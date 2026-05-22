<script setup lang="ts">
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

// ── tuning ─────────────────────────────────────────────────────────────────
const COLS = 18
const ROWS = 14
const TARGET_LENGTH = 25
const TIME_LIMIT_MS = 5 * 60 * 1000
const TICK_MS = 130
const WIN_DELAY_MS = 1300
const LOSE_DELAY_MS = 900
const CRASH_FLASH_MS = 250
const START_HEAD = { row: Math.floor(ROWS / 2), col: Math.floor(COLS / 4) }

type Cell = { row: number; col: number }
type Dir = 'up' | 'down' | 'left' | 'right'

const OPPOSITES: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DELTAS: Record<Dir, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 }, left: { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 },
}

const snake = ref<Cell[]>([{ ...START_HEAD }])
const direction = ref<Dir>('right')
const queuedDir = ref<Dir | null>(null)
const food = ref<Cell>({ row: START_HEAD.row, col: START_HEAD.col + 5 })
const crashes = ref(0)
const peak = ref(1)
const finished = ref<'win' | 'lose' | null>(null)
const crashing = ref(false)

const startedAt = Date.now()
const now = ref(Date.now())
const remainingMs = computed(() => Math.max(0, TIME_LIMIT_MS - (now.value - startedAt)))
const mmss = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
})
const timeLow = computed(() => remainingMs.value < 30_000)

const snakeKeys = computed(() => new Set(snake.value.map(c => `${c.row}-${c.col}`)))
const headKey = computed(() => snake.value[0] ? `${snake.value[0].row}-${snake.value[0].col}` : '')
const foodKey = computed(() => `${food.value.row}-${food.value.col}`)

const length = computed(() => snake.value.length)
const progressPct = computed(() => Math.min(100, (length.value / TARGET_LENGTH) * 100))

function randomEmptyCell(): Cell {
  const occupied = snakeKeys.value
  for (let i = 0; i < 30; i++) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!occupied.has(`${r}-${c}`)) return { row: r, col: c }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!occupied.has(`${r}-${c}`)) return { row: r, col: c }
    }
  }
  return { row: 0, col: 0 }
}

function setDirection(d: Dir) {
  if (finished.value) return
  // can't reverse 180° unless snake is single cell
  if (OPPOSITES[d] === direction.value && snake.value.length > 1) return
  queuedDir.value = d
}

function resetRun() {
  snake.value = [{ ...START_HEAD }]
  direction.value = 'right'
  queuedDir.value = null
  food.value = randomEmptyCell()
}

function crashOut() {
  crashes.value++
  crashing.value = true
  useTimeoutFn(() => { crashing.value = false }, CRASH_FLASH_MS)
  resetRun()
}

function tick() {
  if (finished.value) return
  if (queuedDir.value && OPPOSITES[queuedDir.value] !== direction.value) {
    direction.value = queuedDir.value
  }
  queuedDir.value = null

  const head = snake.value[0]
  if (!head) return
  const { dr, dc } = DELTAS[direction.value]
  const nr = head.row + dr
  const nc = head.col + dc

  // wall
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return crashOut()
  // self (tail will move unless eating)
  const willEat = food.value.row === nr && food.value.col === nc
  const body = willEat ? snake.value : snake.value.slice(0, -1)
  if (body.some(c => c.row === nr && c.col === nc)) return crashOut()

  const newHead = { row: nr, col: nc }
  if (willEat) {
    snake.value = [newHead, ...snake.value]
    if (snake.value.length > peak.value) peak.value = snake.value.length
    if (snake.value.length >= TARGET_LENGTH) {
      finished.value = 'win'
      ticker.pause()
      timer.pause()
      useTimeoutFn(() => emit('resolve', 1), WIN_DELAY_MS)
      return
    }
    food.value = randomEmptyCell()
  } else {
    snake.value = [newHead, ...snake.value.slice(0, -1)]
  }
}

function bailOut() {
  if (finished.value) return
  finished.value = 'lose'
  ticker.pause()
  timer.pause()
  useTimeoutFn(() => emit('resolve', 0), 400)
}

const ticker = useIntervalFn(tick, TICK_MS)
const timer = useIntervalFn(() => {
  now.value = Date.now()
  if (remainingMs.value === 0 && !finished.value) {
    finished.value = 'lose'
    ticker.pause()
    timer.pause()
    useTimeoutFn(() => emit('resolve', 0), LOSE_DELAY_MS)
  }
}, 100)

function onKey(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  const dir =
    k === 'arrowup' || k === 'w' ? 'up' :
    k === 'arrowdown' || k === 's' ? 'down' :
    k === 'arrowleft' || k === 'a' ? 'left' :
    k === 'arrowright' || k === 'd' ? 'right' :
    null
  if (!dir) return
  setDirection(dir)
  e.preventDefault()
}

onMounted(() => {
  if (typeof window !== 'undefined') window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey)
  ticker.pause()
  timer.pause()
})

function cellClass(r: number, c: number): string {
  const key = `${r}-${c}`
  if (headKey.value === key) return 'bg-emerald-300'
  if (snakeKeys.value.has(key)) return 'bg-emerald-500/80'
  if (foodKey.value === key) return 'bg-amber-300'
  return 'bg-black/40'
}
</script>

<template>
  <div class="rounded-2xl border border-emerald-400/30 bg-white/5 p-6 sm:p-8 shadow-card glow-green">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-widest text-emerald-300">🐍 Snake · Data Stream Edition</span>
      <span class="ticker-mono text-xs text-slate-400">First-mover bonus</span>
    </div>

    <h2 class="text-2xl font-bold mb-1">Route the data stream.</h2>
    <p class="text-slate-400 mb-2">
      Eat <span class="text-emerald-300 font-semibold">{{ TARGET_LENGTH }}</span> packets in one run.
      Crash and your stream resets — but the clock keeps ticking.
    </p>
    <p class="ticker-mono text-sm font-bold uppercase tracking-widest text-emerald-300 mb-5">
      ⌨ USE YOUR KEYBOARD — ARROW KEYS OR WASD TO MOVE THE SNAKE
    </p>

    <!-- HUD -->
    <div class="flex items-center justify-between gap-4 mb-4">
      <div class="flex-1">
        <div class="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 mb-1">
          <span>Length</span>
          <span class="ticker-mono text-emerald-300">{{ length }} / {{ TARGET_LENGTH }}</span>
        </div>
        <div class="h-2 rounded-full bg-white/5 overflow-hidden">
          <div class="h-full transition-all duration-200 bg-emerald-500" :style="{ width: `${progressPct}%` }" />
        </div>
      </div>
      <div class="shrink-0 text-right">
        <div class="text-xs uppercase tracking-widest text-slate-400">Time</div>
        <div
          class="ticker-mono text-2xl font-bold leading-tight"
          :class="timeLow ? 'text-rose-400' : 'text-slate-200'"
        >
          {{ mmss }}
        </div>
      </div>
    </div>

    <!-- Arena -->
    <div
      class="grid gap-px rounded-lg p-1 transition-colors mx-auto select-none"
      :class="crashing ? 'bg-rose-500/40' : 'bg-white/5'"
      :style="{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        maxWidth: `${COLS * 1.4}rem`,
      }"
    >
      <template v-for="r in ROWS" :key="r">
        <div
          v-for="c in COLS"
          :key="`${r}-${c}`"
          class="aspect-square rounded-[2px]"
          :class="cellClass(r - 1, c - 1)"
        />
      </template>
    </div>

    <UAlert
      v-if="finished === 'win'"
      color="success"
      icon="i-lucide-party-popper"
      title="Stream Complete!"
      description="Packets routed. Logging in your win…"
      class="mt-6"
    />
    <UAlert
      v-else-if="finished === 'lose'"
      color="error"
      icon="i-lucide-circle-x"
      title="Connection Severed!"
      description="The data stream crashed. No points this run."
      class="mt-6"
    />

    <div class="mt-6 flex items-center justify-between text-xs">
      <span class="ticker-mono text-slate-500">
        Peak: {{ peak }} · Crashes: {{ crashes }}
      </span>
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="!!finished"
        @click="bailOut"
      >
        Bail out
      </UButton>
    </div>
  </div>
</template>
