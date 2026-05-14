<script setup lang="ts">
const game = useGame()
const admin = useAdminActions()

const search = ref('')
const filtered = computed(() =>
  game.sortedPlayers
    .filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
    .slice(0, 14),
)

const deltaInputs = ref<Record<string, string>>({})

function applyDelta(playerId: string) {
  const raw = (deltaInputs.value[playerId] ?? '').trim()
  if (!raw)
    return
  const n = Number(raw.replace(/^\+/, ''))
  if (!Number.isFinite(n) || n === 0)
    return
  admin.adjustPoints(playerId, n)
  deltaInputs.value[playerId] = ''
}
</script>

<template>
  <section class="bg-[color:var(--surface)] border border-[color:var(--line)] p-5 space-y-4">
    <header class="flex items-center justify-between">
      <div class="font-mono text-xs text-[color:var(--vue)]">
        defineProps&lt;{ contributor: string; delta: number }&gt;()
      </div>
      <UInput
        v-model="search"
        size="sm"
        placeholder="grep contributors"
        icon="i-lucide-search"
        class="w-40"
      />
    </header>

    <div class="space-y-1 max-h-[520px] overflow-y-auto">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="grid grid-cols-[1fr_auto] gap-2 items-center px-2 py-1.5 border border-transparent hover:border-[color:var(--line)]"
      >
        <div class="flex items-center gap-2 min-w-0">
          <img
            v-if="p.avatarUrl"
            :src="p.avatarUrl"
            :alt="p.name"
            class="h-6 w-6 object-cover border border-[color:var(--line)]"
          >
          <span v-else class="text-base">{{ p.avatar }}</span>
          <span class="font-mono text-sm text-[color:var(--ink-body)] truncate">{{ p.name }}</span>
          <span class="font-mono text-[10px] text-[color:var(--ink-muted)] whitespace-nowrap">
            {{ p.gems }}/5 · {{ p.victories }}/5 · {{ p.points.toLocaleString() }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <UInput
            v-model="deltaInputs[p.id]"
            size="xs"
            placeholder="±n"
            class="w-16"
            @keydown.enter="applyDelta(p.id)"
          />
          <UButton size="xs" variant="outline" color="primary" @click="applyDelta(p.id)">
            apply
          </UButton>
          <UButton size="xs" variant="outline" @click="admin.adjustPoints(p.id, 10)">
            +10
          </UButton>
          <UButton size="xs" variant="outline" color="error" @click="admin.adjustPoints(p.id, -10)">
            -10
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
