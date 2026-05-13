<script setup lang="ts">
import { SUPER_CLUE, TOTAL_GEMS } from '#shared/constants/game'

const game = useGameStore()
const config = useRuntimeConfig()
const playerName = computed(() => config.public.currentPlayerName)

await useAsyncData('state', () => game.refresh())
onMounted(() => game.startPolling())
onUnmounted(() => game.stopPolling())

type Mode = 'input' | 'trivia' | 'crossword' | 'challenge'
const mode = ref<Mode>('input')
const activeMinigame = ref<{ codeRef: string } | null>(null)
const code = ref('')
const fails = ref(0)
const lockUntil = ref<number | null>(null)
const lockRemain = ref(0)
const flash = ref<{ pts: number; mult: number } | null>(null)
const showClueModal = ref(false)
const showSuperWin = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

let lockTimer: ReturnType<typeof setInterval> | null = null
watchEffect(() => {
  if (lockTimer) { clearInterval(lockTimer); lockTimer = null }
  if (!lockUntil.value) return
  lockTimer = setInterval(() => {
    const ms = lockUntil.value! - Date.now()
    if (ms <= 0) {
      lockUntil.value = null
      lockRemain.value = 0
      fails.value = 0
    } else {
      lockRemain.value = Math.ceil(ms / 1000)
    }
  }, 250)
})
onUnmounted(() => { if (lockTimer) clearInterval(lockTimer) })

const locked = computed(() => lockUntil.value !== null)
const myGems = computed(() => game.me?.gems ?? 0)
const myVictories = computed(() => game.me?.victories ?? 0)
const clueUnlocked = computed(() => game.clueUnlocked)

function flashAward(pts: number, mult: number) {
  flash.value = { pts, mult }
  confettiBurst()
  setTimeout(() => { flash.value = null }, 2500)
}

async function submit() {
  const c = code.value.trim().toUpperCase()
  if (!c) return
  code.value = ''
  const res = await $fetch<any>('/api/codes/redeem', {
    method: 'POST',
    body: { code: c, playerName: playerName.value },
  }).catch(() => ({ kind: 'invalid' }))

  await game.refresh()

  if (res.kind === 'invalid') {
    const next = fails.value + 1
    fails.value = next
    if (next >= 3) lockUntil.value = Date.now() + 60_000
    return
  }
  if (res.kind === 'super') {
    if (res.alreadyWonBy) {
      flash.value = { pts: 0, mult: 1 }
      return
    }
    showSuperWin.value = true
    confettiSuperBurst()
    return
  }
  if (res.kind === 'point' || res.kind === 'victory') {
    flashAward(res.awarded, res.multiplier)
    if (res.clueUnlocked) setTimeout(() => { showClueModal.value = true }, 1200)
    return
  }
  if (res.kind === 'trivia' || res.kind === 'crossword' || res.kind === 'challenge') {
    activeMinigame.value = { codeRef: res.codeRef }
    mode.value = res.kind
  }
}

async function resolveMinigame(points: number) {
  const codeRef = activeMinigame.value?.codeRef ?? 'minigame'
  const res = await $fetch<any>('/api/codes/award', {
    method: 'POST',
    body: { playerName: playerName.value, codeRef, base: points },
  })
  await game.refresh()
  mode.value = 'input'
  activeMinigame.value = null
  if (res.awarded > 0) {
    flashAward(res.awarded, res.multiplier)
    if (res.clueUnlocked) setTimeout(() => { showClueModal.value = true }, 1200)
  }
  setTimeout(() => inputEl.value?.focus(), 60)
}
</script>

<template>
  <div>
    <div class="container mx-auto max-w-3xl px-6 py-12">
      <!-- INPUT MODE -->
      <template v-if="mode === 'input'">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs ticker-mono mb-4">
            <UIcon name="i-lucide-sparkles" class="h-3 w-3" /> v3.migration.live
          </div>
          <h1 class="text-5xl font-bold tracking-tight mb-3">
            Enter <span class="text-emerald-400">Migration Code</span>
          </h1>
          <p class="text-slate-400">
            Drop your code below. Hidden gems unlock trivia, crosswords, or IRL challenges.
          </p>
        </div>

        <RedeemGemsTracker :filled="Math.max(myGems, myVictories)" />

        <button
          v-if="clueUnlocked && !game.superWinner"
          class="w-full mb-4 px-4 py-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 text-sm ticker-mono hover:bg-emerald-500/20"
          @click="showClueModal = true"
        >
          ⬡ Master Branch clue unlocked — review
        </button>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card relative overflow-hidden">
          <div v-if="locked" class="absolute inset-0 animate-shimmer pointer-events-none" />
          <div class="flex gap-3">
            <input
              ref="inputEl"
              v-model="code"
              :disabled="locked"
              autofocus
              :placeholder="locked ? 'LOCKED' : 'V3-READY'"
              class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-5 py-5 text-2xl ticker-mono tracking-wider focus:outline-none focus:border-emerald-400 disabled:opacity-40 uppercase"
              @input="code = code.toUpperCase()"
              @keydown.enter="submit"
            />
            <UButton
              size="xl"
              color="primary"
              :disabled="locked || !code"
              @click="submit"
            >
              Submit
            </UButton>
          </div>

          <div class="mt-4 flex items-center justify-between text-sm">
            <div class="text-slate-400">
              <span v-if="!locked && fails > 0" class="text-rose-400">
                ✕ Invalid code · {{ 3 - fails }} {{ 3 - fails === 1 ? 'try' : 'tries' }} left
              </span>
              <span v-else-if="locked" class="flex items-center gap-2 text-rose-400 font-semibold ticker-mono">
                <UIcon name="i-lucide-lock" class="h-4 w-4" /> LOCKED: {{ lockRemain }}s
              </span>
              <span v-else class="opacity-60">Try: V3-READY · REACTIVE · SETUP · CHALLENGE · DART-WIN</span>
            </div>
            <span v-if="game.isMultiplierActive" class="ticker-mono text-emerald-300 font-bold">
              ⚡ {{ game.activeMultiplier }}x ACTIVE
            </span>
          </div>
        </div>

        <div v-if="flash" class="mt-6 text-center animate-rank-up">
          <div class="text-5xl font-bold text-emerald-300 ticker-mono">+{{ flash.pts }}</div>
          <div v-if="flash.pts > 0" class="text-sm text-slate-400 mt-1">
            Base {{ Math.round(flash.pts / flash.mult) }}
            <template v-if="flash.mult > 1"> × {{ flash.mult }}x Multiplier</template>
          </div>
        </div>
      </template>

      <GamesTrivia
        v-if="mode === 'trivia'"
        question="Which Vue 3 feature lets you render content into a different DOM node?"
        :answers="['Suspense', 'Teleport', 'Fragments', 'Composition API']"
        :correct-idx="1"
        @resolve="resolveMinigame"
      />
      <GamesCrossword v-if="mode === 'crossword'" @solve="resolveMinigame" />
      <GamesChallenge v-if="mode === 'challenge'" @resolve="resolveMinigame" />
    </div>

    <!-- CLUE MODAL -->
    <div
      v-if="showClueModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 animate-fade-in"
    >
      <div class="relative max-w-xl w-full rounded-2xl border-2 border-emerald-400 bg-slate-900 p-8 shadow-[0_0_60px_rgba(66,184,131,0.5)]">
        <button class="absolute top-3 right-3 p-1 text-slate-400 hover:text-white" @click="showClueModal = false">
          <UIcon name="i-lucide-x" class="h-5 w-5" />
        </button>
        <div class="ticker-mono text-xs text-emerald-300 mb-2">// MAJOR_UPGRADE.exe</div>
        <h2 class="text-3xl font-bold mb-1">LEGACY MIGRATION COMPLETE</h2>
        <p class="text-slate-400 text-sm mb-6">
          All {{ TOTAL_GEMS }} Vue 3 Gems collected. The Master Branch awaits.
        </p>
        <div class="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-5">
          <div class="text-xs uppercase tracking-widest text-emerald-300 mb-2">⬡ Cryptic clue</div>
          <p class="text-lg leading-relaxed">{{ SUPER_CLUE }}</p>
        </div>
        <p class="text-xs text-slate-500 mt-4 ticker-mono">
          Find the Master Code in the wild. Submit it on this page to merge the branch.
        </p>
      </div>
    </div>

    <!-- SUPER WIN OVERLAY -->
    <div
      v-if="showSuperWin"
      class="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style="background: radial-gradient(circle at center, rgba(66,184,131,0.4), rgba(10,15,25,0.95));"
    >
      <div class="text-center max-w-2xl">
        <UIcon name="i-lucide-git-merge" class="h-20 w-20 mx-auto text-emerald-300 mb-4 animate-pulse" />
        <div class="ticker-mono text-xs text-emerald-300 mb-2">git merge --master</div>
        <h1 class="text-6xl font-black mb-4 bg-gradient-to-r from-emerald-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
          MASTER BRANCH MERGED
        </h1>
        <div class="text-7xl font-bold text-emerald-300 ticker-mono mb-6">+1,000</div>
        <p class="text-xl text-slate-400 mb-8">
          You found the Super Code. The Great Migration is complete.
        </p>
        <UButton size="lg" color="primary" @click="showSuperWin = false">Continue</UButton>
      </div>
    </div>
  </div>
</template>
