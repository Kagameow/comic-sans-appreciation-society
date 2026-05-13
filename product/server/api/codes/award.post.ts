
/** Called by a minigame component once the player resolves it. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ playerName?: string; codeRef?: string; base?: number }>(event)
  const playerName = String(body?.playerName ?? '')
  const codeRef = String(body?.codeRef ?? '')
  const base = Number(body?.base ?? 0)
  if (!playerName || !codeRef || !Number.isFinite(base)) {
    throw createError({ statusCode: 400, message: 'bad request' })
  }

  const repo = useRepo()
  const player = repo.getPlayerByName(playerName)
  if (!player) throw createError({ statusCode: 404, message: 'unknown player' })

  return repo.redeemMinigameResult(player, codeRef, Math.max(0, Math.min(1000, base)))
})
