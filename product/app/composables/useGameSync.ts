/**
 * Hydrates the game store on first render + keeps it in sync via polling
 * while the page is mounted. Swap to a Supabase realtime channel once the
 * backend is wired — the call sites won't change.
 */
export async function useGameSync(intervalMs = 3000) {
  const game = useGameStore()
  await useAsyncData('state', () => game.refresh())
  onMounted(() => game.startPolling(intervalMs))
  onUnmounted(() => game.stopPolling())
  return game
}
