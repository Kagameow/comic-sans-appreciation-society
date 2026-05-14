<script setup lang="ts">
import { COMPOSABLES, TOTAL_VICTORIES } from '#shared/constants/game'

// docs/refactor-plan.md §1.4 — V-shape composables row (the 5 real Vue 3
// composables) sit above a PR track (5 rectangular slots). Either row
// hitting 5/5 unlocks the clue, which is owned upstream in useCodeRedeem.
const props = defineProps<{
  /** Composables filled (gems). */
  composables: number
  /** Victories filled (merged PRs). */
  victories: number
}>()

const composableLit = (i: number) => i < props.composables
const prLit = (i: number) => i < props.victories

// V layout: 3 dots on the left arm, 2 on the right, the join is the bottom
// (slot 4 in 0-indexed terms — the third left + first right meet).
// We render two rows of dots positioned with margin-top to fake the V.
const composables = COMPOSABLES.map((name, i) => ({
  name,
  i,
  /** "depth" 0..2 controlling vertical offset for the V silhouette. */
  depth: [0, 1, 2, 1, 0][i] ?? 0,
}))
</script>

<template>
  <section class="space-y-3 mb-6">
    <header class="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--ink-muted)]">
      <span>{{ composables.length }} composables · {{ TOTAL_VICTORIES }} merged PRs</span>
      <span>both paths lead to <code class="text-[color:var(--vue)]">main</code></span>
    </header>

    <!-- V-shape composables -->
    <div class="grid grid-cols-5 gap-3 sm:gap-6 px-2 sm:px-8">
      <div
        v-for="c in composables"
        :key="c.name"
        :style="{ marginTop: `${c.depth * 14}px` }"
        class="flex flex-col items-center gap-1.5 text-center"
      >
        <span
          class="h-6 w-6 sm:h-8 sm:w-8 rounded-full transition-all" :class="[
            composableLit(c.i)
              ? 'bg-[color:var(--vue)] glow animate-charge-in'
              : 'border-2 border-[color:var(--line)]',
          ]"
        />
        <span
          class="font-mono text-[10px] sm:text-xs" :class="[
            composableLit(c.i)
              ? 'text-[color:var(--vue)]'
              : 'text-[color:var(--ink-muted)]',
          ]"
        >
          {{ c.name }}()
          <span v-if="composableLit(c.i)" class="text-[color:var(--vue)]">✓</span>
        </span>
      </div>
    </div>

    <!-- PR track -->
    <div class="grid grid-cols-5 gap-2 sm:gap-3 px-2 sm:px-8">
      <div
        v-for="i in TOTAL_VICTORIES"
        :key="i"
        class="h-8 sm:h-10 flex items-center justify-center font-mono text-[10px] sm:text-xs uppercase tracking-[0.04em] transition-all" :class="[
          prLit(i - 1)
            ? 'bg-[color:var(--amber)] text-[color:var(--bg)] border border-[color:var(--amber)] animate-charge-in'
            : 'border border-[color:var(--line)] text-[color:var(--ink-muted)]',
        ]"
      >
        PR #{{ i }} <span v-if="prLit(i - 1)">✓</span>
      </div>
    </div>
  </section>
</template>
