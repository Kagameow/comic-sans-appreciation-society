<script setup lang="ts">
// docs/refactor-plan.md §3.6 — after 10 reversible admin actions in a
// session, a tile reveals with the line below. No interaction. Vanishes
// on page reload (state is request-scoped).
const admin = useAdminActions()
</script>

<template>
  <Transition name="evan">
    <div
      v-if="admin.actionCount.value >= 10"
      class="fixed bottom-12 left-3 z-30 font-mono text-xs text-[color:var(--ink-muted)] px-2 py-1"
    >
      &gt; Evan has approved this migration.
    </div>
  </Transition>
</template>

<style scoped>
.evan-enter-from { opacity: 0; }
.evan-enter-active { transition: opacity 800ms ease-in; }
</style>
