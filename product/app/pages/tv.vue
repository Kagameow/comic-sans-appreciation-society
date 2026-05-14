<script setup lang="ts">
// docs/refactor-plan.md §2 — pipeline status board. Four bands stacked
// vertically: HMR (conditional) → header → leaderboard → ticker. Header is
// hidden by AppShell on this route — the TV view is its own world.
const game = useGame(2000)
const myId = computed(() => game.me?.id ?? null)
const sortedPlayers = computed(() => game.sortedPlayers)
const bumpedId = useRankBumpHighlight(sortedPlayers)

whenever(() => game.superWinner, () => {
  confettiSuperBurst()
  const { pause } = useIntervalFn(confettiSuperBurst, 600)
  useTimeoutFn(pause, 4000)
})

const superWinnerId = computed(() => {
  const w = game.superWinner
  if (!w)
    return null
  return game.players.find(p => p.name === w.name)?.id ?? null
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <LeaderboardHmrBanner />
    <LeaderboardPageHeader />

    <div class="flex-1 overflow-hidden">
      <LeaderboardRow
        v-for="(p, idx) in sortedPlayers.slice(0, 10)"
        :key="p.id"
        :player="p"
        :rank="idx"
        :is-me="p.id === myId"
        :bumped="bumpedId === p.id"
        :is-super-winner="p.id === superWinnerId"
      />
    </div>

    <LeaderboardTicker />

    <LeaderboardSuperWinBroadcast
      v-if="game.superWinner"
      :name="game.superWinner.name"
      @dismiss="game.dismissSuperEvent()"
    />
  </div>
</template>
