/** Called by a minigame component once the player resolves it. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ codeRef?: string; base?: number }>(event)
  const codeRef = String(body?.codeRef ?? '')
  const base = Number(body?.base ?? 0)
  if (!codeRef || !Number.isFinite(base)) {
    throw createError({ statusCode: 400, message: 'bad request' })
  }

  const player = await requirePlayer(event)
  return useRepo().redeemMinigameResult(player, codeRef, Math.max(0, Math.min(1000, base)))
})
