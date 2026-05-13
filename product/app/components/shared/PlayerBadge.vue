<script setup lang="ts">
const game = useGameStore()
const playerName = computed(() => useRuntimeConfig().public.currentPlayerName)
const myPoints = computed(() => game.me?.points ?? 0)
const myAvatar = computed(() => game.me?.avatar ?? '🦊')
</script>

<template>
  <div class="flex items-center gap-2 pl-3 border-l border-white/10">
    <span class="ticker-mono text-sm font-semibold text-emerald-300">
      {{ myPoints.toLocaleString() }} pts
    </span>
    <div class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
      {{ myAvatar }}
    </div>
    <span class="hidden sm:inline text-xs text-slate-400">{{ playerName }}</span>
  </div>
</template>
