/**
 * Reactive game snapshot driven by rstore + a visibility-aware poll.
 * Drop-in replacement for the legacy `useGameStore()` + `useGameSync()`
 * combo. Returns refs/computeds (so script callers use `.value`, templates
 * auto-unwrap) mirroring the old Pinia getters plus a `refresh()` to
 * force-pull the snapshot.
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

export function useGame(intervalMs = 3000) {
  const store = useStore()
  const { data, refresh } = store.gameState.query(q => q.first('current'))

  const config = computed<ConfigSnapshot>(() => data.value?.config ?? DEFAULT_CONFIG)
  const players = computed<Player[]>(() => data.value?.players ?? [])
  const me = computed<Player | null>(() => data.value?.me ?? null)
  const superWinner = computed<SuperEvent>(() => data.value?.superWinner ?? null)

  const activeMultiplier = computed(() => {
    const c = config.value
    if (!c.multiplierEndsAt)
      return 1
    if (c.multiplierEndsAt < Date.now())
      return 1
    return c.multiplier
  })
  const isMultiplierActive = computed(() => activeMultiplier.value > 1)
  const clueUnlocked = computed(() => {
    const m = me.value
    if (!m)
      return false
    return m.victories >= TOTAL_VICTORIES || m.gems >= TOTAL_GEMS
  })
  const sortedPlayers = computed(() => [...players.value].sort((a, b) => b.points - a.points))

  const visibility = useDocumentVisibility()
  const { pause, resume } = useIntervalFn(
    () => { refresh() },
    intervalMs,
    { immediate: false },
  )
  watchEffect(() => {
    if (visibility.value === 'visible')
      resume()
    else pause()
  })

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
