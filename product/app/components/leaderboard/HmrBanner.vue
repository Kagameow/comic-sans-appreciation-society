<script setup lang="ts">
const game = useGame()
const remaining = useCountdown(() => game.config.multiplierEndsAt)
</script>

<template>
  <Transition name="hmr">
    <div
      v-if="game.isMultiplierActive"
      class="h-[8vh] min-h-[64px] flex items-center justify-between px-10 bg-[color:var(--surface)] border-y border-[color:var(--amber)] glow-amber animate-glow-pulse-amber animate-flicker"
    >
      <div class="flex items-center gap-4 font-display text-3xl sm:text-5xl text-[color:var(--amber)] uppercase tracking-[0.04em]">
        <UIcon name="i-lucide-zap" class="h-8 w-8" />
        Vite HMR active — multiplier: {{ game.activeMultiplier }}x
      </div>
      <div class="font-display text-3xl sm:text-5xl text-[color:var(--amber)] tabular-nums">
        {{ remaining }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.hmr-enter-from, .hmr-leave-to { opacity: 0; transform: translateY(-8px); }
.hmr-enter-active, .hmr-leave-active { transition: opacity 240ms ease-out, transform 240ms ease-out; }
</style>
