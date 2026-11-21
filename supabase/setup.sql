-- RuntimeEnglish — Full Supabase setup
-- Run this script in your Supabase project's SQL Editor.
-- Includes: certificates (public verification by ID, account-linked issuance) and user progress (auth + sync).

-- ============================================================
-- A) CERTIFICATES (public verification)
-- ============================================================

-- 1) Certificates table
create table if not exists public.certificates (
  id text primary key,                         -- certificate code (e.g. EE3DEL)
  name text not null,                          -- holder name
  issued_at timestamptz not null default now(),-- issuance date
  completion_date text,                        -- human-readable completion date
  program text not null default 'RuntimeEnglish',
  level text not null default 'A1-A2', -- A1-A2 / B1-B2 / C1-C2
  status text not null default 'valid',        -- valid | revoked
  user_id uuid references auth.users(id) on delete set null,
  issued_by text not null default 'system',    -- system | user
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- New columns if the table already existed
alter table public.certificates add column if not exists completion_date text;
alter table public.certificates add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.certificates add column if not exists issued_by text not null default 'system';
alter table public.certificates add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.certificates add column if not exists updated_at timestamptz not null default now();

create index if not exists certificates_user_id_idx on public.certificates(user_id);

-- The old single certificate covered the whole course and was labelled "A1 — B2".
-- Per-level certificates use A1-A2 / B1-B2, so normalize legacy rows in place.
update public.certificates
set level = 'A1-A2'
where level in ('A1 — B2', 'A1 - B2', 'A1-B2');

-- Normalize the ID to uppercase
create or replace function public.normalize_certificate_id()
returns trigger language plpgsql as $$
begin
  new.id := upper(trim(new.id));
  return new;
end;
$$;

drop trigger if exists certificates_normalize_id on public.certificates;
create trigger certificates_normalize_id
before insert or update on public.certificates
for each row execute function public.normalize_certificate_id();

-- Automatic updated_at
create or replace function public.set_updated_at_generic()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists certificates_set_updated_at on public.certificates;
create trigger certificates_set_updated_at
before update on public.certificates
for each row execute function public.set_updated_at_generic();

-- 2) Security (RLS)
alter table public.certificates enable row level security;

-- Do not expose public listing. Verification is done via the verify_certificate RPC.
-- Allow authenticated users to view their own certificate(s) (optional, useful for the UI)
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

-- 3) Public verification RPC: returns only the certificate requested by ID
-- (keeps the original signature for compatibility; includes user_id as a signal of account-linked issuance when present)
drop function if exists public.verify_certificate(text);
create or replace function public.verify_certificate(cert_id text)
returns table (
  id text,
  name text,
  issued_at timestamptz,
  program text,
  level text,
  status text,
  user_id uuid,
  completion_date text
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.name, c.issued_at, c.program,
         case when c.level in ('A1 — B2', 'A1 - B2', 'A1-B2') then 'A1-A2' else c.level end as level,
         c.status, c.user_id, c.completion_date
  from public.certificates c
  where c.id = upper(trim(cert_id))
    and c.status = 'valid'
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ============================================================
-- B) USER PROGRESS (Google/GitHub login + sync)
-- Efficient design: 1 row per user, compact state in JSONB.
-- ============================================================

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  schema_version int not null default 3,
  updated_at timestamptz not null default now()
);

alter table public.user_progress add column if not exists schema_version int not null default 3;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_progress_set_updated_at on public.user_progress;
create trigger user_progress_set_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

alter table public.user_progress enable row level security;

-- Each user can only read/write their own progress
drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_progress_delete_own" on public.user_progress;
create policy "user_progress_delete_own"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- ============================================================
-- C) DASHBOARD CONFIGURATION (manual, not SQL)
-- ============================================================
-- 1. Authentication → Providers: enable Google and GitHub and paste their Client ID/Secret.
-- 2. Authentication → URL Configuration:
--    - Site URL: your app URL (e.g. https://yourdomain.com or http://localhost:4321)
--    - Redirect URLs: add the URLs where the app runs.
-- 3. issue-certificate Edge Function (hardened for production): deploy with `supabase functions deploy issue-certificate`.
--    - Requires an Authorization Bearer token (authenticated user JWT) and links the certificate to the user (user_id). Open issuance is not allowed.
--    - Validates eligibility on the server against public.user_progress before issuing, per level.
--    - Verify flow uses the public.certificates row via verify_certificate(cert_id); level is returned by the RPC.
--    - Configure in the function: ALLOWED_ORIGINS (CORS) and the per-level thresholds
--      CERT_REQUIRED_SESSIONS_A1_A2 / CERT_REQUIRED_EXERCISES_A1_A2 (16 / 109) and
--      CERT_REQUIRED_SESSIONS_B1_B2 / CERT_REQUIRED_EXERCISES_B1_B2 (33 / 222, plus A1-A2).
--      The old CERT_REQUIRED_SESSIONS / CERT_REQUIRED_EXERCISES remain as fallbacks.
