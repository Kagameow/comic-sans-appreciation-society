/**
 * In-memory data layer for the POC.
 *
 * Wraps the operations the API routes need behind a single `useRepo()` call.
 * When real Supabase creds are wired up, replace this module's body with a
 * Supabase-backed implementation that exposes the same methods — the API
 * routes don't care which one is behind it.
 *
 * State is module-scoped so it survives between requests in dev. Restart the
 * server to reset.
 */

import type { Player, Code, GameConfig, Redemption } from '#shared/types/game'

// ─── seed ────────────────────────────────────────────────────────────────────

const seedPlayers: Player[] = [
  { id: 'p01', name: 'Daan Nagtegaal',     avatar: '🦊', points: 2840, victories: 3, gems: 3, latest: 'Solved Crossword' },
  { id: 'p02', name: 'Marieke de Vries',   avatar: '🐼', points: 2710, victories: 2, gems: 2, latest: 'Trivia +100' },
  { id: 'p03', name: 'Joris van Dijk',     avatar: '🦉', points: 2455, victories: 4, gems: 1, latest: 'Won Darts Challenge' },
  { id: 'p04', name: 'Sanne Bakker',       avatar: '🦄', points: 2210, victories: 1, gems: 0, latest: 'Code V3-READY' },
  { id: 'p05', name: 'Bram Janssen',       avatar: '🐺', points: 2050, victories: 0, gems: 0, latest: 'Solved Trivia' },
  { id: 'p06', name: 'Eva Mulder',         avatar: '🦋', points: 1890, victories: 1, gems: 0, latest: 'Code COMPOSITION' },
  { id: 'p07', name: 'Tim Visser',         avatar: '🐙', points: 1720, victories: 0, gems: 0, latest: 'Crossword +75' },
  { id: 'p08', name: 'Lotte Smit',         avatar: '🦜', points: 1640, victories: 2, gems: 0, latest: 'Migrated 12 files' },
  { id: 'p09', name: 'Ruben Peters',       avatar: '🐸', points: 1510, victories: 0, gems: 0, latest: 'Code TELEPORT' },
  { id: 'p10', name: 'Fleur Hendriks',     avatar: '🦔', points: 1420, victories: 1, gems: 0, latest: 'Trivia +50' },
  { id: 'p11', name: 'Niels van der Berg', avatar: '🐢', points: 1280, victories: 0, gems: 0, latest: 'Solved Crossword' },
  { id: 'p12', name: 'Iris Brouwer',       avatar: '🦩', points: 1150, victories: 0, gems: 0, latest: 'Code PINIA' },
  { id: 'p13', name: 'Thijs Maas',         avatar: '🐳', points: 1040, victories: 0, gems: 0, latest: 'Trivia +100' },
  { id: 'p14', name: 'Anouk Vermeer',      avatar: '🦊', points:  920, victories: 0, gems: 0, latest: 'Manual +10' },
  { id: 'p15', name: 'Sven Bos',           avatar: '🐯', points:  810, victories: 0, gems: 0, latest: 'Code SETUP' },
]

const seedCodes: Code[] = [
  { code: 'V3-READY',     type: 'point',     value:   50, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'COMPOSITION',  type: 'point',     value:   75, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'TELEPORT',     type: 'point',     value:   25, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'PINIA',        type: 'point',     value:  100, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'REACTIVE',     type: 'trivia',    value:  100, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'SETUP',        type: 'crossword', value:   75, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'CHALLENGE',    type: 'challenge', value:  150, isSuperCode: false, singleUse: false, isUsed: false },
  { code: 'DART-WIN',     type: 'victory',   value:  150, isSuperCode: false, singleUse: true,  isUsed: false },
  { code: 'FOOSBALL-WIN', type: 'victory',   value:  150, isSuperCode: false, singleUse: true,  isUsed: false },
  { code: 'POOL-WIN',     type: 'victory',   value:  150, isSuperCode: false, singleUse: true,  isUsed: false },
  { code: 'RPS-WIN',      type: 'victory',   value:  150, isSuperCode: false, singleUse: true,  isUsed: false },
  { code: 'TYPING-WIN',   type: 'victory',   value:  150, isSuperCode: false, singleUse: true,  isUsed: false },
  { code: 'MASTER-BRANCH',type: 'super',     value: 1000, isSuperCode: true,  singleUse: true,  isUsed: false },
]

// Use a global cache so HMR doesn't wipe state every save.
const g = globalThis as unknown as {
  __migrationStore?: {
    players: Player[]
    codes: Code[]
    config: GameConfig
    redemptions: Redemption[]
  }
}

if (!g.__migrationStore) {
  g.__migrationStore = {
    players: seedPlayers.map(p => ({ ...p })),
    codes:   seedCodes.map(c => ({ ...c })),
    config:  { multiplier: 1, multiplierEndsAt: null, superCode: 'MASTER-BRANCH', superWinner: null, superWonAt: null },
    redemptions: [],
  }
}
const store = g.__migrationStore!

// ─── public api ──────────────────────────────────────────────────────────────

export function useRepo() {
  const currentMultiplier = (): number => {
    if (!store.config.multiplierEndsAt) return 1
    if (store.config.multiplierEndsAt < Date.now()) return 1
    return store.config.multiplier
  }

  return {
    listPlayers(): Player[] {
      return [...store.players].sort((a, b) => b.points - a.points)
    },
    getPlayerByName(name: string): Player | null {
      return store.players.find(p => p.name === name) ?? null
    },
    getPlayerById(id: string): Player | null {
      return store.players.find(p => p.id === id) ?? null
    },
    getPlayerByUserId(userId: string): Player | null {
      return store.players.find(p => p.userId === userId) ?? null
    },
    getPlayerByEmail(email: string): Player | null {
      const e = email.toLowerCase()
      return store.players.find(p => p.email === e) ?? null
    },

    /**
     * Resolves a Supabase user to their player row, keyed on userId. The
     * display name + email are synced from the auth identity on every call,
     * so a user's leaderboard name always tracks who they're signed in as
     * (no stale or seed-derived names sticking around after dev iterations).
     * Seed players are leaderboard decoys — they are never claimed by email.
     */
    ensurePlayerForUser(user: { id: string; email?: string | null; name?: string | null; avatar?: string | null; avatarUrl?: string | null }): Player {
      const email = user.email?.toLowerCase() ?? ''
      const name = user.name?.trim() || (email ? email.split('@')[0]! : 'Anonymous')
      const avatarUrl = user.avatarUrl?.trim() || undefined
      const existing = store.players.find(x => x.userId === user.id)
      if (existing) {
        existing.name = name
        existing.avatarUrl = avatarUrl
        if (email) existing.email = email
        return existing
      }
      const fresh: Player = {
        id: `u${store.players.length + 1}-${user.id.slice(0, 6)}`,
        userId: user.id,
        email: email || undefined,
        name,
        avatar: user.avatar || '🦊',
        avatarUrl,
        points: 0,
        victories: 0,
        gems: 0,
        latest: 'Joined the migration',
      }
      store.players.push(fresh)
      return fresh
    },
    getCode(code: string): Code | null {
      return store.codes.find(c => c.code === code) ?? null
    },
    listCodes(): Code[] {
      return [...store.codes]
    },
    getConfig(): GameConfig {
      // expose the live multiplier (it auto-decays when the timer expires)
      return { ...store.config, multiplier: currentMultiplier() }
    },
    currentMultiplier,

    setMultiplier(n: number, minutes: number): GameConfig {
      store.config.multiplier = n
      store.config.multiplierEndsAt = n > 1 && minutes > 0
        ? Date.now() + minutes * 60_000
        : null
      return { ...store.config }
    },
    clearMultiplier(): GameConfig {
      store.config.multiplier = 1
      store.config.multiplierEndsAt = null
      return { ...store.config }
    },
    setSuperCode(code: string): GameConfig {
      if (!store.codes.find(c => c.code === code)) throw new Error('unknown code')
      store.codes.forEach(c => { c.isSuperCode = false })
      const target = store.codes.find(c => c.code === code)!
      target.isSuperCode = true
      target.singleUse = true
      target.type = 'super'
      target.isUsed = false
      target.usedBy = undefined
      target.usedAt = undefined
      store.config.superCode = code
      store.config.superWinner = null
      store.config.superWonAt = null
      return { ...store.config }
    },

    adjustPoints(playerId: string, delta: number): Player | null {
      const p = store.players.find(p => p.id === playerId)
      if (!p) return null
      p.points = Math.max(0, p.points + delta)
      p.latest = `Admin ${delta >= 0 ? '+' : ''}${delta}`
      return { ...p }
    },

    redeemPoint(player: Player, code: Code) {
      const multiplier = currentMultiplier()
      const awarded = Math.round(code.value * multiplier)
      const gemsBefore = player.gems
      player.gems = Math.min(5, player.gems + 1)
      player.points += awarded
      player.latest = `Code ${code.code} · +${awarded}`
      this._log(player.id, code.code, awarded, multiplier, false)
      return {
        awarded, multiplier,
        gemUnlocked: player.gems > gemsBefore,
        clueUnlocked: player.gems >= 5 && gemsBefore < 5,
      }
    },

    redeemVictory(player: Player, code: Code) {
      const multiplier = currentMultiplier()
      const awarded = Math.round(code.value * multiplier)
      const before = player.victories
      player.victories = Math.min(5, player.victories + 1)
      player.points += awarded
      player.latest = `Won ${code.code} · +${awarded}`
      code.isUsed = true
      code.usedBy = player.id
      code.usedAt = Date.now()
      this._log(player.id, code.code, awarded, multiplier, false)
      return {
        awarded, multiplier,
        victories: player.victories,
        clueUnlocked: player.victories >= 5 && before < 5,
      }
    },

    redeemSuper(player: Player, code: Code) {
      if (player.victories < 5) return { ok: false as const, reason: 'locked' as const }
      if (code.isUsed) {
        const winner = code.usedBy ? this.getPlayerById(code.usedBy) : null
        return { ok: false as const, reason: 'taken' as const, winnerName: winner?.name ?? null }
      }
      const awarded = code.value || 1000
      player.points += awarded
      player.latest = `Found the Super Code · +${awarded}`
      code.isUsed = true
      code.usedBy = player.id
      code.usedAt = Date.now()
      store.config.superWinner = player.id
      store.config.superWonAt = Date.now()
      this._log(player.id, code.code, awarded, 1, true)
      return { ok: true as const, awarded, winnerName: player.name }
    },

    /** True if this player has already received points for `codeRef`. */
    hasSolvedCode(playerId: string, codeRef: string): boolean {
      return store.redemptions.some(r => r.playerId === playerId && r.code === codeRef && r.awarded > 0)
    },
    /** Count of distinct players who have solved `codeRef`. Drives first-mover tiers. */
    distinctSolverCount(codeRef: string): number {
      const seen = new Set<string>()
      for (const r of store.redemptions) {
        if (r.code === codeRef && r.awarded > 0) seen.add(r.playerId)
      }
      return seen.size
    },

    redeemMinigameResult(player: Player, codeRef: string, base: number) {
      if (base === 0) return { awarded: 0, multiplier: 1, gemUnlocked: false, clueUnlocked: false }
      const multiplier = currentMultiplier()
      const awarded = Math.round(base * multiplier)
      const gemsBefore = player.gems
      player.gems = Math.min(5, player.gems + 1)
      player.points += awarded
      player.latest = `${codeRef} resolved · +${awarded}`
      this._log(player.id, codeRef, awarded, multiplier, false)
      return {
        awarded, multiplier,
        gemUnlocked: player.gems > gemsBefore,
        clueUnlocked: player.gems >= 5 && gemsBefore < 5,
      }
    },

    superWinner(): { name: string; at: number } | null {
      if (!store.config.superWinner) return null
      const p = this.getPlayerById(store.config.superWinner)
      if (!p || !store.config.superWonAt) return null
      return { name: p.name, at: store.config.superWonAt }
    },

    clearSuperWinner() {
      store.config.superWinner = null
      store.config.superWonAt = null
    },

    _log(playerId: string, code: string, awarded: number, multiplier: number, isSuper: boolean) {
      store.redemptions.push({
        id: `r${store.redemptions.length + 1}`,
        playerId, code, awarded, multiplier, isSuper,
        redeemedAt: Date.now(),
      })
    },
  }
}
