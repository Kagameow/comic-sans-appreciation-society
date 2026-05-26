/**
 * Reactive game snapshot driven by rstore + a Supabase realtime subscription.
 *
 * On setup we open a single realtime channel that listens to changes on
 * `players`, `game_config`, and `code_redemptions`. Any change fires a
 * `refresh()` of the `gameState` collection, which re-pulls `/api/state`.
 * This replaces the prior polling loop — the leaderboard / TV updates within
 * a few hundred milliseconds of any redemption, multiplier change, or super
 * code claim.
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
  const supabase = useSupabaseClient()
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

  // Realtime: one channel, three tables. Any change → refetch the snapshot.
  // `Date.now()` in the channel name avoids cross-HMR collisions during dev.
  if (import.meta.client) {
    const channel = supabase
      .channel(`game-state-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' },          () => { void refresh() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_config' },      () => { void refresh() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'code_redemptions' }, () => { void refresh() })
      .subscribe()
    onScopeDispose(() => { void supabase.removeChannel(channel) })
  }

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
