<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()

const denied = computed(() => route.query.denied === 'admin')
const loading = ref(false)
const error = ref<string | null>(null)

async function signInWithGoogle() {
  loading.value = true
  error.value = null
  const redirectTo = `${window.location.origin}/confirm`
  const { error: err } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (err) {
    error.value = err.message
    loading.value = false
  }
}

// If somehow we land here already authed (e.g. back button), bounce to home.
watchEffect(() => {
  if (user.value) navigateTo('/')
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
          Required to access the admin dashboard.
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
        :loading="loading"
        icon="i-lucide-log-in"
        @click="signInWithGoogle"
      >
        Continue with Google
      </UButton>

      <div v-if="error" class="mt-4 text-sm text-rose-400 ticker-mono text-center">
        {{ error }}
      </div>

      <p class="mt-6 text-xs text-slate-500 text-center">
        Only emails listed in <code class="ticker-mono">ADMIN_EMAILS</code> can reach
        <NuxtLink to="/" class="text-emerald-300 hover:underline">/admin</NuxtLink>.
        Everyone else can play anonymously at
        <NuxtLink to="/" class="text-emerald-300 hover:underline">Code Check</NuxtLink>.
      </p>
    </div>
  </div>
</template>
