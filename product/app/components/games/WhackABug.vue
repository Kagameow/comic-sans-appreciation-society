<script setup lang="ts">
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

// ── tuning ─────────────────────────────────────────────────────────────────
const GRID_SIZE = 9               // 3 × 3 slots
const TARGET = 40                 // bugs to squash for the win
const TIME_LIMIT_MS = 5 * 60 * 1000
const SPAWN_INTERVAL_MS = 550
const BUG_LIFETIME_MS = 850
const WIN_DELAY_MS = 1300
const LOSE_DELAY_MS = 900

type Bug = { id: number; expiresAt: number }

const slots = ref<Array<Bug | null>>(Array.from({ length: GRID_SIZE }, () => null))
const squashed = ref(0)
const finished = ref<'win' | 'lose' | null>(null)

const startedAt = Date.now()
const now = ref(Date.now())
const remainingMs = computed(() => Math.max(0, TIME_LIMIT_MS - (now.value - startedAt)))
const mmss = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

let bugCounter = 0

const spawner = useIntervalFn(() => {
  if (finished.value) return
  const empty: number[] = []
  for (let i = 0; i < slots.value.length; i++) if (!slots.value[i]) empty.push(i)
  if (empty.length === 0) return
  const i = empty[Math.floor(Math.random() * empty.length)]!
  slots.value[i] = { id: ++bugCounter, expiresAt: Date.now() + BUG_LIFETIME_MS }
}, SPAWN_INTERVAL_MS)

const ticker = useIntervalFn(() => {
  now.value = Date.now()
  // expire bugs whose lifetime is up
  for (let i = 0; i < slots.value.length; i++) {
    const s = slots.value[i]
    if (s && s.expiresAt < now.value) slots.value[i] = null
  }
  // timeout → lose
  if (remainingMs.value === 0 && !finished.value) finishLose()
}, 80)

function finishWin() {
  if (finished.value) return
  finished.value = 'win'
  spawner.pause()
  // freeze the board
  for (let i = 0; i < slots.value.length; i++) slots.value[i] = null
  useTimeoutFn(() => emit('resolve', 1), WIN_DELAY_MS)
}

function finishLose() {
  if (finished.value) return
  finished.value = 'lose'
  spawner.pause()
  useTimeoutFn(() => emit('resolve', 0), LOSE_DELAY_MS)
}

function squash(i: number) {
  if (finished.value) return
  if (!slots.value[i]) return
  slots.value[i] = null
  squashed.value++
  if (squashed.value >= TARGET) finishWin()
}

onBeforeUnmount(() => {
  spawner.pause()
  ticker.pause()
})

const progressPct = computed(() => Math.min(100, (squashed.value / TARGET) * 100))
const timeLow = computed(() => remainingMs.value < 30_000)
</script>

<template>
  <div class="rounded-2xl border border-emerald-400/30 bg-white/5 p-6 sm:p-8 shadow-card glow-green">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-widest text-emerald-300">🐛 Whack-a-Bug · Error Log Edition</span>
      <span class="ticker-mono text-xs text-slate-400">First-mover bonus</span>
    </div>

    <h2 class="text-2xl font-bold mb-1">Squash the legacy bugs.</h2>
    <p class="text-slate-400 mb-5">
      Hit <span class="text-emerald-300 font-semibold">{{ TARGET }}</span> bugs before the timer runs out. Miss one and you wait for the next spawn.
    </p>

    <!-- HUD -->
    <div class="flex items-center justify-between gap-4 mb-4">
      <div class="flex-1">
        <div class="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 mb-1">
          <span>Squashed</span>
          <span class="ticker-mono text-emerald-300">{{ squashed }} / {{ TARGET }}</span>
        </div>
        <div class="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            class="h-full transition-all duration-200 bg-emerald-500"
            :style="{ width: `${progressPct}%` }"
          />
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

    <!-- Board -->
    <div
      class="grid gap-3 mx-auto select-none"
      :style="`grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 24rem`"
    >
      <button
        v-for="(slot, i) in slots"
        :key="i"
        type="button"
        :disabled="!!finished"
        class="relative aspect-square rounded-xl border border-white/10 bg-black/40 transition-colors hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-60"
        @click="squash(i)"
      >
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="scale-50 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-50 opacity-0"
        >
          <span
            v-if="slot"
            :key="slot.id"
            class="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl pointer-events-none"
            aria-label="bug"
          >
            🐛
          </span>
        </Transition>
      </button>
    </div>

    <!-- Result overlays -->
    <UAlert
      v-if="finished === 'win'"
      color="success"
      icon="i-lucide-party-popper"
      title="System Cleaned!"
      description="All legacy bugs squashed. Logging in your win…"
      class="mt-6"
    />
    <UAlert
      v-else-if="finished === 'lose'"
      color="error"
      icon="i-lucide-circle-x"
      title="Infestation!"
      description="Too many bugs escaped. No points this run."
      class="mt-6"
    />

    <div class="mt-6 flex items-center justify-between">
      <span class="ticker-mono text-xs text-slate-500">
        First solver gets the biggest bonus — payout decays as more people finish.
      </span>
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="!!finished"
        @click="finishLose"
      >
        Bail out
      </UButton>
    </div>
  </div>
</template>
