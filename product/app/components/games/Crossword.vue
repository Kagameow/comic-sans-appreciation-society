<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const emit = defineEmits<{ (e: 'solve', points: number): void }>()

type Answer = {
  word: string
  row: number
  col: number
  dir: 'across' | 'down'
  num: number
  clue: string
}

const ROWS = 5
const COLS = 7

const ANSWERS: Answer[] = [
  { word: 'VITE',  row: 0, col: 1, dir: 'down',   num: 1, clue: "Vue 3's build tool — also French for \"quickly\"" },
  { word: 'DARTS', row: 0, col: 4, dir: 'down',   num: 2, clue: 'Office pub game (sharp-tipped projectiles)' },
  { word: 'PINIA', row: 1, col: 0, dir: 'across', num: 3, clue: "Vue 3's official state library" },
  { word: 'MERGE', row: 2, col: 2, dir: 'across', num: 4, clue: 'Git: combine two branches (also: traffic verb)' },
]

const cellsOf = (a: Answer) => Array.from({ length: a.word.length }, (_, i) => ({
  r: a.dir === 'across' ? a.row : a.row + i,
  c: a.dir === 'across' ? a.col + i : a.col,
  letter: a.word[i]!,
}))

const active = computed(() => {
  const m: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  for (const a of ANSWERS) for (const { r, c } of cellsOf(a)) m[r]![c] = true
  return m
})

const correctAt = computed(() => {
  const m: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  for (const a of ANSWERS) for (const { r, c, letter } of cellsOf(a)) m[r]![c] = letter
  return m
})

const numAt = computed(() => {
  const m: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  for (const a of ANSWERS) m[a.row]![a.col] = a.num
  return m
})

const schema = v.object({
  grid: v.pipe(
    v.array(v.array(v.string())),
    v.check((rows) => {
      for (const a of ANSWERS) {
        for (const { r, c, letter } of cellsOf(a)) {
          if ((rows[r]?.[c] ?? '').toUpperCase() !== letter) return false
        }
      }
      return true
    }, 'Some letters are off — keep editing.'),
  ),
})

const crosswordForm = createFormObject({
  defaultValues: () => ({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill('') as string[]),
  }),
  schema,
  async submit() {
    emit('solve', 1) // server picks the first-mover tier
  },
  resetOnSuccess: false,
})

const grid = computed(() => crosswordForm.grid ?? [])

const filledCount = computed(() => {
  let n = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (active.value[r]?.[c] && grid.value[r]?.[c]) n++
    }
  }
  return n
})

const activeCount = computed(() => {
  let n = 0
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (active.value[r]?.[c]) n++
  return n
})

const acrossClues = computed(() => ANSWERS.filter(a => a.dir === 'across').sort((a, b) => a.num - b.num))
const downClues   = computed(() => ANSWERS.filter(a => a.dir === 'down').sort((a, b) => a.num - b.num))

function update(r: number, c: number, raw: string) {
  if (!crosswordForm.grid) return
  const ch = raw.toUpperCase().slice(-1).replace(/[^A-Z]/g, '')
  crosswordForm.grid[r]![c] = ch
}
</script>

<template>
  <UForm
    :state="crosswordForm"
    :schema="crosswordForm.$schema"
    class="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-card"
    @submit="crosswordForm.$submit()"
    @error="focusFirstError"
  >
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs uppercase tracking-widest text-slate-400">Crossword · The Great Migration</span>
      <span class="ticker-mono text-xs text-slate-400">
        {{ filledCount }} / {{ activeCount }}
      </span>
    </div>

    <div class="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start">
      <UFormField name="grid">
        <div
          class="grid gap-1.5 mx-auto"
          :style="`grid-template-columns: repeat(${COLS}, minmax(0, 2.6rem))`"
        >
          <template v-for="(row, r) in grid" :key="r">
            <template v-for="(cell, c) in row" :key="`${r}-${c}`">
              <div
                v-if="active[r]?.[c]"
                class="relative aspect-square w-full"
              >
                <span
                  v-if="numAt[r]?.[c]"
                  class="ticker-mono absolute top-0.5 left-1 text-[10px] leading-none text-emerald-300/80 pointer-events-none"
                >
                  {{ numAt[r]?.[c] }}
                </span>
                <input
                  type="text"
                  inputmode="text"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="characters"
                  spellcheck="false"
                  :maxlength="1"
                  :value="cell"
                  class="ticker-mono w-full h-full text-center text-lg sm:text-xl font-bold uppercase rounded-md border border-white/15 bg-black/30 text-emerald-100 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  @input="update(r, c, ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div v-else class="aspect-square w-full rounded-md bg-white/[0.02]" />
            </template>
          </template>
        </div>
      </UFormField>

      <div class="space-y-5">
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-widest text-emerald-300 mb-2">Across</h3>
          <ul class="space-y-2 text-sm text-slate-300">
            <li v-for="a in acrossClues" :key="a.num" class="flex gap-2">
              <span class="ticker-mono text-emerald-300 shrink-0">{{ a.num }}.</span>
              <span>{{ a.clue }} <span class="opacity-50">({{ a.word.length }})</span></span>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-widest text-emerald-300 mb-2">Down</h3>
          <ul class="space-y-2 text-sm text-slate-300">
            <li v-for="a in downClues" :key="a.num" class="flex gap-2">
              <span class="ticker-mono text-emerald-300 shrink-0">{{ a.num }}.</span>
              <span>{{ a.clue }} <span class="opacity-50">({{ a.word.length }})</span></span>
            </li>
          </ul>
        </div>

        <UButton
          block
          color="primary"
          size="lg"
          type="submit"
          :disabled="filledCount < activeCount || crosswordForm.$loading"
          :loading="crosswordForm.$loading"
        >
          Submit Crossword
        </UButton>
        <UAlert
          v-if="crosswordForm.$error"
          color="error"
          icon="i-lucide-circle-x"
          :title="crosswordForm.$error.message"
        />
        <p class="text-xs text-slate-500">
          First solver gets the biggest bonus — points decay as more people finish.
        </p>
      </div>
    </div>
  </UForm>
</template>
