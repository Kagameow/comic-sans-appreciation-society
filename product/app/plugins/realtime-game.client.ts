/**
 * Owns the single Supabase Realtime channel that watches the game tables and
 * refreshes the rstore `gameState` snapshot whenever a row changes.
 *
 * Why a plugin and not the composable: `useGame()` is called from ~14 sites
 * (AppShell, MultiplierBadge, every admin panel, every page…). When the
 * channel was created inside the composable with `Date.now()` in its name,
 * two `useGame()` calls in the same JS tick hashed to the same channel
 * name. Supabase Realtime returns the *existing* channel object for any
 * `.channel(sameName)` call, so the second `useGame()` ended up calling
 * `.on('postgres_changes', …)` on a channel that the first one already
 * `.subscribe()`'d — illegal, and the route 500'd with
 *   "cannot add `postgres_changes` callbacks for realtime:game-state-N
 *    after `subscribe()`".
 *
 * The plugin runs once per client (the `.client.ts` suffix gates SSR), so
 * there is exactly one channel and exactly one set of listeners for the
 * lifetime of the page. HMR disposes the channel cleanly via `import.meta.hot`.
 */
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const store = useStore()
  const { refresh } = store.gameState.query(q => q.first('current'))

  const channel = supabase
    .channel('game-state')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' },          () => { void refresh() })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_config' },      () => { void refresh() })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'code_redemptions' }, () => { void refresh() })
    .subscribe()

  if (import.meta.hot) {
    import.meta.hot.dispose(() => { void supabase.removeChannel(channel) })
  }
})
