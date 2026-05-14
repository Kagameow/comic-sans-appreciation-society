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

`.env` must contain `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, and `ADMIN_EMAILS` (see `.env.example`). Nuxt 4's CLI only auto-loads `.env` — `.env.local` is **not** picked up, and without these vars `@nuxtjs/supabase`'s server plugin throws during setup, the failure is swallowed by Nuxt's plugin try/catch, and every SSR request 500s. The Supabase project also needs the Email provider enabled under Authentication → Providers; the `avatars` Storage bucket must exist (public, with an RLS policy letting authenticated users upload to a folder named after their user id).

## Architecture

**Server is the source of truth.** Nitro API routes (`server/api/**`) only ever talk to `useRepo()` (`server/utils/repo.ts`), an in-memory data layer pre-seeded with demo players + codes. Minigame components emit a `base` value; the server applies the multiplier and writes the result — clients cannot self-award.

**Client state is rstore.** All data + form state goes through `@rstore/nuxt`. There is no Pinia. Collections live in `app/rstore/*.ts`, plugins in `app/rstore/plugins/*.ts`, both auto-scanned by the module. Two plugins back three collections:

- `app/rstore/plugins/supabase-auth.ts` — wires the `session` and `currentUser` collections to Supabase Auth (`signInWithPassword`, `getUser`, `updateUser`, `signOut`).
- `app/rstore/plugins/nitro-api.ts` — wires the `gameState` collection's `fetchFirst` hook to `GET /api/state`.

`app/composables/useGame.ts` is the thin call-site composable wrapping `store.gameState.query(q => q.first('current'))` + a visibility-aware poll (`useDocumentVisibility` + `useIntervalFn`) that pauses when the tab is hidden. It returns a `reactive()` mirroring the old Pinia getter shape (me/config/players/superWinner/activeMultiplier/isMultiplierActive/clueUnlocked/sortedPlayers) so call sites just do `const game = useGame()` and access fields without `.value`.

**Identity comes from the Supabase session.** Player rows are linked to Supabase users by `userId`. On every resolve, `repo.ensurePlayerForUser()` syncs the row's `name` + `email` + `avatarUrl` from the auth identity — there is no separate name-edit flow at the player-row level, and no email-match seed reclaim (so seed players stay decoys on the leaderboard). The display name comes from `user_metadata.display_name`, falling back to the raw email. Avatars come from `user_metadata.avatar_url` (a public URL in the `avatars` Storage bucket). Server routes resolve identity via `currentPlayer(event)` (nullable, for reads) or `requirePlayer(event)` (throws 401, for writes). **No client request carries a `playerName` field** — the session is authoritative.

**Auth surface (Supabase email/password):**
- `/admin` page + `/api/admin/*` + `/api/super-event/dismiss` require an email in `ADMIN_EMAILS`. Dual-layered: `app/middleware/admin.ts` is UX (redirects), `server/utils/supabase.ts → isAdminRequest()` is the security gate.
- `/api/codes/redeem` and `/api/codes/award` require *any* authenticated user.
- Code Check (`/`) shows a `SignInGate` to anonymous visitors. Leaderboard (`/leaderboard`) is fully public — it's the TV view.
- `/login` uses `store.session.createForm({ schema })` (valibot) backed by the supabase-auth plugin; on success the user is bounced to the cookie-stored original destination via `useSupabaseCookieRedirect().pluck()`.
- Admin nav link is hidden from non-admin sessions in `AppNav`; the same nav re-renders in a `USlideover` triggered by a `md:hidden` hamburger.

**Move-to-Supabase-DB swap path** (auth is already on Supabase; the data layer is still in-memory):
1. Run `db/schema.sql` + `db/seed.sql`.
2. Swap the body of `server/utils/repo.ts` for a Supabase-backed implementation exposing the same methods — API routes don't import any Supabase client directly.
3. In `app/rstore/plugins/nitro-api.ts`, swap the polling-based `fetchFirst` for an rstore `subscribe` hook backed by a Supabase realtime channel on `players` + `game_config`. Drop the `useIntervalFn` in `useGame.ts`.

**Super Code flow** (in `repo.ts`):
- Victory codes (`DART-WIN`, …) bump `players.victories` and award `150 × multiplier`.
- At `victories >= 5`, the Code Check page reveals the Master Branch clue (`SUPER_CLUE` in `shared/constants/game.ts`).
- Super Code is single-use, first-come-first-served. `redeemSuper` guards on `victories >= 5`, writes the winner into `game_config`, awards a flat 1000 pts (**bypasses the multiplier**). Leaderboard broadcasts the win.
- Admins swap the active Super Code via `/admin` (resets the winner) — useful if the IRL sticker is lost.

**Gems** are a parallel track: any `point` or minigame redemption bumps `players.gems`. The clue lights up when *either* gems or victories reaches 5.

## Conventions

- **Composition over inheritance. Always.** Vue 3 + Composition API + composables — no Vue 2 mixins, no Options API in new code, no "BaseFoo / extends BaseFoo" patterns, no class hierarchies. Components *assemble* capabilities at the call site (`const { x } = useFoo()`), they don't inherit them.
    - **Shared logic → composable** in `app/composables/use*.ts`. If two components grow the same logic, extract a composable; if a composable juggles unrelated concerns, split it. The unit of reuse is the function, not the class.
    - **Browser primitives, timers, lifecycle → VueUse first.** `useIntervalFn`, `useTimeoutFn`, `useDocumentVisibility`, `useLocalStorage`, `refAutoReset`, `whenever`, `useEventListener`, etc. Don't hand-roll `setInterval`/`setTimeout` + `onUnmounted` cleanup — VueUse already ties the lifetime to the calling scope, *and that's the whole point*. (Trivia.vue and useCodeRedeem.ts both had hand-rolled timers — fixed in PR #17.)
    - **rstore forms are the canonical example.** `store.x.createForm({...})` returns a value with `$submit`/`$loading`/`$error`/`$schema` you assemble alongside other state. You never extend a base form class — you call a function and get back capabilities. If you want a toast on success, you compose `useToast()` alongside it. If you want change tracking, the form already exposes `$hasChanges()`. Nothing is forced from a parent.
    - **No global plugin for shared logic when a composable would do.** Plugins are for transport/state wiring (`supabase-auth`, `nitro-api`); cross-cutting *logic* (auth predicates, multiplier maths, lockout state) lives in `app/composables/`.
- **Every form goes through rstore. No exceptions.** Login, display-name edit, avatar upload, code redemption, IRL-challenge confirmation — all of them.
    - **Submit handler is `form.$submit()`, never `form()`.** The form is a `Proxy` over `reactive({...})`, not callable; calling `form()` throws `TypeError: ... is not a function` (root cause of the 2026-05-14 prod login outage).
    - **CRUD against a collection → collection-bound `store.<collection>.createForm({...})` / `.updateForm({...})`.** Schemas live on the collection as `formSchema: { create, update }` so they're picked up automatically. `updateForm` is async (awaits a `findFirst` for initial values), so mount it inside a `<Suspense>` boundary if it's outside `<NuxtPage>` — see `SharedPlayerBadge` + `SharedPlayerBadgeMenu`.
    - **Custom actions (e.g. Storage upload + update) → plain `createFormObject({ schema, submit })`** imported from `@rstore/vue` (not auto-imported). Schema stays inline.
    - **Schemas are valibot.** rstore owns *state + submit + schema*; `<UForm>` owns *field-level error display + scroll-to-error*. Combine them: wrap inputs in `<UForm :state="form" :schema="form.$schema" @submit="form.$submit()" @error="focusFirstError">`. Use `<UFormField name="<schema-key>">` per field — the `name` must match a schema key or the error has nowhere to go. Render server-side errors as `<UAlert color="error" :title="form.$error.message" />` at the form level. `focusFirstError` (in `app/utils/forms.ts`) auto-imports.
- **Collections live in `app/rstore/*.ts`.**
    - Always `withItemType<T>().defineCollection({...})` — never a bare object. The currying pattern is required for proper type inference.
    - Override `getKey` when the primary key isn't `id`. Use `fields.parse/serialize` for non-primitive fields (e.g. dates → keep ISO strings out of templates). Use computed fields for derived values instead of computing in templates.
    - **Scanner gotcha:** the Nuxt module treats *every* export from `app/rstore/*.ts` as a collection candidate (and the scan is one level deep). Non-collection helpers (schemas, types, utility consts) in that directory must be **non-exported**, or moved elsewhere (`#shared`, `app/utils/`).
- **Plugins live in `app/rstore/plugins/*.ts`.**
    - Plugin for shared transport across multiple collections (e.g. `supabase-auth` serves both `session` + `currentUser`); collection-scoped hook for one-offs.
    - **Categorize every plugin** with `category: 'virtual' | 'local' | 'remote' | 'processing'` — hook ordering matters once a local cache plugin lands. Both current plugins are `'remote'`.
    - Abort hooks early by calling `payload.setResult(...)`. Use `scopeId` only if there are multiple backends.
- **Don't bypass the cache or the server.** Mutations through `store.x.update(...)` / `create(...)` / `delete(...)` propagate to readers automatically — no manual refetch, and don't mutate the rstore cache directly from components. New game-state mutations belong in `repo.ts` + an `/api` route.
- **Queries**: `query` / `liveQuery` are designed for `setup()` (reactive + awaitable). Wrap polling/visibility logic in a composable (`useGame()` does this for `gameState`).
- **Minigame components must not self-award.** Pattern: component emits `resolve(base)`; server applies multiplier in `/api/codes/award`.
- **Don't trust client-supplied identity.** Server routes derive the player from `requirePlayer(event)` / `currentPlayer(event)`; the request body never carries a `playerName`.
- **Auth allowlist is `email`-keyed, not `user_metadata`.** Per Supabase security guidance, `user_metadata` is user-editable. Email is the provider's assertion.
- **Auto-imports are on.** First-party components (path-prefixed: `RedeemCodeInput`, `AdminCodesPanel`, etc.), composables, utils auto-import. rstore auto-imports `withItemType`, `defineCollection`, `defineRstorePlugin`, `useStore`, `RStoreSchema`. `createFormObject` is **not** auto-imported — import it explicitly from `@rstore/vue`. Types from `#shared/types/*` still need explicit imports — only runtime values auto-import.
- **VueUse over hand-rolled timers.** Use `useIntervalFn`, `refAutoReset`, `whenever`, `useTimeoutFn` — there's no need for bare `setInterval`/`setTimeout` + manual cleanup.
- **Nuxt UI primitives over native HTML.** Always. `<UInput>` not `<input>`, `<UButton>` not `<button>`, `<UTextarea>` not `<textarea>`, `<USelect>` not `<select>`, `<UAlert>` not a hand-rolled error `<div>`, `<NuxtLink>` not `<a href>` (for internal nav). Override styling via the `:ui` prop (slot-keyed override map) or a `class` on the component — don't drop back to a native element just because the styling is custom. Search filters that have no `<UForm>` wrapper are still `<UInput>` (no schema/submit needed). The crossword cells, the code-redeem input, the trivia answer buttons, the admin multiplier cards, the badge-popover trigger — all use Nuxt UI primitives even when the surrounding chrome is heavily customized.
- Nuxt UI v4 + Tailwind v4 via `@nuxt/ui`; Lucide via `@iconify-json/lucide`. Theme tokens via `@theme` in `app/assets/css/main.css`, component overrides in `app/app.config.ts → ui.colors`. Dark/light toggle wired via `useColorMode()` in `AppShell`; light mode still needs a color audit (most surfaces are tuned for dark — see the open follow-up).
