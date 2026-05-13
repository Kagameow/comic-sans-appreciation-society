<script setup lang="ts">
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

const grid = ref<string[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill('')))

const filled = computed(() =>
  grid.value.every((row, r) => row.every((c, ci) => !active.value[r]![ci] || c.length > 0)),
)

function update(r: number, c: number, v: string) {
  const ch = v.toUpperCase().slice(-1)
  grid.value[r]![c] = ch
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-card">
    <div class="text-xs uppercase tracking-widest text-slate-400 mb-4">Crossword · Vue 3</div>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="grid gap-1.5" :style="`grid-template-columns: repeat(${SIZE}, minmax(0,1fr))`">
        <template v-for="(row, r) in grid" :key="r">
          <template v-for="(cell, c) in row" :key="`${r}-${c}`">
            <input
              v-if="active[r]?.[c]"
              :value="cell"
              maxlength="1"
              class="aspect-square w-full text-center font-bold text-lg uppercase rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 ticker-mono"
              @input="(e) => update(r, c, (e.target as HTMLInputElement).value)"
            />
            <div v-else class="aspect-square w-full rounded-md bg-white/5" />
          </template>
        </template>
      </div>
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
          :disabled="!filled"
          @click="emit('solve', 75)"
        >
          Submit Crossword
        </UButton>
      </div>
    </div>
  </div>
</template>
