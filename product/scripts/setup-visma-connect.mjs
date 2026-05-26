#!/usr/bin/env node
// Registers Visma Connect as a custom OIDC provider on this Supabase project.
//
// Run from product/:
//   pnpm setup:visma-connect
// or directly:
//   node --env-file=.env scripts/setup-visma-connect.mjs
//
// Required env vars (read from product/.env via Node's --env-file flag):
//   NUXT_PUBLIC_SUPABASE_URL          e.g. https://eggnvwfkadyjsyicofzr.supabase.co
//   NUXT_SUPABASE_SECRET_KEY          Project secret key (Studio → API → secret key)
//   NUXT_VISMA_CONNECT_CLIENT_ID      From Visma Developer Portal
//   NUXT_VISMA_CONNECT_CLIENT_SECRET  From Visma Developer Portal
//
// Idempotent: creates the provider if missing, updates it if already present.

import { createClient } from '@supabase/supabase-js'

const PROVIDER_IDENTIFIER = 'custom:visma-connect'
const PROVIDER_NAME = 'Visma Connect'
const ISSUER = 'https://connect.visma.com'
const SCOPES = ['openid', 'email', 'profile']

function requireEnv(key) {
  const value = process.env[key]
  if (!value) {
    console.error(`✗ Missing env var: ${key}`)
    console.error(`  Set it in product/.env (see product/.env.example)`)
    process.exit(1)
  }
  return value
}

const SUPABASE_URL = requireEnv('NUXT_PUBLIC_SUPABASE_URL')
const SECRET_KEY = requireEnv('NUXT_SUPABASE_SECRET_KEY')
const VISMA_CLIENT_ID = requireEnv('NUXT_VISMA_CONNECT_CLIENT_ID')
const VISMA_CLIENT_SECRET = requireEnv('NUXT_VISMA_CONNECT_CLIENT_SECRET')

const callbackUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/callback`

console.log('→ Supabase project:', SUPABASE_URL)
console.log('→ Visma issuer    :', ISSUER)
console.log('→ Provider id     :', PROVIDER_IDENTIFIER)
console.log('→ Required Visma redirect URI:')
console.log('    ', callbackUrl)
console.log('  (must be whitelisted in the Visma Developer Portal before sign-in works)')
console.log('')

const admin = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
}).auth.admin.customProviders

const { data: existing } = await admin.getProvider(PROVIDER_IDENTIFIER)

if (existing) {
  console.log(`↻ Provider ${PROVIDER_IDENTIFIER} already exists — updating in place.`)
  const { error } = await admin.updateProvider(PROVIDER_IDENTIFIER, {
    name: PROVIDER_NAME,
    client_id: VISMA_CLIENT_ID,
    client_secret: VISMA_CLIENT_SECRET,
    issuer: ISSUER,
    scopes: SCOPES,
    enabled: true,
  })
  if (error) {
    console.error('✗ Update failed:', error.message)
    process.exit(1)
  }
  console.log('✓ Updated.')
} else {
  const { error } = await admin.createProvider({
    provider_type: 'oidc',
    identifier: PROVIDER_IDENTIFIER,
    name: PROVIDER_NAME,
    client_id: VISMA_CLIENT_ID,
    client_secret: VISMA_CLIENT_SECRET,
    issuer: ISSUER,
    scopes: SCOPES,
    enabled: true,
  })
  if (error) {
    console.error('✗ Create failed:', error.message)
    if (error.message?.toLowerCase().includes('discovery')) {
      console.error('  Could not fetch / validate the OIDC discovery document at')
      console.error(`  ${ISSUER}/.well-known/openid-configuration`)
    }
    process.exit(1)
  }
  console.log(`✓ Created ${PROVIDER_IDENTIFIER}.`)
}

console.log('')
console.log('Sign in from the app with:')
console.log("  supabase.auth.signInWithOAuth({ provider: 'custom:visma-connect' })")
