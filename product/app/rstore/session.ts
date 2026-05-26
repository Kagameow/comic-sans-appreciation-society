/**
 * Singleton collection representing the auth session. The single item id
 * is the literal 'current'. Sign-in itself is no longer driven through an
 * rstore form — it's an OAuth redirect (Visma Connect) initiated by
 * `supabase.auth.signInWithOAuth({ provider: 'custom:visma-connect' })`.
 * The collection still backs `fetchFirst` (read "am I signed in?") and
 * `deleteItem` (sign out) via the supabase-auth plugin.
 */
export interface Session {
  id: 'current'
}

export const session = withItemType<Session>().defineCollection({
  name: 'session',
})
