/**
 * Server-side admin commands. Each one refreshes the store on success so the
 * UI reflects the new state immediately, then the polling loop covers everyone else.
 * Stateless — the codes registry is owned by CodesTable.
 */
export function useAdminActions() {
  const game = useGame()

  async function setMultiplier(multiplier: number, minutes: number) {
    await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier, minutes } })
    await game.refresh()
  }

  async function clearMultiplier() {
    await setMultiplier(1, 0)
  }

  async function adjustPoints(playerId: string, delta: number) {
    await $fetch('/api/admin/adjust', { method: 'POST', body: { playerId, delta } })
    await game.refresh()
  }

  async function pickSuper(code: string) {
    await $fetch('/api/admin/super-code', { method: 'POST', body: { code } })
    await game.refresh()
  }

  return { setMultiplier, clearMultiplier, adjustPoints, pickSuper }
}
