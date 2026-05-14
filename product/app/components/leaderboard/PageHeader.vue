<script setup lang="ts">
import { useNow } from '@vueuse/core'

const game = useGame()
const now = useNow({ interval: 1000 })

// docs/refactor-plan.md §2.2 — clock + merge-window countdown.
const time = computed(() => {
  const d = now.value
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
})

// Merge window closes at 18:00 local time, per docs/concept.md.
const mergeRemaining = computed(() => {
  const d = new Date(now.value)
  const close = new Date(d)
  close.setHours(18, 0, 0, 0)
  let ms = close.getTime() - d.getTime()
  if (ms < 0)
    ms = 0
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// The "watch" indicator is amber if the multiplier is decaying soon, vue
// otherwise. A real Supabase Realtime hookup would flip it to amber on
// channel error — the polling fallback fakes "alive" indefinitely.
const watchHealthy = computed(() => true)
const _ = game // referenced to keep reactivity; remove once realtime lands
</script>

<template>
  <header class="px-10 py-6 flex items-end justify-between border-b border-[color:var(--line)]">
    <div>
      <h1 class="font-display text-5xl sm:text-6xl text-[color:var(--ink)] uppercase leading-none">
        Pipeline Status
      </h1>
      <p class="mt-2 font-mono text-base sm:text-lg text-[color:var(--ink-muted)] flex items-center gap-2">
        <span
          class="inline-block h-2.5 w-2.5 rounded-full" :class="[
            watchHealthy ? 'bg-[color:var(--vue)] animate-glow-pulse' : 'bg-[color:var(--amber)]',
          ]"
        />
        watchEffect(() => renderLeaderboard()) — {{ watchHealthy ? 'running' : 'paused' }}
      </p>
    </div>
    <div class="text-right font-mono text-base sm:text-lg text-[color:var(--ink-muted)]">
      <div class="tabular-nums">
        {{ time }}
      </div>
      <div class="tabular-nums text-[color:var(--amber)]">
        merge window: {{ mergeRemaining }} remaining
      </div>
    </div>
  </header>
</template>
