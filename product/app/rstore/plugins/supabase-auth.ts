/**
 * rstore plugin wiring the `session` and `currentUser` collections to
 * Supabase Auth. fetchFirst reads the current user/session; createItem
 * on `session` signs in; updateItem on `currentUser` writes user_metadata;
 * deleteItem on `session` signs out.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js'

function toCurrentUser(user: User | null) {
  if (!user)
    return undefined
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
    // Capture nuxtApp at install (rstore boots inside Nuxt's app context)
    // and reach for $supabase.client directly. useSupabaseClient() relies on
    // useNuxtApp() resolving the current async context — and that context is
    // gone by the time an rstore hook's await tick resumes, so the composable
    // returns undefined and `supabase.auth.getUser()` blows up. Direct read
    // off the captured app is stable across awaits.
    const nuxtApp = useNuxtApp()
    function getSupabase(): SupabaseClient {
      const $supabase = (nuxtApp as { $supabase?: { client: SupabaseClient } }).$supabase
      if (!$supabase?.client)
        throw new Error('Supabase client not initialised — is @nuxtjs/supabase loaded?')
      return $supabase.client
    }

    hook('fetchFirst', async (payload) => {
      const name = payload.collection.name
      if (name !== 'session' && name !== 'currentUser')
        return
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (name === 'session') {
        payload.setResult(user ? { id: 'current' } : undefined)
        return
      }
      payload.setResult(toCurrentUser(user))
    })

    hook('createItem', async (payload) => {
      if (payload.collection.name !== 'session')
        return
      const supabase = getSupabase()
      const { email, password } = payload.item as { email: string, password: string }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error)
        throw new Error(error.message)
      payload.setResult({ id: 'current' })
    })

    hook('updateItem', async (payload) => {
      if (payload.collection.name !== 'currentUser')
        return
      const supabase = getSupabase()
      const patch = payload.item as Partial<{ display_name: string, avatar_url: string | null }>
      const { data, error } = await supabase.auth.updateUser({ data: patch })
      if (error)
        throw new Error(error.message)
      const next = toCurrentUser(data.user)
      if (next)
        payload.setResult(next)
    })

    hook('deleteItem', async (payload) => {
      if (payload.collection.name !== 'session')
        return
      const supabase = getSupabase()
      await supabase.auth.signOut()
    })
  },
})
