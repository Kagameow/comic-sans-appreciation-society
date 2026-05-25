# The Great Migration — Vue 3 Upgrade Day

Nuxt 3 + Nuxt UI + Pinia + (eventually) Supabase port of the Lovable prototype
in `../prototype`. POC for the office-wide Vue 3 migration celebration: code
hunting, minigames, victories, and the hidden Master Branch / Super Code race.

## Stack

| Layer        | Pick                                                  |
| ------------ | ----------------------------------------------------- |
| App          | Nuxt 3 (Vue 3, Composition API)                        |
| UI           | Nuxt UI v2 + Tailwind (Lucide icons via @iconify-json) |
| State        | Pinia                                                  |
| Backend      | Nuxt server routes (`/server/api`)                     |
| Data — POC   | In-memory store in `server/utils/repo.ts`              |
| Data — later | Supabase (schema in `supabase/schema.sql`)             |

## Run

```bash
cd product
pnpm install        # or npm install / yarn install
pnpm dev
```

No environment variables required for the POC — the in-memory store ships
pre-seeded with the players + codes from the prototype. Visit
<http://localhost:3000>.

To run as a different "logged in" player, set
`NUXT_PUBLIC_CURRENT_PLAYER_NAME` in `.env` (see `.env.example`). The current
POC uses a single name from runtime config in place of real auth.

## Pages

* `/`            — Code Check (default). Submit codes, trigger minigames,
                   collect gems / victories, unlock the Master Branch clue.
* `/leaderboard` — Live rankings, TV-mode. Polls `/api/state` every 2s and
                   plays a Master-Branch-Merged overlay when the super code
                   gets claimed.
* `/admin`       — Architect view. Multiplier control, point adjustments,
                   code registry, super-code selector. **Currently
                   unguarded** — see Auth below.

## API surface

All routes JSON, no auth (POC).

| Route                              | Verb | Purpose                                              |
| ---------------------------------- | ---- | ---------------------------------------------------- |
| `/api/state`                       | GET  | Snapshot of config + players + (optionally) `me`.    |
| `/api/codes/redeem`                | POST | Submit a code. Dispatches: invalid, point, victory, super, or starts a minigame. |
| `/api/codes/award`                 | POST | Posted by a minigame component when it resolves.     |
| `/api/super-event/dismiss`         | POST | Clears the Master Branch winner overlay.             |
| `/api/admin/codes`                 | GET  | Code registry (admin table).                         |
| `/api/admin/multiplier`            | POST | Start/stop the chaos multiplier.                     |
| `/api/admin/adjust`                | POST | Manual ± points on a player.                         |
| `/api/admin/super-code`            | POST | Promote one code to be the active Super Code.        |

## How the Super Code flow works

Logic lives in `server/utils/repo.ts`. The shape mirrors the spec in the brief:

1. **The grind.** A player redeems "victory" codes (`DART-WIN`,
   `FOOSBALL-WIN`, etc., handed out by admins after IRL games). Each one
   bumps `players.victories` and awards 150 pts × current multiplier.
2. **The unlock.** When `victories` hits 5, the Code Check page reveals the
   cryptic Master Branch clue (`SUPER_CLUE` in `stores/game.ts`).
3. **The search.** The player finds the physical Super Code sticker.
4. **The merge.** They submit it. The repo guards on `victories >= 5`, marks
   the code used, writes the winner into `game_config`, awards 1,000 points
   (no multiplier — `redeemSuper` bypasses it), and the leaderboard plays
   the "MASTER BRANCH MERGED" broadcast for everyone.

The Super Code is **single-use, first-come-first-served**. The admin
"Active Super Code" toggle in `/admin` lets architects swap which code
counts as the Super Code (and resets the winner). Useful if the sticker
gets lost.

## Plain point codes also grow gems

The brief also describes a parallel "5 Vue 3 Gems" track for hidden-logo
finds — that's separate from victories. The repo bumps `players.gems` on
every `point` or minigame redemption, and the Code Check page lights the
clue when *either* gems or victories reaches 5. Tune to taste.

## Migrating to Supabase

1. Create a Supabase project, copy `.env.example` to `.env`, fill in
   `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. Run `supabase/schema.sql` then `supabase/seed.sql` in the SQL editor.
3. Add `'@nuxtjs/supabase'` back to `modules` in `nuxt.config.ts`.
4. Replace the in-memory body of `server/utils/repo.ts` with a Supabase
   implementation that exposes the same methods. The API routes don't
   import the client directly — they only talk to `useRepo()`.
5. Swap the 2–3s polling in `stores/game.ts` for a realtime channel
   subscription on `players` and `game_config`.
6. Tighten `server/utils/supabase.ts → isAdminRequest`: load
   `serverSupabaseUser(event)`, then check it against
   `runtimeConfig.adminEmails`.

## Auth (TODO)

The POC reads a single player name from `NUXT_PUBLIC_CURRENT_PLAYER_NAME`.
Real auth = `@nuxtjs/supabase` with Google SSO restricted to the company
domain. Add the admin emails to `ADMIN_EMAILS` (already wired through
`runtimeConfig`) and flip the guard in `server/utils/supabase.ts` from
"always allow" to the commented-out `serverSupabaseUser` check.

## Notable diffs vs. the prototype

* Truth moved to the server. The Pinia store is now a thin cache.
* Code redemption + point math are server-side — clients can't lie about
  multipliers or steal a Super Code without 5 victories.
* Quiz / Crossword / Challenge components no longer self-award; they
  return a `base` value and the server multiplies + logs.
* The leaderboard polls instead of mock-bumping random rows. Once
  Supabase is wired, swap polling for a realtime subscription.

## File map

```
product/
├── app.vue                  # NuxtPage + global modals/notifications
├── app.config.ts            # Nuxt UI theme tokens (emerald primary)
├── assets/css/main.css      # Vue-green tokens + multiplier glow + rank-up animation
├── components/
│   ├── AppShell.vue         # Header, nav, multiplier badge, points/avatar
│   ├── GemsTracker.vue      # 5-gem progress
│   └── games/
│       ├── Quiz.vue       # Time-decay question
│       ├── Crossword.vue    # 5x5 grid w/ Vue 3 clues
│       └── Challenge.vue    # IRL match + referee code
├── composables/useConfetti.ts
├── pages/
│   ├── index.vue            # Code Check
│   ├── leaderboard.vue      # TV-mode rankings + Super Code broadcast
│   └── admin.vue            # Multiplier / players / codes
├── server/
│   ├── api/                 # Endpoints (see table above)
│   └── utils/
│       ├── repo.ts          # In-memory data layer (swap for Supabase later)
│       └── supabase.ts      # Auth shim — currently permissive
├── stores/game.ts           # Pinia: config + players + me + super-event
├── supabase/
│   ├── schema.sql           # Run when you wire creds
│   └── seed.sql
├── nuxt.config.ts
└── package.json
```
