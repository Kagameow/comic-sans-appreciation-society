<script setup lang="ts">
import { SUPER_CLUE, TOTAL_GEMS } from '#shared/constants/game'

defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 animate-fade-in">
    <div class="relative max-w-xl w-full rounded-2xl border-2 border-emerald-400 bg-slate-900 p-8 shadow-[0_0_60px_rgba(66,184,131,0.5)]">
      <button class="absolute top-3 right-3 p-1 text-slate-400 hover:text-white" @click="$emit('close')">
        <UIcon name="i-lucide-x" class="h-5 w-5" />
      </button>
      <div class="ticker-mono text-xs text-emerald-300 mb-2">// MAJOR_UPGRADE.exe</div>
      <h2 class="text-3xl font-bold mb-1">LEGACY MIGRATION COMPLETE</h2>
      <p class="text-slate-400 text-sm mb-6">
        All {{ TOTAL_GEMS }} Vue 3 Gems collected. The Master Branch awaits.
      </p>
      <div class="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-5">
        <div class="text-xs uppercase tracking-widest text-emerald-300 mb-2">⬡ Cryptic clue</div>
        <p class="text-lg leading-relaxed">{{ SUPER_CLUE }}</p>
      </div>
      <p class="text-xs text-slate-500 mt-4 ticker-mono">
        Find the Master Code in the wild. Submit it on this page to merge the branch.
      </p>
    </div>
  </div>
</template>
