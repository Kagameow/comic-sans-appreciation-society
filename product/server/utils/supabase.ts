import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

/**
 * Returns true if the request comes from an authenticated user whose email
 * is in ADMIN_EMAILS. Defense-in-depth complement to the client-side
 * `admin` middleware — the middleware is UX, this is the gate.
 *
 * Never use Supabase `user_metadata` for authorization: it's user-editable.
 * We rely on `user.email`, which Supabase asserts from the OAuth provider.
 */
export async function isAdminRequest(event: H3Event): Promise<boolean> {
  const user = await serverSupabaseUser(event).catch(() => null)
  return isAdminEmail(user?.email)
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
