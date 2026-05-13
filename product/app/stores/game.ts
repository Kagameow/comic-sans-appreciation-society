import { defineStore } from 'pinia'
import { TOTAL_GEMS, TOTAL_VICTORIES } from '#shared/constants/game'
import type { Player, ConfigSnapshot, SuperEvent, StateSnapshot } from '#shared/types/game'

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
      return me.victories >= TOTAL_VICTORIES || me.gems >= TOTAL_GEMS
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

    dismissSuperEvent() {
      this.superWinner = null
      $fetch('/api/super-event/dismiss', { method: 'POST' }).catch(() => {})
    },
  },
})
