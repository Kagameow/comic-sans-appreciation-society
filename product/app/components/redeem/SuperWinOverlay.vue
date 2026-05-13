<script setup lang="ts">
defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
    style="background: radial-gradient(circle at center, rgba(66,184,131,0.4), rgba(10,15,25,0.95));"
  >
    <div class="text-center max-w-2xl">
      <UIcon name="i-lucide-git-merge" class="h-20 w-20 mx-auto text-emerald-300 mb-4 animate-pulse" />
      <div class="ticker-mono text-xs text-emerald-300 mb-2">git merge --master</div>
      <h1 class="text-6xl font-black mb-4 bg-gradient-to-r from-emerald-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
        MASTER BRANCH MERGED
      </h1>
      <div class="text-7xl font-bold text-emerald-300 ticker-mono mb-6">+1,000</div>
      <p class="text-xl text-slate-400 mb-8">
        You found the Super Code. The Great Migration is complete.
      </p>
      <UButton size="lg" color="primary" @click="$emit('dismiss')">Continue</UButton>
    </div>
  </div>
</template>
