# The Class Gazette — Deployable Backend

**NFC-powered yearbook platform by Eventbuoy**

A self-hostable web app that powers the digital side of NFC yearbooks. Each graduate's portrait in the physical yearbook has an NFC tag that links to their profile on this platform.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel (Free)                  │
│  Next.js App Router + Server Actions             │
├─────────────────────────────────────────────────┤
│                 Supabase (Free)                  │
│  Auth (magic link / class code)                  │
│  PostgreSQL (profiles, guestbook, time capsule)  │
│  Storage (avatars, drawn faces)                  │
└─────────────────────────────────────────────────┘
```

**NFC tags** → point to `yourclass.vercel.app/m/[member-id]`

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Tailwind CSS** (styling)
- **Vercel** (hosting, free tier)

## Database Schema

### `classes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | "Class of 2026" |
| code | text | Join code (e.g. GRAD2026) |
| school | text | School name |
| year | int | Graduation year |
| created_at | timestamptz | |

### `members`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (used in NFC URL) |
| class_id | uuid | FK → classes |
| user_id | uuid | FK → auth.users (nullable for pre-registered) |
| name | text | Full name |
| quote | text | Headline quote |
| future | text | "NYU — Film & Media" |
| song | text | Their anthem |
| role | text | "Valedictorian, Film Club President" |
| avatar_url | text | Drawn face image URL |
| photo_url | text | Portrait photo URL |
| member_type | text | 'graduate' or 'faculty' |
| is_profile_complete | boolean | |
| created_at | timestamptz | |

### `guestbook_entries`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| member_id | uuid | FK → members (whose profile) |
| author_id | uuid | FK → members (who wrote it) |
| message | text | The guestbook message |
| created_at | timestamptz | |

### `time_capsule_messages`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| member_id | uuid | FK → members (recipient) |
| author_id | uuid | FK → members (who sealed it) |
| message | text | Sealed message |
| open_date | date | When it can be read |
| is_sealed | boolean | |
| created_at | timestamptz | |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/join` | Join with class code → draw face → create profile |
| `/m/[id]` | Public member profile (what NFC opens) |
| `/directory` | Browse all members |
| `/playlist` | Class playlist |
| `/wills` | Senior wills |
| `/admin` | Committee dashboard |
| `/admin/tags` | NFC tag assignment tracker |

## Setup

### 1. Clone and install
```bash
git clone <repo>
cd gazette-backend
npm install
```

### 2. Create Supabase project
- Go to supabase.com, create a new project
- Run the SQL migration in `supabase/migrations/001_initial.sql`
- Copy your project URL and anon key

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
vercel
```

## NFC Tag Programming

Each tag gets programmed with:
```
https://yourclass.vercel.app/m/{member-uuid}
```

Use the admin dashboard at `/admin/tags` to:
1. See every member's NFC URL
2. Track which tags have been programmed
3. Test tags by scanning them

## Cost

- **Vercel**: Free (hobby tier handles yearbook traffic)
- **Supabase**: Free (500MB database, 1GB storage, 50K auth users)
- **Domain** (optional): ~$12/year
- **Total recurring**: $0–12/year
