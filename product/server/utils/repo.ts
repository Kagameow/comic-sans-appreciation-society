/**
 * Supabase-backed data layer. Replaces the in-memory POC store.
 *
 * Every method is async. Game-mutation methods do their own SELECT-then-UPDATE
 * sequences; the super-code claim is race-safe via `update … where super_winner
 * is null`. Multiplier expiry is computed client-side (any expired window
 * collapses to 1×) so the row doesn't need a clearing job.
 *
 * `useRepo(event)` opens a service-role client bound to the request — RLS is
 * bypassed because the API routes already gate identity (`requirePlayer`,
 * `isAdminRequest`) before calling these methods.
 */
import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Player, Code, GameConfig, CodeType } from '#shared/types/game'

type PlayerRow = {
  id: string
  user_id: string | null
  email: string | null
  name: string
  avatar: string
  avatar_url: string | null
  points: number
  victories: number
  gems: number
  latest: string
  inserted_at: string
  updated_at: string
}

type CodeRow = {
  code: string
  type: CodeType
  value: number
  is_super_code: boolean
  single_use: boolean
  per_player_limit: boolean
  is_used: boolean
  used_by: string | null
  used_at: string | null
}

type ConfigRow = {
  id: number
  multiplier: number
  multiplier_ends_at: string | null
  super_code: string | null
  super_winner: string | null
  super_won_at: string | null
}

function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    avatarUrl: row.avatar_url ?? undefined,
    points: row.points,
    victories: row.victories,
    gems: row.gems,
    latest: row.latest,
    userId: row.user_id ?? undefined,
    email: row.email ?? undefined,
  }
}

function rowToCode(row: CodeRow): Code {
  return {
    code: row.code,
    type: row.type,
    value: row.value,
    isSuperCode: row.is_super_code,
    singleUse: row.single_use,
    perPlayerLimit: row.per_player_limit ?? false,
    isUsed: row.is_used,
    usedBy: row.used_by ?? undefined,
    usedAt: row.used_at ? new Date(row.used_at).getTime() : undefined,
  }
}

function rowToConfig(row: ConfigRow): GameConfig {
  const endsAt = row.multiplier_ends_at ? new Date(row.multiplier_ends_at).getTime() : null
  const expired = endsAt !== null && endsAt < Date.now()
  return {
    multiplier: expired ? 1 : Number(row.multiplier ?? 1),
    multiplierEndsAt: expired ? null : endsAt,
    superCode: row.super_code ?? null,
    superWinner: (row.super_winner && row.super_winner !== 'undefined') ? row.super_winner : null,
    superWonAt: row.super_won_at ? new Date(row.super_won_at).getTime() : null,
  }
}

export function useRepo(event: H3Event) {
  const sb = serverSupabaseServiceRole(event)

  async function getConfigRow(): Promise<ConfigRow> {
    const { data, error } = await sb.from('game_config').select('*').eq('id', 1).single()
    if (error) throw error
    return data as unknown as ConfigRow
  }

  async function currentMultiplier(): Promise<number> {
    const cfg = rowToConfig(await getConfigRow())
    return cfg.multiplier
  }

  async function log(playerId: string, code: string, awarded: number, multiplier: number, isSuper: boolean) {
    const { error } = await sb.from('code_redemptions').insert({
      player_id: playerId, code, awarded, multiplier, is_super: isSuper,
    })
    if (error) throw error
  }

  return {
    async listPlayers(): Promise<Player[]> {
      const { data, error } = await sb.from('players').select('*').order('points', { ascending: false })
      if (error) throw error
      return (data as unknown as PlayerRow[]).map(rowToPlayer)
    },

    async getPlayerById(id: string): Promise<Player | null> {
      if (!id || id === 'undefined') return null
      const { data, error } = await sb.from('players').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data ? rowToPlayer(data as unknown as PlayerRow) : null
    },

    async getPlayerByUserId(userId: string): Promise<Player | null> {
      if (!userId || userId === 'undefined') return null
      const { data, error } = await sb.from('players').select('*').eq('user_id', userId).maybeSingle()
      if (error) throw error
      return data ? rowToPlayer(data as unknown as PlayerRow) : null
    },

    /**
     * Resolves a Supabase user to their player row, creating one on first
     * sign-in. Display name + email + avatar are synced from the auth identity
     * on every call so the leaderboard tracks whoever's signed in.
     */
    async ensurePlayerForUser(user: {
      id: string
      email?: string | null
      name?: string | null
      avatar?: string | null
      avatarUrl?: string | null
    }): Promise<Player> {
      if (!user.id) throw new Error('user.id is required')
      const email = user.email?.toLowerCase() ?? null
      const name = (user.name?.trim() || (email ? email.split('@')[0]! : 'Anonymous'))!
      const avatar = user.avatar || '🦊'
      const avatarUrl = user.avatarUrl?.trim() || null

      const { data: existing, error: selErr } = await sb
        .from('players').select('*').eq('user_id', user.id).maybeSingle()
      if (selErr) throw selErr

      if (existing) {
        const patch: Record<string, unknown> = { name, avatar_url: avatarUrl }
        if (email) patch.email = email
        const { data: updated, error: updErr } = await sb
          .from('players').update(patch).eq('id', existing.id).select('*').single()
        if (updErr) throw updErr
        return rowToPlayer(updated as unknown as PlayerRow)
      }

      const { data: inserted, error: insErr } = await sb
        .from('players')
        .insert({
          user_id: user.id,
          email,
          name,
          avatar,
          avatar_url: avatarUrl,
          latest: 'Joined the migration',
        })
        .select('*').single()
      if (insErr) throw insErr
      return rowToPlayer(inserted as unknown as PlayerRow)
    },

    async getCode(code: string): Promise<Code | null> {
      const { data, error } = await sb.from('codes').select('*').eq('code', code).maybeSingle()
      if (error) throw error
      return data ? rowToCode(data as unknown as CodeRow) : null
    },

    async listCodes(): Promise<Code[]> {
      const { data, error } = await sb.from('codes').select('*').order('code')
      if (error) throw error
      return (data as unknown as CodeRow[]).map(rowToCode)
    },

    async getConfig(): Promise<GameConfig> {
      return rowToConfig(await getConfigRow())
    },

    currentMultiplier,

    async setMultiplier(n: number, minutes: number): Promise<GameConfig> {
      const endsAt = n > 1 && minutes > 0 ? new Date(Date.now() + minutes * 60_000).toISOString() : null
      const { data, error } = await sb.from('game_config')
        .update({ multiplier: n, multiplier_ends_at: endsAt }).eq('id', 1).select('*').single()
      if (error) throw error
      return rowToConfig(data as unknown as ConfigRow)
    },

    async clearMultiplier(): Promise<GameConfig> {
      const { data, error } = await sb.from('game_config')
        .update({ multiplier: 1, multiplier_ends_at: null }).eq('id', 1).select('*').single()
      if (error) throw error
      return rowToConfig(data as unknown as ConfigRow)
    },

    async setSuperCode(code: string): Promise<GameConfig> {
      const { data: target, error: getErr } = await sb.from('codes').select('*').eq('code', code).maybeSingle()
      if (getErr) throw getErr
      if (!target) throw new Error('unknown code')

      // Clear is_super_code on all codes, then mark this one super.
      const { error: clrErr } = await sb.from('codes').update({ is_super_code: false }).neq('code', '__none__')
      if (clrErr) throw clrErr
      const { error: upErr } = await sb.from('codes').update({
        is_super_code: true, single_use: true, type: 'super', is_used: false, used_by: null, used_at: null,
      }).eq('code', code)
      if (upErr) throw upErr

      const { data: cfg, error: cfgErr } = await sb.from('game_config')
        .update({ super_code: code, super_winner: null, super_won_at: null }).eq('id', 1).select('*').single()
      if (cfgErr) throw cfgErr
      return rowToConfig(cfg as unknown as ConfigRow)
    },

    async adjustPoints(playerId: string, delta: number): Promise<Player | null> {
      const { data: p, error: getErr } = await sb.from('players').select('*').eq('id', playerId).maybeSingle()
      if (getErr) throw getErr
      if (!p) return null
      const row = p as unknown as PlayerRow
      const newPoints = Math.max(0, row.points + delta)
      const { data: upd, error: upErr } = await sb.from('players')
        .update({ points: newPoints, latest: `Admin ${delta >= 0 ? '+' : ''}${delta}` })
        .eq('id', playerId).select('*').single()
      if (upErr) throw upErr
      return rowToPlayer(upd as unknown as PlayerRow)
    },

    async redeemPoint(player: Player, code: Code) {
      const multiplier = await currentMultiplier()
      const awarded = Math.round(code.value * multiplier)
      const gemsBefore = player.gems
      const gems = Math.min(5, gemsBefore + 1)
      const points = player.points + awarded
      const latest = `Code ${code.code} · +${awarded}`
      const { error } = await sb.from('players').update({ points, gems, latest }).eq('id', player.id)
      if (error) throw error
      await log(player.id, code.code, awarded, multiplier, false)
      return {
        awarded, multiplier,
        gemUnlocked: gems > gemsBefore,
        clueUnlocked: gems >= 5 && gemsBefore < 5,
      }
    },

    async redeemVictory(player: Player, code: Code) {
      const multiplier = await currentMultiplier()
      const awarded = Math.round(code.value * multiplier)
      const before = player.victories
      const victories = Math.min(5, before + 1)
      const points = player.points + awarded
      const latest = `Won ${code.code} · +${awarded}`
      const { error } = await sb.from('players').update({ points, victories, latest }).eq('id', player.id)
      if (error) throw error
      const { error: ucErr } = await sb.from('codes').update({
        is_used: true, used_by: player.id, used_at: new Date().toISOString(),
      }).eq('code', code.code)
      if (ucErr) throw ucErr
      await log(player.id, code.code, awarded, multiplier, false)
      return {
        awarded, multiplier,
        victories,
        clueUnlocked: victories >= 5 && before < 5,
      }
    },

    async redeemSuper(player: Player, code: Code) {
      // Allow super code redemption with either 5 gems OR 5 victories
      if (player.victories < 5 && player.gems < 5) return { ok: false as const, reason: 'locked' as const }

      // Race-safe claim: only the first writer where super_winner is null wins.
      const nowIso = new Date().toISOString()
      const { data: claimed, error: claimErr } = await sb.from('game_config')
        .update({ super_winner: player.id, super_won_at: nowIso })
        .eq('id', 1).is('super_winner', null).select('*').maybeSingle()
      if (claimErr) throw claimErr

      if (!claimed) {
        // Someone else won. Surface who.
        const { data: cfg } = await sb.from('game_config').select('super_winner').eq('id', 1).single()
        const winnerId = (cfg as { super_winner: string | null } | null)?.super_winner ?? null
        const winner = winnerId
          ? await this.getPlayerById(winnerId)
          : null
        return { ok: false as const, reason: 'taken' as const, winnerName: winner?.name ?? null }
      }

      const awarded = code.value || 1000
      const { error: pErr } = await sb.from('players').update({
        points: player.points + awarded,
        latest: `Found the Super Code · +${awarded}`,
      }).eq('id', player.id)
      if (pErr) throw pErr
      const { error: cErr } = await sb.from('codes').update({
        is_used: true, used_by: player.id, used_at: nowIso,
      }).eq('code', code.code)
      if (cErr) throw cErr
      await log(player.id, code.code, awarded, 1, true)
      return { ok: true as const, awarded, winnerName: player.name }
    },

    async hasSolvedCode(playerId: string, codeRef: string): Promise<boolean> {
      const { count, error } = await sb.from('code_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('player_id', playerId).eq('code', codeRef).gt('awarded', 0)
      if (error) throw error
      return (count ?? 0) > 0
    },

    async distinctSolverCount(codeRef: string): Promise<number> {
      // Distinct players who got >0 from this code. supabase-js doesn't expose
      // `distinct` directly; we read player_ids and dedupe in memory. Cardinality
      // is bounded by the office size, so this is fine.
      const { data, error } = await sb.from('code_redemptions')
        .select('player_id').eq('code', codeRef).gt('awarded', 0)
      if (error) throw error
      const ids = new Set((data ?? []).map((r: { player_id: string }) => r.player_id))
      return ids.size
    },

    async redeemMinigameResult(player: Player, codeRef: string, base: number) {
      if (base === 0) return { awarded: 0, multiplier: 1, gemUnlocked: false, clueUnlocked: false }
      const multiplier = await currentMultiplier()
      const awarded = Math.round(base * multiplier)
      const gemsBefore = player.gems
      const gems = Math.min(5, gemsBefore + 1)
      const points = player.points + awarded
      const latest = `${codeRef} resolved · +${awarded}`
      const { error } = await sb.from('players').update({ points, gems, latest }).eq('id', player.id)
      if (error) throw error
      await log(player.id, codeRef, awarded, multiplier, false)
      return {
        awarded, multiplier,
        gemUnlocked: gems > gemsBefore,
        clueUnlocked: gems >= 5 && gemsBefore < 5,
      }
    },

    async superWinner(): Promise<{ name: string; at: number } | null> {
      const cfg = await this.getConfig()
      if (!cfg.superWinner || !cfg.superWonAt) return null
      const p = await this.getPlayerById(cfg.superWinner)
      return p ? { name: p.name, at: cfg.superWonAt } : null
    },

    async clearSuperWinner(): Promise<void> {
      const { error } = await sb.from('game_config')
        .update({ super_winner: null, super_won_at: null }).eq('id', 1)
      if (error) throw error
    },
  }
}
