<script setup lang="ts">
type Mode = 'quiz' | 'crossword' | 'challenge' | 'arcade'
type Question = { question: string; answers: string[]; correctIdx: number }

defineProps<{ mode: Mode; codeRef?: string }>()
defineEmits<{ (e: 'resolve', points: number): void }>()

// Per-code question banks. Add a new entry here + flip the corresponding row
// to `type: 'quiz'` in db/seed.sql to introduce a new quiz code.
const QUIZZES: Record<string, Question[]> = {
  QUIZ: [
    {
      question: 'What was an important reason to migrate to Vue3?',
      answers: ['Making users aware how to clear their cookies/cache', 'Better AI integration', 'To avoid using an outdated version', 'Simplified login'],
      correctIdx: 2,
    },
    {
      question: 'What is the legendary, universally applicable troubleshooting advice that Roy and Moss use to answer almost every single IT support call in The IT Crowd?',
      answers: ['Did you clear your cookies?', 'Have you tried turning it off and on again?', 'Is it plugged into the wall, or the floor?', 'Did you blow on the cartridge?'],
      correctIdx: 1,
    },
    {
      question: 'How many programmers does it take to change a lightbulb?',
      answers: ['None, that\'s a hardware problem!', 'Just one, quickly', 'Two, one to code and one to review it', 'None, they prefer working in the dark'],
      correctIdx: 0,
    },
    {
      question: 'What kind of movies do pirates like?',
      answers: ['Action movies', 'Comedies', 'Documentaries', 'Anything rated Arrrrrrrrrr!'],
      correctIdx: 3,
    },
  ],
  COMPOSITION: [
    {
      question: 'What is the snappy new brand name we are transitioning to?',
      answers: ['Spendotron 3000', 'Elari', 'Visma Vibe', 'The Artist Formerly Known as Proactive'],
      correctIdx: 1,
    },
    {
      question: 'Which famous video game plumber causes the most racing rivalry during our lunch breaks?',
      answers: ['Master Chief in overalls', 'Luigi (He wishes)', 'Bob the Builder', 'Mario'],
      correctIdx: 3,
    },
    {
      question: 'What type of holy building was our Haarlem office before we moved in and made it awesome?',
      answers: ['A sacred shrine for lost office Tupperware', 'A medieval monastery', 'A church', 'A temple dedicated to the God of Coffee'],
      correctIdx: 2,
    },
    {
      question: 'What is our ultimate, ambitious target number for defects in a sprint?',
      answers: ['42 (The answer to the ultimate question of life, the universe, and everything)', '"Just one more..."', 'As many as it takes to keep Support on their toes', 'Zero'],
      correctIdx: 3,
    },
  ],
}

// Fallback to the original QUIZ bank for any quiz-type code without its own bank,
// so legacy single-quiz behaviour keeps working.
const FALLBACK_QUESTIONS = QUIZZES.QUIZ!
</script>

<template>
  <GamesQuiz
    v-if="mode === 'quiz'"
    :questions="QUIZZES[codeRef ?? ''] ?? FALLBACK_QUESTIONS"
    @resolve="$emit('resolve', $event)"
  />
  <GamesCrossword v-else-if="mode === 'crossword'" @solve="$emit('resolve', $event)" />
  <GamesChallenge v-else-if="mode === 'challenge'" @resolve="$emit('resolve', $event)" />

  <!-- Arcade games are dispatched by codeRef so a single 'arcade' type can host N games. -->
  <template v-else-if="mode === 'arcade'">
    <GamesWhackABug v-if="codeRef === 'WHACK-BUGS'" @resolve="$emit('resolve', $event)" />
    <GamesSnake v-else-if="codeRef === 'SNAKE-RUN'" @resolve="$emit('resolve', $event)" />
    <GamesCatchProps v-else-if="codeRef === 'CATCH-PROPS'" @resolve="$emit('resolve', $event)" />
    <div v-else class="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-6 text-rose-200">
      Unknown arcade game: <span class="ticker-mono">{{ codeRef }}</span>
    </div>
  </template>
</template>
