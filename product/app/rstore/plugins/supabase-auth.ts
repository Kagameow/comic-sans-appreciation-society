/**
 * rstore plugin wiring the `session` and `currentUser` collections to
 * Supabase Auth. fetchFirst reads the current user/session; updateItem on
 * `currentUser` writes user_metadata; deleteItem on `session` signs out.
 * Sign-in is no longer here — Visma Connect is OIDC, so login.vue calls
 * supabase.auth.signInWithOAuth directly and the browser navigates away.
 */
import type { User } from '@supabase/supabase-js'

function toCurrentUser(user: User | null) {
  if (!user) return undefined
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  return {
    id: user.id,
    email: user.email ?? null,
    display_name: typeof meta.display_name === 'string' ? meta.display_name : '',
    avatar_url: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
  }
}

export default defineRstorePlugin({
  name: 'supabase-auth',
  category: 'remote',
  setup({ hook }) {
    const nuxtApp = useNuxtApp()
    const getClient = () => nuxtApp.$supabase.client

    hook('fetchFirst', async (payload) => {
      const name = payload.collection.name
      if (name !== 'session' && name !== 'currentUser') return
      const { data: { user } } = await getClient().auth.getUser()
      if (name === 'session') {
        payload.setResult(user ? { id: 'current' } : undefined)
        return
      }
      payload.setResult(toCurrentUser(user))
    })

    hook('updateItem', async (payload) => {
      if (payload.collection.name !== 'currentUser') return
      const patch = payload.item as Partial<{ display_name: string; avatar_url: string | null }>
      const { data, error } = await getClient().auth.updateUser({ data: patch })
      if (error) throw new Error(error.message)
      const next = toCurrentUser(data.user)
      if (next) payload.setResult(next)
      // updateUser patches session.user server-side + locally but does NOT
      // re-mint the access token — the JWT still carries the old metadata,
      // so useSupabaseUser() consumers (PlayerBadgeMenu avatar/display name)
      // keep showing pre-update values. Refresh, then push fresh claims into
      // the reactive ref so the UI updates immediately.
      await getClient().auth.refreshSession()
      const { data: claimsData } = await getClient().auth.getClaims()
      const userRef = useSupabaseUser()
      userRef.value = (claimsData?.claims ?? null) as typeof userRef.value
    })

    hook('deleteItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      await getClient().auth.signOut()
    })
  },
})
