<script setup lang="ts">
import { APP_QUOTE } from '#shared/constants/game'
</script>

<template>
  <div class="w-full max-w-[720px] mx-auto text-center mb-6">
    <div class="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--ink-muted)]">
      &lt;script setup&gt; mode — side effects execute immediately
    </div>
    <p class="mt-2 font-mono text-xs sm:text-sm text-[color:var(--ink-muted)] italic">
      {{ APP_QUOTE }}
    </p>
  </div>
</template>
