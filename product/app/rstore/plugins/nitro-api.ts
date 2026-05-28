/**
 * rstore plugin that maps the `gameState` collection's fetchFirst hook
 * to the aggregate GET /api/state Nitro endpoint. Single item id is
 * the literal 'current'; the snapshot is rebuilt from the JSON body
 * on every fetch.
 */
import type { StateSnapshot, Player } from '#shared/types/game'

export default defineRstorePlugin({
  name: 'nitro-api',
  category: 'remote',
  setup({ hook }) {
    hook('fetchFirst', async (payload) => {
      if (payload.collection.name !== 'gameState') return
      const snap = await $fetch<StateSnapshot>('/api/state', { credentials: 'include' })
      
      // If server didn't return current user, try to find them in the players list
      // using the client-side Supabase user email
      if (!snap.me && snap.players.length > 0) {
        try {
          const user = useSupabaseUser()
          if (user.value?.email) {
            const email = user.value.email.toLowerCase()
            const matchedPlayer = snap.players.find((p: Player) => 
              p.email?.toLowerCase() === email
            )
            if (matchedPlayer) {
              snap.me = matchedPlayer
            }
          }
        } catch {
          // Ignore errors - fall back to server response
        }
      }
      
      payload.setResult({ id: 'current', ...snap })
    })
  },
})
