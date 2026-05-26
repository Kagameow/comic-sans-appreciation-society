# Visma Connect (OIDC) — setup steps

One-time setup to make `https://eggnvwfkadyjsyicofzr.supabase.co` accept sign-ins from any Visma Google Workspace account via Visma Connect.

Code work is already done on branch `feat/visma-connect-oidc`. These are the manual steps to complete the wiring.

## 1. Fix the redirect URIs in the Visma Developer Portal

Open the `comic-sans-appreciation` app config in Visma Connect.

**Redirect URIs** — add this exact URL:

```
https://eggnvwfkadyjsyicofzr.supabase.co/auth/v1/callback
```

The existing `http://localhost:3000/` and `https://comic-sans-appreciation-society.vercel.app/` entries are app URLs, not OIDC callback URLs — they belong in Supabase's allowlist (step 5), not here. You can leave them or remove them; they're harmless in Visma but unused for this flow.

**Grant Types** — your screenshot showed this field blank. Enable `authorization_code`.

**Identity Scopes** — already set to `openid email profile`. Leave as-is.

Grab the **client secret** for the app — you'll need it in step 3.

## 2. Get the Supabase secret key

In Supabase Studio:

`Project Settings` → `API` → **secret key** (replaces the deprecated service_role). Copy.

## 3. Populate `product/.env`

Add these lines to `product/.env` (the file already has `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` / `ADMIN_EMAILS`):

```env
NUXT_SUPABASE_SECRET_KEY=<from step 2>
NUXT_VISMA_CONNECT_CLIENT_ID=comic-sans-appreciation
NUXT_VISMA_CONNECT_CLIENT_SECRET=<from step 1>
```

## 4. Register Visma Connect as an OIDC provider in Supabase

```bash
cd product
pnpm setup:visma-connect
```

This calls `supabase.auth.admin.customProviders.createProvider()` with:

- `provider_type: 'oidc'`
- `identifier: 'custom:visma-connect'`
- `issuer: 'https://connect.visma.com'` (Supabase auto-discovers all endpoints from `/.well-known/openid-configuration`)
- `scopes: ['openid', 'email', 'profile']`
- PKCE enabled (default)

Script is idempotent — re-running it updates the existing provider instead of failing.

## 5. Add app redirect URLs in the Supabase Dashboard

`Authentication` → `URL Configuration` → **Redirect URLs**, add:

```
http://localhost:3000/confirm
https://comic-sans-appreciation-society.vercel.app/confirm
```

Optionally set **Site URL** to `https://comic-sans-appreciation-society.vercel.app`.

`/confirm` is the post-OAuth landing page (already in the code) — it reads the redirect cookie and bounces the user to their original destination.

## 6. Verify

```bash
cd product
pnpm dev
```

Visit `http://localhost:3000/login`, click **Sign in with Visma**. Flow:

```
/login
  → connect.visma.com  (you authenticate with your Visma account)
  → eggnvwfkadyjsyicofzr.supabase.co/auth/v1/callback  (Supabase exchanges code for session)
  → /confirm  (session cookie set, redirect cookie consumed)
  → original destination (default: /)
```

## Heads-ups

- **Identity linking** — first Visma sign-in with `tom.van.veen@visma.com` should link to your existing email/password Supabase user (same email). The `ADMIN_EMAILS` check is email-keyed, so admin still works either way.
- **Lockout risk** — this PR removes email/password sign-in. Test the full flow on the branch (or in a Vercel preview deploy) before merging. While `main` still has email/password, you have a fallback.
- **COOP** — Visma's `Cross-Origin-Opener-Policy: same-origin` only affects popup/`window.open` flows. The login page does a full-page redirect, so it's unaffected.
- **Re-running the script** — safe. `getProvider` then `update` or `create`. Use it to rotate the client secret too.

## Rollback

If something breaks:

```bash
git checkout main  # email/password login still works here
```

To remove the provider from Supabase, either delete via the Dashboard (`Authentication` → `Providers` → ⋮ on `custom:visma-connect`) or programmatically:

```js
await supabase.auth.admin.customProviders.deleteProvider('custom:visma-connect')
```
