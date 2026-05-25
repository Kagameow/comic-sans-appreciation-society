<script setup lang="ts">
interface Question {
  question: string
  answers: string[]
  correctIdx: number
}

const props = defineProps<{
  questions: Question[]
}>()
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

const TOTAL = 20
const RESOLVE_DELAY_MS = 1200
const currentQuestionIndex = ref(0)
const elapsed = ref(0)
const picked = ref<number | null>(null)
const totalPoints = ref(0)

useIntervalFn(() => {
  if (picked.value === null) elapsed.value += 0.1
}, 100)

const currentQuestion = computed(() => props.questions[currentQuestionIndex.value])
const remaining = computed(() => Math.max(0, TOTAL - elapsed.value))
const pct = computed(() => (remaining.value / TOTAL) * 100)
const points = computed(() => remaining.value > 13 ? 100 : remaining.value > 6 ? 50 : 10)
const barColor = computed(() => remaining.value > 13 ? 'bg-emerald-500' : remaining.value > 6 ? 'bg-amber-300' : 'bg-rose-500')
const textColor = computed(() => remaining.value > 13 ? 'text-emerald-400' : remaining.value > 6 ? 'text-amber-300' : 'text-rose-400')

function pick(i: number) {
  picked.value = i
  const earned = i === currentQuestion.value.correctIdx ? points.value : 0
  totalPoints.value += earned

  useTimeoutFn(() => {
    if (currentQuestionIndex.value < props.questions.length - 1) {
      currentQuestionIndex.value++
      elapsed.value = 0
      picked.value = null
    } else {
      emit('resolve', totalPoints.value)
    }
  }, RESOLVE_DELAY_MS)
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-card">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs uppercase tracking-widest text-slate-400">Quiz · Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span>
      <span :class="['ticker-mono font-bold text-2xl', textColor]">+{{ points }}</span>
    </div>
    <div class="h-2 rounded-full bg-white/5 overflow-hidden mb-6">
      <div :class="['h-full transition-all', barColor]" :style="{ width: `${pct}%` }" />
    </div>

    <h2 class="text-2xl font-semibold mb-6">{{ currentQuestion.question }}</h2>

    <div class="grid sm:grid-cols-2 gap-3">
      <UButton
        v-for="(a, i) in currentQuestion.answers"
        :key="i"
        :disabled="picked !== null"
        :color="picked !== null && i === currentQuestion.correctIdx ? 'success' : picked === i ? 'error' : 'neutral'"
        variant="soft"
        block
        class="!justify-start text-left px-4 py-3 rounded-lg border h-auto transition-all"
        @click="pick(i)"
      >
        <span class="ticker-mono text-xs text-slate-400 mr-2">{{ String.fromCharCode(65 + i) }}</span>
        {{ a }}
      </UButton>
    </div>
  </div>
</template>
