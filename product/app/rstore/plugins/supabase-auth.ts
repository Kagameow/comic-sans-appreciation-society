/**
 * rstore plugin wiring the `session` and `currentUser` collections to
 * Supabase Auth. fetchFirst reads the current user/session; createItem
 * on `session` signs in; updateItem on `currentUser` writes user_metadata;
 * deleteItem on `session` signs out.
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
  setup({ hook }) {
    hook('fetchFirst', async (payload) => {
      const name = payload.collection.name
      if (name !== 'session' && name !== 'currentUser') return
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (name === 'session') {
        payload.setResult(user ? { id: 'current' } : undefined)
        return
      }
      payload.setResult(toCurrentUser(user))
    })

    hook('createItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      const supabase = useSupabaseClient()
      const { email, password } = payload.item as { email: string; password: string }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      payload.setResult({ id: 'current' })
    })

    hook('updateItem', async (payload) => {
      if (payload.collection.name !== 'currentUser') return
      const supabase = useSupabaseClient()
      const patch = payload.item as Partial<{ display_name: string; avatar_url: string | null }>
      const { data, error } = await supabase.auth.updateUser({ data: patch })
      if (error) throw new Error(error.message)
      const next = toCurrentUser(data.user)
      if (next) payload.setResult(next)
      // updateUser updates session.user server-side + locally but does NOT
      // re-mint the access token — the local JWT still carries the old
      // user_metadata. getClaims() decodes that stale JWT, so without a
      // refresh, useSupabaseUser() consumers (PlayerBadge avatar/name,
      // AvatarUploader preview) keep showing pre-update values. Refresh
      // the session first so the new metadata is in the JWT, then pull
      // fresh claims and push them into the reactive ref.
      await supabase.auth.refreshSession()
      const { data: claimsData } = await supabase.auth.getClaims()
      const userRef = useSupabaseUser()
      userRef.value = (claimsData?.claims ?? null) as typeof userRef.value
    })

    hook('deleteItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
    })
  },
})
