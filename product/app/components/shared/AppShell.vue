<script setup lang="ts">
const game = useGameStore()
const { isComic, toggle: toggleFont } = useFontMode()
</script>

<template>
  <div :class="['min-h-screen', game.isMultiplierActive ? 'multiplier-glow' : '']">
    <header class="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-40">
      <div class="container mx-auto max-w-6xl px-6 flex h-16 items-center justify-between gap-6">
        <SharedAppLogo />
        <SharedAppNav />
        <div class="flex items-center gap-3">
          <UButton
            variant="ghost"
            size="sm"
            :title="isComic ? 'Switch to boring font' : 'Switch to fun font'"
            @click="toggleFont"
          >
            <span class="text-lg leading-none">{{ isComic ? '🎨' : '📝' }}</span>
          </UButton>
          <SharedMultiplierBadge />
          <SharedPlayerBadge />
          <SharedAuthBadge />
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
