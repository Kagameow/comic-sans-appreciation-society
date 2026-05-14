export const TOTAL_GEMS = 5
export const TOTAL_VICTORIES = 5

export const SUPER_CLUE
  = 'Where the build artifacts rest and the green checkmark hums — seek the kiosk that never sleeps.'

/**
 * docs/voice.md §3 — the 5 progress slots map to real Vue 3 composables.
 * Order matters: it drives the V-shape arrangement on /check (three-left,
 * two-right, the bottom one joins the legs).
 */
export const COMPOSABLES = [
  'useRoute',
  'useFetch',
  'useHead',
  'useState',
  'useRuntimeConfig',
] as const

export const APP_VERSION = 'v3.0.0'
export const APP_TAGLINE = 'THE GREAT MIGRATION'
export const APP_QUOTE = 'Vue 3 is not a rewrite. It\'s a migration. So is today.'
