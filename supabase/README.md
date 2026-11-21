# Supabase Operations (Auth, Sync, Certificates)

This folder contains the database schema, migrations, and Edge Function used by RuntimeEnglish for:
- **Public certificate verification** (`verify_certificate` RPC + `/verify` page)
- **User progress sync** (`user_progress` table, RLS per authenticated user)
- **Secure certificate issuance** (`issue-certificate` Edge Function, server-side eligibility)

## Contents

- [`setup.sql`](./setup.sql): full schema/setup script (certificates + `user_progress` + policies/functions). Suitable for fresh environments or to reconcile schema manually in SQL Editor.
- [`migrations/`](./migrations): incremental SQL migrations tracked in repo (apply in order for existing environments).
- [`functions/issue-certificate/index.ts`](./functions/issue-certificate/index.ts): hardened certificate issuance function (JWT required, CORS restrictions, server-side eligibility, fail-closed config).

## 1) Prerequisites

- A Supabase project: https://supabase.com/dashboard
- Project API values (Project Settings → API):
  - **Project URL** → `PUBLIC_SUPABASE_URL`
  - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
- (Recommended for ops) Supabase CLI installed and authenticated (`supabase login`) and linked to your project (`supabase link --project-ref <ref>`) when deploying functions/applying migrations via CLI.

## 2) Client environment variables (app)

Copy `.env.example` to `.env` and configure:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_CERTIFICATE_ISSUE_URL` (optional but required for in-app issuance flow; e.g. `https://<project-ref>.supabase.co/functions/v1/issue-certificate`)

After changing env vars, restart/rebuild the app as needed.

## 3) Database schema and migrations

### Fresh project (recommended quick setup)
1. Open Supabase **SQL Editor**.
2. Run [`setup.sql`](./setup.sql).

This creates/ensures:
- `public.certificates` (+ RLS, normalized IDs, `updated_at` trigger, `verify_certificate` RPC, select-own policy)
- `public.user_progress` (+ RLS policies for authenticated owner access, `updated_at` trigger, `schema_version`)
- Useful comments for dashboard-side Auth configuration

### Existing project (incremental updates)
- Review and apply SQL files in [`migrations/`](./migrations) in filename/order (e.g. via SQL Editor or your migration workflow).
- Re-run or compare against [`setup.sql`](./setup.sql) when needed to ensure required objects/policies/functions exist.
- Example included: [`migrations/20261114103000_rename_devlingo_to_runtimeenglish.sql`](./migrations/20261114103000_rename_devlingo_to_runtimeenglish.sql)

> Keep schema changes in sync with app expectations (certificate verification fields, `user_progress` structure, and issuance eligibility reads).

## 4) Auth configuration (Supabase Dashboard)

Required for login/sync and certificate issuance (JWT-based):

1. **Authentication → Providers**
   - Enable and configure providers used by the app (e.g. Google/GitHub) with their client credentials.
2. **Authentication → URL Configuration**
   - Set **Site URL** to your app URL (local/dev/prod as appropriate).
   - Add **Redirect URLs** for environments where the app runs.
   - For native Android auth callback, include the app scheme redirect if used: `com.runtimeenglish.core://login-callback` (and keep it aligned with app config).
3. Verify a user can sign in and receive a valid session/JWT in the app before testing issuance.

## 5) Deploy certificate issuance Edge Function

The app must **not** issue certificates directly from the client with the anon key. Use the hardened Edge Function:

- Source: [`functions/issue-certificate/index.ts`](./functions/issue-certificate/index.ts)
- Deploy (Supabase CLI): `supabase functions deploy issue-certificate`
- Endpoint format: `https://<project-ref>.supabase.co/functions/v1/issue-certificate` (set as `PUBLIC_CERTIFICATE_ISSUE_URL`)

Behavior (important):
- Requires `Authorization: Bearer <user_jwt>`
- Restricts CORS by allowed origins
- Validates eligibility server-side from `user_progress` before new issuance
- **Fail-closed:** returns `503 issuance_not_configured` if the eligibility env vars for the requested level are missing
- Reuses/links existing certificate records safely; rejects conflicting ownership

## 6) Edge Function secrets/variables (required/recommended)

Configure these for `issue-certificate` (Dashboard or CLI secrets), in addition to Supabase-provided runtime vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`):

| Variable | Required | Purpose | Notes |
| --- | --- | --- | --- |
| `ALLOWED_ORIGINS` | Recommended (effectively required for browser clients) | CORS allowlist | Comma-separated origins (no trailing slash issues handled), e.g. `https://yourdomain.com,http://localhost:4321`. If unset, cross-origin requests with `Origin` are rejected. |
| `CERT_REQUIRED_SESSIONS` | Fallback | Eligibility threshold | Minimum completed sessions from `user_progress` (`cs`/`completedSessions`). Used when no level-specific threshold is configured. |
| `CERT_REQUIRED_EXERCISES` | Fallback | Eligibility threshold | Minimum completed exercises from `user_progress` (`ce`/`completedExercises`). Used when no level-specific threshold is configured. |
| `CERT_REQUIRED_SESSIONS_A1_A2` | **Required for A1-A2** | Per-level threshold | Currently **16** sessions. |
| `CERT_REQUIRED_EXERCISES_A1_A2` | **Required for A1-A2** | Per-level threshold | Currently **109** exercises. |
| `CERT_REQUIRED_SESSIONS_B1_B2` | **Required for B1-B2** | Per-level threshold | Currently **33** sessions (plus the A1-A2 threshold, progressive unlock). |
| `CERT_REQUIRED_EXERCISES_B1_B2` | **Required for B1-B2** | Per-level threshold | Currently **222** exercises (plus the A1-A2 threshold, progressive unlock). |
| `CERT_REQUIRED_SESSIONS_C1_C2` | **Required for C1-C2** | Per-level threshold | Currently **12** sessions (plus the B1-B2 threshold, progressive unlock). |
| `CERT_REQUIRED_EXERCISES_C1_C2` | **Required for C1-C2** | Per-level threshold | Currently **60** exercises (plus the B1-B2 threshold, progressive unlock). |

> Issuance is denied with `503 issuance_not_configured` if the thresholds for the requested level (or their global fallback) are missing/invalid. New certificate IDs must end with the level suffix (`-A1A2`, `-B1B2`, `-C1C2`), otherwise the function returns `400 invalid_id_for_level`.

Example (CLI):

```bash
supabase secrets set \
  ALLOWED_ORIGINS="https://yourdomain.com,http://localhost:4321" \
  CERT_REQUIRED_SESSIONS_A1_A2="16" \
  CERT_REQUIRED_EXERCISES_A1_A2="109" \
  CERT_REQUIRED_SESSIONS_B1_B2="33" \
  CERT_REQUIRED_EXERCISES_B1_B2="222" \
  CERT_REQUIRED_SESSIONS_C1_C2="12" \
  CERT_REQUIRED_EXERCISES_C1_C2="60"
```

Redeploy/restart behavior is handled by Supabase when secrets change as applicable; if issues persist, redeploy the function.

## 7) Verification checklist (ops)

### Database / RPC
- [ ] `certificates` and `user_progress` tables exist with expected columns/policies
- [ ] `certificates.level` exists (default `A1-A2`), legacy `A1 — B2` rows normalized to `A1-A2`
- [ ] `verify_certificate(cert_id)` RPC exists, returns `level`, and is executable by `anon, authenticated`
- [ ] A valid certificate row can be verified via RPC/app `/verify?id=<ID>` and shows `Nivel A1-A2` / `Nivel B1-B2`
- [ ] Revoked/unknown IDs return "no verificado" (RPC filters `status = 'valid'`)

### Auth / Sync
- [ ] User can sign in from the app (provider configured + redirect URLs correct)
- [ ] Progress sync reads/writes `user_progress` for the authenticated user (RLS allows own row only)

### Issuance (Edge Function)
- [ ] `issue-certificate` deployed and `PUBLIC_CERTIFICATE_ISSUE_URL` configured in app env
- [ ] Function secrets set: `ALLOWED_ORIGINS` plus `CERT_REQUIRED_{SESSIONS,EXERCISES}_A1_A2`, `..._B1_B2` and `..._C1_C2`
- [ ] Authenticated eligible user can issue A1-A2 (`-A1A2`), B1-B2 (`-B1B2`) and C1-C2 (`-C1C2`)
- [ ] Issuing B1-B2 without A1-A2 (or C1-C2 without B1-B2) returns `403 previous_level_incomplete`
- [ ] Unauthenticated request returns unauthorized; ineligible returns not eligible; missing thresholds returns `503 issuance_not_configured`; disallowed origin is rejected

## 8) Troubleshooting quick reference

- **`issuance_not_configured` (503):** set the per-level thresholds (`CERT_REQUIRED_SESSIONS_A1_A2`, `CERT_REQUIRED_EXERCISES_A1_A2`, etc.) or the global fallbacks.
- **`previous_level_incomplete` (403):** the previous level is not complete; B1-B2 needs A1-A2 and C1-C2 needs B1-B2.
- **`invalid_id_for_level` (400):** the ID must end with `-A1A2`, `-B1B2` or `-C1C2`.
- **`invalid_id_for_level` (400):** the certificate ID must end with `-A1A2` or `-B1B2`.
- **Verification shows the wrong level:** re-run `migrations/20261120120000_certificate_levels.sql` to normalize legacy `A1 — B2` rows.
- **CORS/origin rejected:** add the exact app origin(s) to `ALLOWED_ORIGINS` (including scheme/port for local dev).
- **`unauthorized`:** missing/invalid JWT; ensure user is signed in and app sends `Authorization: Bearer <token>` (handled by client when session exists).
- **`not_eligible`:** user progress in `user_progress` does not meet configured thresholds.
- **Verification works but issuance fails:** check function deploy status, `PUBLIC_CERTIFICATE_ISSUE_URL`, function logs, and secrets/env values.
- **Schema/RPC errors:** re-apply `setup.sql` (fresh) or relevant migrations and confirm function names/signatures match client expectations.

## Related app files

- `src/lib/supabase.ts` (client config)
- `src/lib/progressSync.ts` (sync logic, `user_progress`)
- `src/lib/certificates.ts` (verify/issue client calls)
- `src/components/verify/VerifyCertificate.tsx` / `/verify` page (verification UI)
