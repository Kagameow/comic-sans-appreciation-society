<script setup lang="ts">
type Mode = 'trivia' | 'crossword' | 'challenge'

defineProps<{ mode: Mode }>()
defineEmits<{ (e: 'resolve', points: number): void }>()
</script>

<template>
  <!-- docs/refactor-plan.md §5 — minigames render INLINE on /check, not as
       modals. They push the rest of the page down. Cancelling restores the
       terminal. -->
  <div class="w-full max-w-[720px] mx-auto mt-4">
    <GamesTrivia
      v-if="mode === 'trivia'"
      question="Should v-model support multiple bindings?"
      :answers="['Reject — single binding only', 'Approve — namespaced bindings', 'Defer to RFC #056', 'Composition API handles it']"
      :correct-idx="1"
      @resolve="$emit('resolve', $event)"
    />
    <GamesCrossword v-else-if="mode === 'crossword'" @solve="$emit('resolve', $event)" />
    <GamesChallenge v-else-if="mode === 'challenge'" @resolve="$emit('resolve', $event)" />
  </div>
</template>
