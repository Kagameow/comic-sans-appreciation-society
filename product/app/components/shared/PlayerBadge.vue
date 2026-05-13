<script setup lang="ts">
const game = useGameStore()
</script>

<template>
  <div v-if="game.me" class="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-white/10">
    <span class="ticker-mono text-xs sm:text-sm font-semibold text-emerald-300 whitespace-nowrap">
      {{ game.me.points.toLocaleString() }}<span class="hidden sm:inline"> pts</span>
    </span>
    <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center text-base sm:text-lg">
      {{ game.me.avatar }}
    </div>
    <span class="hidden md:inline text-xs text-slate-400">{{ game.me.name }}</span>
  </div>
</template>
