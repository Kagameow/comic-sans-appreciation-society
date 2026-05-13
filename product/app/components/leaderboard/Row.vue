<script setup lang="ts">
import type { Player } from '#shared/types/game'

const props = defineProps<{
  player: Player
  rank: number
  isMe: boolean
  bumped: boolean
}>()

const medals = ['🥇', '🥈', '🥉']
const isPodium = computed(() => props.rank < 3)
const rankLabel = computed(() => isPodium.value ? medals[props.rank]! : `#${props.rank + 1}`)
</script>

<template>
  <div
    :class="[
      'relative flex items-center gap-4 rounded-xl border transition-all',
      isPodium ? 'py-5 px-6 bg-white/5 border-emerald-400/30' : 'py-3 px-4 bg-white/[0.03] border-white/10',
      isMe ? 'ring-1 ring-emerald-400/60' : '',
      bumped ? 'animate-rank-up' : '',
    ]"
  >
    <div :class="['ticker-mono font-bold', isPodium ? 'text-3xl w-12' : 'text-lg w-10 text-slate-400']">
      {{ rankLabel }}
    </div>
    <div
      :class="[
        'rounded-full bg-white/10 flex items-center justify-center',
        isPodium ? 'h-14 w-14 text-3xl' : 'h-10 w-10 text-xl',
      ]"
    >
      {{ player.avatar }}
    </div>
    <div class="flex-1 min-w-0">
      <div :class="['font-semibold truncate', isPodium ? 'text-xl' : 'text-base']">
        {{ player.name }}
        <span v-if="isMe" class="text-xs text-emerald-300 font-normal">(you)</span>
      </div>
      <div class="text-xs text-slate-400 truncate">{{ player.latest }}</div>
    </div>
    <div :class="['ticker-mono font-bold text-emerald-300', isPodium ? 'text-3xl' : 'text-xl']">
      {{ player.points.toLocaleString() }}
    </div>
  </div>
</template>
