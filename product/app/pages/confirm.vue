<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()

watchEffect(() => {
  if (!user.value)
    return
  const dest = redirect.pluck() || '/admin'
  navigateTo(dest, { replace: true })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[color:var(--bg)]">
    <div class="text-center font-mono">
      <UIcon name="i-lucide-loader-2" class="h-10 w-10 text-[color:var(--vue)] mx-auto mb-3 animate-spin" />
      <p class="text-sm text-[color:var(--ink-muted)]">
        Resolving async dependency…
      </p>
    </div>
  </div>
</template>
