# Vellora API

Real backend for Vellora: Node.js, Express, TypeScript, PostgreSQL, Prisma,
Socket.IO. No mock data, no in-memory arrays pretending to be a database,
no localStorage standing in for persistence, no illustrative-only features.

---

## Setup

### 1. Install and start PostgreSQL

- **Mac:** `brew install postgresql@16 && brew services start postgresql@16`
- **Windows:** install from https://www.postgresql.org/download/windows/,
  then make sure the "postgresql-x64-*" service is running (Services app,
  or pgAdmin)
- **Linux:** `sudo apt install postgresql postgresql-contrib && sudo service postgresql start`

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE vellora;"
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

At minimum, confirm `DATABASE_URL` matches your actual Postgres
username/password/host/port, e.g.:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/vellora"
```

Set `JWT_SECRET` to any long random string (this signs auth cookies) — the
root-level `start-vellora` scripts generate one for you automatically if
you use them instead of doing this by hand.

### 3. Install, generate, migrate

```bash
npm install
npx prisma generate      # generates the Prisma Client from schema.prisma
npx prisma migrate deploy  # applies the migrations in prisma/migrations/
```

Or all at once: `npm run setup`.

### 4. Start the server

```bash
npm run dev
```

Listens on `http://localhost:4000` by default (both REST and Socket.IO).

The app works fine with an empty database too.

---

## API overview

All REST responses are shaped `{ success: true, data }` or
`{ success: false, error }`.

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Posts | `GET /api/posts`, `GET /api/posts/:id`, `POST /api/posts`, `PATCH /api/posts/:id`, `DELETE /api/posts/:id` |
| Likes | `POST /api/posts/:id/like`, `DELETE /api/posts/:id/like` |
| Bookmarks | `POST /api/posts/:id/bookmark`, `DELETE /api/posts/:id/bookmark`, `GET /api/users/me/bookmarks` |
| Comments | `GET /api/posts/:id/comments`, `POST /api/posts/:id/comments`, `DELETE /api/comments/:commentId` |
| Profiles | `GET /api/users/:username`, `PATCH /api/users/me` |
| Follows | `POST /api/users/:username/follow`, `DELETE /api/users/:username/follow`, `GET /api/users/:username/followers`, `GET /api/users/:username/following` |
| Leaderboard | `GET /api/users/leaderboard` — see formula below |
| Achievements | `GET /api/users/:username/achievements` — see rules below |
| Search | `GET /api/search?q=...` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all` |
| Conversations/Messages | `GET /api/conversations`, `POST /api/conversations/start/:username`, `GET /api/conversations/:id/messages`, `POST /api/conversations/:id/messages`, `PATCH /api/conversations/:id/read` |
| Stats | `GET /api/stats` — real public totals, used on the landing page |
| Uploads | `POST /api/uploads` (multipart, field name `image`) |

Real-time messages are also pushed over **Socket.IO** on the same port. The
socket handshake is authenticated with the same JWT cookie as the REST API
(see `src/server.ts`); a client joins `conversation:<id>` rooms only after
the server independently re-verifies real membership in that conversation.

---

## Leaderboard ranking formula

Computed live in `src/controllers/userController.ts` (`getLeaderboard`) from
real rows, every time the endpoint is called — nothing is cached or
precomputed as a static number:

```
points = (published post count × 50) + (total likes received × 5) + (total comments received × 8)
```

Users with 0 points (no published posts) are excluded from the list
entirely, rather than shown with a fabricated score.

## Streak definition

A "day" of activity is recorded (`src/services/streakService.ts`) when a
user **publishes a post** or **posts a comment**. On each qualifying action:

- If they already have activity recorded today: no change.
- If their last activity was yesterday: `currentStreak` increments by 1.
- If their last activity was any earlier day (or never): `currentStreak`
  resets to 1.
- `longestStreak` is `max(longestStreak, currentStreak)` — it only ever
  goes up, so a broken streak doesn't erase the record of a longer one.

Dates are compared using the server's local calendar day
(year/month/date), so this is consistent as long as the server's clock is
correct; it is not currently timezone-aware per-user. Logging out does not
touch `currentStreak`/`longestStreak` at all — they live on the `User` row,
not in any session or client-side state, so refreshing or re-logging-in
never resets them.

## Achievements

Defined as code (`src/services/achievementService.ts`), checked against
real counts, and persisted permanently once earned (`UserAchievement`,
unique on `(userId, key)` so an achievement can never be double-awarded):

| Key | Earned when |
|---|---|
| `first_post` | ≥1 published post |
| `ten_posts` | ≥10 published posts |
| `week_streak` | `longestStreak` ≥ 7 (uses longest, not current, so it's never revoked) |
| `hundred_followers` | ≥100 real followers |
| `engaged_writer` | ≥50 total likes received across all posts |

Checks run after publishing, commenting, receiving a like, and gaining a
follower — i.e., after any action that could newly qualify someone.

---

## Scope notes

Every feature listed in the frontend now has a real backend behind it,
including chat (Socket.IO + persisted conversations/messages) and
achievements (computed from real activity, not illustrative). Community
"join/leave" style membership was never part of the original data model —
the Community page is the real leaderboard, not a separate group feature —
so there's no separate Community backend beyond that.

---

## Honesty about testing — three different levels

Be precise about which claim applies to which piece, per how this project
was actually verified:

### Verified (I ran this myself and saw it pass)

The environment this backend was built in could not run the compiled
Express/Prisma server directly (see below), so verification took two forms:

1. **Direct SQL against a real local PostgreSQL 16 instance** — every
   schema constraint that matters (unique emails/usernames, duplicate-like
   prevention, duplicate-follow prevention, duplicate-conversation-member
   prevention, duplicate-achievement prevention, cascade deletes across
   users/posts/likes/comments/follows/conversations/messages) was tested
   with real INSERT/UPDATE/DELETE statements and confirmed to behave
   correctly.
2. **The actual `backend/scripts/e2e-test.mjs` script**, run against a
   hand-built mock server that replicates the real API's exact response
   shapes and route behavior. This caught and fixed a real bug in the test
   script itself (a response-envelope double-wrapping issue) before it was
   ever handed over — so the script you're being asked to run has itself
   been exercised, not just written and assumed correct.

### Environment limitation (blocked here, not a reflection of the real app)

Prisma's engine binaries download from `binaries.prisma.sh`, which this
particular sandbox's network policy blocks (confirmed: same failure occurs
regardless of Prisma version, and occurs even for `prisma generate` alone).
This means the actual compiled TypeScript server, with the actual
generated Prisma Client talking to actual PostgreSQL, was never run
end-to-end inside that environment. This is a property of that sandbox,
not of your machine — `binaries.prisma.sh` is a normal, unrestricted
domain from anywhere else.

### User verification (run this yourself for real proof)

```bash
# 1. Start everything
npm run dev:all      # from the project root

# 2. In a second terminal, from the project root:
npm run test:e2e
```

This runs `backend/scripts/e2e-test.mjs` against your actual running
server and actual PostgreSQL database. It signs up two real users, edits a
profile, saves a draft, publishes it, likes/bookmarks/comments on a post,
follows, sends a real-time message, checks notifications, checks the
leaderboard, checks achievements, logs out, logs back in, and confirms
everything survived — 38 checks in total, printed as pass/fail, with a
non-zero exit code if anything fails. This is the actual proof, on your
actual machine, not a claim.

---

## Useful commands

```bash
npx prisma studio       # visual database browser
npx prisma migrate dev  # create a new migration after editing schema.prisma
npm run build            # compile TypeScript to dist/
npm start                # run the compiled build
npm run test:e2e         # run the real end-to-end verification script
```
