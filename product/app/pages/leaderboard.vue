<script setup lang="ts">
const game = await useGameSync(2000)
const myName = computed(() => useRuntimeConfig().public.currentPlayerName)

const sortedPlayers = computed(() => game.sortedPlayers)
const bumpedId = useRankBumpHighlight(sortedPlayers)

watch(() => game.superWinner, (winner) => {
  if (!winner) return
  confettiSuperBurst()
  const interval = setInterval(confettiSuperBurst, 600)
  setTimeout(() => clearInterval(interval), 4000)
})
</script>

<template>
  <div>
    <div class="container mx-auto max-w-5xl px-6 py-8">
      <LeaderboardPageHeader />
      <div class="space-y-2">
        <LeaderboardRow
          v-for="(p, idx) in sortedPlayers"
          :key="p.id"
          :player="p"
          :rank="idx"
          :is-me="p.name === myName"
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
