<script setup lang="ts">
type Mode = 'trivia' | 'crossword' | 'challenge'

defineProps<{ mode: Mode }>()
defineEmits<{ (e: 'resolve', points: number): void }>()
</script>

<template>
  <GamesTrivia
    v-if="mode === 'trivia'"
    question="Which Vue 3 feature lets you render content into a different DOM node?"
    :answers="['Suspense', 'Teleport', 'Fragments', 'Composition API']"
    :correct-idx="1"
    @resolve="$emit('resolve', $event)"
  />
  <GamesCrossword v-else-if="mode === 'crossword'" @solve="$emit('resolve', $event)" />
  <GamesChallenge v-else-if="mode === 'challenge'" @resolve="$emit('resolve', $event)" />
</template>
