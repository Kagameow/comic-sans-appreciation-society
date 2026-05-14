<script setup lang="ts">
// docs/refactor-plan.md §2 — /leaderboard kept as a 301 alias for muscle
// memory; the canonical route is /tv.
definePageMeta({ middleware: 'leaderboard-alias' })
</script>

<template>
  <div />
</template>
