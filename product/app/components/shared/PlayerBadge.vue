<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const { user, isSignedIn, isAdmin, signOut } = useAuthSession()
const supabase = useSupabaseClient()
const store = useStore()
const game = useGameStore()
const toast = useToast()

const currentDisplay = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const dn = meta.display_name
  return typeof dn === 'string' ? dn : ''
})

const currentAvatarUrl = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const url = meta.avatar_url
  return typeof url === 'string' && url ? url : null
})

const displayName = computed(() => {
  if (currentDisplay.value) return currentDisplay.value
  if (game.me?.name) return game.me.name
  return user.value?.email ?? ''
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

const avatarSchema = v.object({
  file: v.pipe(
    v.instance(File, 'Pick an image'),
    v.check(f => f.size <= 2_000_000, 'Max 2MB'),
    v.check(f => f.type.startsWith('image/'), 'Images only'),
  ),
})

const avatarForm = createFormObject({
  defaultValues: () => ({ file: null as File | null }),
  schema: avatarSchema,
  async submit(values): Promise<{ file: File | null }> {
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
    return { file: values.file }
  },
  resetOnSuccess: true,
})

avatarForm.$onSuccess(() => {
  toast.add({ title: 'Avatar updated', color: 'success', icon: 'i-lucide-check' })
})

watch(() => avatarForm.file, (f) => {
  if (f instanceof File) avatarForm()
})
</script>

<template>
  <NuxtLink
    v-if="!isSignedIn"
    to="/login"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ticker-mono text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
  >
    <UIcon name="i-lucide-log-in" class="h-3.5 w-3.5" /> Sign in
  </NuxtLink>

  <UPopover v-else>
    <button
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
    </button>
    <template #content>
      <div class="p-3 w-72 space-y-3">
        <div class="text-xs text-slate-400 ticker-mono truncate">{{ user?.email }}</div>

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

        <div>
          <UFormField label="Avatar">
            <UFileUpload
              v-model="avatarForm.file"
              accept="image/*"
              :label="avatarForm.$loading ? 'Uploading…' : 'Drop or click to upload'"
              description="Max 2MB · PNG / JPG / WebP"
              class="w-full"
              :disabled="avatarForm.$loading"
            />
          </UFormField>
          <p v-if="avatarForm.$error" class="mt-1 text-xs text-rose-400 ticker-mono">
            {{ avatarForm.$error.message }}
          </p>
        </div>

        <div v-if="isAdmin" class="text-xs text-emerald-300 ticker-mono">⬡ Admin</div>
        <UButton block size="sm" color="error" variant="soft" icon="i-lucide-log-out" @click="signOut">
          Sign out
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
