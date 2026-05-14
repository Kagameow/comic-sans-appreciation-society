<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

type LockoutState = ReturnType<typeof useCodeLockout>

const props = defineProps<{ lockout: LockoutState }>()
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

const game = useGame()
const inputEl = ref<HTMLInputElement | null>(null)

defineExpose({ focus: () => inputEl.value?.focus() })

const schema = v.object({
  code: v.pipe(v.string(), v.trim(), v.minLength(1, 'Enter a code')),
})

const codeForm = createFormObject({
  defaultValues: () => ({ code: '' }),
  schema,
  async submit(values): Promise<{ code: string }> {
    if (props.lockout.locked.value) return { code: '' }
    const code = (values.code as string).toUpperCase()
    emit('submit', code)
    return { code: '' }
  },
  resetOnSuccess: true,
})
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card relative overflow-hidden">
    <div v-if="lockout.locked.value" class="absolute inset-0 animate-shimmer pointer-events-none" />
    <UForm
      :state="codeForm"
      :schema="codeForm.$schema"
      class="flex flex-col sm:flex-row gap-3"
      @submit="codeForm.$submit()"
      @error="focusFirstError"
    >
      <UFormField name="code" class="flex-1 min-w-0">
        <input
          ref="inputEl"
          :value="codeForm.code"
          :disabled="lockout.locked.value"
          autofocus
          :placeholder="lockout.locked.value ? 'LOCKED' : 'V3-READY'"
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 sm:px-5 py-4 sm:py-5 text-xl sm:text-2xl ticker-mono tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 disabled:opacity-40 uppercase"
          @input="codeForm.code = ((($event.target as HTMLInputElement).value) || '').toUpperCase()"
        />
      </UFormField>
      <UButton
        type="submit"
        size="lg"
        block
        class="sm:!w-auto sm:!block-auto"
        color="primary"
        :disabled="lockout.locked.value || !codeForm.code"
        :loading="codeForm.$loading"
      >
        Submit
      </UButton>
    </UForm>

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
