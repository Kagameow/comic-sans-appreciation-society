#!/usr/bin/env node
// Deletes Supabase Auth users whose email is NOT under @visma.com.
//
// Run from product/:
//   pnpm cleanup:non-visma-users          # dry run — lists who would be deleted
//   pnpm cleanup:non-visma-users --apply  # actually deletes
//
// Why: the prototype seeded the auth table with throwaway sign-ups during the
// Lovable port. Now that Visma Connect is the only sign-in path, anyone not
// on @visma.com is residue and shouldn't appear on the leaderboard.
//
// Identities aren't touched separately — Supabase cascade-deletes them when
// the parent user goes. Linked players in the `players` table are removed
// by the schema's `on delete cascade` chain via code_redemptions.

const SUPABASE_URL = (process.env.NUXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const SECRET_KEY = process.env.NUXT_SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SECRET_KEY) {
  console.error('Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_SUPABASE_SECRET_KEY')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')
const ALLOWED_DOMAIN = '@visma.com'

const headers = {
  Authorization: `Bearer ${SECRET_KEY}`,
  apikey: SECRET_KEY,
  'Content-Type': 'application/json',
}

async function listAllUsers() {
  const users = []
  let page = 1
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200&page=${page}`, { headers })
    if (!res.ok) throw new Error(`list users failed: HTTP ${res.status} ${await res.text()}`)
    const body = await res.json()
    const batch = body.users ?? []
    users.push(...batch)
    if (batch.length < 200) break
    page += 1
  }
  return users
}

async function deleteUser(id) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error(`delete ${id} failed: HTTP ${res.status} ${await res.text()}`)
}

const users = await listAllUsers()
const keep = users.filter(u => (u.email ?? '').toLowerCase().endsWith(ALLOWED_DOMAIN))
const drop = users.filter(u => !(u.email ?? '').toLowerCase().endsWith(ALLOWED_DOMAIN))

console.log(`Found ${users.length} users · keep ${keep.length} · drop ${drop.length}`)
console.log()
console.log('KEEP (@visma.com):')
for (const u of keep) console.log(`  ✓ ${u.email}`)
console.log()
console.log('DROP (everyone else):')
for (const u of drop) console.log(`  ✗ ${u.email ?? '(no email)'}  id=${u.id}`)

if (!APPLY) {
  console.log()
  console.log('Dry run. Re-run with --apply to actually delete.')
  process.exit(0)
}

console.log()
console.log('Deleting…')
let ok = 0, fail = 0
for (const u of drop) {
  try {
    await deleteUser(u.id)
    console.log(`  ✓ deleted ${u.email ?? u.id}`)
    ok += 1
  } catch (e) {
    console.error(`  ✗ ${u.email ?? u.id}: ${e.message}`)
    fail += 1
  }
}
console.log()
console.log(`Auth users: deleted ${ok}/${drop.length} · failed ${fail}.`)

// Also delete orphan player rows — seed/prototype leftovers with no Supabase
// user. Real player rows are linked via `user_id` and survive.
const playersRes = await fetch(
  `${SUPABASE_URL}/rest/v1/players?user_id=is.null`,
  { method: 'DELETE', headers: { ...headers, Prefer: 'return=representation' } },
)
if (!playersRes.ok) {
  console.error(`  ✗ deleting orphan players failed: HTTP ${playersRes.status} ${await playersRes.text()}`)
} else {
  const orphans = await playersRes.json()
  console.log(`Players: deleted ${orphans.length} orphan row(s) (no linked Supabase user).`)
}
