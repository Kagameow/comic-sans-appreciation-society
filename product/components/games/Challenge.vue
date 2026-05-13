<script setup lang="ts">
const emit = defineEmits<{ (e: 'resolve', points: number): void }>()

const TARGETS = ['Marieke de Vries', 'Joris van Dijk', 'Sanne Bakker', 'Bram Janssen']
const ACTIVITIES = ['Darts', 'Foosball', 'Pool', 'a Pull-Up Contest', 'Rock Paper Scissors']

const target = ref(TARGETS[Math.floor(Math.random() * TARGETS.length)])
const activity = ref(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)])
const code = ref('')
</script>

<template>
  <div class="rounded-2xl border border-emerald-400/30 bg-white/5 p-8 glow-green">
    <div class="text-xs uppercase tracking-widest text-emerald-300 mb-3">⚔ IRL Challenge</div>
    <h2 class="text-3xl font-bold leading-tight mb-2">
      Find <span class="text-emerald-300">{{ target }}</span>
    </h2>
    <p class="text-xl text-slate-400 mb-8">…and beat them at {{ activity }}!</p>

    <label class="text-xs uppercase tracking-wider text-slate-400">Referee Confirmation Code</label>
    <div class="flex gap-2 mt-2">
      <input
        v-model="code"
        placeholder="ADMIN-XXXX"
        class="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-emerald-400 focus:outline-none ticker-mono uppercase"
        @input="code = code.toUpperCase()"
      />
      <UButton
        size="lg"
        color="primary"
        :disabled="code.length < 4"
        @click="emit('resolve', 150)"
      >
        Confirm Win
      </UButton>
    </div>
    <p class="text-xs text-slate-500 mt-3">
      POC: any 4+ char code resolves the win. The real version checks against
      a referee-issued single-use code.
    </p>
  </div>
</template>
