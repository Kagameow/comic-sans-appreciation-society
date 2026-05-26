#!/usr/bin/env node
// Deletes the custom:visma-connect OIDC provider from Supabase.
//
// Why we don't use supabase-js: as of @supabase/auth-js 2.106.2 the
// customProviders.{get,update,delete}Provider methods URL-encode the
// identifier path segment via encodeURIComponent, turning the required
// `custom:` prefix into `custom%3A`. The auth server then rejects the
// request with "identifier must start with 'custom:' prefix". This script
// hits the REST endpoint directly with the literal colon preserved.
//
// Run from product/:
//   pnpm delete:visma-connect
//
// After deletion, run `pnpm setup:visma-connect` to recreate from .env.

const PROVIDER_IDENTIFIER = 'custom:visma-connect'

const SUPABASE_URL = (process.env.NUXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const SECRET_KEY = process.env.NUXT_SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error('✗ Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_SUPABASE_SECRET_KEY')
  process.exit(1)
}

// Build URL without going through URL/URLSearchParams (both would percent-encode the colon).
const endpoint = `${SUPABASE_URL}/auth/v1/admin/custom-providers/${PROVIDER_IDENTIFIER}`

console.log(`DELETE ${endpoint}`)

const res = await fetch(endpoint, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${SECRET_KEY}`,
    apikey: SECRET_KEY,
  },
})

if (res.ok || res.status === 204) {
  console.log(`✓ Deleted ${PROVIDER_IDENTIFIER}.`)
  console.log(`Run \`pnpm setup:visma-connect\` to recreate it from .env.`)
  process.exit(0)
}

const text = await res.text()
console.error(`✗ Delete failed: HTTP ${res.status} ${res.statusText}`)
console.error(`  body: ${text}`)

// If the provider doesn't exist that's also fine for this script's purpose.
if (res.status === 404) {
  console.log(`(provider was already absent — treat as success)`)
  process.exit(0)
}
process.exit(1)
