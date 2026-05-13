<script setup lang="ts">
type LockoutState = ReturnType<typeof useCodeLockout>

const props = defineProps<{ lockout: LockoutState }>()
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

const game = useGameStore()
const code = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

defineExpose({ focus: () => inputEl.value?.focus() })

async function submit() {
  if (!code.value || props.lockout.locked.value) return
  const value = code.value
  code.value = ''
  emit('submit', value)
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card relative overflow-hidden">
    <div v-if="lockout.locked.value" class="absolute inset-0 animate-shimmer pointer-events-none" />
    <div class="flex gap-3">
      <input
        ref="inputEl"
        v-model="code"
        :disabled="lockout.locked.value"
        autofocus
        :placeholder="lockout.locked.value ? 'LOCKED' : 'V3-READY'"
        class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-5 py-5 text-2xl ticker-mono tracking-wider focus:outline-none focus:border-emerald-400 disabled:opacity-40 uppercase"
        @input="code = code.toUpperCase()"
        @keydown.enter="submit"
      />
      <UButton
        size="xl"
        color="primary"
        :disabled="lockout.locked.value || !code"
        @click="submit"
      >
        Submit
      </UButton>
    </div>

    <div class="mt-4 flex items-center justify-between text-sm">
      <div class="text-slate-400">
        <span v-if="!lockout.locked.value && lockout.fails.value > 0" class="text-rose-400">
          ✕ Invalid code · {{ lockout.maxFails - lockout.fails.value }}
          {{ lockout.maxFails - lockout.fails.value === 1 ? 'try' : 'tries' }} left
        </span>
        <span v-else-if="lockout.locked.value" class="flex items-center gap-2 text-rose-400 font-semibold ticker-mono">
          <UIcon name="i-lucide-lock" class="h-4 w-4" /> LOCKED: {{ lockout.lockRemain.value }}s
        </span>
        <span v-else class="opacity-60">Try: V3-READY · REACTIVE · SETUP · CHALLENGE · DART-WIN</span>
      </div>
      <span v-if="game.isMultiplierActive" class="ticker-mono text-emerald-300 font-bold">
        ⚡ {{ game.activeMultiplier }}x ACTIVE
      </span>
    </div>
  </div>
</template>
