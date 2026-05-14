<script setup lang="ts">
const props = defineProps<{ pts: number, mult: number }>()
const base = computed(() => Math.round(props.pts / props.mult))
</script>

<template>
  <div class="mt-4 text-center animate-digit-roll">
    <div class="font-display text-5xl text-[color:var(--vue)] glow">
      +{{ pts.toLocaleString() }}
    </div>
    <div v-if="pts > 0" class="mt-1 font-mono text-xs text-[color:var(--ink-muted)]">
      ref(credits).value += {{ base }}<template v-if="mult > 1">
        · HMR × {{ mult }}
      </template>
    </div>
  </div>
</template>
