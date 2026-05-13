# The Great Migration — Design System

> Retro-futurist hacker arcade. CRT terminal × neon arcade × war-room scoreboard.
> Every screen should feel like a piece of legacy hardware that has *just* been
> handed a live feed of something it was never built to display.

---

## 1. Tokens

### 1.1 Color

| Role           | Token name             | Value      | Used for                                              |
| -------------- | ---------------------- | ---------- | ----------------------------------------------------- |
| Base           | `--bg`                 | `#0d0f0e`  | Body, page, base surfaces                             |
| Surface raised | `--surface`            | `#13161a`  | Cards, panels, modal bodies                           |
| Surface sunken | `--surface-deep`       | `#090b0b`  | Code blocks, terminal areas, inset wells              |
| Primary        | `--vue`                | `#42b883`  | Brand, success, gems lit, leaderboard accent          |
| Primary dim    | `--vue-dim`            | `#2a7a57`  | Border on hover-off, secondary action                 |
| Primary glow   | `--vue-glow`           | `rgba(66,184,131,0.4)` | All active glows                          |
| Amber          | `--amber`              | `#f5a623`  | Multiplier, victory dots, urgent timers, alerts       |
| Amber glow     | `--amber-glow`         | `rgba(245,166,35,0.45)` | Multiplier banner glow                   |
| Red            | `--red`                | `#ff4444`  | Errors, rejections, destructive admin actions         |
| Text strong    | `--ink`                | `#ffffff`  | Critical readouts only — winner name, prompt char `>` |
| Text body      | `--ink-body`           | `#c9d1c5`  | Normal text on dark surfaces                          |
| Text muted     | `--ink-muted`          | `#7a8079`  | Help text, timestamps, ticker rows                    |
| Border         | `--line`               | `rgba(66,184,131,0.30)` | All borders by default                  |
| Border hot     | `--line-hot`           | `rgba(66,184,131,0.65)` | Focused, active row, hovered button     |
| Border danger  | `--line-danger`        | `rgba(255,68,68,0.55)`  | Error state on inputs                   |

**Rules**
- Pure white is rare. Use `--ink-body` for almost everything readable; promote to `--ink` only for moments that must read across a room (winner name, the `>` prompt character, the score on the TV).
- Vue green is the **friendly** state (gem lit, score going up, code accepted). Amber is **urgent / temporary** (multiplier active, timer counting down, "act now"). Red is **failed / wrong** (invalid code, rejected upload, dangerous action).
- No grays in branding zones. Slate-ish neutrals are fine for raw text on a dark surface but the chrome itself never goes "Vercel gray".

### 1.2 Typography

| Stack                       | Where                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| `'VT323', monospace`        | Display headings, the `>` prompt, the TV rank numbers, winner banner |
| `'Share Tech Mono', monospace` | Subheads, score readouts, ticker, button labels              |
| `'IBM Plex Mono', monospace`   | Body text, help copy, form labels, list rows                  |

No Inter. No Roboto. Zero sans-serif softness. The whole interface is monospaced.

**Sizes (10-foot UI on /tv exempts itself — see section 3.2):**
- Display 1: 56–72px (VT323) — winner banner, page-arrival hero
- Display 2: 36–48px (VT323) — section heads, multiplier banner
- H2 readout: 28px (Share Tech Mono) — leaderboard rank, big score
- H3 / button: 16–20px (Share Tech Mono, tracking +0.04em, uppercase)
- Body: 15px (IBM Plex Mono, line-height 1.55)
- Caption: 12px (IBM Plex Mono, `--ink-muted`)

### 1.3 Spacing & geometry

- Use multiples of **4px**. The whole UI snaps to a 4-px grid.
- **No rounded corners** except gem icons (full circle) and player avatars (full circle). Everything else: 0 radius. Sharp, military, terminal.
- Borders are always **1px** solid. Hover-promote to `--line-hot`, never to thickness 2.
- Padding rhythm: 12 / 16 / 24 / 40. The 40-px gutter is reserved for between major page regions on /tv.

### 1.4 Effects

- **Scanlines**: a body-level overlay, 2px repeating horizontal gradient at 5 % opacity. Fixed-position, `pointer-events: none`, `z-index: 9999`.
  ```css
  body::after {
    content: "";
    position: fixed; inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.04) 0,
      rgba(255,255,255,0.04) 1px,
      transparent 1px,
      transparent 3px
    );
    pointer-events: none;
    z-index: 9999;
  }
  ```
- **Grain**: a 240×240px noise tile, 6 % opacity, multiply-blended onto cards.
- **Glow** replaces drop-shadow everywhere:
  ```css
  .glow      { box-shadow: 0 0 12px var(--vue-glow); }
  .glow-hot  { box-shadow: 0 0 28px var(--vue-glow), inset 0 0 24px rgba(66,184,131,0.18); }
  .glow-amber{ box-shadow: 0 0 24px var(--amber-glow); }
  .glow-red  { box-shadow: 0 0 18px rgba(255,68,68,0.5); }
  ```
- Active inputs / focused fields glow green. Hovered buttons glow green. Multiplier banner glows amber. Error toasts/inputs glow red.

---

## 2. Motion vocabulary

A small, opinionated catalogue. Every animation in the app comes from this list — no one-off curves.

| Name             | What it does                                                                                                | Where it fires                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `type-in`        | Characters reveal left-to-right at ~30 cps with a blinking caret at the leading edge.                       | Terminal output after a redeem; the cryptic Master Branch clue. |
| `flicker`        | 80–120ms screen-wide opacity dip (0.6) followed by snap-back.                                               | Code rejected; admin destructive action; multiplier flip.    |
| `glow-pulse`     | Box-shadow `0 0 6px → 0 0 20px → 0 0 6px` over 1.8s, infinite.                                              | Active multiplier banner; the unlocked-clue panel.           |
| `charge-in`      | A horizontal fill animates left→right inside an empty cell (gem slot, victory slot) over 380ms.             | Gem lit; victory recorded.                                   |
| `rank-rise`      | Row translates up ~40px with a green flash, settles in 800ms.                                              | Leaderboard row gains a rank.                                |
| `digit-roll`     | Points counter rolls up using `Intl.NumberFormat` interpolation across 600ms with each digit dropping in.   | Personal score after redeem; leaderboard score.              |
| `scan-sweep`     | A 2-px bright green line sweeps top→bottom across a panel once over 700ms.                                  | Panel arrives on screen for the first time (one-shot).       |
| `master-merge`   | A multi-stage cinematic sequence — see §4.                                                                  | Super Code is redeemed.                                      |

Implementation lives in `app/assets/css/main.css` as utility classes (`.animate-type-in`, `.animate-flicker`, etc.) so components stay declarative.

**Reduced motion**: every animation in the catalogue must have a `@media (prefers-reduced-motion: reduce)` fallback that drops to a single 120ms opacity fade. The `master-merge` finale stays — it's a feature, not chrome — but its particle burst is omitted.

---

## 3. Component theming

### 3.1 Nuxt UI overrides

The defaults bleed too much "modern SaaS" — override aggressively in `app/app.config.ts → ui.*`. The current config keys `primary: emerald, neutral: slate, warning: amber, error: rose` are roughly right, but the **slate** neutral is too blue. Replace with a custom neutral tuned at the CSS-variable level via `@theme`:

```css
@theme {
  --color-neutral-50:  #f3f4f2;
  --color-neutral-100: #d9dcd8;
  --color-neutral-200: #b1b6ae;
  --color-neutral-300: #8a8f86;
  --color-neutral-400: #686d65;
  --color-neutral-500: #4a4e47;
  --color-neutral-600: #353833;
  --color-neutral-700: #232622;
  --color-neutral-800: #16181a;
  --color-neutral-900: #0d0f0e;
  --color-neutral-950: #06080a;
  --color-primary-500: #42b883;
  --color-warning-500: #f5a623;
  --color-error-500:   #ff4444;
}
```

Per-component overrides via `ui.button`, `ui.input`, `ui.card`, `ui.badge`, `ui.popover`, `ui.modal`, `ui.toast`:

- **Button**: no border-radius (`rounded: 'none'`), uppercase Share Tech Mono label, primary variant uses `outline` style by default — a 1-px green border + transparent fill, hover fills 12 %, focus pulses with `glow`.
- **Input**: `bg: var(--surface-deep)`, 1-px `--line` border, no radius, focus → `--line-hot` + `glow`, monospace caret. The "default" Nuxt UI input never appears.
- **Card**: `bg: var(--surface)`, 1-px border, no radius, optional `grain` overlay, optional `scan-sweep` on first paint.
- **Badge**: rectangular, mono, uppercase, two variants — *green* (lit / on / accepted) and *amber* (urgent / pending / multiplier).
- **Toast** (`UNotification`): pinned bottom-right on the player app, but on /tv it's **disabled** — feedback on the TV is in the canvas itself, never overlay.

### 3.2 10-foot UI scale

`/tv` is a separate visual world. It assumes a 1080p/4K display 3–5 m from viewers, no interaction. Add a body class `tv-mode` set when the route matches:

- Base font-size jumps to 22px on `tv-mode`, so 1rem = 22px everywhere — every UI thus scales without bespoke sizes.
- Rank numbers: 72px VT323. Player names: 36px Share Tech Mono. Scores: 56px VT323.
- The scanline overlay opacity doubles to 10 % — it reads as deliberate at viewing distance, where the 5 % version disappears.

---

## 4. The Master Branch finale

The cinematic moment. Treat the rest of the design system as scaffolding that exists to make this 8-second sequence land.

**Trigger**: `/api/codes/redeem` returns a "super" result, `game_config.super_winner` flips to a player id, leaderboard's realtime subscription fires.

**Sequence**, in order, with timings:

| t (ms) | Event                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------- |
| 0      | All non-broadcast UI on /tv `flicker` once (80ms).                                                |
| 80     | Leaderboard fades to 15 % opacity behind a `--surface-deep` overlay (200ms ease-out).             |
| 280    | A 6-line ASCII banner `type-in`s in `--vue` (one line / 200ms): `> branch master` / `> checking integrity ...` / `> conflicts: 0` / `> merging` / `> █` / *(blank)*. |
| 1500   | Banner clears. Winner readout fades up: `WINNER` in 36px amber Share Tech Mono.                   |
| 1800   | Winner name slams in at 96px VT323 in `--ink` with a `glow-hot` ring. Optional `digit-roll` of "+1000 PTS". |
| 2400   | A 60-particle burst — half `--vue`, half `--amber` — animates outward from the winner name over 1.4s. |
| 4000   | Sub-line types in: `> well played, $name. the migration is complete.`                              |
| 5500   | Banner holds for ~2.5s.                                                                            |
| 8000   | Sequence ends. Leaderboard fades back to 100 % with the winner permanently pinned to row 1 inside a 1-px amber border. |

Implementation notes:
- Drive the sequence from a single `useMasterMergeBroadcast()` composable that owns the timeline. Components subscribe and render their slice.
- The audio cue is optional but if present: a single soft modem-handshake-style sample, normalized to peak −12 dB. Default muted; admin toggle in the architect panel.
- After 8s the broadcast does **not** auto-dismiss for the TV view — the architect dismisses it via `/api/super-event/dismiss`. The /tv view watches `game.superWinner` and keeps the row pinned regardless.

---

## 5. Accessibility (non-negotiable)

- Color contrast ≥ 4.5:1 for body text on `--bg`. Verified: `--ink-body #c9d1c5` on `#0d0f0e` = 11.7:1. ✓
- Vue green on dark: `#42b883` on `#0d0f0e` = 7.3:1. ✓ (acceptable for body, ideal for headings and large readouts).
- Amber on dark: `#f5a623` on `#0d0f0e` = 9.6:1. ✓
- Focus rings: every interactive element gets a 2px `--line-hot` outset + 4px `--vue-glow`. Never rely on color alone for focus.
- Every animation respects `prefers-reduced-motion`.
- Touch targets ≥ 44 × 44 on the player app. The code input on `/check` is intentionally larger.

---

## 6. Easter egg

The repo is called *Comic Sans Appreciation Society*. Hide a single appearance of Comic Sans somewhere only the architects can find. Suggested: the admin panel's section header for "Override player points" renders in 12px Comic Neue. That is the only sanctioned violation of the type system.
