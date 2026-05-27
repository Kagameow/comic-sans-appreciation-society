import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Player } from '#shared/types/game'

/**
 * Resolves the request's Supabase session to a `Player` row, auto-creating one
 * on first sign-in. Returns null when no user is signed in — callers decide
 * whether that's an error (write endpoints) or a soft "no player" (state read).
 *
 * We also treat a user object without `id` as anonymous. With the Visma Connect
 * OIDC provider it's possible to receive a partially-populated user (claims
 * not mapped to the Supabase-internal uuid) — passing `undefined` down to the
 * repo would serialize as the literal string `"undefined"` and crash a uuid
 * column on the player upsert with Postgres 22P02.
 */
export async function currentPlayer(event: H3Event): Promise<Player | null> {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user?.id) return null
  return useRepo(event).ensurePlayerForUser({
    id: user.id,
    email: user.email,
    name: displayNameForUser(user),
    avatar: null,
    avatarUrl: avatarUrlForUser(user),
  })
}

function avatarUrlForUser(user: { user_metadata?: Record<string, unknown> | null }): string | null {
  const url = user.user_metadata?.avatar_url
  return typeof url === 'string' && url.trim() ? url.trim() : null
}

function displayNameForUser(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }): string {
  const display = user.user_metadata?.display_name
  if (typeof display === 'string' && display.trim()) return display.trim()
  return user.email?.trim() || 'Anonymous'
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
