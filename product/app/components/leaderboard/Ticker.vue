<script setup lang="ts">
// docs/refactor-plan.md §2.6 — right→left ticker of recent redemptions. The
// in-memory repo doesn't expose `code_redemptions` rows today, so we
// generate the ticker stream from the current sorted players' `latest`
// field plus a few synthetic chips (HMR state). Replace with realtime
// channel data once the move-to-Supabase swap path lands.
const game = useGame()

const ticks = computed(() => {
  const lines: { text: string, tone: 'vue' | 'amber' | 'ink' }[] = []
  for (const p of game.sortedPlayers.slice(0, 8)) {
    lines.push({ text: `> ${p.name.toLowerCase().split(' ')[0]} ${p.latest.toLowerCase()}`, tone: 'ink' })
  }
  if (game.isMultiplierActive) {
    lines.push({ text: `> ⚡ Vite HMR active ${game.activeMultiplier}x`, tone: 'amber' })
  }
  lines.push({ text: '> watchEffect(() => renderLeaderboard())', tone: 'vue' })
  return [...lines, ...lines]
})

const toneClass = {
  vue: 'text-[color:var(--vue)]',
  amber: 'text-[color:var(--amber)]',
  ink: 'text-[color:var(--ink-body)]',
}
</script>

<template>
  <div class="h-[14vh] min-h-[80px] bg-[color:var(--surface-deep)] border-t border-[color:var(--line)] overflow-hidden relative flex items-center">
    <div class="ticker-rail flex items-center gap-12 px-10 whitespace-nowrap font-mono text-2xl">
      <span
        v-for="(t, i) in ticks"
        :key="i"
        :class="toneClass[t.tone]"
      >
        {{ t.text }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticker-rail {
  animation: ticker 40s linear infinite;
}
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-rail { animation: none; }
}
</style>
