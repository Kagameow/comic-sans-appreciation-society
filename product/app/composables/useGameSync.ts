/**
 * Hydrates the game store on first render + keeps it in sync via polling
 * while the page is mounted. Pauses automatically when the tab is hidden
 * to save bandwidth. Swap to a Supabase realtime channel once the backend
 * is wired — the call sites won't change.
 */
export async function useGameSync(intervalMs = 3000) {
  const game = useGameStore()
  await useAsyncData('state', () => game.refresh())

  const visibility = useDocumentVisibility()
  const { pause, resume } = useIntervalFn(
    () => { game.refresh().catch(() => {}) },
    intervalMs,
    { immediate: false },
  )

  watchEffect(() => {
    if (visibility.value === 'visible') resume()
    else pause()
  })

  return game
}
