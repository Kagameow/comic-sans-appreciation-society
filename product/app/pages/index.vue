<script setup lang="ts">
const game = useGame()
const { isSignedIn } = useAuthSession()
const redeem = useCodeRedeem()

const filledGems = computed(() => Math.max(game.me?.gems ?? 0, game.me?.victories ?? 0))
const showClueCta = computed(() => game.clueUnlocked && !game.superWinner)
</script>

<template>
  <div>
    <div class="container mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-12">
      <RedeemSignInGate v-if="!isSignedIn" />

      <template v-else-if="redeem.mode.value === 'input'">
        <RedeemHeroBanner />
        <RedeemGemsTracker :filled="filledGems" />

        <RedeemClueCta v-if="showClueCta" @click="redeem.showClueModal.value = true" />

        <RedeemCodeInput :lockout="redeem.lockout" @submit="redeem.submit" />

        <RedeemAwardFlash v-if="redeem.flash.value" v-bind="redeem.flash.value" />
      </template>

      <RedeemMinigameHost
        v-else
        :mode="redeem.mode.value"
        :code-ref="redeem.activeMinigame.value?.codeRef"
        @resolve="redeem.resolveMinigame"
      />
    </div>

    <RedeemMasterClueModal v-model:open="redeem.showClueModal.value" />
    <RedeemSuperWinOverlay v-if="redeem.showSuperWin.value" @dismiss="redeem.showSuperWin.value = false" />
  </div>
</template>
