<script setup lang="ts">
// docs/refactor-plan.md §5 — trivia reframed as an RFC the contributor
// reviews. "Approve RFC →" picks the answer; time-decay still applies.
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
  if (picked.value === null)
    elapsed.value += 0.1
}, 100)

const remaining = computed(() => Math.max(0, TOTAL - elapsed.value))
const pct = computed(() => (remaining.value / TOTAL) * 100)
const points = computed(() => remaining.value > 13 ? 100 : remaining.value > 6 ? 50 : 10)
const barColor = computed(() => remaining.value > 13 ? 'bg-[color:var(--vue)]' : remaining.value > 6 ? 'bg-[color:var(--amber)]' : 'bg-[color:var(--red)]')

const rfcNumber = useState('rfc-trivia', () => Math.floor(Math.random() * 900 + 100))

function pick(i: number) {
  picked.value = i
  const earned = i === props.correctIdx ? points.value : 0
  useTimeoutFn(() => emit('resolve', earned), RESOLVE_DELAY_MS)
}
</script>

<template>
  <div class="bg-[color:var(--surface)] border border-[color:var(--line)] p-6 sm:p-8">
    <header class="flex items-center justify-between mb-2">
      <div class="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--vue)]">
        RFC #{{ rfcNumber }} · trivia review
      </div>
      <div class="font-mono text-xs text-[color:var(--amber)] tabular-nums">
        merging in 00:{{ Math.ceil(remaining).toString().padStart(2, '0') }} · +{{ points }} credits
      </div>
    </header>

    <div class="h-1.5 bg-[color:var(--surface-deep)] overflow-hidden mb-6">
      <div class="h-full transition-all" :class="[barColor]" :style="{ width: `${pct}%` }" />
    </div>

    <h2 class="font-display text-2xl sm:text-3xl text-[color:var(--ink)] mb-6 leading-tight">
      {{ question }}
    </h2>

    <div class="grid sm:grid-cols-2 gap-2 mb-4">
      <UButton
        v-for="(a, i) in answers"
        :key="i"
        :disabled="picked !== null"
        :color="picked !== null && i === correctIdx ? 'success' : picked === i ? 'error' : 'neutral'"
        variant="outline"
        block
        class="!justify-start text-left px-4 py-3 h-auto font-mono"
        @click="pick(i)"
      >
        <span class="text-[color:var(--ink-muted)] mr-2">{{ String.fromCharCode(65 + i) }}.</span>
        {{ a }}
      </UButton>
    </div>

    <div class="flex gap-2">
      <UButton size="sm" color="primary" :disabled="picked !== null" class="font-mono">
        Approve RFC →
      </UButton>
      <UButton size="sm" variant="outline" color="error" :disabled="picked !== null" class="font-mono" @click="emit('resolve', 0)">
        Request changes
      </UButton>
    </div>
  </div>
</template>
