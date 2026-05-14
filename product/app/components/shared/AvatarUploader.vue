<script setup lang="ts">
import * as v from 'valibot'
import { createFormObject } from '@rstore/vue'

const { user } = useAuthSession()
const supabase = useSupabaseClient()
const store = useStore()
const toast = useToast()

const persistedAvatarUrl = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const url = meta.avatar_url
  return typeof url === 'string' && url ? url : null
})

const displayName = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const dn = meta.display_name
  return typeof dn === 'string' && dn ? dn : (user.value?.email ?? 'You')
})

const fileInput = ref<HTMLInputElement | null>(null)
const optimisticPreview = ref<string | null>(null)
const shake = ref(false)
const inlineError = ref<string | null>(null)

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
    return { file: null }
  },
  resetOnSuccess: true,
})

const liveAvatarUrl = computed(() => optimisticPreview.value ?? persistedAvatarUrl.value)

function clearPreview() {
  if (optimisticPreview.value) URL.revokeObjectURL(optimisticPreview.value)
  optimisticPreview.value = null
}

function flashError(message: string) {
  inlineError.value = message
  shake.value = true
  setTimeout(() => { shake.value = false }, 500)
  toast.add({
    title: 'Avatar upload failed',
    description: message,
    color: 'error',
    icon: 'i-lucide-circle-x',
  })
}

function triggerPick() {
  if (avatarForm.$loading) return
  inlineError.value = null
  fileInput.value?.click()
}

async function onFilePicked(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  clearPreview()
  optimisticPreview.value = URL.createObjectURL(file)
  avatarForm.file = file

  try {
    await avatarForm.$submit()
    if (avatarForm.$error) {
      clearPreview()
      flashError(avatarForm.$error.message)
    }
  } catch {
    clearPreview()
    flashError('Something went wrong')
  }
}

avatarForm.$onSuccess(() => {
  clearPreview()
  inlineError.value = null
  toast.add({ title: 'Avatar updated', color: 'success', icon: 'i-lucide-check' })
})

onBeforeUnmount(clearPreview)
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      :class="[
        'relative h-16 w-16 rounded-full overflow-hidden border-2 transition group shrink-0',
        avatarForm.$loading
          ? 'border-emerald-400/60 cursor-wait'
          : 'border-white/10 hover:border-emerald-400/60 cursor-pointer',
        shake ? 'animate-shake-x border-rose-500/70' : '',
      ]"
      :disabled="avatarForm.$loading"
      :aria-label="liveAvatarUrl ? 'Change avatar' : 'Upload avatar'"
      @click="triggerPick"
    >
      <img
        v-if="liveAvatarUrl"
        :src="liveAvatarUrl"
        :alt="displayName"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="h-full w-full bg-white/10 flex items-center justify-center text-3xl"
      >
        👤
      </div>
      <div
        v-if="avatarForm.$loading"
        class="absolute inset-0 bg-black/45 flex items-center justify-center"
      >
        <UIcon name="i-lucide-loader-circle" class="h-6 w-6 text-white animate-spin" />
      </div>
      <div
        v-else
        class="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
      >
        <UIcon name="i-lucide-camera" class="h-5 w-5 text-white" />
      </div>
    </button>
    <div class="flex-1 min-w-0">
      <div class="text-xs text-slate-300 ticker-mono">
        {{ avatarForm.$loading ? 'Uploading…' : 'Click to change' }}
      </div>
      <div class="text-[11px] text-slate-500 mt-0.5 leading-tight">
        Max 2MB · PNG / JPG / WebP
      </div>
      <p
        v-if="inlineError"
        class="mt-1 text-[11px] text-rose-400 ticker-mono leading-tight"
      >
        {{ inlineError }}
      </p>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFilePicked"
    >
  </div>
</template>
