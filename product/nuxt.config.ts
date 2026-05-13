export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  supabase: {
    // POC: the app reads its game state from the in-memory repo. Supabase is
    // wired so that route middleware + serverSupabaseClient/User are available
    // for the auth swap — but redirect is disabled so anonymous play still works.
    redirect: false,
  },

  runtimeConfig: {
    adminEmails: process.env.ADMIN_EMAILS ?? '',
    public: {
      currentPlayerName: process.env.NUXT_PUBLIC_CURRENT_PLAYER_NAME ?? 'Daan Nagtegaal',
    },
  },

  app: {
    head: {
      title: 'The Great Migration · Vue 3 Upgrade Day',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
