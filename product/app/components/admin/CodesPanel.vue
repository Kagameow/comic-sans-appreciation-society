<script setup lang="ts">
import type { Code } from '#shared/types/game'

const game = useGame()
const admin = useAdminActions()

const { data: codesData, refresh } = await useAsyncData('admin-codes', () =>
  $fetch<{ codes: Code[] }>('/api/admin/codes'))
const codes = computed(() => codesData.value?.codes ?? [])

const search = ref('')
const filtered = computed(() =>
  codes.value.filter(c => c.code.toLowerCase().includes(search.value.toLowerCase())),
)

async function promote(code: string) {
  await admin.pickSuper(code)
  await refresh()
}

function statusFor(c: Code) {
  if (c.isSuperCode && !c.isUsed)
    return { label: '⬢ active super', tone: 'amber' as const }
  if (c.isUsed)
    return { label: '✓ merged', tone: 'vue' as const }
  return { label: '◌ unused', tone: 'ink' as const }
}

const toneClass = {
  vue: 'text-[color:var(--vue)] border-[color:var(--vue)]',
  amber: 'text-[color:var(--amber)] border-[color:var(--amber)]',
  ink: 'text-[color:var(--ink-muted)] border-[color:var(--line)]',
}
</script>

<template>
  <section class="bg-[color:var(--surface)] border border-[color:var(--line)] p-5 space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div class="font-mono text-xs text-[color:var(--vue)]">
        provide(&apos;superCode&apos;, ref(...))
      </div>
      <UInput
        v-model="search"
        size="sm"
        placeholder="grep keys"
        icon="i-lucide-search"
        class="w-40"
      />
    </header>

    <p class="font-mono text-[11px] text-[color:var(--ink-muted)]">
      active super: <span class="text-[color:var(--amber)]">{{ game.config.superCode ?? '—' }}</span>
    </p>

    <div class="space-y-1 max-h-[520px] overflow-y-auto">
      <div
        v-for="c in filtered"
        :key="c.code"
        class="grid grid-cols-[1fr_auto] gap-2 items-center px-2 py-1.5 border" :class="[
          c.isSuperCode ? 'border-[color:var(--amber)] bg-[color:var(--amber)]/10' : 'border-transparent hover:border-[color:var(--line)]',
        ]"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-mono text-sm text-[color:var(--ink)]">{{ c.code }}</span>
          <span class="font-mono text-[10px] text-[color:var(--ink-muted)]">{{ c.type }} · {{ c.value }}</span>
          <span class="ml-auto font-mono text-[10px] px-1 border" :class="[toneClass[statusFor(c).tone]]">
            {{ statusFor(c).label }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            size="xs"
            :variant="c.isSuperCode ? 'solid' : 'outline'"
            color="warning"
            :disabled="c.isSuperCode"
            @click="promote(c.code)"
          >
            promote
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
