<script setup lang="ts">
// docs/refactor-plan.md §1.3 — fixed 8-row buffer below the prompt. Each
// new line type-ins at ~30 cps; older lines push up; lines that scroll
// off the top vanish. Keyboard-inert (no focus traps).
const term = useTerminalBus()

const toneClass = {
  vue: 'text-[color:var(--vue)]',
  amber: 'text-[color:var(--amber)]',
  red: 'text-[color:var(--red)]',
  ink: 'text-[color:var(--ink-body)]',
} as const

function rowClass(tone?: 'vue' | 'amber' | 'red' | 'ink') {
  return toneClass[tone ?? 'ink']
}
</script>

<template>
  <div
    class="w-full max-w-[720px] mx-auto mt-4 bg-[color:var(--surface-deep)] border border-[color:var(--line)]"
    aria-hidden="true"
  >
    <div class="px-4 py-3 font-mono text-sm leading-relaxed min-h-[12rem]">
      <transition-group name="terminal" tag="div" class="space-y-0.5">
        <div
          v-for="line in term.lines.value"
          :key="line.id"
          class="whitespace-pre-wrap break-words" :class="[rowClass(line.tone)]"
        >
          <span class="animate-type-in" :style="{ '--type-in-steps': line.text.length, '--type-in-duration': `${Math.min(900, line.text.length * 28)}ms` }">{{ line.text }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.terminal-enter-from { opacity: 0; transform: translateY(4px); }
.terminal-enter-active { transition: opacity 200ms ease-out, transform 200ms ease-out; }
.terminal-leave-active { transition: opacity 200ms ease-out; }
.terminal-leave-to { opacity: 0; }
</style>
