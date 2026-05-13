export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // NOTE: `@nuxtjs/supabase` is intentionally NOT registered yet — it fails to
  // boot without SUPABASE_URL/KEY. The dependency is installed and ready to be
  // added back once creds are in place. The server routes use an in-memory
  // repo (server/utils/repo.ts) in the meantime.
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    icons: ['lucide'],
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
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
