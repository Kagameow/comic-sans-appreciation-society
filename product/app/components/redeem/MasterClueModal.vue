<script setup lang="ts">
// docs/refactor-plan.md §1.5 — the unlocked clue is rendered inline by
// RedeemClueCta. This component is retained as a transparent passthrough
// so the existing v-model:open from useCodeRedeem doesn't dangle. The
// inline card on /check already shows the clue; once unlocked, the user
// sees it on the page itself with no modal to dismiss.
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <span v-if="open" class="sr-only">clue revealed inline</span>
</template>
