<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

// docs/refactor-plan.md §3 — three columns at the top (multiplier /
// players / codes) and the pipeline log spanning the bottom. Density
// inverts the player UX rules — this is the only surface where it does.
useAdminActions().pushLog('> maintainer console resumed.', 'ink')
</script>

<template>
  <div class="container mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
    <AdminPageHeader />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <AdminMultiplierPanel />
      <AdminPlayersPanel />
      <Suspense>
        <AdminCodesPanel />
        <template #fallback>
          <div class="bg-[color:var(--surface)] border border-[color:var(--line)] p-5 font-mono text-xs text-[color:var(--ink-muted)]">
            Resolving async dependency…
          </div>
        </template>
      </Suspense>
    </div>

    <AdminPipelineLog />

    <AdminUndoToasts />
    <AdminEvanEgg />
  </div>
</template>
