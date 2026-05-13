<template>
  <div class="rounded-2xl border border-emerald-400/30 bg-white/5 p-10 text-center">
    <UIcon name="i-lucide-log-in" class="h-12 w-12 mx-auto text-emerald-300 mb-4" />
    <h2 class="text-2xl font-bold mb-2">Sign in to play</h2>
    <p class="text-slate-400 mb-6 max-w-md mx-auto">
      Each migration code you find is logged against your account. Sign in with Google
      to join the leaderboard.
    </p>
    <UButton size="lg" color="primary" icon="i-lucide-log-in" to="/login">
      Continue with Google
    </UButton>
    <p class="text-xs text-slate-500 mt-4">
      You can still watch the
      <NuxtLink to="/leaderboard" class="text-emerald-300 hover:underline">Leaderboard</NuxtLink>
      without signing in.
    </p>
  </div>
</template>
