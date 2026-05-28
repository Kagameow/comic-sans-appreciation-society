export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event)
  const code = String(body?.code ?? '').trim().toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'code required' })

  const player = await requirePlayer(event)
  const repo = useRepo(event)
  const row = await repo.getCode(code)
  if (!row) return { kind: 'invalid' as const }

  if (row.isSuperCode) {
    const result = await repo.redeemSuper(player, row)
    if (!result.ok) {
      if (result.reason === 'taken') {
        return { kind: 'super' as const, awarded: 0, alreadyWonBy: result.winnerName }
      }
      return { kind: 'invalid' as const } // gated by victories
    }
    return { kind: 'super' as const, awarded: result.awarded }
  }

  if (row.singleUse && row.isUsed) return { kind: 'invalid' as const }

  if (row.perPlayerLimit && await repo.hasSolvedCode(player.id, row.code)) {
    return { kind: 'invalid' as const }
  }

  if (row.type === 'victory') {
    const r = await repo.redeemVictory(player, row)
    return { kind: 'victory' as const, ...r }
  }

  if (row.type === 'point') {
    const r = await repo.redeemPoint(player, row)
    return { kind: 'point' as const, ...r }
  }

  if (row.type === 'quiz' || row.type === 'crossword' || row.type === 'challenge' || row.type === 'arcade') {
    return { kind: row.type, codeRef: row.code }
  }

  return { kind: 'invalid' as const }
})
