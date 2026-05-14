<script setup lang="ts">
// docs/voice.md §8 — the v3.0.0 chip is hoverable; the tooltip is canon.
// Re-used in AppShell (bottom-right fixed) and pinned to the winner's
// name in the master-merge broadcast (docs/refactor-plan.md §2.7).
withDefaults(defineProps<{
  /** When true, render inline (for pinning beside a name). Default is fixed bottom-right. */
  inline?: boolean
}>(), { inline: false })
</script>

<template>
  <UTooltip text="Released: 2020-09-18. Today: the migration completes.">
    <span
      :class="[
        'inline-flex items-center px-1.5 py-0.5',
        'font-mono text-[11px] uppercase tracking-[0.04em]',
        'border border-[color:var(--line)] bg-[color:var(--surface-deep)]',
        'text-[color:var(--ink-muted)]',
        'hover:text-[color:var(--ink-body)] hover:border-[color:var(--line-hot)]',
        'transition-colors cursor-help select-none',
        inline ? '' : 'fixed bottom-3 right-3 z-50',
      ]"
    >
      v3.0.0
    </span>
  </UTooltip>
</template>
