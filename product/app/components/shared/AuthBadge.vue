<script setup lang="ts">
const { user, isSignedIn, isAdmin, signOut } = useAuthSession()
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink
      v-if="!isSignedIn"
      to="/login"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ticker-mono text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
    >
      <UIcon name="i-lucide-log-in" class="h-3.5 w-3.5" /> Sign in
    </NuxtLink>

    <UPopover v-else>
      <button
        class="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs ticker-mono border border-white/10 hover:bg-white/5"
        :class="isAdmin ? 'text-emerald-300' : 'text-slate-300'"
      >
        <UIcon :name="isAdmin ? 'i-lucide-shield-check' : 'i-lucide-user'" class="h-3.5 w-3.5" />
        <span class="hidden sm:inline truncate max-w-[160px]">{{ user!.email }}</span>
      </button>
      <template #panel>
        <div class="p-3 w-56 space-y-2">
          <div class="text-xs text-slate-400 ticker-mono truncate">{{ user!.email }}</div>
          <div v-if="isAdmin" class="text-xs text-emerald-300 ticker-mono">⬡ Admin</div>
          <UButton block size="sm" color="red" variant="soft" icon="i-lucide-log-out" @click="signOut">
            Sign out
          </UButton>
        </div>
      </template>
    </UPopover>
  </div>
</template>
