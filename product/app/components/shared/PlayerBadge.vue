<script setup lang="ts">
const { user, isSignedIn, isAdmin, signOut } = useAuthSession()
const game = useGame()

const currentDisplay = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const dn = meta.display_name
  return typeof dn === 'string' ? dn : ''
})

const avatarUrl = computed(() => {
  const meta = (user.value?.user_metadata ?? {}) as Record<string, unknown>
  const url = meta.avatar_url
  return typeof url === 'string' && url ? url : null
})

const displayName = computed(() => {
  if (currentDisplay.value) return currentDisplay.value
  if (game.me?.name) return game.me.name
  return user.value?.email ?? ''
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
        v-if="avatarUrl"
        :src="avatarUrl"
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
      <div class="p-4 w-72 space-y-4">
        <div class="text-xs text-slate-400 ticker-mono truncate">{{ user?.email }}</div>
        <SharedAvatarUploader />
        <SharedDisplayNameForm />
        <div v-if="isAdmin" class="text-xs text-emerald-300 ticker-mono">⬡ Admin</div>
        <UButton block size="sm" color="error" variant="soft" icon="i-lucide-log-out" @click="signOut">
          Sign out
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
