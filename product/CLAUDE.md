# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`product/` is the Nuxt 3 port of the Lovable prototype at `../prototype`. It is a POC for an office-wide Vue 3 migration-day game (code hunting, minigames, victories, a hidden Super Code race). The repo is a pnpm workspace; all app code lives in `product/`.

## Commands

```bash
pnpm dev        # nuxt dev — http://localhost:3000
pnpm build      # nuxt build
pnpm typecheck  # nuxt typecheck (vue-tsc)
pnpm generate   # static generation
pnpm preview    # preview production build
```

No env vars are required for the POC. Optional: set `NUXT_PUBLIC_CURRENT_PLAYER_NAME` in `.env` to impersonate a different player (see `.env.example`). `ADMIN_EMAILS` is wired through `runtimeConfig` but unused until Supabase auth is enabled.

## Architecture

**Server is the source of truth.** API routes (`server/api/**`) only ever talk to `useRepo()` (`server/utils/repo.ts`) — an in-memory data layer pre-seeded with players and codes. The Pinia store (`stores/game.ts`) is a thin cache that polls `/api/state` (2s on leaderboard). Clients cannot self-award; minigame components return a `base` value and the server applies the multiplier and writes the result.

**Swap path to Supabase** (intentionally not wired yet — `@nuxtjs/supabase` crashes without creds, so it is deliberately *omitted* from `modules` in `nuxt.config.ts` despite being installed):
1. Reinstate `'@nuxtjs/supabase'` in `nuxt.config.ts`.
2. Replace the body of `server/utils/repo.ts` with a Supabase implementation exposing the same methods — API routes don't import any client directly.
3. Run `supabase/schema.sql` + `supabase/seed.sql`.
4. Replace polling in `stores/game.ts` with a realtime subscription on `players` + `game_config`.
5. Tighten `server/utils/supabase.ts → isAdminRequest` from "always allow" to the commented-out `serverSupabaseUser` + `runtimeConfig.adminEmails` check.

**Super Code flow** (lives entirely in `repo.ts`):
- Victory codes (e.g. `DART-WIN`) bump `players.victories` and award `150 × multiplier`.
- At `victories >= 5`, the UI reveals the Master Branch clue (`SUPER_CLUE` in `stores/game.ts`).
- The Super Code is single-use, first-come-first-served. `redeemSuper` guards on `victories >= 5`, marks the code used, writes the winner into `game_config`, and awards a flat 1000 pts (**bypasses the multiplier**). The leaderboard broadcasts the win to all clients.
- Admins can swap the active Super Code via `/admin` (resets the winner) — useful if the IRL sticker is lost.

**Gems** are a parallel track: any `point` or minigame redemption bumps `players.gems`. The Code Check page lights the clue when *either* gems or victories reaches 5.

## Conventions

- **Don't bypass the server.** If a feature needs to award points or mutate game state, add a method to `repo.ts` and an `/api` route — do not mutate the Pinia store directly.
- **Minigame components must not self-award.** Pattern: component resolves with a `base` value, server applies multiplier in `/api/codes/award`.
- **Admin routes are currently unguarded** (`isAdminRequest` always returns true). Treat the `/admin` page as trusted-network only until the Supabase auth shim is enabled.
- Nuxt UI v2 + Tailwind via `@nuxt/ui`; Lucide icons via `@iconify-json/lucide`. Theme tokens in `app.config.ts`, custom CSS (Vue-green palette, multiplier glow, rank-up animation) in `assets/css/main.css`.
- Color mode is forced to dark.
