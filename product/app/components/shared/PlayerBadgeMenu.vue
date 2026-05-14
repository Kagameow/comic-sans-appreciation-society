<script setup lang="ts">
/**
 * Signed-in popover for the header badge. Async setup — `updateForm` awaits
 * a findFirst() against currentUser (one supabase.auth.getUser() call) for
 * initial values, so this component is wrapped in <Suspense> by PlayerBadge.
 */
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const { user, isAdmin, signOut } = useAuthSession()
const supabase = useSupabaseClient()
const store = useStore()
const game = useGame()
const toast = useToast()

const currentAvatarUrl = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const url = meta.avatar_url
  return typeof url === 'string' && url ? url : null
})

const displayName = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const dn = meta.display_name
  if (typeof dn === 'string' && dn)
    return dn
  if (game.me?.name)
    return game.me.name
  return user.value?.email ?? ''
})

// Tier badge — docs/refactor-plan.md §4.
const tier = computed(() => {
  const me = game.me
  if (!me)
    return null
  if (me.gems >= 3)
    return 'Composition API contributor'
  if (me.victories >= 3)
    return 'Options API contributor'
  return null
})

const nameForm = await store.currentUser.updateForm({})
nameForm.$onSuccess(() => {
  toast.add({ title: '> commit recorded', color: 'success', icon: 'i-lucide-check' })
})

const avatarSchema = v.object({
  file: v.pipe(
    v.instance(File, 'Pick an image'),
    v.check(f => f.size <= 2_000_000, 'Max 2MB'),
    v.check(f => f.type.startsWith('image/'), 'Images only'),
  ),
})

const avatarForm = createFormObject({
  defaultValues: () => ({ file: undefined as File | undefined }),
  schema: avatarSchema,
  async submit(values): Promise<void> {
    if (!user.value || !values.file)
      throw new Error('Not signed in')
    const uid = user.value.id
    const ext = values.file.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `${uid}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, values.file, {
      contentType: values.file.type,
    })
    if (upErr)
      throw new Error(upErr.message)
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    await store.currentUser.update({ avatar_url: pub.publicUrl }, { key: uid })
  },
  resetOnSuccess: true,
})

avatarForm.$onSuccess(() => {
  toast.add({ title: '> contributor profile picture updated', color: 'success', icon: 'i-lucide-check' })
})

watch(() => avatarForm.file, (f) => {
  if (f instanceof File)
    avatarForm.$submit()
})
</script>

<template>
  <UPopover>
    <UButton
      variant="ghost"
      color="neutral"
      class="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1 border border-[color:var(--line)] hover:border-[color:var(--line-hot)] hover:bg-[color:var(--surface-deep)]"
    >
      <span
        v-if="game.me"
        class="font-mono text-xs sm:text-sm font-semibold text-[color:var(--vue)] whitespace-nowrap"
      >
        {{ game.me.points.toLocaleString() }}<span class="hidden sm:inline"> credits</span>
      </span>
      <img
        v-if="currentAvatarUrl"
        :src="currentAvatarUrl"
        :alt="displayName"
        class="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
      >
      <div
        v-else
        class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center text-base sm:text-lg"
      >
        {{ game.me?.avatar ?? '👤' }}
      </div>
      <span
        class="hidden md:inline text-xs font-mono truncate max-w-[160px]" :class="[
          isAdmin ? 'text-[color:var(--vue)]' : 'text-[color:var(--ink-body)]',
        ]"
      >
        {{ displayName }}
      </span>
    </UButton>
    <template #content>
      <div class="p-3 w-72 space-y-3">
        <div>
          <div class="font-mono text-xs text-[color:var(--ink-muted)] truncate">
            {{ user?.email }}
          </div>
          <div v-if="tier" class="font-mono text-[10px] text-[color:var(--vue)] uppercase tracking-[0.04em] mt-0.5">
            {{ tier }}
          </div>
        </div>

        <UForm
          :state="nameForm"
          :schema="nameForm.$schema"
          @submit="nameForm.$submit()"
          @error="focusFirstError"
        >
          <UFormField label="user.name" name="display_name">
            <div class="flex gap-2">
              <UInput
                v-model="nameForm.display_name"
                size="sm"
                class="flex-1"
                placeholder="contributor handle"
                :disabled="nameForm.$loading"
              />
              <UButton
                type="submit"
                size="sm"
                :loading="nameForm.$loading"
                :disabled="!nameForm.$hasChanges()"
              >
                commit
              </UButton>
            </div>
          </UFormField>
          <UAlert
            v-if="nameForm.$error"
            color="error"
            icon="i-lucide-circle-x"
            :title="nameForm.$error.message"
            class="mt-1"
          />
        </UForm>

        <UForm
          :state="avatarForm"
          :schema="avatarForm.$schema"
          @submit="avatarForm.$submit()"
        >
          <UFormField label="defineModel({ avatar })" name="file">
            <UFileUpload
              v-model="avatarForm.file"
              accept="image/*"
              :label="avatarForm.$loading ? 'Pushing…' : 'Drop or click to upload'"
              description="Max 2MB · PNG / JPG / WebP"
              class="w-full"
              :disabled="avatarForm.$loading"
            />
          </UFormField>
          <UAlert
            v-if="avatarForm.$error"
            color="error"
            icon="i-lucide-circle-x"
            :title="avatarForm.$error.message"
            class="mt-1"
          />
        </UForm>

        <div v-if="isAdmin" class="font-mono text-xs text-[color:var(--vue)] uppercase tracking-[0.04em]">
          ⬡ maintainer
        </div>
        <UButton block size="sm" color="error" variant="soft" icon="i-lucide-log-out" @click="signOut">
          git logout
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
