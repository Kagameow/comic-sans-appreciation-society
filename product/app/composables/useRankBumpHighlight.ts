import type { Player } from '#shared/types/game'

/**
 * Watches the leaderboard order and emits a transient highlight whenever any
 * player's rank changes. The component using this can apply an animation
 * class to the row whose id matches `bumpedId`.
 */
export function useRankBumpHighlight(players: Ref<Player[]>, durationMs = 900) {
  const bumpedId = refAutoReset<string | null>(null, durationMs)
  let prevOrder: string[] = []

  watch(players, (next) => {
    const order = next.map(p => p.id)
    for (let i = 0; i < order.length; i++) {
      if (prevOrder.length > 0 && order[i] !== prevOrder[i]) {
        bumpedId.value = order[i] ?? null
        break
      }
    }
    prevOrder = order
  }, { deep: true })

  return bumpedId
}
