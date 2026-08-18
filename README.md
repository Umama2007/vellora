# Vellora

Share. Inspire. Connect.

A full-stack social blogging platform: React frontend, Express + PostgreSQL
backend. Real authentication, real posts, real likes/comments/follows —
nothing here is mock data pretending to be persistent.

## Quick start (double-click)

**Windows:** double-click `start-vellora.bat`

**Mac:** double-click `start-vellora.command`
(if macOS blocks it as an unidentified file: right-click it → Open, then confirm)

**Linux:** double-click `start-vellora.sh`, or from a terminal: `./start-vellora.sh`

Any of these will:
1. Check that Node.js is installed (and tell you where to get it if not — https://nodejs.org, LTS version)
2. Check for a running PostgreSQL server and generate a real random auth secret in `backend/.env`
3. Install both frontend and backend dependencies the first time you run it
4. Set up the database tables via Prisma
5. Start both servers together and open Vellora in your browser

Leave the terminal window open while you use the app. Closing it stops both servers.

**You do need PostgreSQL installed and running first.** The script checks for it
and tells you exactly what to do if it's missing:

- **Mac:** `brew install postgresql@16 && brew services start postgresql@16`
- **Windows:** install from https://www.postgresql.org/download/windows/
- **Linux:** `sudo apt install postgresql postgresql-contrib`

Once running, sign up to create your own account.

**Want real proof it all works, not just a claim?** Open a second terminal
in this folder and run:

```bash
npm run test:e2e
```

This signs up two real accounts, publishes a post, likes/comments/bookmarks,
follows, sends a real-time message, checks notifications, the leaderboard,
and achievements, logs out and back in, and confirms everything actually
persisted — against your real running server and real database. See
`backend/README.md` for exactly what it checks and why this exists.

## Manual setup

If you'd rather run it by hand:

```bash
# from the project root
npm install
npm run backend:install
npm run backend:setup   # generates Prisma client, runs migrations
npm run dev:all         # runs frontend (5173) and backend (4000) together
```

Or run them in two separate terminals with `npm run dev` (frontend) and
`npm run backend:dev` (backend) if you prefer to see their logs separately.

See `backend/README.md` for backend-specific details: environment variables,
API routes, and what's real vs. what's still a labeled demo (Messages/chat).

To build for production:

```bash
npm run build
npm run preview
```

## What's included

- **Landing, Login, Signup, About** — public marketing (with real stats) and real auth pages
- **Dashboard/Feed** — real posts from the database, For You / Following tabs
- **Explore** — browse real posts by category
- **Trending** — ranked by real like counts from the database
- **Create Post** — real draft/publish, tags, cover image upload
- **Post Detail** — real post content, real comments, real like/bookmark
- **Profile** — real profile data, own and others', with real follow/unfollow
- **Messages** — real conversations and messages, persisted in PostgreSQL, delivered live over Socket.IO
- **Community** — leaderboard computed live from real posts/likes/comments (formula documented in `backend/README.md`)
- **Streaks** — real day-streak tracking off actual publish/comment activity
- **Achievements** — real badges, computed from real activity, persisted once earned
- **Notifications** — real notifications generated on likes, comments, follows
- **Bookmarks** — real saved posts, persisted per account
- **Search** — real backend search across posts, authors, tags
- **Settings** — real profile editing (name, bio, location, avatar)

## Project structure

```
src/
  components/   Reusable UI (Logo, Sidebar, Topbar, Avatar, PostCard)
  layouts/      AppLayout (persistent sidebar shell)
  pages/        One file per route
  context/      AuthContext (real session state backed by the API)
  api/          Fetch wrappers for every backend endpoint
  data/         brand.js (brand tokens) — no more mock app data
public/
  branding/     Vellora logo assets (SVG, plum + light variants)
  favicon.svg
backend/
  src/          Express + TypeScript API (see backend/README.md)
  prisma/       Database schema, migrations, seed script
```

## Design tokens

Colors, spacing, and radii are defined in `tailwind.config.js` and pulled directly
from the Vellora brand sheet: Deep Plum `#4B294F`, Lavender `#B8A2C8`, Soft Lilac
`#D9CBE5`, Warm Cream `#F8F3EA`, Warm Beige `#E8DCCB`.

## Notes on data

All persistent data — users, posts, likes, comments, bookmarks, follows,
notifications — lives in real PostgreSQL tables, written and read through the
Express API in `backend/`. There's no localStorage database, no in-memory
array standing in for a real one. The one deliberate exception is Messages,
which is a clearly-labeled visual demo — see `backend/README.md` for why and
what it would take to make it real.
