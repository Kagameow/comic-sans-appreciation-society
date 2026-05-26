<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

const game = useGame()
const ACTIVITIES = ['Darts', 'Foosball', 'Pool', 'a Pull-Up Contest', 'Rock Paper Scissors']

const target = computed(() => {
  const others = game.players.filter(p => p.id !== game.me?.id).map(p => p.name)
  if (!others.length) return 'a colleague'
  return others[Math.floor(Math.random() * others.length)]
})
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
    class="rounded-2xl border border-emerald-400/30 bg-white/5 p-8 glow-green"
    @submit="confirmForm.$submit()"
    @error="focusFirstError"
  >
    <div class="text-xs uppercase tracking-widest text-emerald-300 mb-3">⚔ IRL Challenge</div>
    <h2 class="text-3xl font-bold leading-tight mb-2">
      Find <span class="text-emerald-300">{{ target }}</span>
    </h2>
    <p class="text-xl text-slate-400 mb-8">…and beat them at {{ activity }}!</p>

    <UFormField label="Referee Confirmation Code" name="code" class="mt-2">
      <div class="flex gap-2">
        <UInput
          :model-value="confirmForm.code"
          placeholder="ADMIN-XXXX"
          size="lg"
          class="flex-1"
          :ui="{ base: 'ticker-mono uppercase' }"
          @update:model-value="confirmForm.code = String(($event ?? '')).toUpperCase()"
        />
        <UButton
          type="submit"
          size="lg"
          color="primary"
          :loading="confirmForm.$loading"
          :disabled="!confirmForm.code || confirmForm.code.length < 4"
        >
          Confirm Win
        </UButton>
      </div>
    </UFormField>
    <UAlert
      v-if="confirmForm.$error"
      color="error"
      icon="i-lucide-circle-x"
      :title="confirmForm.$error.message"
      class="mt-2"
    />
    <p class="text-xs text-slate-500 mt-3">
      POC: any 4+ char code resolves the win. The real version checks against
      a referee-issued single-use code.
    </p>
  </UForm>
</template>
