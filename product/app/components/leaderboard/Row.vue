<script setup lang="ts">
import type { Player } from '#shared/types/game'

const props = defineProps<{
  player: Player
  rank: number
  isMe: boolean
  bumped: boolean
}>()

// Lucide medal icons render as inline SVG via @nuxt/icon, so the PiSignage
// Raspberry Pi (which lacks a colour-emoji font) shows them correctly —
// unlike the previous 🥇🥈🥉 character literals which tofu'd on the TV.
// Order matches `rank`: 0 = gold, 1 = silver, 2 = bronze.
const podiumIconClass = [
  'text-amber-300',  // gold
  'text-slate-300',  // silver
  'text-orange-400', // bronze
]
const isPodium = computed(() => props.rank < 3)
</script>

<template>
  <div
    :class="[
      'relative flex items-center gap-2 sm:gap-4 rounded-xl border transition-all',
      isPodium ? 'py-3 px-3 sm:py-5 sm:px-6 bg-white/5 border-emerald-400/30' : 'py-2 px-3 sm:py-3 sm:px-4 bg-white/[0.03] border-white/10',
      isMe ? 'ring-1 ring-emerald-400/60' : '',
      bumped ? 'animate-rank-up' : '',
    ]"
  >
    <div :class="['ticker-mono font-bold shrink-0 flex items-center justify-center', isPodium ? 'text-2xl sm:text-3xl w-8 sm:w-12' : 'text-base sm:text-lg w-8 sm:w-10 text-slate-400']">
      <UIcon
        v-if="isPodium"
        name="i-lucide-medal"
        :class="['h-7 w-7 sm:h-9 sm:w-9', podiumIconClass[rank]]"
      />
      <span v-else>#{{ rank + 1 }}</span>
    </div>
    <img
      v-if="player.avatarUrl"
      :src="player.avatarUrl"
      :alt="player.name"
      :class="[
        'rounded-full object-cover shrink-0',
        isPodium ? 'h-10 w-10 sm:h-14 sm:w-14' : 'h-9 w-9 sm:h-10 sm:w-10',
      ]"
    />
    <div
      v-else
      :class="[
        'rounded-full bg-white/10 flex items-center justify-center shrink-0 text-slate-300',
        isPodium ? 'h-10 w-10 sm:h-14 sm:w-14' : 'h-9 w-9 sm:h-10 sm:w-10',
      ]"
    >
      <!-- Emoji avatars (default '🦊' or user-chosen) render as tofu on the PiSignage
           Pi, so the leaderboard falls back to a Lucide SVG glyph when no uploaded
           avatarUrl is present. Player profile pages still show the emoji. -->
      <UIcon name="i-lucide-user" :class="isPodium ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6'" />
    </div>
    <div class="flex-1 min-w-0">
      <div :class="['font-semibold truncate', isPodium ? 'text-base sm:text-xl' : 'text-sm sm:text-base']">
        {{ player.name }}
        <span v-if="isMe" class="text-xs text-emerald-300 font-normal">(you)</span>
      </div>
      <div class="text-xs text-slate-400 truncate">{{ player.latest }}</div>
    </div>
    <div :class="['ticker-mono font-bold text-emerald-300 shrink-0', isPodium ? 'text-xl sm:text-3xl' : 'text-base sm:text-xl']">
      {{ player.points.toLocaleString() }}
    </div>
  </div>
</template>
