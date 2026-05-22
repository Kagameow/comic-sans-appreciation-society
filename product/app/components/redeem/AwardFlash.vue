<script setup lang="ts">
const props = defineProps<{ pts: number; mult: number; note?: string }>()
const base = computed(() => props.mult > 0 ? Math.round(props.pts / props.mult) : props.pts)
</script>

<template>
  <div class="mt-6 text-center animate-rank-up">
    <div v-if="pts > 0" class="text-5xl font-bold text-emerald-300 ticker-mono">+{{ pts }}</div>
    <div v-else class="text-2xl font-bold text-amber-300 ticker-mono">— no points —</div>
    <div v-if="pts > 0" class="text-sm text-slate-400 mt-1">
      Base {{ base }}
      <template v-if="mult > 1"> × {{ mult }}x Multiplier</template>
    </div>
    <div v-else-if="note" class="text-sm text-slate-400 mt-1">{{ note }}</div>
  </div>
</template>
