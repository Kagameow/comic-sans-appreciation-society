/**
 * rstore plugin that maps the `gameState` collection's fetchFirst hook
 * to the aggregate GET /api/state Nitro endpoint. Single item id is
 * the literal 'current'; the snapshot is rebuilt from the JSON body
 * on every fetch.
 */
import type { StateSnapshot } from '#shared/types/game'

export default defineRstorePlugin({
  name: 'nitro-api',
  category: 'remote',
  setup({ hook }) {
    hook('fetchFirst', async (payload) => {
      if (payload.collection.name !== 'gameState') return
      const snap = await $fetch<StateSnapshot>('/api/state')
      payload.setResult({ id: 'current', ...snap })
    })
  },
})
