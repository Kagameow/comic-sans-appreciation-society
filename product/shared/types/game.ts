export type Player = {
  id: string
  name: string
  avatar: string
  /** Public URL to an uploaded avatar image. Wins over `avatar` (emoji) when set. */
  avatarUrl?: string
  points: number
  victories: number
  gems: number
  latest: string
  /** Linked Supabase auth user id, if this player has signed in. Seed players have none. */
  userId?: string
  /** Lowercased Google email. Set on first sign-in; used as the link key. */
  email?: string
}

export type CodeType = 'point' | 'trivia' | 'crossword' | 'challenge' | 'victory' | 'super'

export type Code = {
  code: string
  type: CodeType
  value: number
  isSuperCode: boolean
  singleUse: boolean
  isUsed: boolean
  usedBy?: string
  usedAt?: number
}

export type GameConfig = {
  multiplier: number
  multiplierEndsAt: number | null
  superCode: string | null
  superWinner: string | null
  superWonAt: number | null
}

export type Redemption = {
  id: string
  playerId: string
  code: string
  awarded: number
  multiplier: number
  isSuper: boolean
  redeemedAt: number
}

export type ConfigSnapshot = {
  multiplier: number
  multiplierEndsAt: number | null
  superCode: string | null
  superWinner: string | null
  superWonAt: number | null
}

export type SuperEvent = { name: string; at: number } | null

export type StateSnapshot = {
  config: ConfigSnapshot
  players: Player[]
  me: Player | null
  superWinner: SuperEvent
}
