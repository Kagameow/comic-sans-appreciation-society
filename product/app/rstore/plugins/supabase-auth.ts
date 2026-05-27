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

// Helper to safely get Supabase client from Nuxt app
function getSupabaseClient() {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.$supabase?.auth || null
  } catch {
    return null
  }
}

// Helper to safely get Supabase user ref from Nuxt app
function getSupabaseUserRef() {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp._supabase?.user || null
  } catch {
    return null
  }
}

export default defineRstorePlugin({
  name: 'supabase-auth',
  category: 'remote',
  setup({ hook }) {
    hook('fetchFirst', async (payload) => {
      const name = payload.collection.name
      if (name !== 'session' && name !== 'currentUser') return
      const supabase = getSupabaseClient()
      if (!supabase) {
        // Return default items when Supabase is not available
        if (name === 'session') {
          payload.setResult(undefined)
        } else {
          // Return a placeholder currentUser item to avoid "Item not found" errors
          payload.setResult({
            id: 'placeholder',
            email: null,
            display_name: '',
            avatar_url: null,
          })
        }
        return
      }
      const { data: { user } } = await supabase.getUser()
      if (name === 'session') {
        payload.setResult(user ? { id: 'current' } : undefined)
        return
      }
      payload.setResult(toCurrentUser(user))
    })

    hook('updateItem', async (payload) => {
      if (payload.collection.name !== 'currentUser') return
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Supabase not available')
      const patch = payload.item as Partial<{ display_name: string; avatar_url: string | null }>
      const { data, error } = await supabase.updateUser({ data: patch })
      if (error) throw new Error(error.message)
      const next = toCurrentUser(data.user)
      if (next) payload.setResult(next)
      await supabase.refreshSession()
      const { data: claimsData } = await supabase.getClaims()
      const userRef = getSupabaseUserRef()
      if (userRef) userRef.value = (claimsData?.claims ?? null) as typeof userRef.value
    })

    hook('deleteItem', async (payload) => {
      if (payload.collection.name !== 'session') return
      const supabase = getSupabaseClient()
      if (!supabase) return
      await supabase.signOut()
    })
  },
})
