import type { ConfigSnapshot, Player, SuperEvent } from '#shared/types/game'

/**
 * Singleton collection holding the aggregate game snapshot (config +
 * players + me + superWinner). The nitro-api plugin populates fetchFirst
 * by calling GET /api/state once; consumers refresh on a polling cadence
 * via useGame().
 */
export interface GameSnapshot {
  id: 'current'
  config: ConfigSnapshot
  players: Player[]
  me: Player | null
  superWinner: SuperEvent
}

export const gameState = withItemType<GameSnapshot>().defineCollection({
  name: 'gameState',
})
