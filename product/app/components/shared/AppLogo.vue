<script setup lang="ts">
import { APP_TAGLINE, APP_VERSION } from '#shared/constants/game'
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
    <svg viewBox="0 0 261.76 226.69" class="h-6 w-6 shrink-0" aria-hidden="true">
      <path
        fill="#42b883"
        d="m161.096.001-30.224 52.35L100.648.001H-.001L130.872 226.69 261.749.001Z"
      />
      <path
        fill="#35495e"
        d="m161.096.001-30.224 52.35L100.648.001H52.4l78.472 135.948L209.348.001Z"
      />
    </svg>
    <span class="hidden sm:inline font-display text-lg uppercase tracking-[0.08em] text-[color:var(--ink)]">
      {{ APP_TAGLINE }}
    </span>
    <span class="hidden md:inline font-mono text-[10px] uppercase tracking-[0.04em] text-[color:var(--ink-muted)] border border-[color:var(--line)] px-1 py-px">
      {{ APP_VERSION }}
    </span>
  </NuxtLink>
</template>
