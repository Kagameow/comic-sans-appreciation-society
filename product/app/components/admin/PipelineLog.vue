<script setup lang="ts">
const admin = useAdminActions()

// docs/refactor-plan.md §3.5 — scrolling terminal at the bottom. Accepts
// slash-commands that print the result back to the log (never a modal).
const cmd = ref('')

async function run() {
  const raw = cmd.value.trim()
  cmd.value = ''
  if (!raw)
    return

  if (raw === '/undo') {
    await admin.undoLast()
    return
  }

  const hmr = raw.match(/^\/hmr\s+(\d+(?:\.\d+)?)(?:\s+(\d+))?$/)
  if (hmr) {
    await admin.setMultiplier(Number(hmr[1]), Number(hmr[2] ?? 600) / 60)
    return
  }

  const sup = raw.match(/^\/super\s+(\S+)$/)
  if (sup) {
    await admin.pickSuper(sup[1]!.toUpperCase())
    return
  }

  admin.pushLog(`> unknown command: ${raw}`, 'red')
}

const toneClass = {
  vue: 'text-[color:var(--vue)]',
  amber: 'text-[color:var(--amber)]',
  red: 'text-[color:var(--red)]',
  ink: 'text-[color:var(--ink-body)]',
}

const railEl = ref<HTMLDivElement | null>(null)
watch(() => admin.log.value.length, () => {
  nextTick(() => {
    if (railEl.value)
      railEl.value.scrollTop = railEl.value.scrollHeight
  })
})
</script>

<template>
  <section class="bg-[color:var(--surface-deep)] border border-[color:var(--line)] flex flex-col" style="height: 30vh; min-height: 200px;">
    <header class="px-3 py-1.5 border-b border-[color:var(--line)] font-mono text-[11px] text-[color:var(--ink-muted)] uppercase tracking-[0.04em] flex items-center justify-between">
      <span>pipeline · realtime</span>
      <span class="font-mono">slash: /hmr 3 600 · /super VUEGEM7 · /undo</span>
    </header>
    <div ref="railEl" class="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-0.5">
      <div
        v-for="line in admin.log.value"
        :key="line.id"
        :class="toneClass[line.tone]"
      >
        {{ line.text }}
      </div>
    </div>
    <div class="border-t border-[color:var(--line)] px-3 py-2 flex items-center gap-2">
      <span class="text-[color:var(--vue)] font-display text-lg">&gt;</span>
      <input
        v-model="cmd"
        placeholder="/hmr 3 600 · /super VUEGEM7 · /undo"
        class="flex-1 bg-transparent outline-none border-0 font-mono text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] caret-[color:var(--vue)]"
        @keydown.enter.prevent="run"
      >
    </div>
  </section>
</template>
