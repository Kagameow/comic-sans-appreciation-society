<script setup lang="ts">
import type { Player } from '#shared/types/game'
import { APP_VERSION } from '#shared/constants/game'

const props = defineProps<{
  player: Player
  rank: number
  isMe: boolean
  bumped: boolean
  isSuperWinner?: boolean
}>()

// docs/refactor-plan.md §2.4 — 3 columns at fixed heights (132px in tv-mode).
// Top-3 share the contour but with brighter rank glyphs.
const tierColor = ['text-[color:var(--amber)]', 'text-[color:var(--vue)]', 'text-[color:var(--vue-dim)]']
const isPodium = computed(() => props.rank < 3)
const rankLabel = computed(() => `#${(props.rank + 1).toString().padStart(2, '0')}`)
const rankClass = computed(() => isPodium.value ? tierColor[props.rank] ?? '' : 'text-[color:var(--ink-muted)]')
</script>

<template>
  <div
    class="grid grid-cols-[10%_60%_30%] items-center px-6 py-4 border-b border-[color:var(--line)]/40 transition-all" :class="[
      bumped ? 'animate-charge-in bg-[color:var(--vue)]/[0.22]' : '',
      isMe ? 'bg-[color:var(--surface)]' : '',
      isSuperWinner ? 'border-y-2 border-[color:var(--amber)] glow-amber' : '',
    ]"
  >
    <!-- Tier glyph + rank -->
    <div class="flex items-center gap-2">
      <UIcon
        v-if="isPodium"
        name="i-lucide-hexagon"
        class="h-7 w-7" :class="[rankClass]"
      />
      <span class="font-display text-3xl sm:text-5xl tabular-nums" :class="[rankClass]">
        {{ rankLabel }}
      </span>
    </div>

    <!-- Contributor block -->
    <div class="flex items-center gap-4">
      <img
        v-if="player.avatarUrl"
        :src="player.avatarUrl"
        :alt="player.name"
        class="h-10 w-10 sm:h-12 sm:w-12 object-cover border border-[color:var(--line)]"
      >
      <div
        v-else
        class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-2xl bg-[color:var(--surface)] border border-[color:var(--line)]"
      >
        {{ player.avatar }}
      </div>
      <div class="min-w-0">
        <div class="font-mono text-lg sm:text-2xl text-[color:var(--ink)] truncate flex items-center gap-2">
          {{ player.name }}
          <span v-if="isSuperWinner" class="font-mono text-[10px] text-[color:var(--amber)] border border-[color:var(--amber)] px-1">
            {{ APP_VERSION }}
          </span>
          <span v-if="isMe" class="font-mono text-xs text-[color:var(--vue)]">(you)</span>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <div class="flex gap-1">
            <div
              v-for="i in 5"
              :key="`c-${i}`"
              class="h-2 w-2 rounded-full" :class="[
                i <= player.gems ? 'bg-[color:var(--vue)]' : 'border border-[color:var(--line)]',
              ]"
            />
          </div>
          <div class="flex gap-1">
            <div
              v-for="i in 5"
              :key="`p-${i}`"
              class="h-2 w-3" :class="[
                i <= player.victories ? 'bg-[color:var(--amber)]' : 'border border-[color:var(--line)]',
              ]"
            />
          </div>
        </div>
        <div class="font-mono text-xs text-[color:var(--ink-muted)] truncate mt-0.5">
          git log --oneline: {{ player.latest }}
        </div>
      </div>
    </div>

    <!-- Score -->
    <div class="text-right">
      <div class="font-display text-3xl sm:text-5xl text-[color:var(--vue)] tabular-nums">
        {{ player.points.toLocaleString() }}
      </div>
      <div class="font-mono text-[10px] text-[color:var(--ink-muted)] uppercase tracking-[0.04em]">
        commit credits
      </div>
    </div>
  </div>
</template>
