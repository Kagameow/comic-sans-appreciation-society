/**
 * Page middleware for `/admin`. Runs *after* @nuxtjs/supabase has redirected
 * unauthenticated visitors to /login (configured in nuxt.config.ts via
 * `redirectOptions.include`). This layer adds the email-allowlist check.
 *
 * If a signed-in user isn't on ADMIN_EMAILS, send them home. The server guard
 * (server/utils/supabase.ts) enforces the same check on every /api/admin/*
 * call, so this client redirect is UX, not security.
 */
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) return // module handles the unauth case

  const allowed = String(useRuntimeConfig().public.adminEmails ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  const email = user.value.email?.toLowerCase()
  if (!email || !allowed.includes(email)) {
    return navigateTo('/?denied=admin')
  }
})
