
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string; playerName?: string }>(event)
  const code = String(body?.code ?? '').trim().toUpperCase()
  const playerName = String(body?.playerName ?? '').trim()
  if (!code || !playerName) {
    throw createError({ statusCode: 400, message: 'code and playerName required' })
  }

  const repo = useRepo()
  const player = repo.getPlayerByName(playerName)
  if (!player) throw createError({ statusCode: 404, message: 'unknown player' })

  const row = repo.getCode(code)
  if (!row) return { kind: 'invalid' as const }

  // ─── super code ──────────────────────────────────────────────────────────
  if (row.isSuperCode) {
    const result = repo.redeemSuper(player, row)
    if (!result.ok) {
      if (result.reason === 'taken') {
        return { kind: 'super' as const, awarded: 0, alreadyWonBy: result.winnerName }
      }
      return { kind: 'invalid' as const } // gated by victories
    }
    return { kind: 'super' as const, awarded: result.awarded }
  }

  if (row.singleUse && row.isUsed) return { kind: 'invalid' as const }

  if (row.type === 'victory') {
    const r = repo.redeemVictory(player, row)
    return { kind: 'victory' as const, ...r }
  }

  if (row.type === 'point') {
    const r = repo.redeemPoint(player, row)
    return { kind: 'point' as const, ...r }
  }

  if (row.type === 'trivia' || row.type === 'crossword' || row.type === 'challenge') {
    return { kind: row.type, codeRef: row.code }
  }

  return { kind: 'invalid' as const }
})
