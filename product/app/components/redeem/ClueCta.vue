<script setup lang="ts">
import { SUPER_CLUE } from '#shared/constants/game'

// docs/refactor-plan.md §1.5 — the unlocked clue is part of the page, not a
// modal. scan-sweep on entry, glow-amber, header type-ins, then the clue
// body decrypts in a single pass.
const opened = ref(false)
useTimeoutFn(() => {
  opened.value = true
}, 80)
</script>

<template>
  <section
    class="w-full max-w-[720px] mx-auto mt-8 bg-[color:var(--surface)] border border-[color:var(--amber)] glow-amber animate-scan-sweep p-5 sm:p-6"
  >
    <header class="font-display text-lg sm:text-xl text-[color:var(--vue)] space-y-1">
      <div>&gt; all composables resolved.</div>
      <div>&gt; main branch unlocked.</div>
    </header>

    <p v-if="opened" class="mt-4 font-mono text-sm sm:text-base leading-relaxed text-[color:var(--ink)] animate-type-in" :style="{ '--type-in-steps': SUPER_CLUE.length, '--type-in-duration': '1400ms' }">
      <span class="text-[color:var(--ink-muted)]">// cryptic clue · syntax-highlighted as if a comment</span><br>
      {{ SUPER_CLUE }}
    </p>

    <footer class="mt-4 font-mono text-[11px] text-[color:var(--ink-muted)]">
      &gt; the deploy key is somewhere physical. find it.
    </footer>
  </section>
</template>
