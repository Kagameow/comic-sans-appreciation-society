<script setup lang="ts">
// docs/voice.md §8 — the 404 line is canon: "this route was not yet migrated."
defineProps<{ error: { statusCode?: number, message?: string } | null }>()

async function home() {
  await clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div class="container mx-auto max-w-2xl px-3 sm:px-6 py-16 font-mono text-[color:var(--ink-body)]">
      <div class="bg-[color:var(--surface-deep)] border border-[color:var(--line)] p-6 sm:p-8 space-y-2">
        <div>
          <span class="text-[color:var(--red)]">&gt;</span>
          {{ error?.statusCode ?? 500 }}: this route was not yet migrated.
        </div>
        <div v-if="error?.message">
          <span class="text-[color:var(--ink-muted)]">&gt;</span>
          {{ error.message }}
        </div>
        <div class="pt-3">
          <UButton size="lg" color="primary" icon="i-lucide-git-branch" class="font-mono" @click="home">
            git checkout main
          </UButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
