export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // The MarqueeTicker uses the deprecated native <marquee> element on purpose
  // (the joke). Vue's compiler warns on unknown tags, so flag it as a custom
  // element to skip component resolution.
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag === 'marquee',
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
    '@rstore/nuxt',
  ],

  // The fonts module reads the `@theme` block in app/assets/css/main.css
  // (Tailwind v4 token names) and downloads + self-hosts each family.
  // Subsets/styles are trimmed to what we actually render.
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      { name: 'VT323',           weights: [400],           provider: 'google' },
      { name: 'Share Tech Mono', weights: [400],           provider: 'google' },
      { name: 'IBM Plex Mono',   weights: [400, 500, 600], provider: 'google' },
    ],
  },

  // rstoreDirs default to ['rstore'] resolved relative to srcDir (app/), so
  // app/rstore/ and app/rstore/plugins/ are scanned automatically.

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  supabase: {
    // No generated database types — the data layer is in-memory in repo.ts.
    // Disabling stops the boot-time WARN that hunts for database.types.ts.
    types: false,
    // Game pages stay anonymous (Code Check + Leaderboard). Only /admin is
    // gated — the module auto-redirects unauthed visitors there to /login
    // and stashes the original destination in a cookie for /confirm to read.
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/admin(/*)?'],
      saveRedirectToCookie: true,
    },
  },

  vite: {
    optimizeDeps: {
      // Pre-bundle so Vite doesn't trigger a page reload the first time
      // each surface mounts (Vite asked nicely in dev).
      include: ['@rstore/vue', 'canvas-confetti'],
    },
  },

  runtimeConfig: {
    public: {
      // Whitelist surfaced to the client so the admin route middleware can
      // gate before any API call. Emails are not secrets.
      adminEmails: process.env.ADMIN_EMAILS ?? '',
    },
  },

  app: {
    head: {
      title: 'The Great Migration · Vue 3 Upgrade Day',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      // Fonts are self-hosted via @nuxt/fonts (see `fonts` config above);
      // no <link> tags to Google Fonts.
    },
  },
})
