import { COMPOSABLES } from '#shared/constants/game'
import type { CodeType } from '#shared/types/game'

// docs/voice.md §5 — the server authors the terminal script for every
// redemption outcome. Clients append `lines` verbatim into RedeemTerminal.
// Keeping the voice server-side means admins can tune it without a
// redeploy (when the in-memory repo gets a DB seat), and it stays
// consistent across all entry points.

function pointLines(code: string, awarded: number, multiplier: number, composable: string | null) {
  const lines = [
    `> git commit -m "${code}"`,
    '> Running test suite...',
    '> ✓ 12 tests passing',
  ]
  if (composable)
    lines.push(`> ${composable}() → composable acquired`)
  if (multiplier > 1)
    lines.push(`> ⚡ Vite HMR × ${multiplier} applied`)
  lines.push(`> ref(credits).value += ${awarded}`)
  lines.push('> Pushed to origin.')
  return lines
}

function victoryLines(code: string, awarded: number) {
  return [
    `> git commit -m "${code}"`,
    '> Reviewing PR...',
    '> Approved by maintainer.',
    `> ref(credits).value += ${awarded}`,
    '> Merged into feature/vue3 ✓',
  ]
}

function invalidLines(code: string) {
  return [
    `> git commit -m "${code}"`,
    '> ⚠ Breaking change detected.',
    '> This deploy key is incompatible with Vue 3.',
    '> Aborting.',
  ]
}

function alreadyMergedLines(code: string) {
  return [
    `> git commit -m "${code}"`,
    '> ⚠ Already merged into main.',
    '> Nothing to commit.',
  ]
}

function minigameLines(code: string, kind: CodeType) {
  return [
    `> git commit -m "${code}"`,
    `> RFC #${Math.floor(Math.random() * 900 + 100)} incoming...`,
    `> review required: ${kind}`,
  ]
}

function superTakenLines(winner: string) {
  return [
    '> Verifying deploy key...',
    '> ⚠ already merged.',
    `> ${winner} pushed first. v3.0.0 is live.`,
  ]
}

function superLockedLines() {
  return [
    '> Verifying deploy key...',
    '> ⚠ insufficient permissions.',
    '> reach 5 merged PRs or 5 composables to qualify.',
  ]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event)
  const code = String(body?.code ?? '').trim().toUpperCase()
  if (!code)
    throw createError({ statusCode: 400, message: 'code required' })

  const player = await requirePlayer(event)
  const repo = useRepo()
  const row = repo.getCode(code)
  if (!row)
    return { kind: 'invalid' as const, lines: invalidLines(code) }

  // ─── super code ──────────────────────────────────────────────────────────
  if (row.isSuperCode) {
    const result = repo.redeemSuper(player, row)
    if (!result.ok) {
      if (result.reason === 'taken') {
        return {
          kind: 'super' as const,
          awarded: 0,
          alreadyWonBy: result.winnerName,
          lines: superTakenLines(result.winnerName ?? 'someone'),
        }
      }
      return { kind: 'invalid' as const, lines: superLockedLines() }
    }
    return {
      kind: 'super' as const,
      awarded: result.awarded,
      lines: [
        '> Verifying deploy key...',
        '> Authentication successful',
        '> Resolving merge conflicts... none found',
        '> Running final test suite...',
        '> ✓ 847 tests passing',
        '> Preparing to merge into main...',
      ],
    }
  }

  if (row.singleUse && row.isUsed) {
    return { kind: 'invalid' as const, lines: alreadyMergedLines(code) }
  }

  if (row.type === 'victory') {
    const r = repo.redeemVictory(player, row)
    return {
      kind: 'victory' as const,
      ...r,
      lines: victoryLines(code, r.awarded),
    }
  }

  if (row.type === 'point') {
    const r = repo.redeemPoint(player, row)
    // After the redeem, player.gems is the new value — the composable name
    // that just lit up is at index gems-1 in the canonical order.
    const composable = r.gemUnlocked && player.gems > 0
      ? COMPOSABLES[Math.min(player.gems, COMPOSABLES.length) - 1] ?? null
      : null
    return {
      kind: 'point' as const,
      ...r,
      lines: pointLines(code, r.awarded, r.multiplier, composable),
    }
  }

  if (row.type === 'trivia' || row.type === 'crossword' || row.type === 'challenge') {
    return {
      kind: row.type,
      codeRef: row.code,
      lines: minigameLines(code, row.type),
    }
  }

  return { kind: 'invalid' as const, lines: invalidLines(code) }
})
