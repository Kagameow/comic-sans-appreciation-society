import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Returns true if the request comes from a Google-authenticated user whose
 * email is in ADMIN_EMAILS.
 *
 * POC fallback: if no user is signed in *and* no ADMIN_EMAILS list is
 * configured, allow the request — keeps the demo running without auth. The
 * moment ADMIN_EMAILS is set, this becomes a real gate.
 */
export async function isAdminRequest(event: H3Event): Promise<boolean> {
  const list = adminEmails()
  const user = await serverSupabaseUser(event).catch(() => null)

  if (list.length === 0 && !user) return true
  return isAdminEmail(user?.email)
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

function adminEmails(): string[] {
  return String(useRuntimeConfig().adminEmails ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}
