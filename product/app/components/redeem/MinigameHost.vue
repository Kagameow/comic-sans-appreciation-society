<script setup lang="ts">
type Mode = 'trivia' | 'crossword' | 'challenge' | 'arcade'

defineProps<{ mode: Mode; codeRef?: string }>()
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

  <!-- Arcade games are dispatched by codeRef so a single 'arcade' type can host N games. -->
  <template v-else-if="mode === 'arcade'">
    <GamesWhackABug v-if="codeRef === 'WHACK-BUGS'" @resolve="$emit('resolve', $event)" />
    <div v-else class="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-6 text-rose-200">
      Unknown arcade game: <span class="ticker-mono">{{ codeRef }}</span>
    </div>
  </template>
</template>
