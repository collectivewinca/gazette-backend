-- ============================================
-- The Class Gazette — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── CLASSES ───
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  school text,
  year int not null,
  theme text default 'gazette',
  lock_date timestamptz,
  created_at timestamptz default now()
);

-- ─── MEMBERS ───
create table public.members (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  quote text,
  future text,
  song text,
  role text,
  avatar_url text,
  photo_url text,
  member_type text not null default 'graduate' check (member_type in ('graduate', 'faculty')),
  is_profile_complete boolean default false,
  nfc_programmed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_members_class_id on public.members(class_id);
create index idx_members_user_id on public.members(user_id);
create unique index idx_members_email_class on public.members(email, class_id) where email is not null;

-- ─── GUESTBOOK ENTRIES ───
create table public.guestbook_entries (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid not null references public.members(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete cascade,
  message text not null check (char_length(message) <= 500),
  created_at timestamptz default now()
);

create index idx_guestbook_member on public.guestbook_entries(member_id);

-- ─── TIME CAPSULE MESSAGES ───
create table public.time_capsule_messages (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid not null references public.members(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete cascade,
  message text not null check (char_length(message) <= 2000),
  open_date date not null,
  is_sealed boolean default true,
  created_at timestamptz default now()
);

create index idx_capsule_member on public.time_capsule_messages(member_id);

-- ─── SENIOR WILLS ───
create table public.senior_wills (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  from_member_id uuid not null references public.members(id) on delete cascade,
  to_recipient text not null,
  item text not null check (char_length(item) <= 500),
  created_at timestamptz default now()
);

-- ─── SUPERLATIVES ───
create table public.superlatives (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  winner_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now()
);

-- ─── TIMELINE EVENTS ───
create table public.timeline_events (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  month text not null,
  event_name text not null,
  description text,
  event_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.classes enable row level security;
alter table public.members enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.time_capsule_messages enable row level security;
alter table public.senior_wills enable row level security;
alter table public.superlatives enable row level security;
alter table public.timeline_events enable row level security;

-- Classes: anyone can read (needed for join flow), only admins can write
create policy "Classes are viewable by everyone"
  on public.classes for select using (true);

-- Members: class members can read all members in their class
create policy "Members viewable by class members"
  on public.members for select using (true);

-- Members: users can update their own profile
create policy "Users can update own profile"
  on public.members for update using (
    auth.uid() = user_id
  );

-- Members: anyone can insert (join flow — class code validated in app)
create policy "Anyone can join via class code"
  on public.members for insert with check (true);

-- Guestbook: class members can read
create policy "Guestbook viewable by everyone"
  on public.guestbook_entries for select using (true);

-- Guestbook: authenticated users can write
create policy "Authenticated users can write guestbook"
  on public.guestbook_entries for insert with check (
    auth.uid() is not null
  );

-- Time capsule: only author and recipient can read, only when unsealed
create policy "Capsule messages viewable when open"
  on public.time_capsule_messages for select using (
    is_sealed = false
    or auth.uid() = (select user_id from public.members where id = author_id)
  );

create policy "Authenticated users can seal capsule"
  on public.time_capsule_messages for insert with check (
    auth.uid() is not null
  );

-- Senior wills: viewable by all
create policy "Wills viewable by everyone"
  on public.senior_wills for select using (true);

create policy "Members can create wills"
  on public.senior_wills for insert with check (
    auth.uid() is not null
  );

-- Superlatives: viewable by all
create policy "Superlatives viewable by everyone"
  on public.superlatives for select using (true);

-- Timeline: viewable by all
create policy "Timeline viewable by everyone"
  on public.timeline_events for select using (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at on members
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_member_updated
  before update on public.members
  for each row execute function public.handle_updated_at();

-- Validate class code and return class info
create or replace function public.validate_class_code(input_code text)
returns json as $$
declare
  class_record record;
begin
  select * into class_record from public.classes where code = upper(input_code);
  if class_record is null then
    return json_build_object('valid', false);
  end if;
  return json_build_object(
    'valid', true,
    'class_id', class_record.id,
    'name', class_record.name,
    'school', class_record.school,
    'year', class_record.year
  );
end;
$$ language plpgsql security definer;

-- Get profile completion stats for admin
create or replace function public.get_class_stats(p_class_id uuid)
returns json as $$
declare
  total_count int;
  complete_count int;
  nfc_count int;
begin
  select count(*) into total_count from public.members where class_id = p_class_id;
  select count(*) into complete_count from public.members where class_id = p_class_id and is_profile_complete = true;
  select count(*) into nfc_count from public.members where class_id = p_class_id and nfc_programmed = true;
  return json_build_object(
    'total', total_count,
    'complete', complete_count,
    'nfc_programmed', nfc_count,
    'completion_pct', case when total_count > 0 then round((complete_count::numeric / total_count) * 100) else 0 end
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- SEED DATA (optional — for demo/testing)
-- ============================================

-- Insert a demo class
insert into public.classes (name, code, school, year) values
  ('Class of 2026', 'GRAD2026', 'Westchester Academy', 2026);

-- Insert demo members (pre-registered roster)
do $$
declare
  class_uuid uuid;
begin
  select id into class_uuid from public.classes where code = 'GRAD2026';

  insert into public.members (class_id, name, quote, future, song, role, member_type, is_profile_complete) values
    (class_uuid, 'Jordan Kim', 'We came, we saw, we graduated.', 'NYU — Film & Media', 'Cruel Summer — Taylor Swift', 'Valedictorian, Film Club President', 'graduate', true),
    (class_uuid, 'Alex Martinez', 'Sleep is for college.', 'Georgia Tech — CS', 'Blinding Lights — The Weeknd', 'Robotics Captain, Math Team', 'graduate', true),
    (class_uuid, 'Riley Thompson', 'The stage is my home address.', 'Emerson — Theater', 'Heat Waves — Glass Animals', 'Lead in 3 musicals, Drama VP', 'graduate', true),
    (class_uuid, 'Sam Rivera', 'One more rep.', 'UCLA — Kinesiology', 'Unstoppable — Sia', 'Varsity Captain, Student Council', 'graduate', true),
    (class_uuid, 'Casey Liu', 'Measured twice, built once.', 'MIT — Mech Eng', 'Legends — Juice WRLD', 'Robotics Lead, Science Fair Winner', 'graduate', true),
    (class_uuid, 'Morgan Williams', 'If I''m not early, I''m late.', 'Howard — Poli Sci', 'Alright — Kendrick Lamar', 'Class President, Debate Champion', 'graduate', true),
    (class_uuid, 'Avery Patel', 'Curiosity never killed anything.', 'Stanford — Biology', 'Yellow — Coldplay', 'Science Olympiad, NHS President', 'graduate', true),
    (class_uuid, 'Taylor Brooks', 'Make it beautiful or don''t make it.', 'RISD — Design', 'Electric Feel — MGMT', 'Art Show Winner, Yearbook Designer', 'graduate', true),
    (class_uuid, 'Mr. David Okafor', 'Physics is just vibes with math.', 'Still teaching — 14th year', 'Don''t Stop Me Now — Queen', 'Physics, Robotics Advisor', 'faculty', true),
    (class_uuid, 'Ms. Linda Chen', 'Read the chapter.', 'Still teaching — 22nd year', 'Bohemian Rhapsody — Queen', 'AP English, Literary Magazine', 'faculty', true);
end $$;
