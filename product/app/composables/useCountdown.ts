import type { MaybeRefOrGetter } from 'vue'

/**
 * Live `mm:ss` countdown until `endsAt` (epoch ms). Returns empty string when
 * `endsAt` is null or already past. Re-targets automatically when the source
 * changes; stops cleanly on unmount.
 */
export function useCountdown(endsAt: MaybeRefOrGetter<number | null>, tickMs = 500) {
  const display = ref('')
  let handle: ReturnType<typeof setInterval> | null = null

  watchEffect(() => {
    if (handle) { clearInterval(handle); handle = null }
    const target = toValue(endsAt)
    if (!target) { display.value = ''; return }
    const tick = () => {
      const ms = Math.max(0, target - Date.now())
      const m = Math.floor(ms / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      display.value = `${m}:${s.toString().padStart(2, '0')}`
    }
    tick()
    handle = setInterval(tick, tickMs)
  })

  onUnmounted(() => { if (handle) clearInterval(handle) })

  return display
}
