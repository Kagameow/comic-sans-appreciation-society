<script setup lang="ts">
const game = useGame()
const admin = useAdminActions()

const presets = [2, 3, 5] as const
const customN = ref('')
const customMin = ref('5')

const remaining = useCountdown(() => game.config.multiplierEndsAt)

function engage(n: number) {
  admin.setMultiplier(n, Number(customMin.value) || 5)
}

function engageCustom() {
  const n = Number(customN.value)
  if (!n || n < 1.1)
    return
  admin.setMultiplier(n, Number(customMin.value) || 5)
  customN.value = ''
}
</script>

<template>
  <section class="bg-[color:var(--surface)] border border-[color:var(--line)] p-5 space-y-4">
    <header class="font-mono text-xs text-[color:var(--vue)]">
      defineEmits([&apos;multiplier:toggle&apos;])
    </header>

    <div class="grid grid-cols-3 gap-2">
      <UButton
        v-for="n in presets"
        :key="n"
        block
        size="lg"
        :variant="game.activeMultiplier === n ? 'solid' : 'outline'"
        class="font-display text-3xl py-6"
        @click="engage(n)"
      >
        {{ n }}x
      </UButton>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <UInput
        v-model="customN"
        type="number"
        step="0.1"
        min="1.1"
        placeholder="custom n"
      />
      <UInput
        v-model="customMin"
        type="number"
        min="1"
        placeholder="minutes"
      />
    </div>

    <UButton
      block
      size="lg"
      color="warning"
      class="font-mono uppercase"
      icon="i-lucide-zap"
      :disabled="!customN || Number(customN) <= 1"
      @click="engageCustom"
    >
      [ Engage HMR → ]
    </UButton>

    <UButton
      v-if="game.isMultiplierActive"
      block
      color="error"
      variant="outline"
      size="sm"
      class="font-mono"
      @click="admin.clearMultiplier"
    >
      [ HMR running — {{ remaining || '--:--' }} · stop ]
    </UButton>
  </section>
</template>
