/**
 * 3-strikes-and-you-wait-a-minute lockout for the redeem input.
 * On the 3rd consecutive failure, locks input for 60s; tracks a live
 * second-by-second countdown and resets fail count on expiry.
 */
export function useCodeLockout(maxFails = 3, lockMs = 60_000) {
  const fails = ref(0)
  const lockUntil = ref<number | null>(null)
  const lockRemain = ref(0)
  const locked = computed(() => lockUntil.value !== null)

  const { pause, resume } = useIntervalFn(() => {
    if (!lockUntil.value)
      return
    const ms = lockUntil.value - Date.now()
    if (ms <= 0)
      reset()
    else lockRemain.value = Math.ceil(ms / 1000)
  }, 250, { immediate: false })

  watchEffect(() => {
    if (lockUntil.value)
      resume()
    else pause()
  })

  function recordFail() {
    const next = fails.value + 1
    fails.value = next
    if (next >= maxFails)
      lockUntil.value = Date.now() + lockMs
  }

  function reset() {
    fails.value = 0
    lockUntil.value = null
    lockRemain.value = 0
  }

  return { fails, locked, lockRemain, recordFail, reset, maxFails }
}
