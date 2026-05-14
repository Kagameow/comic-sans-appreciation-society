<script setup lang="ts">
const props = defineProps<{
  question: string
  answers: string[]
  correctIdx: number
}>()
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

const TOTAL = 20
const RESOLVE_DELAY_MS = 1200
const elapsed = ref(0)
const picked = ref<number | null>(null)

useIntervalFn(() => {
  if (picked.value === null) elapsed.value += 0.1
}, 100)

const remaining = computed(() => Math.max(0, TOTAL - elapsed.value))
const pct = computed(() => (remaining.value / TOTAL) * 100)
const points = computed(() => remaining.value > 13 ? 100 : remaining.value > 6 ? 50 : 10)
const barColor = computed(() => remaining.value > 13 ? 'bg-emerald-500' : remaining.value > 6 ? 'bg-amber-300' : 'bg-rose-500')
const textColor = computed(() => remaining.value > 13 ? 'text-emerald-400' : remaining.value > 6 ? 'text-amber-300' : 'text-rose-400')

function pick(i: number) {
  picked.value = i
  const earned = i === props.correctIdx ? points.value : 0
  useTimeoutFn(() => emit('resolve', earned), RESOLVE_DELAY_MS)
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-card">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs uppercase tracking-widest text-slate-400">Trivia · Time Decay</span>
      <span :class="['ticker-mono font-bold text-2xl', textColor]">+{{ points }}</span>
    </div>
    <div class="h-2 rounded-full bg-white/5 overflow-hidden mb-6">
      <div :class="['h-full transition-all', barColor]" :style="{ width: `${pct}%` }" />
    </div>

    <h2 class="text-2xl font-semibold mb-6">{{ question }}</h2>

    <div class="grid sm:grid-cols-2 gap-3">
      <button
        v-for="(a, i) in answers"
        :key="i"
        :disabled="picked !== null"
        :class="[
          'text-left px-4 py-3 rounded-lg border transition-all',
          picked !== null && i === correctIdx
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
            : picked === i
              ? 'bg-rose-500/15 border-rose-400'
              : 'bg-white/5 border-white/10 hover:border-emerald-400/60 hover:bg-white/10',
        ]"
        @click="pick(i)"
      >
        <span class="ticker-mono text-xs text-slate-400 mr-2">{{ String.fromCharCode(65 + i) }}</span>
        {{ a }}
      </button>
    </div>
  </div>
</template>
