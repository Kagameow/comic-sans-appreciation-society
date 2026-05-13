/**
 * Placeholder for the Supabase-backed implementation.
 *
 * When real creds are wired:
 *  1. Re-enable `@nuxtjs/supabase` in nuxt.config.ts (already configured).
 *  2. Replace `server/utils/repo.ts` with a Supabase-backed version of the
 *     same shape (or branch on env in `useRepo()`).
 *  3. Run `supabase/schema.sql` and `supabase/seed.sql` against the project.
 *
 * For the POC, server routes use the in-memory repo and the admin guard below
 * is permissive (no auth). Tighten this once auth is in place.
 */
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'

export function isAdminRequest(_event: H3Event): boolean {
  // TODO: gate on Supabase user email once auth is wired:
  //   const user = await serverSupabaseUser(event)
  //   return isAdminEmail(user?.email)
  return true
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const cfg = useRuntimeConfig()
  const list = String(cfg.adminEmails ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}
