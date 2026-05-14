<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const emit = defineEmits<{ (e: 'solve', points: number): void }>()

const ANSWERS = [
  { word: 'PINIA', row: 0, col: 0, dir: 'across', clue: "Vue 3's official state library" },
  { word: 'SETUP', row: 2, col: 0, dir: 'across', clue: '<script ___> macro' },
  { word: 'VITE',  row: 4, col: 0, dir: 'across', clue: 'Lightning-fast dev server' },
] as const
const SIZE = 5

const active = computed(() => {
  const m: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false))
  for (const a of ANSWERS) {
    for (let i = 0; i < a.word.length; i++) {
      if (a.dir === 'across') m[a.row]![a.col + i] = true
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
          if (!cell) return false
        }
      }
      return true
    }, 'Fill in every active cell'),
  ),
})

const crosswordForm = createFormObject({
  defaultValues: () => ({
    grid: Array.from({ length: SIZE }, () => Array(SIZE).fill('') as string[]),
  }),
  schema,
  async submit() {
    emit('solve', 75)
  },
  resetOnSuccess: false,
})

const grid = computed(() => crosswordForm.grid ?? [])

function update(r: number, c: number, raw: string) {
  const ch = raw.toUpperCase().slice(-1)
  if (!crosswordForm.grid) return
  crosswordForm.grid[r]![c] = ch
}
</script>

<template>
  <UForm
    :state="crosswordForm"
    :schema="crosswordForm.$schema"
    class="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-card"
    @submit="crosswordForm.$submit()"
    @error="focusFirstError"
  >
    <div class="text-xs uppercase tracking-widest text-slate-400 mb-4">Crossword · Vue 3</div>
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
                :ui="{ base: 'text-center font-bold uppercase ticker-mono' }"
                @update:model-value="update(r, c, String($event ?? ''))"
              />
              <div v-else class="aspect-square w-full rounded-md bg-white/5" />
            </template>
          </template>
        </div>
      </UFormField>
      <div>
        <h3 class="font-semibold mb-2">Across</h3>
        <ul class="space-y-2 text-sm text-slate-400">
          <li v-for="(a, i) in ANSWERS" :key="i">
            <span class="ticker-mono text-emerald-300 mr-2">{{ i + 1 }}.</span>
            {{ a.clue }} <span class="opacity-50">({{ a.word.length }})</span>
          </li>
        </ul>
        <UButton
          block
          color="primary"
          class="mt-6"
          type="submit"
          :disabled="!crosswordForm.$valid"
          :loading="crosswordForm.$loading"
        >
          Submit Crossword
        </UButton>
        <UAlert
          v-if="crosswordForm.$error"
          color="error"
          icon="i-lucide-circle-x"
          :title="crosswordForm.$error.message"
          class="mt-2"
        />
      </div>
    </div>
  </UForm>
</template>
