<script setup lang="ts">
import { SUPER_CLUE, TOTAL_GEMS } from '#shared/constants/game'

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-xl border-2 border-emerald-400 shadow-[0_0_60px_color-mix(in_oklab,var(--color-emerald-500)_50%,transparent)]',
    }"
  >
    <template #content>
      <div class="bg-slate-900 p-8 animate-fade-in">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          size="sm"
          class="absolute top-3 right-3"
          @click="open = false"
        />
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
    </template>
  </UModal>
</template>
