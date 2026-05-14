<script setup lang="ts">
import { APP_VERSION } from '#shared/constants/game'

defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in bg-[color:var(--surface-deep)]/95"
    @click="$emit('dismiss')"
  >
    <div class="text-center max-w-2xl bg-[color:var(--surface)] border border-[color:var(--amber)] glow-amber p-8 sm:p-12 animate-scan-sweep">
      <div class="font-mono text-xs text-[color:var(--vue)] mb-2 uppercase tracking-[0.04em]">
        &gt; git push origin main --tags
      </div>
      <h1 class="font-display text-4xl sm:text-6xl text-[color:var(--ink)] mb-4 leading-tight">
        MERGED TO PRODUCTION
      </h1>
      <div class="font-display text-7xl text-[color:var(--vue)] mb-2 animate-digit-roll">
        +1,000
      </div>
      <p class="font-mono text-sm text-[color:var(--ink-muted)] mb-6">
        &gt; git tag {{ APP_VERSION }} — released to the world
      </p>
      <UButton size="lg" color="primary" @click.stop="$emit('dismiss')">
        return to terminal
      </UButton>
    </div>
  </div>
</template>
