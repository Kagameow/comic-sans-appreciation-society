<script setup lang="ts">
import type { Code } from '#shared/types/game'

const game = useGameStore()
const { pickSuper } = useAdminActions()

const { data: codesData, refresh } = await useAsyncData('admin-codes', () =>
  $fetch<{ codes: Code[] }>('/api/admin/codes'),
)
const codes = computed(() => codesData.value?.codes ?? [])

async function selectSuper(code: string) {
  await pickSuper(code)
  await refresh()
}
</script>

<template>
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
                @update:model-value="(v: boolean) => v && selectSuper(c.code)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
