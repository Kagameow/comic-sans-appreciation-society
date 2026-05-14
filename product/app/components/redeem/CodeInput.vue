<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

type LockoutState = ReturnType<typeof useCodeLockout>

const props = defineProps<{ lockout: LockoutState }>()
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

const game = useGame()

const schema = v.object({
  code: v.pipe(v.string(), v.trim(), v.minLength(1, 'Enter a deploy key')),
})

const codeForm = createFormObject({
  defaultValues: () => ({ code: '' }),
  schema,
  async submit(values): Promise<{ code: string }> {
    if (props.lockout.locked.value)
      return { code: '' }
    // Forgiving entry per docs/refactor-plan.md §1.2 — strip whitespace,
    // uppercase for display + submit. The user can type "  vuegem 3  ".
    const code = String(values.code).replace(/\s+/g, '').toUpperCase()
    emit('submit', code)
    return { code: '' }
  },
  resetOnSuccess: true,
})

const inputEl = ref<HTMLInputElement | null>(null)
const flickering = ref(false)

// When the lockout flips on (3 fails) flicker the prompt once.
watch(() => props.lockout.fails.value, (n, prev) => {
  if (n > (prev ?? 0)) {
    flickering.value = true
    useTimeoutFn(() => {
      flickering.value = false
    }, 450)
  }
})
</script>

<template>
  <div class="w-full max-w-[720px] mx-auto">
    <UForm
      :state="codeForm"
      :schema="codeForm.$schema"
      @submit="codeForm.$submit()"
      @error="focusFirstError"
    >
      <UFormField name="code">
        <label
          class="flex items-center gap-2 px-5 h-14 border bg-[color:var(--surface-deep)] transition-colors" :class="[
            lockout.locked.value
              ? 'border-[color:var(--line-danger)] glow-red'
              : 'border-[color:var(--line)] focus-within:border-[color:var(--line-hot)] focus-within:shadow-[0_0_18px_var(--vue-glow)]',
            flickering ? 'animate-flicker' : '',
          ]"
        >
          <span class="text-[color:var(--vue)] font-display text-2xl whitespace-nowrap">
            &gt; git commit -m "
          </span>
          <input
            ref="inputEl"
            v-model="codeForm.code"
            autofocus
            autocomplete="off"
            spellcheck="false"
            :disabled="lockout.locked.value"
            :placeholder="lockout.locked.value ? `LOCKED · ${lockout.lockRemain.value}s` : ''"
            class="flex-1 min-w-0 bg-transparent outline-none border-0 text-[color:var(--ink)] font-display text-2xl tracking-wide caret-[color:var(--vue)] placeholder:text-[color:var(--ink-muted)] disabled:opacity-60"
            @keydown.enter.prevent="codeForm.$submit()"
          >
          <span class="text-[color:var(--vue)] font-display text-2xl">"</span>
        </label>
      </UFormField>
    </UForm>

    <div class="mt-3 flex items-center justify-between font-mono text-xs">
      <div class="text-[color:var(--ink-muted)]">
        <span v-if="!lockout.locked.value && lockout.fails.value > 0" class="text-[color:var(--red)]">
          ✕ Build failed · {{ lockout.maxFails - lockout.fails.value }}
          {{ lockout.maxFails - lockout.fails.value === 1 ? 'retry' : 'retries' }} left
        </span>
        <span v-else-if="lockout.locked.value" class="flex items-center gap-2 text-[color:var(--red)] font-semibold">
          <UIcon name="i-lucide-lock" class="h-3.5 w-3.5" /> CI cooldown · {{ lockout.lockRemain.value }}s
        </span>
        <span v-else class="opacity-70">
          Try: V3-READY · REACTIVE · SETUP · CHALLENGE · DART-WIN
        </span>
      </div>
      <span v-if="game.isMultiplierActive" class="text-[color:var(--amber)] font-semibold animate-glow-pulse-amber px-2 py-0.5 border border-[color:var(--amber)]">
        ⚡ HMR × {{ game.activeMultiplier }}
      </span>
    </div>
  </div>
</template>
