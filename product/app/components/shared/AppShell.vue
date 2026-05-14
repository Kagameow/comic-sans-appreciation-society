<script setup lang="ts">
const game = useGame()
const { isComic, toggle: toggleFont } = useFontMode()
const colorMode = useColorMode()
const route = useRoute()
const navOpen = ref(false)

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => { colorMode.preference = v ? 'dark' : 'light' },
})

// /tv switches the document into tv-mode (10-foot UI per design-system §3.2).
// The class drives base font-size + scanline opacity in main.css.
watchEffect(() => {
  if (import.meta.server)
    return
  document.documentElement.classList.toggle('tv-mode', route.path === '/tv' || route.path === '/leaderboard')
})

// Header is suppressed entirely on /tv — the TV view is its own world.
const showHeader = computed(() => route.path !== '/tv' && route.path !== '/leaderboard')
</script>

<template>
  <div class="min-h-screen" :class="[game.isMultiplierActive && showHeader ? 'multiplier-glow' : '']">
    <header
      v-if="showHeader"
      class="border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur sticky top-0 z-40"
    >
      <div class="container mx-auto max-w-6xl px-3 sm:px-6 flex h-14 items-center justify-between gap-2 sm:gap-6">
        <div class="flex items-center gap-2 min-w-0">
          <UButton
            class="md:hidden"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-menu"
            aria-label="Open menu"
            @click="navOpen = true"
          />
          <SharedAppLogo />
        </div>
        <SharedAppNav />
        <div class="flex items-center gap-1.5 sm:gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            :title="isComic ? 'Switch to system font' : 'Switch to comic font'"
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
        </div>
      </div>
    </header>

    <USlideover v-model:open="navOpen" side="left" title="Menu">
      <template #body>
        <SharedAppNav variant="stacked" @navigate="navOpen = false" />
      </template>
    </USlideover>

    <main>
      <slot />
    </main>

    <SharedVersionChip />
  </div>
</template>
