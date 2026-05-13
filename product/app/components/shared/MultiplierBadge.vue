<script setup lang="ts">
const game = useGameStore()
const remaining = useCountdown(() => game.config.multiplierEndsAt)
</script>

<template>
  <div
    v-if="game.isMultiplierActive"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold ticker-mono"
  >
    <UIcon name="i-lucide-zap" class="h-3.5 w-3.5" />
    {{ game.activeMultiplier }}x · {{ remaining }}
  </div>
</template>
