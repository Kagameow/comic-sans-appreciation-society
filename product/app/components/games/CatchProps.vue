<script setup lang="ts">
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

// ── tuning ─────────────────────────────────────────────────────────────────
const TARGET = 30                    // good catches to win
const TIME_LIMIT_MS = 5 * 60 * 1000
const SPAWN_INTERVAL_MS = 700
const TICK_MS = 50                   // ~20 fps for falling / basket
const BAD_CHANCE = 0.3
const ITEM_SPEED_PCT_PER_S = 32      // arena height % traveled per second
const BASKET_SPEED_PCT_PER_S = 90    // basket movement speed
const FREEZE_MS = 3000

const BASKET_W_PCT = 14
const BASKET_TOP_PCT = 88            // y where the basket sits
const ITEM_W_PCT = 6
const CATCH_BAND_BOTTOM_PCT = 96     // items above this y can still be caught
const WIN_DELAY_MS = 1300
const LOSE_DELAY_MS = 900

type ItemKind = 'good' | 'bad'
type Item = { id: number; kind: ItemKind; xPct: number; yPct: number }

const items = ref<Item[]>([])
const basketX = ref(50 - BASKET_W_PCT / 2)
const heldDir = ref<-1 | 0 | 1>(0)
const frozenUntil = ref(0)
const caught = ref(0)
const finished = ref<'win' | 'lose' | null>(null)

const startedAt = Date.now()
const now = ref(Date.now())
const remainingMs = computed(() => Math.max(0, TIME_LIMIT_MS - (now.value - startedAt)))
const mmss = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
})
const timeLow = computed(() => remainingMs.value < 30_000)
const isFrozen = computed(() => now.value < frozenUntil.value && !finished.value)
const freezeLeftMs = computed(() => Math.max(0, frozenUntil.value - now.value))
const progressPct = computed(() => Math.min(100, (caught.value / TARGET) * 100))

let itemId = 0
let lastTickMs = Date.now()

function finishWin() {
  if (finished.value) return
  finished.value = 'win'
  spawner.pause()
  anim.pause()
  timer.pause()
  useTimeoutFn(() => emit('resolve', 1), WIN_DELAY_MS)
}

function finishLose() {
  if (finished.value) return
  finished.value = 'lose'
  spawner.pause()
  anim.pause()
  timer.pause()
  useTimeoutFn(() => emit('resolve', 0), LOSE_DELAY_MS)
}

const spawner = useIntervalFn(() => {
  if (finished.value) return
  const kind: ItemKind = Math.random() < BAD_CHANCE ? 'bad' : 'good'
  items.value.push({
    id: ++itemId,
    kind,
    xPct: Math.random() * (100 - ITEM_W_PCT),
    yPct: -8,
  })
}, SPAWN_INTERVAL_MS)

function tickAnim() {
  if (finished.value) return
  const t = Date.now()
  const dt = (t - lastTickMs) / 1000
  lastTickMs = t

  // basket
  if (!isFrozen.value && heldDir.value !== 0) {
    const next = basketX.value + heldDir.value * BASKET_SPEED_PCT_PER_S * dt
    basketX.value = Math.max(0, Math.min(100 - BASKET_W_PCT, next))
  }

  // items
  const basketLeft = basketX.value
  const basketRight = basketX.value + BASKET_W_PCT
  const next: Item[] = []
  for (const it of items.value) {
    const newY = it.yPct + ITEM_SPEED_PCT_PER_S * dt
    if (newY >= BASKET_TOP_PCT && newY <= CATCH_BAND_BOTTOM_PCT) {
      const itLeft = it.xPct
      const itRight = it.xPct + ITEM_W_PCT
      if (itRight >= basketLeft && itLeft <= basketRight) {
        // caught
        if (it.kind === 'good') {
          caught.value++
          if (caught.value >= TARGET) {
            finishWin()
            return
          }
        } else {
          frozenUntil.value = Date.now() + FREEZE_MS
          heldDir.value = 0
        }
        continue
      }
    }
    if (newY > 110) continue
    next.push({ ...it, yPct: newY })
  }
  items.value = next
}

const anim = useIntervalFn(tickAnim, TICK_MS)
const timer = useIntervalFn(() => {
  now.value = Date.now()
  if (remainingMs.value === 0 && !finished.value) finishLose()
}, 100)

function onKey(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  const isLeft = k === 'arrowleft' || k === 'a'
  const isRight = k === 'arrowright' || k === 'd'
  if (!isLeft && !isRight) return
  e.preventDefault()
  if (e.type === 'keydown') {
    heldDir.value = isLeft ? -1 : 1
  } else {
    // keyup — only stop if releasing the active direction
    if ((isLeft && heldDir.value === -1) || (isRight && heldDir.value === 1)) heldDir.value = 0
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
  }
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keyup', onKey)
  }
  spawner.pause()
  anim.pause()
  timer.pause()
})

function bailOut() {
  if (finished.value) return
  useTimeoutFn(() => emit('resolve', 0), 400)
  finished.value = 'lose'
  spawner.pause()
  anim.pause()
  timer.pause()
}
</script>

<template>
  <div class="rounded-2xl border border-emerald-400/30 bg-white/5 p-6 sm:p-8 shadow-card glow-green">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-widest text-emerald-300">📦 Catch the Props · Data Drop Edition</span>
      <span class="ticker-mono text-xs text-slate-400">First-mover bonus</span>
    </div>

    <h2 class="text-2xl font-bold mb-1">Catch the migrating components.</h2>
    <p class="text-slate-400 mb-2">
      Catch <span class="text-emerald-300 font-semibold">{{ TARGET }}</span> green packets to migrate the system.
      Catch a red bug and your basket freezes for 3 seconds.
    </p>
    <p class="ticker-mono text-sm font-bold uppercase tracking-widest text-emerald-300 mb-5">
      ⌨ USE YOUR KEYBOARD — ARROW KEYS OR A / D TO MOVE THE BASKET
    </p>

    <!-- HUD -->
    <div class="flex items-center justify-between gap-4 mb-4">
      <div class="flex-1">
        <div class="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 mb-1">
          <span>Caught</span>
          <span class="ticker-mono text-emerald-300">{{ caught }} / {{ TARGET }}</span>
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
      class="relative overflow-hidden rounded-lg border border-white/10 bg-black/40 select-none"
      :class="isFrozen ? 'ring-2 ring-rose-400/50' : ''"
      style="aspect-ratio: 16 / 9"
    >
      <!-- falling items -->
      <div
        v-for="it in items"
        :key="it.id"
        class="absolute flex items-center justify-center rounded-md text-2xl sm:text-3xl shadow-lg"
        :class="it.kind === 'good'
          ? 'bg-emerald-500/30 border border-emerald-400/40'
          : 'bg-rose-500/30 border border-rose-400/40'"
        :style="{
          left: `${it.xPct}%`,
          top: `${it.yPct}%`,
          width: `${ITEM_W_PCT}%`,
          aspectRatio: '1 / 1',
        }"
      >
        {{ it.kind === 'good' ? '📦' : '🐛' }}
      </div>

      <!-- basket -->
      <div
        class="absolute rounded-full transition-colors flex items-center justify-center text-xs ticker-mono font-bold"
        :class="isFrozen ? 'bg-rose-400 text-black' : 'bg-emerald-400 text-emerald-950'"
        :style="{
          left: `${basketX}%`,
          top: `${BASKET_TOP_PCT + 1}%`,
          width: `${BASKET_W_PCT}%`,
          height: '5%',
        }"
      >
        <template v-if="isFrozen">❄ {{ Math.ceil(freezeLeftMs / 1000) }}s</template>
        <template v-else>▶ basket</template>
      </div>
    </div>

    <UAlert
      v-if="finished === 'win'"
      color="success"
      icon="i-lucide-party-popper"
      title="All Components Migrated!"
      description="Packets caught. Logging in your win…"
      class="mt-6"
    />
    <UAlert
      v-else-if="finished === 'lose'"
      color="error"
      icon="i-lucide-circle-x"
      title="Data Loss!"
      description="Too many components slipped through. No points this run."
      class="mt-6"
    />

    <div class="mt-6 flex items-center justify-between text-xs">
      <span class="ticker-mono text-slate-500">
        🐛 = freeze 3s · 📦 = +1
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
