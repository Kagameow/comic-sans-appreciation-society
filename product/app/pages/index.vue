<script setup lang="ts">
const game = useGame()
const { isSignedIn, user } = useAuthSession()
const redeem = useCodeRedeem()

// If server doesn't return current user, try to find them in players list using client email
const currentPlayer = computed(() => {
  if (game.me) return game.me
  if (!user.value?.email || game.players.length === 0) return null
  const email = user.value.email.toLowerCase()
  return game.players.find(p => p.email?.toLowerCase() === email) ?? null
})

const filledGems = computed(() => currentPlayer.value?.gems ?? 0)
const showClueCta = computed(() => game.clueUnlocked && !game.superWinner)
</script>

<template>
  <div>
    <div class="container mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-12">
      <ClientOnly>
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
      </ClientOnly>
    </div>

    <RedeemMasterClueModal v-model:open="redeem.showClueModal.value" />
    <RedeemSuperWinOverlay v-if="redeem.showSuperWin.value" @dismiss="redeem.showSuperWin.value = false" />
  </div>
</template>
