<script setup lang="ts">
const game = useGameStore()
const { isComic, toggle: toggleFont } = useFontMode()
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => { colorMode.preference = v ? 'dark' : 'light' },
})
</script>

<template>
  <div :class="['min-h-screen', game.isMultiplierActive ? 'multiplier-glow' : '']">
    <header class="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-40">
      <div class="container mx-auto max-w-6xl px-3 sm:px-6 flex h-16 items-center justify-between gap-2 sm:gap-6">
        <SharedAppLogo />
        <SharedAppNav />
        <div class="flex items-center gap-1.5 sm:gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            :title="isComic ? 'Switch to boring font' : 'Switch to fun font'"
            @click="toggleFont"
          >
            <span class="text-lg leading-none">{{ isComic ? '🎨' : '📝' }}</span>
          </UButton>
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              variant="ghost"
              color="neutral"
              size="sm"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="h-8 w-8" />
            </template>
          </ClientOnly>
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
