<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

// docs/refactor-plan.md §5 — RFC #017, the Composition API vocabulary.
const emit = defineEmits<{ (e: 'solve', points: number): void }>()

const ANSWERS = [
  { word: 'PINIA', row: 0, col: 0, dir: 'across', clue: 'Vue 3\'s official state library' },
  { word: 'SETUP', row: 2, col: 0, dir: 'across', clue: '<script ___> macro' },
  { word: 'VITE', row: 4, col: 0, dir: 'across', clue: 'Lightning-fast dev server' },
] as const
const SIZE = 5

const active = computed(() => {
  const m: boolean[][] = Array.from({ length: SIZE }, () => Array.from<boolean>({ length: SIZE }).fill(false))
  for (const a of ANSWERS) {
    for (let i = 0; i < a.word.length; i++) {
      if (a.dir === 'across')
        m[a.row]![a.col + i] = true
      else m[a.row + i]![a.col] = true
    }
  }
  return m
})

const schema = v.object({
  grid: v.pipe(
    v.array(v.array(v.string())),
    v.check((rows) => {
      for (const a of ANSWERS) {
        for (let i = 0; i < a.word.length; i++) {
          const cell = a.dir === 'across' ? rows[a.row]?.[a.col + i] : rows[a.row + i]?.[a.col]
          if (!cell)
            return false
        }
      }
      return true
    }, 'Fill in every active cell'),
  ),
})

const crosswordForm = createFormObject({
  defaultValues: () => ({
    grid: Array.from({ length: SIZE }, () => Array.from({ length: SIZE }).fill('') as string[]),
  }),
  schema,
  async submit() {
    emit('solve', 75)
  },
  resetOnSuccess: false,
})

const grid = computed(() => crosswordForm.grid ?? [])
const solved = ref<string[]>([])

function update(r: number, c: number, raw: string) {
  const ch = raw.toUpperCase().slice(-1)
  if (!crosswordForm.grid)
    return
  crosswordForm.grid[r]![c] = ch
  // Track which clues are now fully filled so the sidebar can show "clean".
  for (const a of ANSWERS) {
    const word = Array.from(
      { length: a.word.length },
      (_, i) => (a.dir === 'across' ? crosswordForm.grid![a.row]![a.col + i] : crosswordForm.grid![a.row + i]![a.col]) ?? '',
    ).join('')
    if (word === a.word && !solved.value.includes(a.word)) {
      solved.value = [...solved.value, a.word]
    }
  }
}
</script>

<template>
  <UForm
    :state="crosswordForm"
    :schema="crosswordForm.$schema"
    class="bg-[color:var(--surface)] border border-[color:var(--line)] p-6 sm:p-8"
    @submit="crosswordForm.$submit()"
    @error="focusFirstError"
  >
    <header class="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--vue)] mb-4">
      RFC #017 · the Composition API vocabulary
    </header>

    <div class="grid md:grid-cols-2 gap-8">
      <UFormField name="grid">
        <div class="grid gap-1.5" :style="`grid-template-columns: repeat(${SIZE}, minmax(0,1fr))`">
          <template v-for="(row, r) in grid" :key="r">
            <template v-for="(cell, c) in row" :key="`${r}-${c}`">
              <UInput
                v-if="active[r]?.[c]"
                :model-value="cell"
                :maxlength="1"
                size="lg"
                class="aspect-square w-full"
                :ui="{ base: 'text-center font-display uppercase' }"
                @update:model-value="update(r, c, String($event ?? ''))"
              />
              <div v-else class="aspect-square w-full bg-[color:var(--surface-deep)]" />
            </template>
          </template>
        </div>
      </UFormField>

      <div class="space-y-4">
        <div>
          <h3 class="font-mono uppercase tracking-[0.04em] text-xs text-[color:var(--ink-muted)] mb-2">
            Across
          </h3>
          <ul class="space-y-2 font-mono text-sm">
            <li v-for="(a, i) in ANSWERS" :key="i">
              <span class="text-[color:var(--vue)] mr-2">{{ i + 1 }}.</span>
              <span class="text-[color:var(--ink-body)]">{{ a.clue }}</span>
              <span class="text-[color:var(--ink-muted)]"> ({{ a.word.length }})</span>
            </li>
          </ul>
        </div>

        <div class="font-mono text-[11px] text-[color:var(--vue)] space-y-0.5 min-h-[3rem]">
          <div v-for="w in solved" :key="w">
            &gt; git status: {{ w.toLowerCase() }} clean ✓
          </div>
        </div>

        <UButton
          block
          color="primary"
          type="submit"
          class="font-mono"
          :disabled="!crosswordForm.$valid"
          :loading="crosswordForm.$loading"
        >
          Approve RFC →
        </UButton>
        <UButton
          block
          variant="outline"
          color="error"
          class="font-mono"
          @click="emit('solve', 0)"
        >
          Request changes
        </UButton>
        <UAlert
          v-if="crosswordForm.$error"
          color="error"
          icon="i-lucide-circle-x"
          :title="crosswordForm.$error.message"
        />
      </div>
    </div>
  </UForm>
</template>
