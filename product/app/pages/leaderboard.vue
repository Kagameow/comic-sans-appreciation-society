<script setup lang="ts">
const game = useGameStore()
const config = useRuntimeConfig()
const myName = computed(() => config.public.currentPlayerName)

await useAsyncData('state', () => game.refresh())
onMounted(() => game.startPolling(2000))
onUnmounted(() => game.stopPolling())

const medals = ['🥇', '🥈', '🥉']
const bumpedId = ref<string | null>(null)
let prevOrder: string[] = []

watch(() => game.sortedPlayers, (next) => {
  const order = next.map(p => p.id)
  // Detect rank change → highlight whichever player just moved up.
  for (let i = 0; i < order.length; i++) {
    if (order[i] !== prevOrder[i] && prevOrder.length > 0) {
      bumpedId.value = order[i] ?? null
      setTimeout(() => { bumpedId.value = null }, 900)
      break
    }
  }
  prevOrder = order
}, { deep: true })

watch(() => game.superWinner, (winner) => {
  if (!winner) return
  confettiSuperBurst()
  const interval = setInterval(confettiSuperBurst, 600)
  setTimeout(() => clearInterval(interval), 4000)
})
</script>

<template>
  <div>
    <div class="container mx-auto max-w-5xl px-6 py-8">
      <div class="flex items-baseline justify-between mb-6">
        <div>
          <h1 class="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p class="text-slate-400">Live rankings · TV Mode</p>
        </div>
        <div class="ticker-mono text-sm text-emerald-300 animate-pulse">● LIVE</div>
      </div>

      <div class="space-y-2">
        <div
          v-for="(p, idx) in game.sortedPlayers"
          :key="p.id"
          :class="[
            'relative flex items-center gap-4 rounded-xl border transition-all',
            idx < 3 ? 'py-5 px-6 bg-white/5 border-emerald-400/30' : 'py-3 px-4 bg-white/[0.03] border-white/10',
            p.name === myName ? 'ring-1 ring-emerald-400/60' : '',
            bumpedId === p.id ? 'animate-rank-up' : '',
          ]"
        >
          <div
            :class="[
              'ticker-mono font-bold',
              idx < 3 ? 'text-3xl w-12' : 'text-lg w-10 text-slate-400',
            ]"
          >
            {{ idx < 3 ? medals[idx] : `#${idx + 1}` }}
          </div>
          <div
            :class="[
              'rounded-full bg-white/10 flex items-center justify-center',
              idx < 3 ? 'h-14 w-14 text-3xl' : 'h-10 w-10 text-xl',
            ]"
          >
            {{ p.avatar }}
          </div>
          <div class="flex-1 min-w-0">
            <div :class="['font-semibold truncate', idx < 3 ? 'text-xl' : 'text-base']">
              {{ p.name }}
              <span v-if="p.name === myName" class="text-xs text-emerald-300 font-normal">(you)</span>
            </div>
            <div class="text-xs text-slate-400 truncate">{{ p.latest }}</div>
          </div>
          <div :class="['ticker-mono font-bold text-emerald-300', idx < 3 ? 'text-3xl' : 'text-xl']">
            {{ p.points.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="game.superWinner"
      class="fixed inset-0 z-50 flex items-center justify-center p-8 animate-fade-in cursor-pointer"
      style="background: radial-gradient(circle at center, rgba(66,184,131,0.55), rgba(10,15,25,0.95));"
      @click="game.dismissSuperEvent()"
    >
      <div class="text-center max-w-4xl">
        <UIcon name="i-lucide-git-merge" class="h-24 w-24 mx-auto text-emerald-300 mb-6 animate-pulse" />
        <div class="ticker-mono text-sm text-emerald-300 mb-4">▲ INCOMING TRANSMISSION ▲</div>
        <h1 class="text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-emerald-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
          THE MASTER BRANCH<br />HAS BEEN MERGED!
        </h1>
        <p class="text-3xl mb-2">
          <span class="font-bold text-emerald-300">{{ game.superWinner.name }}</span>
        </p>
        <p class="text-2xl text-slate-400">found the Super Code.</p>
        <p class="text-xs text-slate-500 mt-8 ticker-mono opacity-60">click anywhere to dismiss</p>
      </div>
    </div>
  </div>
</template>
