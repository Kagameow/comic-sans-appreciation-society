import type { MaybeRefOrGetter } from 'vue'

/**
 * Live `mm:ss` countdown until `endsAt` (epoch ms). Returns empty string when
 * `endsAt` is null or already past. Re-targets automatically when the source
 * changes; auto-pauses when the source becomes null.
 */
export function useCountdown(endsAt: MaybeRefOrGetter<number | null>, tickMs = 500) {
  const display = ref('')

  const { pause, resume } = useIntervalFn(() => {
    const target = toValue(endsAt)
    if (!target) {
      display.value = ''
      return
    }
    const ms = Math.max(0, target - Date.now())
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    display.value = `${m}:${s.toString().padStart(2, '0')}`
  }, tickMs, { immediate: false })

  watchEffect(() => {
    if (toValue(endsAt)) {
      resume()
    }
    else {
      pause()
      display.value = ''
    }
  })

  return display
}
