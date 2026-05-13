<script setup lang="ts">
const game = useGameStore()
</script>

<template>
  <div :class="['min-h-screen', game.isMultiplierActive ? 'multiplier-glow' : '']">
    <header class="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-40">
      <div class="container mx-auto max-w-6xl px-6 flex h-16 items-center justify-between gap-6">
        <SharedAppLogo />
        <SharedAppNav />
        <div class="flex items-center gap-3">
          <SharedMultiplierBadge />
          <SharedPlayerBadge />
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
