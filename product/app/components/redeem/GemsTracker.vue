<script setup lang="ts">
import { TOTAL_GEMS } from '#shared/constants/game'

const props = defineProps<{ filled: number; label?: string }>()
const lit = (i: number) => i < props.filled
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs uppercase tracking-widest text-slate-400">
        {{ label ?? 'Migration Progress' }}
      </div>
      <div class="ticker-mono text-xs text-emerald-300">
        {{ filled }}/{{ TOTAL_GEMS }} Vue 3 Gems
      </div>
    </div>
    <div class="flex items-center justify-between gap-2">
      <div v-for="i in TOTAL_GEMS" :key="i" class="flex-1 flex items-center justify-center">
        <UIcon
          name="i-lucide-diamond"
          :class="[
            'h-10 w-10 transition-all',
            lit(i - 1) ? 'text-emerald-400 animate-gem-pulse' : 'text-slate-700',
          ]"
        />
      </div>
    </div>
  </div>
</template>
