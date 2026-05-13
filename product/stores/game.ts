import { defineStore } from 'pinia'
import type { Player } from '~/server/utils/repo'

export const TOTAL_GEMS = 5
export const SUPER_CLUE =
  'Where the build artifacts rest and the green checkmark hums — seek the kiosk that never sleeps.'

export type ConfigSnapshot = {
  multiplier: number
  multiplierEndsAt: number | null
  superCode: string | null
  superWinner: string | null
  superWonAt: number | null
}

export type SuperEvent = { name: string; at: number } | null

type StateSnapshot = {
  config: ConfigSnapshot
  players: Player[]
  me: Player | null
  superWinner: SuperEvent
}

export const useGameStore = defineStore('game', {
  state: () => ({
    config: {
      multiplier: 1,
      multiplierEndsAt: null,
      superCode: null,
      superWinner: null,
      superWonAt: null,
    } as ConfigSnapshot,
    players: [] as Player[],
    me: null as Player | null,
    superWinner: null as SuperEvent,
    initialised: false,
    pollHandle: null as ReturnType<typeof setInterval> | null,
  }),

  getters: {
    activeMultiplier(state): number {
      if (!state.config.multiplierEndsAt) return 1
      if (state.config.multiplierEndsAt < Date.now()) return 1
      return state.config.multiplier
    },
    isMultiplierActive(): boolean {
      return this.activeMultiplier > 1
    },
    clueUnlocked(state): boolean {
      const me = state.me
      if (!me) return false
      return me.victories >= 5 || me.gems >= TOTAL_GEMS
    },
    sortedPlayers(state): Player[] {
      return [...state.players].sort((a, b) => b.points - a.points)
    },
  },

  actions: {
    apply(snap: StateSnapshot) {
      this.config = snap.config
      this.players = snap.players
      this.me = snap.me
      this.superWinner = snap.superWinner
      this.initialised = true
    },

    async refresh() {
      const playerName = useRuntimeConfig().public.currentPlayerName
      const snap = await $fetch<StateSnapshot>('/api/state', { query: { player: playerName } })
      this.apply(snap)
    },

    /**
     * POC: poll every 3s instead of Supabase realtime. Swap to a realtime
     * channel subscription once @nuxtjs/supabase is wired.
     */
    startPolling(intervalMs = 3000) {
      if (this.pollHandle) return
      this.pollHandle = setInterval(() => { this.refresh().catch(() => {}) }, intervalMs)
    },
    stopPolling() {
      if (this.pollHandle) clearInterval(this.pollHandle)
      this.pollHandle = null
    },

    dismissSuperEvent() {
      this.superWinner = null
      $fetch('/api/super-event/dismiss', { method: 'POST' }).catch(() => {})
    },
  },
})
