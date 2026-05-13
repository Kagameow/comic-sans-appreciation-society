<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const { user } = useAuthSession()
const store = useStore()
const toast = useToast()

const currentDisplay = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const dn = meta.display_name
  return typeof dn === 'string' ? dn : ''
})

const nameSchema = v.object({
  display_name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, 'At least 2 characters'),
    v.maxLength(40, 'Max 40 characters'),
  ),
})

const nameForm = createFormObject({
  defaultValues: () => ({ display_name: currentDisplay.value }),
  schema: nameSchema,
  async submit(values): Promise<{ display_name: string }> {
    if (!user.value) throw new Error('Not signed in')
    const display_name = values.display_name as string
    await store.currentUser.update({ display_name }, { key: user.value.id })
    return { display_name }
  },
  resetOnSuccess: false,
})

nameForm.$onSuccess(() => {
  toast.add({ title: 'Display name saved', color: 'success', icon: 'i-lucide-check' })
})
</script>

<template>
  <form @submit.prevent="nameForm()">
    <UFormField label="Display name">
      <div class="flex gap-2">
        <UInput
          v-model="nameForm.display_name"
          size="sm"
          class="flex-1"
          placeholder="Your name"
          :disabled="nameForm.$loading"
        />
        <UButton
          type="submit"
          size="sm"
          :loading="nameForm.$loading"
          :disabled="!nameForm.$hasChanges()"
        >
          Save
        </UButton>
      </div>
    </UFormField>
    <p v-if="nameForm.$error" class="mt-1 text-xs text-rose-400 ticker-mono">
      {{ nameForm.$error.message }}
    </p>
  </form>
</template>
