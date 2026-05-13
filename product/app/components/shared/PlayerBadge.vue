<script setup lang="ts">
const game = useGameStore()
</script>

<template>
  <div v-if="game.me" class="flex items-center gap-2 pl-3 border-l border-white/10">
    <span class="ticker-mono text-sm font-semibold text-emerald-300">
      {{ game.me.points.toLocaleString() }} pts
    </span>
    <div class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
      {{ game.me.avatar }}
    </div>
    <span class="hidden sm:inline text-xs text-slate-400">{{ game.me.name }}</span>
  </div>
</template>
