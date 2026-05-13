/**
 * Thin wrapper over the @nuxtjs/supabase auth surface.
 * Exposes the current user, an isAdmin flag derived from the email allowlist,
 * and a sign-out helper that bounces back to /.
 */
export function useAuthSession() {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const allowedEmails = computed(() =>
    String(useRuntimeConfig().public.adminEmails ?? '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
  )

  const email = computed(() => user.value?.email?.toLowerCase() ?? null)
  const isSignedIn = computed(() => !!user.value)
  const isAdmin = computed(() => !!email.value && allowedEmails.value.includes(email.value))

  async function signOut() {
    await supabase.auth.signOut()
    await navigateTo('/')
  }

  return { user, email, isSignedIn, isAdmin, signOut }
}
