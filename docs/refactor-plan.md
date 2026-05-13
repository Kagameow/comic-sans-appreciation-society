# The Great Migration — UX / UI Refactor Plan

Component-by-component plan to take the current Nuxt prototype to the
"retro-futurist hacker arcade × Vue 3 migration" target laid out in
[`design-system.md`](./design-system.md) and [`voice.md`](./voice.md).

Each section names the current file, what changes, and the interaction logic
behind it. The four through-lines (the principles every refactor obeys):

1. **Transient posture** — the player app is for distracted, walking, half-paying-attention humans. One primary action, massive target, ruthless removal of everything else.
2. **Forgiving entry, modeless feedback** — no error modals, no "are you sure". Bad input shakes and prints; mistakes get an Undo, not a confirmation.
3. **Rich Visual Modeless Feedback (RVMF)** — every state change is something the room can read across the office. The TV is the canvas, motion is the medium.
4. **Progressive disclosure** — the Master Branch finale is invisible until it isn't. The UI hides its biggest feature until the moment that feature exists.

---

## 0. Cross-cutting changes (do these first)

### 0.1 Type stack + globals — `app/assets/css/main.css`

- Replace the Comic Neue / Comic Mono `@theme` block with the three monospaces from `design-system.md §1.2`. Load via `app.head.link` in `nuxt.config.ts` against Google Fonts (`VT323`, `Share+Tech+Mono`, `IBM+Plex+Mono:wght@400;500;600`).
- Drop `font-feature-settings: "cv11", "ss01"` — Plex Mono picks its own.
- Override the slate neutral palette as shown in `design-system.md §3.1`.
- Add the scanline `body::after` overlay and the noise tile (`bg-noise` utility).
- Add the motion catalogue: `.animate-type-in`, `.animate-flicker`, `.animate-glow-pulse`, `.animate-charge-in`, `.animate-digit-roll`, `.animate-scan-sweep`. Each respects `prefers-reduced-motion`.

### 0.2 Nuxt UI overrides — `app/app.config.ts`

- Set `radius: 'none'` globally where the API allows.
- Override `ui.button.defaultVariants` to `{ color: 'primary', variant: 'outline' }`. Hot fill on hover (12 %), `glow` on focus.
- Override `ui.input` to use `--surface-deep` background, 1-px `--line` border, no radius, monospace caret.
- Override `ui.card` to use `--surface` + 1-px `--line` border + `bg-noise` grain.
- Override `ui.toast` to be rectangular, monospace, glow-on-color.

### 0.3 Voice pass — strings everywhere

Search the codebase for these tokens and replace per `voice.md §2`:

```bash
rg -l --type=vue --type=ts 'Points|Submit|Enter code|Leaderboard|Player|Avatar|Loading|Error|Invalid' app/ shared/
```

Don't ship a single generic label. The CI/CD framing is the operating system.

### 0.4 Persistent `v3.0.0` chip

Add to `app/components/shared/AppShell.vue` (bottom-right, fixed, `--ink-muted`, 11px IBM Plex Mono, with the hover tooltip from `voice.md §8`).

---

## 1. `/check` — the Contributor Terminal (was Code Check)

**Files**: `app/pages/index.vue` and everything under `app/components/redeem/`.

### 1.1 Layout

Single-column, vertically centered, 90vh of usable height. Three stacked zones, separated only by 40-px gutters — no card chrome, no nav, no shell decoration.

```
┌──────────────────────────────────────────────────────────┐
│ <AppShell>                                              │
│  HMR banner (only when active) — amber, full-width      │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│       <script setup> mode — side effects execute        │
│                                                          │
│       > git commit -m "█                              "  │
│                                                          │
│       (typewriter output area, fixed 8 rows of buffer)   │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│       useRoute() ✓   useFetch() ▒   useHead() ▒          │
│              useState() ▒   useRuntimeConfig() ▒          │
│              ────────── V shape ──────────                │
│       PR #1 ✓  PR #2 ✓  PR #3 ▒  PR #4 ▒  PR #5 ▒        │
│                                                          │
│ ─────────────────────────────────────────────────────── │
│  (clue panel — hidden until threshold)                  │
└──────────────────────────────────────────────────────────┘
```

`AppNav` is removed from this route. The only navigation off this page is the avatar/profile popover (top-right of `AppShell`, untouched) and a 12px `v3.0.0` chip bottom-right.

### 1.2 The terminal prompt — replaces `RedeemCodeInput.vue`

The input is the page. Style targets:

- Width: 100 %, max 720px.
- Visual: a 56px-tall row, `bg: var(--surface-deep)`, 1-px `--line` border, no radius. A static `> git commit -m "` in `--vue` to the left of the actual `<input>`. The input itself is borderless, transparent, 28px Share Tech Mono, `--ink`. After the input, a static `"` and a blinking caret block when focused.
- Tailwind sketch:
  ```html
  <label class="block w-full max-w-[720px] mx-auto">
    <div class="flex items-center gap-2 px-5 h-14 border border-[color:var(--line)] bg-[color:var(--surface-deep)] focus-within:border-[color:var(--line-hot)] focus-within:shadow-[0_0_18px_var(--vue-glow)] transition">
      <span class="text-[color:var(--vue)] text-2xl font-display">&gt; git commit -m "</span>
      <input
        ref="el"
        v-model="raw"
        autofocus
        autocomplete="off"
        spellcheck="false"
        class="flex-1 bg-transparent outline-none text-[color:var(--ink)] text-2xl font-display tracking-wide caret-[color:var(--vue)]"
        @keydown.enter="push"
      />
      <span class="text-[color:var(--vue)] text-2xl font-display">"</span>
    </div>
  </label>
  ```

**Forgiving entry**:
- A `formattedCode` computed strips spaces, lowercases for matching, uppercases for display. The user can type `   vuegem 3   ` or `VueGem3` — same result.
- On `Enter`: optimistic submit. The user never waits for a modal to close.
- On rejection: the row gets a 450ms `animate-flicker` + the input briefly flashes `--line-danger`. The terminal below prints the rejection lines (`voice.md §5.4` or §5.5). The input clears and refocuses. **No modal, no toast.**

### 1.3 The terminal output — new `RedeemTerminal.vue`

A fixed 8-row buffer below the input. Each line `type-in`s at ~30 cps. New lines push the buffer up; lines that scroll off the top vanish. The buffer is keyboard-inert. Rich content (a `+250 credits` digit-roll, a check-mark glyph) is allowed but stays inline with the type-in.

Wire it to the redeem API:
```ts
const term = useTerminalBus() // shared composable; pushes lines into the buffer
async function push() {
  const code = normalise(raw.value)
  term.line(`> git commit -m "${code}"`)
  const result = await $fetch('/api/codes/redeem', { method: 'POST', body: { code } })
  for (const line of result.terminalLines) term.line(line) // server returns the script
}
```

The server route (`server/api/codes/redeem.post.ts`) returns a `terminalLines: string[]` field alongside its existing payload — the voice is server-authored so it stays consistent and so admins can tune it without a redeploy. The lines for each outcome are catalogued in `voice.md §5`.

**Minigame trigger**: when the redeem result has `kind: 'trivia' | 'crossword' | 'challenge'`, the terminal prints `> RFC #042 incoming...` and `MinigameHost.vue` opens. The host renders as a takeover within the same column (not a modal — it inherits the page's posture).

### 1.4 The composables + PR tracks — replaces `GemsTracker.vue`

A V-shape arrangement of 5 dots, each labelled with its real composable name (see `voice.md §3`). Empty: 16-px ring in `--line`, label in `--ink-muted` with the empty parens dim. Lit: filled disc in `--vue` with `glow`, `charge-in` animation on transition, then label types in `→ acquired ✓`.

Below, on its own row, 5 rectangular slots — the PR track. Empty: outlined rectangle in `--line`. Filled: solid `--amber` fill, label `PR #1 ✓` types in.

When **either** track hits 5 of 5, the clue panel below `scan-sweep`s into existence (see 1.5). Components subscribe via `useGame().clueUnlocked`.

### 1.5 The unlock — replaces `ClueCta.vue` / `MasterClueModal.vue`

No modal. The clue is part of the page, hidden until unlocked. When `clueUnlocked` flips:

- `scan-sweep` runs over the empty region below the tracks.
- A new card appears with `bg: var(--surface)`, 1-px `--amber` border, `glow-amber`.
- The header types in: `> all composables resolved.` then `> main branch unlocked.`
- Then the body decrypts character-by-character (`▒▒▒▒` cycling per slot, settling per-character left-to-right over 1200ms) into the actual cryptic clue, rendered with syntax-highlighting colors as if it were a code comment.
- A 12-px footer prints: `> the deploy key is somewhere physical. find it.`

This is the only place "amber" appears persistently on `/check`. It signals **this is your task now**.

### 1.6 Sign-in gate — `SignInGate.vue`

Reframe as the terminal trying and failing to authenticate:

```
> git commit -m "VUEGEM1"
> fatal: not authenticated
> run `git auth login` to continue
> [ Push button → /login ]
```

The button is a single primary action: **`git auth login →`**.

### 1.7 Mobile

Everything from 1.1–1.5 collapses cleanly to a 360-px column. Font sizes step down 4–6px. The V-shape of the composables holds — it's the brand mark — but the slot label rows reflow under each dot instead of beside them.

---

## 2. `/tv` — the Pipeline Status Board (was `/leaderboard`)

**Files**: `app/pages/leaderboard.vue`, `app/components/leaderboard/*`.

Rename the route to `/tv` (keep `/leaderboard` as a 301 alias for muscle memory). Add the body class `tv-mode` per `design-system.md §3.2`.

### 2.1 Layout

Four horizontal bands, each filling a deliberate slice of vertical real-estate:

```
┌─────────────────────────────────────────────────────────────┐
│ HMR BANNER (8vh) — only present when multiplier > 1         │
├─────────────────────────────────────────────────────────────┤
│ HEADER (12vh) — "PIPELINE STATUS" + watchEffect indicator   │
├─────────────────────────────────────────────────────────────┤
│ LEADERBOARD (66vh) — top 10 contributors, rank-rise animated │
├─────────────────────────────────────────────────────────────┤
│ TICKER (14vh) — recent redemptions scroll left              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Header

The header is small. Top-left: `PIPELINE STATUS` in 56px VT323. Below it: `watchEffect(() => renderLeaderboard()) — running` in 18px Share Tech Mono, with a 10px green dot. The dot pulses when the realtime subscription is live; it goes amber on a stale subscription and the label flips to `watch paused`.

Top-right: an analog-ish clock readout `15:42:07 / merge window: 02:17:53 remaining` in 18px Share Tech Mono. The remaining-time counter is in `--amber`.

### 2.3 The HMR banner — replaces the in-line multiplier display

A full-width band that exists only when `game.isMultiplierActive`. Tailwind sketch:

```html
<div
  v-if="game.isMultiplierActive"
  class="h-[8vh] flex items-center justify-between px-10 bg-[color:var(--surface)] border-y border-[color:var(--amber)] shadow-[0_0_24px_var(--amber-glow)] animate-glow-pulse"
>
  <div class="flex items-center gap-4 font-display text-4xl text-[color:var(--amber)]">
    <UIcon name="i-lucide-zap" class="h-9 w-9" />
    Vite HMR active — multiplier: {{ game.activeMultiplier }}x
  </div>
  <div class="font-display text-4xl text-[color:var(--amber)] tabular-nums">
    {{ countdown }}
  </div>
</div>
```

The banner enters with `flicker` once, then sustains `glow-pulse`. When it expires the band collapses with a single `flicker` and prints to the ticker: `> HMR session ended. Defaulting to standard build.`

### 2.4 The board itself — refactor `leaderboard/Row.vue`

Top 10 only. Each row is a fixed 60px tall at base zoom (132px in `tv-mode`). Three columns:

1. **Tier glyph + rank** (10 % of width) — `#01` in 72px VT323 (`tv-mode`). Top 3 get a glyph in front: `⬢` (gold), `⬢` (silver), `⬢` (bronze) — but in our palette: top is amber, second is green, third is dim green.
2. **Contributor block** (60 %) — avatar (square, 1-px border, no radius), name in 36px Share Tech Mono. Sub-row: a 5-dot composables strip and a 5-rect PRs strip, scaled small. Sub-sub-row in 14px IBM Plex Mono: `git log --oneline:` followed by the player's `latest` field.
3. **Score** (30 %, right-aligned) — `1,247` in 72px VT323, with `+` digit-roll on update. The trailing label `commit credits` underneath in 14px IBM Plex Mono `--ink-muted`.

A row gaining a position runs `rank-rise`. The flashed background uses `--vue` at 22 % alpha.

### 2.5 Realtime, with stickiness

Subscribe to `players` + `code_redemptions` + `game_config` channels with `useSupabase().channel(...).on('postgres_changes', ...)`. Replace the existing 3-s `$fetch` poll in `useGame` with the channel subscription per the move-to-Supabase-DB swap path already documented in `CLAUDE.md`.

The realtime indicator (the dot next to `watchEffect`) is bound to `channel.subscribe(status => ...)`. A `CHANNEL_ERROR` or `TIMED_OUT` flips the dot to amber and prints `> realtime channel paused. retrying...` to the ticker.

### 2.6 The ticker — replaces nothing (new)

Bottom strip, 14vh, `bg: var(--surface-deep)`, scrolls right→left. Each tick is a redemption from `code_redemptions` (last 50):

```
> alice committed 250 credits (useFetch acquired)    > bob merged PR #3    > carol redeemed VUEGEM7 +150    > Vite HMR active 2x    > ...
```

Names render in `--ink`, verbs in `--vue`, numbers in `--amber`, faux-keywords in `--vue`. The scroll is GPU-accelerated (`transform: translateX(...)` with a `requestAnimationFrame` step). When a new row arrives via realtime, it's prepended to the queue and animates in from the right edge.

### 2.7 Master Branch broadcast — refactor `SuperWinBroadcast.vue`

Implement the full 8-second timeline from `voice.md §7`. Drive it from a `useMasterMergeBroadcast()` composable that owns the timeline:

```ts
const broadcast = useMasterMergeBroadcast()
// fires when game.superWinner flips from null → player
watch(() => game.superWinner, (winner) => {
  if (winner) broadcast.play(winner)
})
```

Implementation tips:
- The leaderboard underneath is **not** destroyed during the broadcast — it's faded to 15 %. This lets the winner's row settle "underneath" the cinematic.
- The 60-particle burst uses one `<canvas>` element sized to the winner-name bounding box. Vue green + amber, gravity 0.06, initial velocity randomized within a 360° cone, drag 0.94, lifetime 1400ms. Don't reach for a particle library — this is one of the few places handwritten Canvas pays off.
- After the broadcast ends, pin the winner's row with a 1-px `--amber` border + the `v3.0.0` chip glued to their name forever. Add a `<game.superWinnerChip>` slot in the leaderboard row for this.

### 2.8 What's killed

- The in-row points "bump" animation that fires randomly. The board only changes on real events.
- Any toast/notification on `/tv`. Feedback on the TV is in the canvas; overlays don't belong here.
- The legacy "multiplier glow inside row" — the multiplier lives in the HMR banner only.

---

## 3. `/admin` — Mission Control (was Admin)

**Files**: `app/pages/admin.vue`, `app/components/admin/*`.

The admin is the only place where the player UX rules invert: the maintainer wants information density and one-click power. Apply the design language, but pack the screen.

### 3.1 Layout — three columns, mission control feel

```
┌─────────────────┬───────────────────────────┬─────────────────┐
│ defineEmits(    │ defineProps<{             │ useDeployKeys() │
│  ['multiplier:  │   contributor: string;    │                 │
│   toggle']      │   delta: number;          │   (codes table) │
│ )               │ }>()                       │                 │
│                 │                            │ provide(        │
│ [Toggle HMR]    │ (contributor list +        │   'superCode',  │
│ [2x][3x][custom]│  ± buttons inline)         │   ref(...)      │
│ [timer +/-]     │                            │ )               │
│                 │                            │                 │
└─────────────────┴───────────────────────────┴─────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ pipeline log — real-time --vue --amber --red lines          │
└─────────────────────────────────────────────────────────────┘
```

Each section header is the rendered Composition-API signature from `voice.md §6` — `defineEmits([...])`, `defineProps<{...}>()`, etc. — in 14px Share Tech Mono in `--vue`, with the `function(arg)` parts syntax-coloured. The headers feel like comments above each panel.

### 3.2 Multiplier panel — refactor `admin/MultiplierPanel.vue`

Three giant preset buttons: `2x` / `3x` / `5x`. Below: a custom input + a timer field. A single big `[Engage HMR →]` button. When pressed:

- The button morphs into `[HMR running — 04:59]` countdown.
- An undo toast appears bottom-right: `Engaged 2x for 5min — Undo (5s)`.
- The undo handler calls `/api/admin/multiplier` with the previous value. After 5s the undo fades.

No confirmation dialog. **Ever.** Undo replaces "are you sure".

### 3.3 Contributor panel — refactor `admin/PlayersPanel.vue`

A dense table: avatar, name, credits, composables/PRs strips, last action. Inline ± buttons on each row for point overrides — single click, no confirmation, undo toast for 5s. Each action posts to `/api/admin/adjust` and prints to the pipeline log:

```
> defineProps({ contributor: 'alice', delta: +250 }) applied
```

A small `[Manual PR merge]` button per row grants a victory code with a custom note. The point override input is a single field that accepts `+250` or `-100` directly — no separate "amount" + "direction".

### 3.4 Codes panel — refactor `admin/CodesPanel.vue`

The codes table, but with a search input pinned to the top and inline state on every row:

- `[ ⬢ active ]` / `[ ✓ merged ]` / `[ ✗ revoked ]` chips in their respective colours.
- A right-side column with a `[Revoke]` / `[Restore]` micro-button per row.
- A "Promote to Super Code" button on each code; clicking it sets the active super code (calls `/api/admin/super-code`) and prints to the log: `> active super code → ${code}. previous winner cleared.`

### 3.5 The pipeline log — new component

Bottom strip, ~30vh tall, scrolling terminal of every realtime event (server-side broadcasts via `code_redemptions` insert + `game_config` update channels). Lines are colour-coded per `voice.md §5`. The log is also the maintainer's diagnostic surface — when realtime drops, the same `> realtime channel paused. retrying...` line lands here.

The log accepts a slash-command input at the bottom (the maintainer's power-tool):
- `/award alice DART-WIN` — drops a victory code on a contributor
- `/hmr 3 600` — engage 3x for 10 minutes
- `/super VUEGEM7` — set the active super code
- `/undo` — undo the last reversible action (uses the same stack the undo toasts populate)

Slash-commands always print their result (or rejection) back to the log, never a modal.

### 3.6 The hidden Easter egg

After 10 reversible admin actions in a single session (tracked in `useState('admin-action-count')`), a 4th column slides in for the rest of the session containing the line:

```
> Evan has approved this migration.
```

No interaction, no border. Disappears on page reload.

---

## 4. AppShell + nav — `app/components/shared/AppShell.vue` and `AppNav.vue`

- The shell's background carries the scanline + radial-glow gradients from `main.css`. Keep.
- The `AppLogo` becomes the literal Vue logo at 24px (SVG), followed by `THE GREAT MIGRATION` in 18px VT323, followed by a small `v3.0.0` chip.
- Drop the `AppNav` route list on `/check` (transient posture). Keep it visible on `/tv` (it's not present today on TV anyway) and `/admin`.
- The `PlayerBadge` (already refactored on `fix/avatar-upload`) keeps its popover, but reword the popover labels per `voice.md §2`:
  - "Display name" → `user.name`
  - "Click to change" → `defineModel({ avatar })`
  - "Sign out" → `git logout`

The popover should also surface the player's current tier (`Composition API contributor` / `Options API contributor` / blank until they've earned something) as a 12px badge under their email.

---

## 5. Minigames — `app/components/games/*`

Reframe each as an RFC the contributor reviews:

- **`Trivia.vue`** → "RFC #042 — Should `v-model` support multiple bindings?" Approve = pick the right answer. The submit button is `[Approve RFC →]`; the cancel is `[Request changes]`. Time-decay value renders as a countdown on the RFC ("merging in 00:14").
- **`Crossword.vue`** → "RFC #017 — The Composition API vocabulary". Same approve/changes verbs. When a clue is solved, a row of `git status: clean ✓` types into a sidebar.
- **`Challenge.vue`** → "RFC #103 — IRL integration test". The "I beat them, referee here" flow becomes "Run integration test on the office floor. Referee signs off in this terminal."

Every minigame renders inline on `/check`, not as a modal. It pushes the rest of the page down. Cancelling restores the redemption terminal.

---

## 6. The fronts that don't change (but need a copy pass)

`app/pages/login.vue`, `app/pages/confirm.vue`, `app/error.vue`: keep the structure, swap the strings. Login is `git auth login`. The 404 prints `> 404: this route was not yet migrated.` with a `git checkout main` link.

---

## 7. Implementation order

1. **Branch off `main`** for each section below; one PR per slice. Per the workflow rule, none of this lands on `main` without review.
2. `0.1`–`0.4` cross-cutting (one PR, the foundation).
3. `2.7` master-merge cinematic (one PR, isolated, easiest to demo).
4. `1.*` Contributor Terminal end-to-end (one PR — `/check` is the most-used surface, do it next).
5. `2.*` Pipeline Status Board (one PR — `/tv` rides on the cross-cutting work and on `2.7`).
6. `3.*` Mission Control (one PR).
7. `5.*` minigames (one PR, last — they're the smallest delta).

Each PR ships with screenshots/screen-recordings. The TV cinematic gets a side-by-side: current `SuperWinBroadcast.vue` vs. new `useMasterMergeBroadcast()` timeline.

---

## 8. What's out of scope (call it now)

- Sound. The design system suggests an optional modem-handshake cue on the finale. Ship muted by default; revisit only if there's time on the day before.
- Real Supabase Realtime. The current poll is fine for `/check` and `/admin`; only `/tv` and the master-merge broadcast genuinely benefit from it. If realtime isn't wired in time, the TV polls every 1.5s instead of 3s — the ticker hides the lag.
- Per-contributor profile pages. The popover is profile enough.
- Theme toggle. The retro-arcade is dark, always. Light mode is a different product.

---

## 9. The one thing this plan must protect

Everything else is negotiable — the type stack, the exact spacing, whether the ticker uses Canvas or DOM, whether the multiplier is amber or a sharper orange. **The Master Branch broadcast is not.** Every other decision in this plan exists to make that 8 seconds hit the room hard. If something on this list trades off against the finale's impact, the finale wins.
