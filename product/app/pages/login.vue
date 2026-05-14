<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const redirect = useSupabaseCookieRedirect()
const route = useRoute()
const store = useStore()

const denied = computed(() => route.query.denied === 'admin')

const loginForm = store.session.createForm({
  defaultValues: () => ({ email: '', password: '' }),
})

function navigateAfterAuth() {
  const dest = redirect.pluck() || '/'
  navigateTo(dest, { replace: true })
}

loginForm.$onSuccess(() => { navigateAfterAuth() })

// Already authed (cookie session) — bounce out immediately.
watchEffect(() => {
  if (user.value) navigateAfterAuth()
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

      <UForm
        :state="loginForm"
        :schema="loginForm.$schema"
        class="space-y-4"
        @submit="loginForm.$submit()"
        @error="focusFirstError"
      >
        <UFormField label="Email" name="email">
          <UInput
            v-model="loginForm.email"
            type="email"
            autocomplete="email"
            placeholder="you@visma.com"
            class="w-full"
            :disabled="loginForm.$loading"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full"
            :disabled="loginForm.$loading"
          />
        </UFormField>

        <UButton
          block
          size="lg"
          color="primary"
          icon="i-lucide-log-in"
          type="submit"
          :loading="loginForm.$loading"
        >
          Sign in
        </UButton>

        <UAlert
          v-if="loginForm.$error"
          color="error"
          icon="i-lucide-circle-x"
          :title="loginForm.$error.message"
        />
      </UForm>

      <p class="mt-6 text-xs text-slate-500 text-center">
        Only emails listed in <code class="ticker-mono">ADMIN_EMAILS</code> can reach
        <NuxtLink to="/admin" class="text-emerald-300 hover:underline">/admin</NuxtLink>.
        Everyone else plays via
        <NuxtLink to="/" class="text-emerald-300 hover:underline">Code Check</NuxtLink>.
      </p>
    </div>
  </div>
</template>
