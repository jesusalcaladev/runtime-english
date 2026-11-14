# Supabase (Certificate Verification)

## 1) Create a project and get your keys
1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
3. Create your `.env` file from `.env.example` and paste the keys.

## 2) Create the table and verification RPC
1. Open the **SQL Editor** in Supabase.
2. Run the contents of [`setup.sql`](./setup.sql).

This creates:
- `public.certificates` table
- RLS enabled (no public listing of the table)
- `public.verify_certificate(cert_id)` RPC function (the only public read access, by ID)

## 3) Secure certificate issuance (production)
Do not insert certificates from the client using the anon key. Use the hardened Edge Function included in this repo:
- Code: [`functions/issue-certificate/index.ts`](./functions/issue-certificate/index.ts)
- Deploy (with Supabase CLI): `supabase functions deploy issue-certificate`
- The function **requires a valid JWT** (authenticated user), **validates eligibility on the server** before issuing, and **does not allow open issuance**.

### Environment variables (Edge Function)
Configure these as function secrets/variables (in addition to `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY`, which are available by default):
- `ALLOWED_ORIGINS` (recommended): comma-separated list of origins allowed for CORS. Example: `https://your-domain.com,https://www.your-domain.com` (or `PUBLIC_APP_URL`). If not set, cross-origin requests with an `Origin` header are rejected.
- `CERT_REQUIRED_SESSIONS` (required to issue): minimum number of completed sessions (based on `user_progress`) to be eligible.
- `CERT_REQUIRED_EXERCISES` (required to issue): minimum number of completed exercises to be eligible.

> If `CERT_REQUIRED_SESSIONS`/`CERT_REQUIRED_EXERCISES` are not configured, the function responds with `503 issuance_not_configured` (fail-closed) to prevent issuance without an eligibility policy.

### Client
- Optional: define `PUBLIC_CERTIFICATE_ISSUE_URL` in `.env` so the app can call the issuance endpoint.
- The client must send the session (`Authorization: Bearer <access_token>`); the app does this automatically when the user is authenticated.

## 4) Verification in the app
- Page: `/verify` (accepts `?id=XXXXXX`).
- Client: `src/lib/supabase.ts`, `src/lib/certificates.ts`, `src/components/VerifyCertificate.tsx`.

> After configuring the keys, install dependencies (`npm install` / `pnpm install`) and run the app. Verification will query the RPC and display the certificate if it is valid.
