<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const game = useGameStore()
const route = useRoute()
const config = useRuntimeConfig()

const navItems = [
  { to: '/',            label: 'Code Check',   icon: 'i-lucide-terminal' },
  { to: '/leaderboard', label: 'Leaderboard',  icon: 'i-lucide-trophy' },
  { to: '/admin',       label: 'Admin',        icon: 'i-lucide-shield' },
]

const remaining = ref('')
let timer: ReturnType<typeof setInterval> | null = null

watchEffect(() => {
  if (timer) { clearInterval(timer); timer = null }
  const endsAt = game.config.multiplierEndsAt
  if (!endsAt) { remaining.value = ''; return }
  const tick = () => {
    const ms = Math.max(0, endsAt - Date.now())
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    remaining.value = `${m}:${s.toString().padStart(2, '0')}`
  }
  tick()
  timer = setInterval(tick, 500)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const playerName = computed(() => config.public.currentPlayerName)
const myPoints = computed(() => game.me?.points ?? 0)
const myAvatar = computed(() => game.me?.avatar ?? '🦊')
</script>

<template>
  <div :class="['min-h-screen', game.isMultiplierActive ? 'multiplier-glow' : '']">
    <header class="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-40">
      <div class="container mx-auto max-w-6xl px-6 flex h-16 items-center justify-between gap-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-md gradient-hero flex items-center justify-center font-bold text-slate-900">
            V3
          </div>
          <span class="font-semibold tracking-tight">The Great Migration</span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="n in navItems"
            :key="n.to"
            :to="n.to"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
              route.path === n.to
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
            ]"
          >
            <UIcon :name="n.icon" class="h-4 w-4" />
            {{ n.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <div
            v-if="game.isMultiplierActive"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold ticker-mono"
          >
            <UIcon name="i-lucide-zap" class="h-3.5 w-3.5" /> {{ game.activeMultiplier }}x · {{ remaining }}
          </div>
          <div class="flex items-center gap-2 pl-3 border-l border-white/10">
            <span class="ticker-mono text-sm font-semibold text-emerald-300">
              {{ myPoints.toLocaleString() }} pts
            </span>
            <div class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
              {{ myAvatar }}
            </div>
            <span class="hidden sm:inline text-xs text-slate-400">{{ playerName }}</span>
          </div>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
