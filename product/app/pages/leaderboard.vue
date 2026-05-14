<script setup lang="ts">
const game = useGame(2000)
const myId = computed(() => game.me?.id ?? null)

const sortedPlayers = computed(() => game.sortedPlayers)
const bumpedId = useRankBumpHighlight(sortedPlayers)

whenever(() => game.superWinner, () => {
  confettiSuperBurst()
  const { pause } = useIntervalFn(confettiSuperBurst, 600)
  useTimeoutFn(pause, 4000)
})
</script>

<template>
  <div>
    <div class="container mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8">
      <LeaderboardPageHeader />
      <div class="space-y-2">
        <LeaderboardRow
          v-for="(p, idx) in sortedPlayers"
          :key="p.id"
          :player="p"
          :rank="idx"
          :is-me="p.id === myId"
          :bumped="bumpedId === p.id"
        />
      </div>
    </div>

    <LeaderboardSuperWinBroadcast
      v-if="game.superWinner"
      :name="game.superWinner.name"
      @dismiss="game.dismissSuperEvent()"
    />
  </div>
</template>
