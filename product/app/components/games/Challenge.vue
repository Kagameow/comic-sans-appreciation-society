<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

// docs/refactor-plan.md §5 — RFC #103. The "I beat them, referee here"
// flow becomes "Run integration test on the office floor. Referee signs
// off in this terminal."
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

const TARGETS = ['Marieke de Vries', 'Joris van Dijk', 'Sanne Bakker', 'Bram Janssen']
const ACTIVITIES = ['Darts', 'Foosball', 'Pool', 'Pull-Up Contest', 'Rock Paper Scissors']

const target = ref(TARGETS[Math.floor(Math.random() * TARGETS.length)])
const activity = ref(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)])

const schema = v.object({
  code: v.pipe(v.string(), v.trim(), v.minLength(4, 'At least 4 characters')),
})

const confirmForm = createFormObject({
  defaultValues: () => ({ code: '' }),
  schema,
  async submit(): Promise<{ code: string }> {
    emit('resolve', 150)
    return { code: '' }
  },
  resetOnSuccess: true,
})
</script>

<template>
  <UForm
    :state="confirmForm"
    :schema="confirmForm.$schema"
    class="bg-[color:var(--surface)] border border-[color:var(--amber)] glow-amber p-6 sm:p-8"
    @submit="confirmForm.$submit()"
    @error="focusFirstError"
  >
    <header class="font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--amber)] mb-3">
      RFC #103 · IRL integration test
    </header>
    <h2 class="font-display text-3xl sm:text-4xl text-[color:var(--ink)] mb-2 leading-tight">
      Find <span class="text-[color:var(--vue)]">{{ target }}</span>
    </h2>
    <p class="font-mono text-base sm:text-lg text-[color:var(--ink-body)] mb-6">
      …and beat them at <span class="text-[color:var(--amber)]">{{ activity }}</span>.
    </p>
    <p class="font-mono text-xs text-[color:var(--ink-muted)] mb-4">
      &gt; referee signs off in this terminal. paste the confirmation code.
    </p>

    <UFormField label="Referee confirmation code" name="code">
      <div class="flex gap-2">
        <UInput
          :model-value="confirmForm.code"
          placeholder="ADMIN-XXXX"
          size="lg"
          class="flex-1"
          :ui="{ base: 'font-display uppercase' }"
          @update:model-value="confirmForm.code = String($event ?? '').toUpperCase()"
        />
        <UButton
          type="submit"
          size="lg"
          color="primary"
          class="font-mono"
          :loading="confirmForm.$loading"
          :disabled="!confirmForm.code || confirmForm.code.length < 4"
        >
          Approve RFC →
        </UButton>
      </div>
    </UFormField>

    <UButton
      variant="outline"
      color="error"
      size="sm"
      class="font-mono mt-3"
      @click="emit('resolve', 0)"
    >
      Request changes (cancel)
    </UButton>

    <UAlert
      v-if="confirmForm.$error"
      color="error"
      icon="i-lucide-circle-x"
      :title="confirmForm.$error.message"
      class="mt-3"
    />
  </UForm>
</template>
