# The Class Gazette

**NFC-powered yearbook platform by Eventbuoy**

Each graduate's portrait in the physical yearbook has an NFC tag that links to their live profile on this platform. Friends tap to sign guestbooks, seal time capsules, and leave senior wills.

## Live Endpoints

| Service | URL |
|---------|-----|
| Frontend | https://gazette.eventbuoy.com |
| PocketBase API | https://ebpb.eventbuoy.com |
| GitHub | https://github.com/collectivewinca/gazette-backend |

## Access Credentials

| Item | Value |
|------|-------|
| PB Admin | `admin@classgazette.local` / `AdminPass2026!` |
| Admin Gate | `gazette2026` (entered on `/admin` page) |
| Class Code | `GRAD2026` |
| Class ID | `i8067cxs8wkmg7b` |

## Architecture

```
┌──────────────────────────────────┐
│       Vercel (Free Tier)         │
│  Next.js 15 App Router           │
│  Server Components + Actions     │
│  Tailwind CSS                    │
├──────────────────────────────────┤
│  Hetzner VM (46.62.231.92)      │
│  PocketBase v0.25.9              │
│  Caddy reverse proxy (HTTPS)     │
└──────────────────────────────────┘
```

NFC tags → `https://gazette.eventbuoy.com/m/{member-id}`

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — superlatives, quick links to wills & directory |
| `/join` | 3-step onboarding: class code → draw face → create profile |
| `/m/[id]` | Member profile (what NFC opens): guestbook, time capsule, edit link |
| `/m/[id]/edit` | Edit profile: avatar, quote, future, song, role |
| `/directory` | Browse all members |
| `/wills` | Senior wills — write and view |
| `/admin` | Committee dashboard (password-gated) |

## Database Schema (PocketBase)

### `classes`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK, autogenerate |
| name | text | "Class of 2026" |
| code | text | Join code `GRAD2026` |
| school | text | School name |
| year | number | 2026 |
| theme | text | Newspaper theme label |
| lock_date | date | Optional deadline |
| created | autodate | Set on create |
| updated | autodate | Set on create+update |

### `members`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK, used in NFC URLs |
| class_id | relation → classes | |
| name | text | Full name |
| email | text | Optional |
| quote | text | Headline quote |
| future | text | "NYU — Film & Media" |
| song | text | Their anthem |
| role | text | "Valedictorian" |
| avatar_url | file | Drawn face image |
| photo_url | text | Photo URL |
| member_type | select | `graduate` or `faculty` |
| is_profile_complete | bool | |
| nfc_programmed | bool | Admin tracking |
| sort_order | number | Display order |
| created | autodate | |
| updated | autodate | |

### `guestbook_entries`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK |
| member_id | relation → members | Whose profile |
| author_name | text | Name of writer (no auth) |
| message | text | Guestbook message |
| created | autodate | |
| updated | autodate | |

### `time_capsule_messages`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK |
| member_id | relation → members | Recipient |
| author_name | text | Sealer's name |
| message | text | Sealed message |
| open_date | date | Opens June 2036 |
| is_sealed | bool | |
| created | autodate | |
| updated | autodate | |

### `senior_wills`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK |
| class_id | relation → classes | |
| from_member_id | relation → members | Who's leaving it |
| to_recipient | text | Who receives it |
| item | text | "My lucky calculator" |
| created | autodate | |
| updated | autodate | |

### `superlatives`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK |
| class_id | relation → classes | |
| title | text | "Most Likely to..." |
| winner_id | relation → members | Nullable |
| created | autodate | |
| updated | autodate | |

### `timeline_events`
| Field | Type | Notes |
|-------|------|-------|
| id | text (15 char) | PK |
| class_id | relation → classes | |
| month | text | "September" |
| event_name | text | |
| description | text | |
| event_date | date | |
| sort_order | number | |
| created | autodate | |
| updated | autodate | |

All collections have public read (`listRule: ""`, `viewRule: ""`) and admin-only write. Write mutations require a valid class code passed from the client.

## Security

- **Class code gate**: All mutations (guestbook, capsule, will, profile edit) validate the class code server-side via `requireClassCode()`
- **Admin gate**: Client-side password (`gazette2026`) — no SSR data leak
- **PB security rules**: Public read, admin-only write
- **No auth system**: `author_name` text field instead of `author_id` relation

## Key Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| `sort=-id` instead of `sort=-created` | Existing records have empty `created`; id order works as insertion proxy |
| `author_name` text vs `author_id` relation | No auth system exists |
| `cache: 'no-store'` on all pbFetch | Prevents Next.js data cache staleness |
| `.trim()` on PB_URL env var | Prevents trailing newline corruption from Vercel env |
| `dynamic = 'force-dynamic'` on dynamic pages | Prevents Vercel serving cached static HTML |

## Setup

### 1. Clone and install
```bash
git clone https://github.com/collectivewinca/gazette-backend.git
cd gazette-backend
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
# Set:
# NEXT_PUBLIC_POCKETBASE_URL=https://your-pb-instance.com
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. PocketBase setup
- Install PocketBase v0.25+
- Create collections per the schema above
- Set `listRule: ""` and `viewRule: ""` on all collections for public read
- Create a superuser admin account

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
vercel --prod
```

## What's Done

- [x] PocketBase v0.25.9 backend with 7 collections + seeded data
- [x] Next.js 15 frontend deployed to Vercel
- [x] Profile page with guestbook, time capsule, edit link
- [x] Edit profile page (avatar upload, quote, future, song, role)
- [x] Senior Wills page (write + view)
- [x] Join flow (class code → draw face → create profile)
- [x] Admin dashboard with password gate
- [x] Class code gate on all write mutations
- [x] `created`/`updated` autodate fields on all collections
- [x] Home page with superlatives + quick links
- [x] Member directory
- [x] pbFetch with cache: no-store + trim()

## What's Next

- [ ] Switch `sort=-id` → `sort=-created` once records have timestamps
- [ ] Pre-fill class code from URL params (`/m/[id]?code=GRAD2026`) for NFC tags
- [ ] Superlatives admin (manage titles + winners from dashboard)
- [ ] Image optimization (resize/compress avatar uploads)
- [ ] Rate limiting on guestbook/will submissions
- [ ] NFC tag write integration into profile flow
- [ ] Member search in admin dashboard
- [ ] Bulk NFC tag status export

## Cost

- **Vercel**: Free (hobby tier)
- **PocketBase**: Self-hosted on existing Hetzner VM
- **Domain** (optional): ~$12/year
- **Total recurring**: $0–12/year
