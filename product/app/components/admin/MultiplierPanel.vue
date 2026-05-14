<script setup lang="ts">
const game = useGame()
const admin = useAdminActions()

const options = [
  { n: 1.5, label: 'Set 1.5x',                    min: 10 },
  { n: 2,   label: 'Set 2x',                      min: 15 },
  { n: 3,   label: 'Set 3x · Composition Boost',  min: 5 },
]

const minutesLeft = computed(() => {
  if (!game.config.multiplierEndsAt) return 0
  return Math.max(0, Math.ceil((game.config.multiplierEndsAt - Date.now()) / 60_000))
})
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="h-5 w-5 text-emerald-300" /> Chaos Button
        </h2>
        <p class="text-sm text-slate-400">
          Current Multiplier:
          <span class="ticker-mono text-emerald-300 font-bold">{{ game.activeMultiplier }}x</span>
        </p>
      </div>
      <UButton
        v-if="game.isMultiplierActive"
        color="error"
        variant="soft"
        icon="i-lucide-stop-circle"
        @click="admin.clearMultiplier"
      >
        Stop ({{ minutesLeft }}m left)
      </UButton>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <UButton
        v-for="b in options"
        :key="b.n"
        variant="soft"
        color="neutral"
        block
        class="!flex-col !items-start !justify-start text-left px-4 py-4 rounded-xl border border-white/10 bg-white/[0.04] hover:border-emerald-400 hover:bg-emerald-500/10 transition h-auto"
        @click="admin.setMultiplier(b.n, b.min)"
      >
        <div class="ticker-mono text-2xl font-bold text-emerald-300">{{ b.n }}x</div>
        <div class="text-xs text-slate-400 mt-1">{{ b.label }} · {{ b.min }}min</div>
      </UButton>
    </div>
  </section>
</template>
