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
  if (typeof dn === 'string' && dn) return dn
  if (game.me?.name) return game.me.name
  return user.value?.email ?? ''
})

// CRUD update on currentUser → rstore's collection-bound updateForm.
// Schema lives on the collection as formSchema.update; defaults come from
// findFirst() via the supabase-auth plugin's fetchFirst hook.
const nameForm = await store.currentUser.updateForm({})
nameForm.$onSuccess(() => {
  toast.add({ title: 'Display name saved', color: 'success', icon: 'i-lucide-check' })
})

// Avatar is a custom action (Storage upload → publicUrl → currentUser.update),
// so createFormObject is correct here.
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
    if (!user.value || !values.file) throw new Error('Not signed in')
    const uid = user.value.id
    const ext = values.file.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `${uid}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, values.file, {
      contentType: values.file.type,
    })
    if (upErr) throw new Error(upErr.message)
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    await store.currentUser.update({ avatar_url: pub.publicUrl }, { key: uid })
  },
  resetOnSuccess: true,
})

avatarForm.$onSuccess(() => {
  toast.add({ title: 'Avatar updated', color: 'success', icon: 'i-lucide-check' })
})

watch(() => avatarForm.file, (f) => {
  if (f instanceof File) avatarForm.$submit()
})
</script>

<template>
  <ClientOnly>
    <UPopover>
      <UButton
        variant="ghost"
        color="neutral"
        class="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/5"
      >
        <span
          v-if="game.me"
          class="ticker-mono text-xs sm:text-sm font-semibold text-emerald-300 whitespace-nowrap"
        >
          {{ game.me.points.toLocaleString() }}<span class="hidden sm:inline"> pts</span>
        </span>
        <img
          v-if="currentAvatarUrl"
          :src="currentAvatarUrl"
          :alt="displayName"
          class="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
        />
        <div
          v-else
          class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center text-base sm:text-lg"
        >
          {{ game.me?.avatar ?? '👤' }}
        </div>
        <span
          :class="[
            'hidden md:inline text-xs ticker-mono truncate max-w-[160px]',
            isAdmin ? 'text-emerald-300' : 'text-slate-300',
          ]"
        >
          {{ displayName }}
        </span>
      </UButton>
      <template #content>
        <div class="p-3 w-72 space-y-3">
          <div class="text-xs text-slate-400 ticker-mono truncate">{{ user?.email }}</div>

          <UForm
            :state="nameForm"
            :schema="nameForm.$schema"
            @submit="nameForm.$submit()"
            @error="focusFirstError"
          >
            <UFormField label="Display name" name="display_name">
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
            <UFormField label="Avatar" name="file">
              <UFileUpload
                v-model="avatarForm.file"
                accept="image/*"
                :label="avatarForm.$loading ? 'Uploading…' : 'Drop or click to upload'"
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

          <div v-if="isAdmin" class="text-xs text-emerald-300 ticker-mono">⬡ Admin</div>
          <UButton block size="sm" color="error" variant="soft" icon="i-lucide-log-out" @click="signOut">
            Sign out
          </UButton>
        </div>
      </template>
    </UPopover>
  </ClientOnly>
</template>
