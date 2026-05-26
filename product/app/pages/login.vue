<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const redirect = useSupabaseCookieRedirect()
const route = useRoute()

const denied = computed(() => route.query.denied === 'admin')
const loading = ref(false)
const error = ref<string | null>(null)

function navigateAfterAuth() {
  const dest = redirect.pluck() || '/'
  navigateTo(dest, { replace: true })
}

// Already authed (cookie session) — bounce out immediately.
watchEffect(() => {
  if (user.value) navigateAfterAuth()
})

async function signInWithVisma() {
  loading.value = true
  error.value = null
  // Supabase will redirect the browser to Visma Connect, which redirects back
  // to <SUPABASE_URL>/auth/v1/callback, which then redirects to /confirm with
  // the session cookie set. /confirm follows the redirect cookie from there.
  const { data, error: err } = await supabase.auth.signInWithOAuth({
    // Provider is typed as a literal union (no `custom:*` template) in
    // supabase-js 2.105 but the JSDoc + runtime explicitly support the
    // `custom:` prefix for custom OIDC providers.
    provider: 'custom:visma-connect' as 'keycloak',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
      scopes: 'openid email profile',
    },
  })
  if (err) {
    error.value = err.message
    loading.value = false
    return
  }
  // In the browser the call above usually navigates away on its own. If it
  // returns a URL instead (SSR shim, popup-blocked, etc.), follow it manually.
  if (data?.url) window.location.href = data.url
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-card">
      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs ticker-mono mb-4">
          <UIcon name="i-lucide-shield" class="h-3 w-3" /> architect.login
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Sign in</h1>
        <p class="text-slate-400 text-sm mt-2">
          Use your Visma account to continue.
        </p>
      </div>

      <div
        v-if="denied"
        class="mb-4 p-3 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 text-sm ticker-mono"
      >
        ⚠ Your account isn't on the admin allowlist.
      </div>

      <UButton
        block
        size="lg"
        color="primary"
        icon="i-lucide-log-in"
        :loading="loading"
        @click="signInWithVisma"
      >
        Sign in with Visma
      </UButton>

      <UAlert
        v-if="error"
        class="mt-4"
        color="error"
        icon="i-lucide-circle-x"
        :title="error"
      />

      <p class="mt-6 text-xs text-slate-500 text-center">
        Only emails listed in <code class="ticker-mono">ADMIN_EMAILS</code> can reach
        <NuxtLink to="/admin" class="text-emerald-300 hover:underline">/admin</NuxtLink>.
        Everyone else plays via
        <NuxtLink to="/" class="text-emerald-300 hover:underline">Code Check</NuxtLink>.
      </p>
    </div>
  </div>
</template>
