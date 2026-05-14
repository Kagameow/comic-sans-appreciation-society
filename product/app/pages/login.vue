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

loginForm.$onSuccess(() => {
  navigateAfterAuth()
})

watchEffect(() => {
  if (user.value)
    navigateAfterAuth()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-[color:var(--bg)]">
    <div class="w-full max-w-md bg-[color:var(--surface)] border border-[color:var(--line)] p-8 space-y-6">
      <header class="space-y-2">
        <div class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--vue)] border border-[color:var(--line)] px-2 py-0.5">
          <UIcon name="i-lucide-shield" class="h-3 w-3" /> git auth login
        </div>
        <h1 class="font-display text-3xl text-[color:var(--ink)] uppercase tracking-[0.04em]">
          authenticate
        </h1>
        <p class="font-mono text-xs text-[color:var(--ink-muted)]">
          email + password your maintainer issued.
        </p>
      </header>

      <UAlert
        v-if="denied"
        color="warning"
        icon="i-lucide-triangle-alert"
        title="Your account isn't on the maintainer allowlist."
        description="Sign in with a different account, or play via the contributor terminal."
      />

      <UForm
        :state="loginForm"
        :schema="loginForm.$schema"
        class="space-y-4"
        @submit="loginForm.$submit()"
        @error="focusFirstError"
      >
        <UFormField label="user.email" name="email">
          <UInput
            v-model="loginForm.email"
            type="email"
            autocomplete="email"
            placeholder="you@visma.com"
            class="w-full"
            :disabled="loginForm.$loading"
          />
        </UFormField>

        <UFormField label="user.password" name="password">
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
          class="font-mono"
          :loading="loginForm.$loading"
        >
          git auth login →
        </UButton>

        <UAlert
          v-if="loginForm.$error"
          color="error"
          icon="i-lucide-circle-x"
          title="Breaking change detected"
          :description="loginForm.$error.message"
        />
      </UForm>

      <p class="font-mono text-[11px] text-[color:var(--ink-muted)] text-center">
        only emails in <code class="text-[color:var(--vue)]">ADMIN_EMAILS</code> reach
        <NuxtLink to="/admin" class="text-[color:var(--vue)] hover:underline">
          /admin
        </NuxtLink>.
        everyone else plays via the
        <NuxtLink to="/" class="text-[color:var(--vue)] hover:underline">
          contributor terminal
        </NuxtLink>.
      </p>
    </div>
  </div>
</template>
