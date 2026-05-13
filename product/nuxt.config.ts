export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  supabase: {
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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/comic-mono@0.0.1/index.css' },
      ],
    },
  },
})
