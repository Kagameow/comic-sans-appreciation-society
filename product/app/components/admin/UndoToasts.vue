<script setup lang="ts">
const admin = useAdminActions()
</script>

<template>
  <div class="fixed bottom-12 right-3 z-50 flex flex-col gap-2">
    <Transition-group name="toast">
      <div
        v-for="action in admin.undoStack.value"
        :key="action.label"
        class="bg-[color:var(--surface)] border border-[color:var(--line-hot)] glow font-mono text-xs px-3 py-2 flex items-center gap-3"
      >
        <span class="text-[color:var(--ink-body)]">{{ action.label }}</span>
        <UButton size="xs" variant="outline" color="warning" @click="action.undo">
          Undo
        </UButton>
      </div>
    </Transition-group>
  </div>
</template>

<style scoped>
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(8px); }
.toast-enter-active, .toast-leave-active { transition: opacity 200ms, transform 200ms; }
</style>
