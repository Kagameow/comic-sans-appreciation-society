# The Great Migration — Voice & Narrative

> *"Vue 3 is not a rewrite. It's a migration. So is today."*

This document is the operating system the rest of the product runs on. Every label, every button, every toast, every error message is reframed as part of a live production deployment to Vue 3. If a string in the UI is generic ("Submit", "Points", "Error") it is wrong. Replace it.

The visual language is in [`design-system.md`](./design-system.md). This file is what those pixels are *saying*.

---

## 1. The narrative frame

The player is not collecting points. They are **migrating their codebase to Vue 3.**

| Surface              | Reframed as                                           |
| -------------------- | ----------------------------------------------------- |
| The whole day        | A live production deployment                          |
| The game             | A CI/CD run from `feature/vue3` to `main`             |
| The leaderboard      | A pipeline status board                               |
| The Code Check page  | The contributor's terminal                            |
| The admin panel      | Mission control / maintainer console                  |
| The Super Code       | The final merge into `main`                           |
| The Master Branch    | Production                                            |
| The multiplier       | Vite HMR turbo mode                                   |
| A redeemed code      | A passing test suite                                  |
| An invalid code      | A build failure                                       |

The hackathon day itself is the migration window. Vue 2 is deprecated at end-of-day. Every contributor's job is to land on `main` before sunset.

---

## 2. Vocabulary replacement — enforced everywhere

Search-and-replace these across all UI strings. If the new term is awkward, find another Vue-3-shaped phrase, but never fall back to the generic.

| Generic                  | Migration voice                                  |
| ------------------------ | ------------------------------------------------ |
| Points                   | Commit credits                                   |
| Gems                     | Composables                                      |
| Victories                | Merged PRs                                       |
| Code (the input)         | Deploy key                                       |
| Enter code               | `git commit -m`                                  |
| Submit                   | Push to origin →                                 |
| Leaderboard              | Pipeline status                                  |
| Player                   | Contributor                                      |
| Admin / Architect        | Maintainer                                       |
| Invalid code             | Build failed                                     |
| Already used             | Already merged                                   |
| Code accepted            | ✓ Tests passing                                  |
| Master Branch clue       | `main` branch unlocked                           |
| Super Code redeemed      | MERGED TO PRODUCTION                             |
| Multiplier active        | Turbo mode: Vite HMR live                        |
| Rank                     | Contributor tier                                 |
| Loading…                 | Resolving async dependency…                      |
| Error                    | Breaking change detected                         |
| Sign in                  | `git auth login`                                 |
| Sign out                 | `git logout`                                     |
| Profile                  | `~/.gitconfig`                                   |
| Avatar                   | Contributor profile picture                      |
| Display name             | `user.name`                                      |
| Save                     | Commit                                           |

**Rule:** if a button says "Submit" anywhere, it is wrong. It says **"Push to origin →"**.

---

## 3. The 5 composables (replaces "gems")

Each of the 5 progress slots is a real Vue 3 composable. When a slot fills, the composable's name lights up next to it.

| Slot | Composable           | Lit-state label                       |
| ---- | -------------------- | -------------------------------------- |
| 1    | `useRoute`           | `useRoute() → acquired ✓`              |
| 2    | `useFetch`           | `useFetch() → acquired ✓`              |
| 3    | `useHead`            | `useHead() → acquired ✓`               |
| 4    | `useState`           | `useState() → acquired ✓`              |
| 5    | `useRuntimeConfig`   | `useRuntimeConfig() → acquired ✓`      |

Empty slots show the dimmed signature: `useRoute()` in `--ink-muted` with an empty parenthesis. Lit slots glow Vue green and the trailing `✓` types in via the `type-in` animation.

The 5 slots are arranged in a **V** shape that mirrors the Vue logo (3 left arm, 2 right arm offset, the bottom one is the join). When all 5 fill, the whole V pulses once and the line below types in: `> all composables resolved. main branch unlocked.`

---

## 4. The two paths to `main`

Both unlock paths land on the same goal — find the Super Code, merge to production. They are framed canonically:

- **Composition API path** (the gems / composable track):
  > *"Refactoring via Composition API — 5 composables to qualify."*
- **Options API path** (the IRL match / victories track):
  > *"Legacy Options API contributor — 5 merged PRs to qualify."*

When the player hits 5 of either, the unlocked-clue panel reveals with the typed line:
> `> congratulations. you've reached feature-parity with main.`
> `> here is the path to production:`
> *(then the cryptic Super Code clue, syntax-highlighted as if it were a code comment)*

This bakes Vue 3's actual philosophy — both APIs are valid, both lead to the same place — directly into the game.

---

## 5. The system voice — terminal output library

Every system action prints like terminal output. Lines `type-in` left-to-right at ~30 cps in `--vue` on `--surface-deep`. The line is prefixed with `>` in `--ink`.

### 5.1 Boot / arrival

```
> Initializing Vue 3 migration...
> Scanning office for deploy keys...
> Migration window: 09:00 – 18:00
> Vue 2 support deprecated at EOD
> All contributors must reach `main` before sunset
```

### 5.2 Code redeemed (point / minigame)

```
> git commit -m "VUEGEM3"
> Running test suite...
> ✓ 12 tests passing
> useFetch() → composable acquired
> ref(credits).value += 150
> Pushed to origin.
```

### 5.3 Code redeemed (victory)

```
> git commit -m "DART-WIN"
> Reviewing PR #4...
> Approved by maintainer.
> Merged into feature/vue3 ✓
```

### 5.4 Code rejected (invalid)

```
> git commit -m "ASDF"
> ⚠ Breaking change detected.
> This deploy key is incompatible with Vue 3.
> Aborting.
```

Screen `flicker`s once, the input shakes, the line stays for 4s then fades.

### 5.5 Code rejected (already merged)

```
> git commit -m "VUEGEM1"
> ⚠ Already merged into main.
> Nothing to commit.
```

### 5.6 Multiplier active

```
> ⚡ Vite HMR activated
> All changes hot-reloaded at 2x speed
> Window closes in 04:59
```

The banner stays visible for the duration, the timer counts down.

### 5.7 Unlock — `main` branch revealed

```
> All composables resolved.
> main branch unlocked.
> Decrypting merge instructions...
> ▒▒▒▒▒▒▒▒▒▒▒▒▒  →  ${THE_ACTUAL_CLUE}
```

### 5.8 Master merge (the finale — full sequence in §7)

```
> Verifying deploy key...
> Authentication successful
> Resolving merge conflicts... none found
> Running final test suite...
> ✓ 847 tests passing
> Preparing to merge into main...
```

### 5.9 Admin actions

```
> defineEmits(['multiplier:toggle']) fired
> defineProps({ contributor: 'alice', delta: +250 }) applied
> Maintainer override: reverted last commit
> Press [⌘Z] to undo
```

---

## 6. Vue 3 mechanics as flavoring

Sprinkle these throughout. They are decoration, not load-bearing — but they are dense enough that a Vue developer reading the UI sees their own framework reflected back at them.

### `<script setup>` mode

The Code Check page sits the player in `<script setup>` mode. Subtle subhead under the page title:

> *`<script setup>` mode — side effects execute immediately.*

### Reactivity primitives

The leaderboard top row carries the label:

> *`watchEffect(() => renderLeaderboard())` — running*

A subtle pulsing green dot next to "running" indicates the realtime subscription is live. If the realtime channel drops, the dot turns amber and the label becomes `watch paused`.

Score updates print as decorated reactivity calls in the redemption terminal:

> *`ref(score).value += 250`*

### Vite — the multiplier

The chaos multiplier IS Vite HMR. Banner text:

> *`⚡ Vite HMR active — multiplier: 2x`*

The badge icon is a stylized lightning bolt. When the timer expires:

> *`HMR session ended. Defaulting to standard build.`*

### Teleport — the finale

The transition INTO the Master Branch broadcast uses the word "teleport" literally. Before the screen wipes:

> *`<Teleport to="#production"> ...`*

That line types in, the chevron blinks, the screen takes over.

### Suspense — loading states

Every async wait wraps in a "Suspense boundary". Skeleton states show:

> *`Resolving async dependency...`*

Never the word "Loading".

### defineEmits / defineProps — admin headers

Admin panel section headers ARE Composition API signatures:

| Section                  | Header (rendered as code)                                |
| ------------------------ | -------------------------------------------------------- |
| Multiplier control       | `defineEmits(['multiplier:toggle'])`                     |
| Manual point override    | `defineProps<{ contributor: string; delta: number }>()`  |
| Code registry            | `useDeployKeys()`                                        |
| Active Super Code picker | `provide('superCode', ref(...))`                          |

### Minigame challenges as RFCs

Each trivia / crossword / challenge is a numbered RFC. Heading:

> *RFC #042 — Should `v-model` support multiple bindings?*
> *Approve to earn 200 commit credits.*

The "Submit answer" button becomes **"Approve RFC →"**, the cancel becomes **"Request changes"**.

### Hidden v-directives

Tiny decorative code fragments on card edges, in disabled states, as placeholder copy. None are functional. Examples:

- Above the leaderboard list, in 11px `--ink-muted`: `v-for="contributor in pipeline"`
- Inside an empty multiplier slot: `v-if="hmr.active"`
- On the disabled "push" button before a code is typed: `v-model="commitMessage"`
- The login email field placeholder: `:value="user.email"`

---

## 7. The Master Branch broadcast — full script

The cinematic moment, beat-by-beat. Replaces the timeline in `design-system.md §4` — when they conflict, this version wins.

```
[0.0s]  Screen dims to black via flicker, leaderboard fades to 15% opacity.
[0.5s]  Centered cursor █ blinks in --ink.
[1.0s]  > Verifying deploy key...
[1.8s]  > Authentication successful
[2.2s]  > Resolving merge conflicts... none found
[2.8s]  > Running final test suite...
[3.2s]  > ✓ 847 tests passing
[3.5s]  > Preparing to merge into main...
[4.0s]  Full-screen flash in --vue, holds 80ms.
[4.1s]  MASSIVE TEXT (96px VT323, --ink, glow-hot):
        MERGED TO PRODUCTION
[4.3s]  Winner's name slams in at 120px VT323 in --vue.
[4.5s]  Subtitle (28px Share Tech Mono, --ink-body):
        Vue 3 migration complete.
        Options API officially deprecated.
[4.8s]  Particle burst — 60 particles, ~half --vue half --amber,
        outward from the winner name over 1.4s.
[5.5s]  Smaller text fades in (20px Share Tech Mono, --ink-muted):
        git tag v3.0.0 — released to the world
[7.0s]  Sub-line types in:
        > well played, ${name}.
        > the migration is complete.
[stays] Leaderboard fades back in underneath at 100%, with the
        winner permanently pinned in row 1 inside a 1-px --amber border.
        A small `v3.0.0` chip appears next to their name forever.
```

The /tv view does not auto-dismiss. A maintainer dismisses it from the admin panel; even after dismissal, the winner's row keeps the amber border + `v3.0.0` chip for the rest of the day.

---

## 8. Easter eggs

- The line *"Vue 3 is not a rewrite. It's a migration. So is today."* appears once on `/check` as a quiet subhead under the terminal prompt, and again as the very last frame of the master-merge broadcast (8s in, fades after the leaderboard returns).
- The admin panel has a hidden tile, only visible after the architect performs 10 actions in one session: **"Evan has approved this migration."** Rendered in 14px IBM Plex Mono, `--ink-muted`, no border. Disappears on page reload.
- Konami code on `/tv` triggers a one-time `console.log('// TODO: rewrite in Rust')` and an amber flicker. Nothing else. The dev tools become part of the show.
- The `v3.0.0` chip in the bottom-right corner of every view is hoverable: tooltip reads *"Released: 2020-09-18. Today: the migration completes."*
- The 404 page reads `> 404: this route was not yet migrated.` with a single `<NuxtLink to="/">git checkout main</NuxtLink>` link.

---

## 9. The line

Memorize it. Use it. Build the day around it.

> *"Vue 3 is not a rewrite. It's a migration. So is today."*
