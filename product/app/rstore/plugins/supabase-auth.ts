/**
 * rstore plugin wiring the `session` and `currentUser` collections to
 * Supabase Auth. fetchFirst reads the current user/session; createItem
 * on `session` signs in; updateItem on `currentUser` writes user_metadata;
 * deleteItem on `session` signs out.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js'

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
    // Capture the Nuxt app at plugin install (rstore boots inside Nuxt's
    // app context). Re-entering the context via runWithContext is what keeps
    // useSupabaseClient() working from inside async rstore hooks — without
    // it, the composable throws "called outside of a plugin / setup fn" once
    // the await tick has erased the implicit Vue context.
    const nuxtApp = useNuxtApp()
    function getSupabase(): SupabaseClient {
      return nuxtApp.runWithContext(() => useSupabaseClient()) as SupabaseClient
    }

    hook('fetchFirst', async (payload) => {
      const name = payload.collection.name
      if (name !== 'session' && name !== 'currentUser') return
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (name === 'session') {
        payload.setResult(user ? { id: 'current' } : undefined)
        return
      }
      payload.setResult(toCurrentUser(user))
    })

    hook('createItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      const supabase = getSupabase()
      const { email, password } = payload.item as { email: string; password: string }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      payload.setResult({ id: 'current' })
    })

    hook('updateItem', async (payload) => {
      if (payload.collection.name !== 'currentUser') return
      const supabase = getSupabase()
      const patch = payload.item as Partial<{ display_name: string; avatar_url: string | null }>
      const { data, error } = await supabase.auth.updateUser({ data: patch })
      if (error) throw new Error(error.message)
      const next = toCurrentUser(data.user)
      if (next) payload.setResult(next)
    })

    hook('deleteItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      const supabase = getSupabase()
      await supabase.auth.signOut()
    })
  },
})
