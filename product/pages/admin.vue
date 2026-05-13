<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import type { Code } from '~/server/utils/repo'

const game = useGameStore()
await useAsyncData('state', () => game.refresh())
onMounted(() => game.startPolling())
onUnmounted(() => game.stopPolling())

const codes = ref<Code[]>([])
async function loadCodes() {
  const { codes: c } = await $fetch<{ codes: Code[] }>('/api/admin/codes')
  codes.value = c
}
await useAsyncData('codes', loadCodes)

const search = ref('')
const filtered = computed(() =>
  game.sortedPlayers.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())),
)

const minutesLeft = computed(() => {
  if (!game.config.multiplierEndsAt) return 0
  return Math.max(0, Math.ceil((game.config.multiplierEndsAt - Date.now()) / 60_000))
})

const multiplierOptions = [
  { n: 1.5, label: 'Set 1.5x',                       min: 10 },
  { n: 2,   label: 'Set 2x',                         min: 15 },
  { n: 3,   label: 'Set 3x · Composition Boost',     min: 5 },
]

async function activate(n: number, min: number) {
  await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier: n, minutes: min } })
  await game.refresh()
}
async function stop() {
  await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier: 1, minutes: 0 } })
  await game.refresh()
}
async function adjust(playerId: string, delta: number) {
  await $fetch('/api/admin/adjust', { method: 'POST', body: { playerId, delta } })
  await game.refresh()
}
async function pickSuper(code: string) {
  await $fetch('/api/admin/super-code', { method: 'POST', body: { code } })
  await Promise.all([game.refresh(), loadCodes()])
}
</script>

<template>
  <AppShell>
    <div class="container mx-auto max-w-6xl px-6 py-8 space-y-6">
      <div>
        <div class="text-xs uppercase tracking-widest text-emerald-300 mb-1">Architect View</div>
        <h1 class="text-4xl font-bold">Admin Dashboard</h1>
        <p class="text-xs text-amber-300 mt-2 ticker-mono">
          ⚠ POC: admin routes are unguarded until Supabase auth is wired
        </p>
      </div>

      <!-- Multiplier -->
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="h-5 w-5 text-emerald-300" /> Chaos Button
            </h2>
            <p class="text-sm text-slate-400">
              Current Multiplier:
              <span class="ticker-mono text-emerald-300 font-bold">{{ game.activeMultiplier }}x</span>
            </p>
          </div>
          <UButton
            v-if="game.isMultiplierActive"
            color="red"
            variant="soft"
            icon="i-lucide-stop-circle"
            @click="stop"
          >
            Stop ({{ minutesLeft }}m left)
          </UButton>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="b in multiplierOptions"
            :key="b.n"
            class="px-4 py-4 rounded-xl border border-white/10 bg-white/[0.04] hover:border-emerald-400 hover:bg-emerald-500/10 transition text-left"
            @click="activate(b.n, b.min)"
          >
            <div class="ticker-mono text-2xl font-bold text-emerald-300">{{ b.n }}x</div>
            <div class="text-xs text-slate-400 mt-1">{{ b.label }} · {{ b.min }}min</div>
          </button>
        </div>
      </section>

      <!-- Players -->
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Player Management</h2>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search players…"
            class="w-64"
          />
        </div>
        <div class="overflow-hidden rounded-lg border border-white/10">
          <table class="w-full text-sm">
            <thead class="bg-white/[0.04] text-slate-400 text-xs uppercase">
              <tr>
                <th class="text-left px-4 py-2">Player</th>
                <th class="text-center px-4 py-2">Victories</th>
                <th class="text-center px-4 py-2">Gems</th>
                <th class="text-right px-4 py-2">Points</th>
                <th class="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered.slice(0, 12)" :key="p.id" class="border-t border-white/10">
                <td class="px-4 py-2 flex items-center gap-2">
                  <span class="text-lg">{{ p.avatar }}</span> {{ p.name }}
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center justify-center gap-1">
                    <UIcon
                      v-for="i in 5"
                      :key="i"
                      name="i-lucide-diamond"
                      :class="['h-3.5 w-3.5', i <= p.victories ? 'text-emerald-300' : 'text-slate-700']"
                    />
                    <span class="ml-1 text-xs ticker-mono text-slate-400">{{ p.victories }}/5</span>
                  </div>
                </td>
                <td class="px-4 py-2 text-center ticker-mono text-xs text-slate-400">
                  {{ p.gems }}/5
                </td>
                <td class="px-4 py-2 text-right ticker-mono font-semibold text-emerald-300">
                  {{ p.points.toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-right space-x-1">
                  <UButton size="2xs" color="primary" variant="soft" @click="adjust(p.id, 10)">+10</UButton>
                  <UButton size="2xs" color="red"     variant="soft" @click="adjust(p.id, -10)">-10</UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Codes -->
      <section class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold">Code Registry</h2>
            <p class="text-xs text-slate-400 mt-1">
              Active Super Code:
              <span class="ticker-mono text-emerald-300">{{ game.config.superCode ?? '—' }}</span>
            </p>
          </div>
        </div>
        <div class="overflow-hidden rounded-lg border border-white/10">
          <table class="w-full text-sm">
            <thead class="bg-white/[0.04] text-slate-400 text-xs uppercase">
              <tr>
                <th class="text-left px-4 py-2">Code</th>
                <th class="text-left px-4 py-2">Type</th>
                <th class="text-left px-4 py-2">Value</th>
                <th class="text-left px-4 py-2">Status</th>
                <th class="text-center px-4 py-2">Super</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in codes"
                :key="c.code"
                :class="['border-t border-white/10', c.isSuperCode ? 'bg-emerald-500/5' : '']"
              >
                <td class="px-4 py-2 ticker-mono flex items-center gap-2">
                  <UIcon v-if="c.isSuperCode" name="i-lucide-crown" class="h-3.5 w-3.5 text-emerald-300" />
                  {{ c.code }}
                </td>
                <td class="px-4 py-2">
                  <span :class="c.type === 'super' ? 'text-emerald-300 font-semibold' : ''">{{ c.type }}</span>
                </td>
                <td class="px-4 py-2 ticker-mono">{{ c.value }}</td>
                <td class="px-4 py-2">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs',
                      c.isUsed ? 'bg-white/10 text-slate-400' : 'bg-emerald-500/15 text-emerald-300',
                    ]"
                  >
                    {{ c.isUsed ? 'Used' : 'Unused' }}
                  </span>
                </td>
                <td class="px-4 py-2 text-center">
                  <USwitch
                    :model-value="c.isSuperCode"
                    color="primary"
                    @update:model-value="(v) => v && pickSuper(c.code)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppShell>
</template>
