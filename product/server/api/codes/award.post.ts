/** Called by a minigame component once the player resolves it. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ codeRef?: string; base?: number }>(event)
  const codeRef = String(body?.codeRef ?? '')
  const base = Number(body?.base ?? 0)
  if (!codeRef || !Number.isFinite(base)) {
    throw createError({ statusCode: 400, message: 'bad request' })
  }

  const player = await requirePlayer(event)
  const repo = useRepo()

  // For the crossword the server picks the payout: first-mover tier +
  // one solve per player. The client-supplied base is only the
  // "did they solve it?" signal (1 = solved, 0 = bailed).
  const code = repo.getCode(codeRef)
  if (code?.type === 'crossword') {
    if (base <= 0) return { awarded: 0, multiplier: 1, alreadySolved: false }
    if (repo.hasSolvedCode(player.id, codeRef)) {
      return { awarded: 0, multiplier: 1, alreadySolved: true }
    }
    const rank = repo.distinctSolverCount(codeRef) + 1
    const tier = rank === 1 ? 500 : rank <= 3 ? 350 : rank <= 10 ? 250 : 150
    return repo.redeemMinigameResult(player, codeRef, tier)
  }

  return repo.redeemMinigameResult(player, codeRef, Math.max(0, Math.min(1000, base)))
})
