<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const redirect = useSupabaseCookieRedirect()
const route = useRoute()

const denied = computed(() => route.query.denied === 'admin')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function signIn() {
  if (loading.value) return
  loading.value = true
  error.value = null
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  if (err) {
    error.value = err.message
    loading.value = false
  }
  // On success, the watchEffect below handles navigation once the session lands.
}

watchEffect(() => {
  if (!user.value) return
  const dest = redirect.pluck() || '/'
  navigateTo(dest, { replace: true })
})
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
          Use the email and password your admin gave you.
        </p>
      </div>

      <div
        v-if="denied"
        class="mb-4 p-3 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 text-sm ticker-mono"
      >
        ⚠ Your account isn't on the admin allowlist.
      </div>

      <form class="space-y-4" @submit.prevent="signIn">
        <UFormField label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@visma.com"
            required
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </UFormField>

        <UButton
          block
          size="lg"
          color="primary"
          icon="i-lucide-log-in"
          type="submit"
          :loading="loading"
        >
          Sign in
        </UButton>
      </form>

      <div v-if="error" class="mt-4 text-sm text-rose-400 ticker-mono text-center">
        {{ error }}
      </div>

      <p class="mt-6 text-xs text-slate-500 text-center">
        Only emails listed in <code class="ticker-mono">ADMIN_EMAILS</code> can reach
        <NuxtLink to="/admin" class="text-emerald-300 hover:underline">/admin</NuxtLink>.
        Everyone else plays via
        <NuxtLink to="/" class="text-emerald-300 hover:underline">Code Check</NuxtLink>.
      </p>
    </div>
  </div>
</template>
