
export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'admin only' })
  const body = await readBody<{ playerId?: string; delta?: number }>(event)
  const playerId = String(body?.playerId ?? '')
  const delta = Number(body?.delta ?? 0)
  if (!playerId || !Number.isFinite(delta)) {
    throw createError({ statusCode: 400, message: 'bad request' })
  }
  const repo = useRepo()
  const player = repo.adjustPoints(playerId, Math.max(-1000, Math.min(1000, delta)))
  if (!player) throw createError({ statusCode: 404, message: 'unknown player' })
  return { ok: true, player }
})
