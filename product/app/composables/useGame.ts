/**
 * Reactive game snapshot driven by rstore. The Supabase realtime subscription
 * lives in `plugins/realtime-game.client.ts` — a single, app-scoped channel
 * that refreshes the `gameState` collection on every players / game_config /
 * code_redemptions mutation. Any number of components can call `useGame()`
 * without spawning extra channels (or colliding on the channel name, which
 * the old per-call `Date.now()` scheme did when two callers hit the same ms).
 */
import { TOTAL_GEMS, TOTAL_VICTORIES } from '#shared/constants/game'
import type { ConfigSnapshot, Player, SuperEvent } from '#shared/types/game'

const DEFAULT_CONFIG: ConfigSnapshot = {
  multiplier: 1,
  multiplierEndsAt: null,
  superCode: null,
  superWinner: null,
  superWonAt: null,
}

export function useGame() {
  const store = useStore()
  const { data, refresh } = store.gameState.query(q => q.first('current'))

  const config = computed<ConfigSnapshot>(() => data.value?.config ?? DEFAULT_CONFIG)
  const players = computed<Player[]>(() => data.value?.players ?? [])
  const me = computed<Player | null>(() => data.value?.me ?? null)
  const superWinner = computed<SuperEvent>(() => data.value?.superWinner ?? null)

  const activeMultiplier = computed(() => {
    const c = config.value
    if (!c.multiplierEndsAt) return 1
    if (c.multiplierEndsAt < Date.now()) return 1
    return c.multiplier
  })
  const isMultiplierActive = computed(() => activeMultiplier.value > 1)
  const clueUnlocked = computed(() => {
    const m = me.value
    if (!m) return false
    return m.victories >= TOTAL_VICTORIES || m.gems >= TOTAL_GEMS
  })
  const sortedPlayers = computed(() => [...players.value].sort((a, b) => b.points - a.points))

  async function dismissSuperEvent() {
    await $fetch('/api/super-event/dismiss', { method: 'POST' }).catch(() => {})
    await refresh()
  }

  return reactive({
    config,
    players,
    me,
    superWinner,
    activeMultiplier,
    isMultiplierActive,
    clueUnlocked,
    sortedPlayers,
    refresh: async () => { await refresh() },
    dismissSuperEvent,
  })
}
