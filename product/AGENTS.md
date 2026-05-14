# AGENTS.md

Style, voice, and component rules for any agent (Claude Code, Cursor, Aider, Copilot, a human collaborator at 23:00) working inside `product/`.

This file is the **enforceable** version of the docs in `../docs/`:

- `../docs/concept.md` — what the product is (a day-long Vue-3-release-day game)
- `../docs/design-system.md` — visual tokens + motion catalogue + master-merge finale
- `../docs/voice.md` — every label, button, error, toast is a line from a live deployment
- `../docs/refactor-plan.md` — the component-by-component target

When `docs/` and this file disagree, **this file wins** for code; the docs win for intent. If the disagreement is load-bearing, update both.

For workflow, rstore, forms, and architecture rules, see `CLAUDE.md` next to this file — none of those are duplicated here.

---

## 1. Type stack

Three monospaces. Zero sans-serif. Set in `app/assets/css/main.css → @theme`; loaded by `@nuxt/fonts`.

| CSS var          | Family             | Used for                                                      |
| ---------------- | ------------------ | ------------------------------------------------------------- |
| `--font-display` | `VT323`            | Headlines, the `>` prompt, TV rank numbers, winner banner.    |
| `--font-mono`    | `Share Tech Mono`  | Subheads, button labels, score readouts, ticker.              |
| `--font-body`    | `IBM Plex Mono`    | Body text, help copy, form labels, list rows. Also `--font-sans`. |

Don't reach for a fourth typeface. The only sanctioned violation is the Comic Neue easter egg (`docs/design-system.md §6`).

## 2. Color tokens

The Tailwind-utility friendly tokens come from `@theme` in `main.css` (`text-primary-500`, `bg-neutral-900`, etc.). The raw, opinionated tokens live on `:root` and are what most components reach for directly:

```
--bg / --surface / --surface-deep      surfaces, deepest = inset wells / terminals
--vue / --vue-dim / --vue-glow         friendly state (accepted, success, gem lit)
--amber / --amber-glow                 urgent / temporary (HMR active, "act now")
--red                                  failed / rejected / dangerous
--ink / --ink-body / --ink-muted       text — promote to --ink only for room-readable moments
--line / --line-hot / --line-danger    borders. Hover promotes to --line-hot, never to thickness 2.
```

Pure white is rare. `--ink-body` for almost everything readable; `--ink` is only for winner names, the `>` prompt glyph, and the score on the TV.

## 3. Geometry

- Snap to a **4-px grid**. Padding rhythm: 12 / 16 / 24 / 40. The 40-px gutter is reserved for between major page regions on `/tv`.
- **No rounded corners** except gem icons and avatars (both full circle). Everything else: `rounded-none`. Sharp, military, terminal.
- Borders are **1px** solid. Always.

## 4. Effects — only from the catalogue

Glow replaces drop-shadow everywhere. Use the utility classes from `main.css`:

```
.glow         0 0 12px var(--vue-glow)
.glow-hot     0 0 28px var(--vue-glow), inset 0 0 24px ...   (focused / cinematic)
.glow-amber   0 0 24px var(--amber-glow)
.glow-red     0 0 18px ...
```

No bespoke `box-shadow`. If you need a new glow, add it to `main.css` first.

## 5. Motion vocabulary — closed catalogue

Every animation in the app picks from this list. Pre-built utilities live in `main.css` with a `prefers-reduced-motion` fallback. **Do not invent one-off curves.**

| Name             | Purpose                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| `type-in`        | Characters reveal left-to-right (configurable via `--type-in-steps` + `--type-in-duration`). |
| `flicker`        | 120ms screen-wide opacity dip. For rejections + destructive flips.           |
| `glow-pulse` / `-amber` | Sustained ambient pulse on multiplier banner / unlocked clue.        |
| `charge-in`      | Horizontal fill inside empty cells — gem lit, victory recorded.              |
| `digit-roll`     | Counter rolls up.                                                            |
| `scan-sweep`     | 2-px green line sweeps top→bottom (one-shot on panel arrival).               |
| `master-merge`   | The protected finale, owned by `useMasterMergeBroadcast()`. Multi-stage.     |

The master-merge cinematic is **not negotiable**. Every other animation trades off against making it land hard.

## 6. Nuxt UI primitives — always over native HTML

`<UInput>` over `<input>`. `<UButton>` over `<button>`. `<UAlert>` over a hand-rolled error div. `<NuxtLink>` over `<a href>` for internal nav.

Component overrides for the design language live in `app/app.config.ts → ui.*`:

- All defaults set `rounded-none + font-mono`.
- `button` default variant is `outline`. Hover fills 12 %, focus pulses with `glow`.
- `input` / `textarea` / `select` use `--surface-deep` wells with `--line` borders.
- `card` / `modal` / `popover` use `--surface` panels with `--line` borders.
- `toast` is rectangular, mono, with `glow`.

If a component renders un-overridden defaults, fix the override first; don't sprinkle utility classes per call site.

## 7. Voice — every string is a line from a live deployment

The narrative frame is in `docs/voice.md §1`. Every label, button, toast, error is reframed as part of a Vue 2 → Vue 3 production migration. The replacement table (`docs/voice.md §2`) is enforceable — search-and-replace:

| Generic                  | Migration voice                                  |
| ------------------------ | ------------------------------------------------ |
| Points                   | Commit credits                                   |
| Submit                   | Push to origin → (or `git commit -m`, depending) |
| Sign in / out            | git auth login / git logout                      |
| Player / Admin           | Contributor / Maintainer                         |
| Leaderboard              | Pipeline status                                  |
| Error                    | Breaking change detected                         |
| Loading…                 | Resolving async dependency…                      |
| Display name             | `user.name`                                      |
| Save                     | Commit                                           |

**Rule:** if a button says "Submit" anywhere, it is wrong. It says "Push to origin →" or "git commit -m" or "Approve RFC →" — whichever fits the surface.

System actions print as terminal lines (`docs/voice.md §5`). The server authors them (`server/api/codes/redeem.post.ts` returns `lines: string[]`) and the client appends them into `useTerminalBus()`.

## 8. The 5 composables (replaces "gems")

```
useRoute  · useFetch · useHead · useState · useRuntimeConfig
```

Order is fixed (`#shared/constants/game.ts → COMPOSABLES`) — it drives the V-shape arrangement on `/check`. Lit slots glow Vue green; the trailing `✓` types in.

The 5 PR slots (victories) get rectangular slots in `--amber`. Either track hitting 5/5 unlocks the cryptic clue inline (no modal — `docs/refactor-plan.md §1.5`).

## 9. The `v3.0.0` chip

Lives in `SharedVersionChip`. Fixed bottom-right by default. Tooltip is canon:

> Released: 2020-09-18. Today: the migration completes.

After the master-merge fires, the chip pins to the winner's name in the leaderboard for the rest of the day (`:inline` variant).

## 10. Quotes that survive

Two literal strings every agent should preserve verbatim, even on rewrites:

- `Vue 3 is not a rewrite. It's a migration. So is today.` (`APP_QUOTE`)
- `> 404: this route was not yet migrated.` (the 404 page line)

If either drifts, restore it.

## 11. tv-mode

`/tv` is a separate visual world. AppShell adds `tv-mode` to `<html>` when the route matches; `main.css` doubles the scanline opacity and ups the base font-size at that class. The header is suppressed entirely — the TV is its own canvas.

Anything you build for `/tv` must read across a 3–5 m room. If the eye has to lean in, the font is too small.

## 12. Admin inverts player rules

The maintainer console packs the screen. Information density wins; one-click power wins. No confirmations — **ever**. Reversible actions get a 5-second undo toast (`useAdminActions().pushUndo(...)`). The pipeline log accepts slash commands (`/hmr 3 600`, `/super VUEGEM7`, `/undo`); their results print back to the log, never a modal.

## 13. Linting

`pnpm lint` / `pnpm lint:fix`. The flat config (`eslint.config.mjs`) is `@antfu/eslint-config` with a small carve-out (see comments in the file). Run `:fix` before pushing; the autofixer is opinionated but stable.

## 14. When something doesn't fit

If you need to break a rule, drop a short `// design-system exception:` comment naming what you broke and why. Future agents — including you, four hours from now — should be able to grep for those.

The master-merge cinematic is the one rule you can't break.
