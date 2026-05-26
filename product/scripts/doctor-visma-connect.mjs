#!/usr/bin/env node
// Visma Connect doctor: checks env, Supabase provider config, Visma discovery,
// and probes Visma's token endpoint with your client_id/secret to localise
// where token exchange is failing. With --fix, applies safe corrections.
//
// Run from product/:
//   pnpm doctor:visma-connect          # diagnose only
//   pnpm doctor:visma-connect --fix    # diagnose AND apply fixes
//
// Scope: anything fixable via the GoTrue admin API (custom OIDC provider
// CRUD: enable/disable, PKCE, scopes, client creds, issuer). Anything that
// needs the Management API PAT (Site URL, Additional Redirect URLs, JWT
// settings) is NOT touched — those are reported as manual follow-ups.

import { createClient } from '@supabase/supabase-js'

const PROVIDER_IDENTIFIER = 'custom:visma-connect'
const PROVIDER_NAME = 'Visma Connect'
const EXPECTED_ISSUER = 'https://connect.visma.com'
const EXPECTED_SCOPES = ['openid', 'email', 'profile']

const FIX_MODE = process.argv.includes('--fix')

const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`)
const warn = (msg) => console.log(`  \x1b[33m⚠\x1b[0m ${msg}`)
const bad = (msg) => console.log(`  \x1b[31m✗\x1b[0m ${msg}`)
const step = (n, t) => console.log(`\n\x1b[1m=== STEP ${n}: ${t} ===\x1b[0m`)
const section = (t) => console.log(`\n\x1b[1m=== ${t} ===\x1b[0m`)

// ───────────────────────────────────────────────────────────────────────────
step(1, 'Environment')

const required = [
  'NUXT_PUBLIC_SUPABASE_URL',
  'NUXT_SUPABASE_SECRET_KEY',
  'NUXT_VISMA_CONNECT_CLIENT_ID',
  'NUXT_VISMA_CONNECT_CLIENT_SECRET',
]
const missing = required.filter(k => !process.env[k])
if (missing.length) {
  for (const k of missing) bad(`Missing ${k}`)
  console.error('\nFill these in product/.env, then re-run.')
  process.exit(1)
}
for (const k of required) ok(k)

const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')
const SECRET_KEY = process.env.NUXT_SUPABASE_SECRET_KEY
const VISMA_CLIENT_ID = process.env.NUXT_VISMA_CONNECT_CLIENT_ID
const VISMA_CLIENT_SECRET = process.env.NUXT_VISMA_CONNECT_CLIENT_SECRET

// Sanity: catch the most common .env mistake — quotes captured as part of value
if (/^["']|["']$/.test(VISMA_CLIENT_SECRET)) {
  warn(`NUXT_VISMA_CONNECT_CLIENT_SECRET starts or ends with a quote character.`)
  warn(`  --env-file does NOT strip quotes. Remove them and re-run.`)
}
if (/\s$/.test(VISMA_CLIENT_SECRET) || /^\s/.test(VISMA_CLIENT_SECRET)) {
  warn(`NUXT_VISMA_CONNECT_CLIENT_SECRET has leading or trailing whitespace.`)
}

// ───────────────────────────────────────────────────────────────────────────
step(2, 'Supabase provider config')

const admin = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
}).auth.admin.customProviders

const issues = []
let provider
{
  const { data, error } = await admin.getProvider(PROVIDER_IDENTIFIER)
  if (error || !data) {
    bad(`Provider ${PROVIDER_IDENTIFIER} not found.`)
    issues.push({
      key: 'missing-provider',
      message: 'Provider does not exist',
      fix: async () => {
        const { error } = await admin.createProvider({
          provider_type: 'oidc',
          identifier: PROVIDER_IDENTIFIER,
          name: PROVIDER_NAME,
          client_id: VISMA_CLIENT_ID,
          client_secret: VISMA_CLIENT_SECRET,
          issuer: EXPECTED_ISSUER,
          scopes: EXPECTED_SCOPES,
          enabled: true,
        })
        if (error) throw new Error(error.message)
      },
    })
    provider = null
  } else {
    provider = data
    ok(`Provider ${PROVIDER_IDENTIFIER} exists`)
    if (!provider.enabled) {
      bad('Provider is DISABLED')
      issues.push({
        key: 'disabled',
        message: 'enabled=false',
        fix: () => admin.updateProvider(PROVIDER_IDENTIFIER, { enabled: true }),
      })
    } else {
      ok('enabled: true')
    }
    if (provider.issuer !== EXPECTED_ISSUER) {
      bad(`issuer mismatch: ${provider.issuer} (expected ${EXPECTED_ISSUER})`)
      issues.push({
        key: 'issuer',
        message: 'Wrong issuer',
        fix: () => admin.updateProvider(PROVIDER_IDENTIFIER, { issuer: EXPECTED_ISSUER }),
      })
    } else {
      ok(`issuer: ${provider.issuer}`)
    }
    const currentScopes = provider.scopes ?? []
    const missingScopes = EXPECTED_SCOPES.filter(s => !currentScopes.includes(s))
    if (missingScopes.length) {
      warn(`scopes missing: ${missingScopes.join(', ')} (have: ${currentScopes.join(', ') || '(none)'})`)
      issues.push({
        key: 'scopes',
        message: `Missing scopes ${missingScopes.join(',')}`,
        fix: () => admin.updateProvider(PROVIDER_IDENTIFIER, { scopes: EXPECTED_SCOPES }),
      })
    } else {
      ok(`scopes: ${currentScopes.join(', ')}`)
    }
    if (provider.client_id !== VISMA_CLIENT_ID) {
      warn(`client_id in Supabase (${provider.client_id}) differs from .env (${VISMA_CLIENT_ID})`)
      issues.push({
        key: 'client-id',
        message: 'client_id drift',
        fix: () => admin.updateProvider(PROVIDER_IDENTIFIER, { client_id: VISMA_CLIENT_ID }),
      })
    } else {
      ok(`client_id matches .env: ${provider.client_id}`)
    }
    console.log(`  · pkce_enabled: ${provider.pkce_enabled ?? '(default true)'}`)
  }
}

// ───────────────────────────────────────────────────────────────────────────
step(3, 'Visma Connect discovery')

let discovery
try {
  const res = await fetch(`${EXPECTED_ISSUER}/.well-known/openid-configuration`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  discovery = await res.json()
  ok(`Discovery doc reachable`)
  if (discovery.issuer === EXPECTED_ISSUER) {
    ok(`issuer matches: ${discovery.issuer}`)
  } else {
    warn(`discovery.issuer is ${discovery.issuer}, expected ${EXPECTED_ISSUER}`)
  }
  console.log(`  · token_endpoint            : ${discovery.token_endpoint}`)
  console.log(`  · token_endpoint_auth_methods: ${(discovery.token_endpoint_auth_methods_supported ?? []).join(', ')}`)
  console.log(`  · grant_types_supported     : ${(discovery.grant_types_supported ?? []).join(', ')}`)
  console.log(`  · code_challenge_methods    : ${(discovery.code_challenge_methods_supported ?? []).join(', ') || '(none — PKCE unsupported)'}`)
} catch (e) {
  bad(`Discovery fetch failed: ${e.message}`)
  process.exit(1)
}

// ───────────────────────────────────────────────────────────────────────────
step(4, 'Client credentials probe at Visma token endpoint')

// POST a syntactically-valid authorization_code request with a fake code.
// Visma's error code tells us whether it accepted the client_id/secret pair:
//   invalid_grant      → creds OK (dummy code rightly rejected)
//   invalid_client/401 → creds BAD
//   unauthorized_client→ grant type not enabled for this client
//
// Try BOTH client_secret_post (creds in body) AND client_secret_basic
// (creds in Authorization header). Some IdentityServer client configs only
// accept one. discovery says Visma supports both, but the per-client policy
// may be stricter.

async function probe(authMethod) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'DOCTOR_PROBE_INTENTIONALLY_INVALID',
    redirect_uri: `${SUPABASE_URL}/auth/v1/callback`,
  })
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (authMethod === 'client_secret_basic') {
    const b64 = Buffer.from(`${VISMA_CLIENT_ID}:${VISMA_CLIENT_SECRET}`).toString('base64')
    headers.Authorization = `Basic ${b64}`
  } else {
    body.set('client_id', VISMA_CLIENT_ID)
    body.set('client_secret', VISMA_CLIENT_SECRET)
  }
  const res = await fetch(discovery.token_endpoint, { method: 'POST', headers, body })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

const basicProbe = await probe('client_secret_basic')
const postProbe = await probe('client_secret_post')
console.log(`  Basic auth: HTTP ${basicProbe.status}: ${JSON.stringify(basicProbe.json)}`)
console.log(`  Post  auth: HTTP ${postProbe.status}: ${JSON.stringify(postProbe.json)}`)

const probeJson =
  basicProbe.json?.error === 'invalid_grant' ? basicProbe.json :
  postProbe.json?.error === 'invalid_grant' ? postProbe.json :
  postProbe.json
const probeRes =
  basicProbe.json?.error === 'invalid_grant' ? basicProbe :
  postProbe.json?.error === 'invalid_grant' ? postProbe :
  postProbe

let probeVerdict
const errCode = probeJson?.error
if (errCode === 'invalid_grant') {
  ok('Visma ACCEPTED client_id + client_secret (dummy code rejected, as expected)')
  probeVerdict = 'creds-ok'
} else if (errCode === 'invalid_client' || probeRes.status === 401) {
  bad('Visma REJECTED the client credentials')
  probeVerdict = 'creds-bad'
} else if (errCode === 'unauthorized_client') {
  bad('Visma says authorization_code grant is not authorized for this client')
  probeVerdict = 'grant-not-allowed'
} else {
  warn(`Unexpected Visma response: ${errCode ?? '(no error code)'}`)
  probeVerdict = 'unknown'
}

// ───────────────────────────────────────────────────────────────────────────
section('Diagnosis')

if (probeVerdict === 'creds-bad') {
  console.log(`
  Visma is rejecting your client_id / client_secret pair. The token exchange
  cannot succeed until this is fixed.

  Things to verify in the Visma Developer Portal:
    · Client Id == "${VISMA_CLIENT_ID}" (exact match)
    · The client_secret value in product/.env matches what's shown for this app
    · No quotes or trailing whitespace in the .env value
    · If you recently rotated the secret in Visma, the old one is dead

  This is not auto-fixable — only you have the real secret. Update
  product/.env and re-run.
`)
} else if (probeVerdict === 'grant-not-allowed') {
  console.log(`
  Visma's app config doesn't have the authorization_code grant enabled.

  In the Visma Developer Portal, edit the "${VISMA_CLIENT_ID}" client and
  enable "authorization_code" under Grant Types. Save, then retry.

  Not auto-fixable from Supabase side.
`)
} else if (probeVerdict === 'creds-ok' && provider) {
  console.log(`
  Creds are good. Since the real sign-in still fails with
  "Unable to exchange external code", the most common remaining cause is
  PKCE: Supabase enables PKCE by default for custom OIDC providers, but
  some IdentityServer-based confidential clients (which Visma Connect is)
  refuse PKCE when a client_secret is also presented.

  The fix is to disable PKCE on the Supabase provider.
`)
  if (provider.pkce_enabled !== false) {
    issues.push({
      key: 'pkce',
      message: 'PKCE likely incompatible with this Visma client',
      fix: () => admin.updateProvider(PROVIDER_IDENTIFIER, { pkce_enabled: false }),
    })
  } else {
    ok('PKCE is already disabled.')
    console.log(`
  Other things to check if sign-in still fails:
    · Supabase Auth Logs (Dashboard → Logs → Auth Logs): the full Visma error
      is logged there with the actual reason.
    · Authentication → URL Configuration → Redirect URLs: must include
      http://localhost:3000/confirm (and your prod /confirm URL).
      These need the Dashboard or a Management API PAT — out of scope here.
`)
  }
}

// ───────────────────────────────────────────────────────────────────────────
section(`Issues found: ${issues.length}`)
if (issues.length === 0) {
  ok('Nothing actionable. Configuration matches expectations.')
  process.exit(0)
}
for (const i of issues) console.log(`  · [${i.key}] ${i.message}`)

if (!FIX_MODE) {
  console.log(`
  Re-run with --fix to apply the auto-fixable ones:
    pnpm doctor:visma-connect --fix
`)
  process.exit(0)
}

// ───────────────────────────────────────────────────────────────────────────
section('Applying fixes')
for (const i of issues) {
  process.stdout.write(`  → ${i.key} ... `)
  try {
    const r = await i.fix()
    if (r && r.error) throw new Error(r.error.message)
    console.log('\x1b[32mfixed\x1b[0m')
  } catch (e) {
    console.log(`\x1b[31mfailed: ${e.message}\x1b[0m`)
  }
}

// ───────────────────────────────────────────────────────────────────────────
section('Re-verification')
const { data: after } = await admin.getProvider(PROVIDER_IDENTIFIER)
if (!after) {
  bad('Provider still not found after fixes.')
  process.exit(1)
}
ok(`enabled       : ${after.enabled}`)
ok(`issuer        : ${after.issuer}`)
ok(`scopes        : ${(after.scopes ?? []).join(', ')}`)
ok(`pkce_enabled  : ${after.pkce_enabled}`)
ok(`client_id     : ${after.client_id}`)

console.log(`
Done. Try signing in again at http://localhost:3000/login.
If it still fails, check Supabase Auth Logs in the Dashboard — the full Visma
error (the part that gets truncated to "40AD" in the redirect URL) is logged
there verbatim.
`)
