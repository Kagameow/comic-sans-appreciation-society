<script setup lang="ts">
/**
 * Anonymous-vs-signed-in gate for the header badge. The signed-in popover
 * lives in PlayerBadgeMenu and uses async setup (rstore updateForm awaits a
 * findFirst), so it's mounted inside a local <Suspense> to scope the auth
 * fetch — without this, the layout would suspend the whole page on cold
 * load.
 */
const { isSignedIn } = useAuthSession()
</script>

<template>
  <NuxtLink
    v-if="!isSignedIn"
    to="/login"
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ticker-mono text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
  >
    <UIcon name="i-lucide-log-in" class="h-3.5 w-3.5" /> Sign in
  </NuxtLink>

  <Suspense v-else>
    <SharedPlayerBadgeMenu />
    <template #fallback>
      <div
        aria-hidden="true"
        class="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1 rounded-md border border-white/10 opacity-60"
      >
        <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/10" />
      </div>
    </template>
  </Suspense>
</template>
