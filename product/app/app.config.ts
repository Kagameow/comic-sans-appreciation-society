// Nuxt UI v4 overrides — turns the defaults from "modern SaaS" into the
// retro-arcade chrome described in docs/design-system.md §3.1.
//
// Rules of thumb:
//   • zero border radius (sharp / terminal)
//   • monospace everywhere (the body font is already Plex Mono via main.css)
//   • outline-by-default buttons, hot-fill on hover, glow on focus
//   • inputs use --surface-deep wells with 1-px --line borders
//   • cards drop the soft shadow for a 1-px --line border
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate',
      success: 'emerald',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
    },
    button: {
      slots: {
        base: [
          'rounded-none font-mono uppercase tracking-[0.04em]',
          'focus-visible:outline-none focus-visible:ring-0',
          'focus-visible:shadow-[0_0_18px_var(--vue-glow)]',
          'transition-[background-color,box-shadow,border-color]',
        ].join(' '),
      },
      defaultVariants: { color: 'primary', variant: 'outline' },
    },
    input: {
      slots: {
        base: [
          'rounded-none font-mono',
          'bg-[var(--surface-deep)]',
          'border border-[color:var(--line)]',
          'focus-visible:border-[color:var(--line-hot)]',
          'focus-visible:shadow-[0_0_18px_var(--vue-glow)]',
          'caret-[color:var(--vue)]',
        ].join(' '),
      },
    },
    textarea: {
      slots: {
        base: [
          'rounded-none font-mono',
          'bg-[var(--surface-deep)]',
          'border border-[color:var(--line)]',
          'focus-visible:border-[color:var(--line-hot)]',
          'focus-visible:shadow-[0_0_18px_var(--vue-glow)]',
          'caret-[color:var(--vue)]',
        ].join(' '),
      },
    },
    select: {
      slots: {
        base: 'rounded-none font-mono bg-[var(--surface-deep)] border border-[color:var(--line)]',
      },
    },
    selectMenu: {
      slots: {
        base: 'rounded-none font-mono bg-[var(--surface-deep)] border border-[color:var(--line)]',
      },
    },
    card: {
      slots: {
        root: 'rounded-none bg-[var(--surface)] border border-[color:var(--line)] shadow-none',
        header: 'border-b border-[color:var(--line)]',
        footer: 'border-t border-[color:var(--line)]',
      },
    },
    badge: {
      slots: {
        base: 'rounded-none font-mono uppercase tracking-[0.04em]',
      },
    },
    alert: {
      slots: {
        root: 'rounded-none font-mono',
      },
    },
    toast: {
      slots: {
        root: [
          'rounded-none font-mono',
          'bg-[var(--surface)] border border-[color:var(--line)]',
          'shadow-[0_0_18px_var(--vue-glow)]',
        ].join(' '),
      },
    },
    modal: {
      slots: {
        content: 'rounded-none bg-[var(--surface)] border border-[color:var(--line)]',
      },
    },
    popover: {
      slots: {
        content: 'rounded-none bg-[var(--surface)] border border-[color:var(--line)]',
      },
    },
    formField: {
      slots: {
        label: 'font-mono text-xs uppercase tracking-[0.04em] text-[color:var(--ink-muted)]',
        hint: 'font-mono text-xs text-[color:var(--ink-muted)]',
        help: 'font-mono text-xs text-[color:var(--ink-muted)]',
        error: 'font-mono text-xs text-[color:var(--red)]',
      },
    },
  },
})
