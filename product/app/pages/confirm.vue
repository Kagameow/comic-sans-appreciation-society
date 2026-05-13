<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()

// As soon as the session lands (cookie set by @nuxtjs/supabase post-OAuth),
// follow the cookie back to the page the user originally tried to reach.
// Default to /admin since that's the only auth-gated destination right now.
watchEffect(() => {
  if (!user.value) return
  const dest = redirect.pluck() || '/admin'
  navigateTo(dest, { replace: true })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="h-10 w-10 text-emerald-300 mx-auto mb-3 animate-spin" />
      <p class="ticker-mono text-sm text-slate-400">Finalising session…</p>
    </div>
  </div>
</template>
