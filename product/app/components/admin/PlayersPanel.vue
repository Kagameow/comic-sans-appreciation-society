<script setup lang="ts">
const game = useGameStore()
const { adjustPoints } = useAdminActions()

const search = ref('')
const filtered = computed(() =>
  game.sortedPlayers.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())).slice(0, 12),
)
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-xl font-semibold">Player Management</h2>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search players…"
        class="w-full sm:w-64"
      />
    </div>
    <div class="overflow-x-auto rounded-lg border border-white/10">
      <table class="w-full text-sm min-w-[560px]">
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
          <tr v-for="p in filtered" :key="p.id" class="border-t border-white/10">
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
              <UButton size="xs" color="primary" variant="soft" @click="adjustPoints(p.id, 10)">+10</UButton>
              <UButton size="xs" color="error"   variant="soft" @click="adjustPoints(p.id, -10)">-10</UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
