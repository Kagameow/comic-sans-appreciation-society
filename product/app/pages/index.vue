<script setup lang="ts">
const game = useGame()
const { isSignedIn } = useAuthSession()
const redeem = useCodeRedeem()
const term = useTerminalBus()

const showClueCard = computed(() => game.clueUnlocked && !game.superWinner)

// docs/voice.md §5.1 — boot lines fire once on first arrival (signed in).
onMounted(() => {
  if (!isSignedIn.value || term.lines.value.length)
    return
  for (const text of [
    '> Initializing Vue 3 migration...',
    '> Scanning office for deploy keys...',
    '> Migration window: 09:00 – 18:00',
    '> All contributors must reach main before sunset',
  ]) term.line(text, 'vue')
})
</script>

<template>
  <div>
    <div class="container mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-12">
      <RedeemSignInGate v-if="!isSignedIn" />

      <template v-else-if="redeem.mode.value === 'input'">
        <RedeemHeroBanner />

        <RedeemCodeInput :lockout="redeem.lockout" @submit="redeem.submit" />
        <RedeemTerminal />

        <RedeemAwardFlash v-if="redeem.flash.value" v-bind="redeem.flash.value" />

        <RedeemGemsTracker
          class="mt-10"
          :composables="game.me?.gems ?? 0"
          :victories="game.me?.victories ?? 0"
        />

        <RedeemClueCta v-if="showClueCard" />
      </template>

      <RedeemMinigameHost
        v-else
        :mode="redeem.mode.value"
        @resolve="redeem.resolveMinigame"
      />
    </div>

    <RedeemMasterClueModal v-model:open="redeem.showClueModal.value" />
    <RedeemSuperWinOverlay v-if="redeem.showSuperWin.value" @dismiss="redeem.showSuperWin.value = false" />
  </div>
</template>
