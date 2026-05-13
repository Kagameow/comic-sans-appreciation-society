<script setup lang="ts">
defineProps<{ name: string }>()
defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-8 animate-fade-in cursor-pointer"
    style="background: radial-gradient(circle at center, rgba(66,184,131,0.55), rgba(10,15,25,0.95));"
    @click="$emit('dismiss')"
  >
    <div class="text-center max-w-4xl">
      <UIcon name="i-lucide-git-merge" class="h-24 w-24 mx-auto text-emerald-300 mb-6 animate-pulse" />
      <div class="ticker-mono text-sm text-emerald-300 mb-4">▲ INCOMING TRANSMISSION ▲</div>
      <h1 class="text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-emerald-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
        THE MASTER BRANCH<br />HAS BEEN MERGED!
      </h1>
      <p class="text-3xl mb-2">
        <span class="font-bold text-emerald-300">{{ name }}</span>
      </p>
      <p class="text-2xl text-slate-400">found the Super Code.</p>
      <p class="text-xs text-slate-500 mt-8 ticker-mono opacity-60">click anywhere to dismiss</p>
    </div>
  </div>
</template>
