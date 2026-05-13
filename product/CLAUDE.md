# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`product/` is the Nuxt 4-conventions port of the Lovable prototype at `../prototype`. POC for an office-wide Vue 3 migration-day game (code hunting, minigames, victories, a hidden Super Code race). Client code lives under `app/`, server under `server/`, cross-cutting types/constants under `shared/` (via the `#shared` alias).

## Workflow rules

- **Every change ships on its own branch + PR.** No commits land on `main` directly. Spin up a feature branch (`git switch -c <topic>`), push, open a PR, and merge from there.
- **Commit often, commit early.** Push WIP onto the PR branch as soon as something compiles — small commits, descriptive messages. The PR is the unit of review, not the commit.
- **`main` is protected by convention.** If you catch yourself about to `git commit` on `main`, stop and create a branch first. The only commits that should ever be reachable from `main` directly are the ones already on the remote.

## Commands

```bash
pnpm dev        # nuxt dev — http://localhost:3000
pnpm build      # nuxt build
pnpm typecheck  # nuxt typecheck (vue-tsc)
```

`.env.local` must contain `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, and `ADMIN_EMAILS` (see `.env.example`). The Supabase project also needs the Google OAuth provider enabled and `http://localhost:3000/confirm` whitelisted under Authentication → URL Configuration.

## Architecture

**Server is the source of truth.** Nitro API routes (`server/api/**`) only ever talk to `useRepo()` (`server/utils/repo.ts`), an in-memory data layer pre-seeded with demo players + codes. The Pinia store (`app/stores/game.ts`) is a thin cache; the polling lifecycle lives in `useGameSync` and pauses when the tab is hidden (`useDocumentVisibility` + `useIntervalFn`). Minigame components emit a `base` value; the server applies the multiplier and writes the result — clients cannot self-award.

**Identity comes from the Supabase session.** Player rows are linked to Supabase users by `email`/`userId`. The first time a user signs in, `repo.ensurePlayerForUser()` either reclaims a seed row matching their email or creates a fresh player. Server routes resolve identity via `currentPlayer(event)` (nullable, for reads) or `requirePlayer(event)` (throws 401, for writes). **No client request carries a `playerName` field** — the session is authoritative.

**Auth surface (Supabase + Google):**
- `/admin` page + `/api/admin/*` + `/api/super-event/dismiss` require an email in `ADMIN_EMAILS`. Dual-layered: `app/middleware/admin.ts` is UX (redirects), `server/utils/supabase.ts → isAdminRequest()` is the security gate.
- `/api/codes/redeem` and `/api/codes/award` require *any* authenticated user.
- Code Check (`/`) shows a `SignInGate` to anonymous visitors. Leaderboard (`/leaderboard`) is fully public — it's the TV view.
- `/login` runs `signInWithOAuth({ provider: 'google' })`; `/confirm` reads the cookie-stored original destination via `useSupabaseCookieRedirect().pluck()` and redirects.
- Admin nav link is hidden from non-admin sessions in `AppNav`.

**Move-to-Supabase-DB swap path** (auth is already on Supabase; the data layer is still in-memory):
1. Run `db/schema.sql` + `db/seed.sql`.
2. Swap the body of `server/utils/repo.ts` for a Supabase-backed implementation exposing the same methods — API routes don't import any Supabase client directly.
3. Replace `useIntervalFn` polling in `useGameSync` with a realtime channel subscription on `players` + `game_config`.

**Super Code flow** (in `repo.ts`):
- Victory codes (`DART-WIN`, …) bump `players.victories` and award `150 × multiplier`.
- At `victories >= 5`, the Code Check page reveals the Master Branch clue (`SUPER_CLUE` in `shared/constants/game.ts`).
- Super Code is single-use, first-come-first-served. `redeemSuper` guards on `victories >= 5`, writes the winner into `game_config`, awards a flat 1000 pts (**bypasses the multiplier**). Leaderboard broadcasts the win.
- Admins swap the active Super Code via `/admin` (resets the winner) — useful if the IRL sticker is lost.

**Gems** are a parallel track: any `point` or minigame redemption bumps `players.gems`. The clue lights up when *either* gems or victories reaches 5.

## Conventions

- **Don't bypass the server.** New game-state mutations belong in `repo.ts` + an `/api` route; don't mutate the Pinia store directly.
- **Minigame components must not self-award.** Pattern: component emits `resolve(base)`; server applies multiplier in `/api/codes/award`.
- **Don't trust client-supplied identity.** Server routes derive the player from `requirePlayer(event)` / `currentPlayer(event)`; the request body never carries a `playerName`.
- **Auth allowlist is `email`-keyed, not `user_metadata`.** Per Supabase security guidance, `user_metadata` is user-editable. Email is the OAuth provider's assertion.
- **Auto-imports are on.** First-party components (path-prefixed: `RedeemCodeInput`, `AdminCodesPanel`, etc.), composables, utils, and Pinia stores all auto-import. Types from `#shared/types/*` still need explicit imports — only runtime values auto-import.
- **VueUse over hand-rolled timers.** Use `useIntervalFn`, `refAutoReset`, `whenever`, `useTimeoutFn` — there's no need for bare `setInterval`/`setTimeout` + manual cleanup.
- Nuxt UI v2 + Tailwind via `@nuxt/ui`; Lucide via `@iconify-json/lucide`. Theme tokens in `app/app.config.ts`, custom CSS in `app/assets/css/main.css`. Color mode forced to dark.
