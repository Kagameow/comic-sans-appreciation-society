<script setup lang="ts">
const props = defineProps<{ pts: number; mult: number }>()
const base = computed(() => Math.round(props.pts / props.mult))
</script>

<template>
  <div class="mt-6 text-center animate-rank-up">
    <div class="text-5xl font-bold text-emerald-300 ticker-mono">+{{ pts }}</div>
    <div v-if="pts > 0" class="text-sm text-slate-400 mt-1">
      Base {{ base }}
      <template v-if="mult > 1"> × {{ mult }}x Multiplier</template>
    </div>
  </div>
</template>
