import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Player } from '#shared/types/game'

/**
 * Resolves the request's Supabase session to a `Player` row, auto-creating one
 * on first sign-in. Returns null when no user is signed in — callers decide
 * whether that's an error (write endpoints) or a soft "no player" (state read).
 */
export async function currentPlayer(event: H3Event): Promise<Player | null> {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) return null
  return useRepo().ensurePlayerForUser({
    id: user.id,
    email: user.email,
    name: displayNameForUser(user),
    avatar: null,
  })
}

function displayNameForUser(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }): string {
  const full = user.user_metadata?.full_name
  if (typeof full === 'string' && full.trim()) return full.trim()
  const local = user.email?.split('@')[0]
  if (!local) return 'Anonymous'
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Same as currentPlayer but throws a 401 instead of returning null. Use for
 * write endpoints that should never accept an anonymous request.
 */
export async function requirePlayer(event: H3Event): Promise<Player> {
  const player = await currentPlayer(event)
  if (!player) throw createError({ statusCode: 401, message: 'sign in required' })
  return player
}
