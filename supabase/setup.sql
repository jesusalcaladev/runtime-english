-- DevLingo — Configuración completa de Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- Incluye: certificados (verificación pública por ID, emisión vinculada a cuenta) y progreso de usuario (auth + sync).

-- ============================================================
-- A) CERTIFICADOS (verificación pública)
-- ============================================================

-- 1) Tabla de certificados
create table if not exists public.certificates (
  id text primary key,                         -- código del certificado (ej. EE3DEL)
  name text not null,                          -- nombre del titular
  issued_at timestamptz not null default now(),-- fecha de emisión
  completion_date text,                        -- fecha legible de finalización
  program text not null default 'DevLingo',
  level text not null default 'A1 — B2',
  status text not null default 'valid',        -- valid | revoked
  user_id uuid references auth.users(id) on delete set null,
  issued_by text not null default 'system',    -- system | user
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Columnas nuevas si ya existía la tabla
alter table public.certificates add column if not exists completion_date text;
alter table public.certificates add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.certificates add column if not exists issued_by text not null default 'system';
alter table public.certificates add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.certificates add column if not exists updated_at timestamptz not null default now();

create index if not exists certificates_user_id_idx on public.certificates(user_id);

-- Normaliza el id a mayúsculas
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

-- updated_at automático
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

-- 2) Seguridad (RLS)
alter table public.certificates enable row level security;

-- No exponer listado público. La verificación se hace vía RPC verify_certificate.
-- Permitir al usuario autenticado ver su(s) propio(s) certificado(s) (opcional, útil para UI)
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

-- 3) RPC pública de verificación: devuelve solo el certificado solicitado por id
-- (mantiene firma original para compatibilidad; incluye user_id como señal de emisión vinculada cuando existe)
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
  select c.id, c.name, c.issued_at, c.program, c.level, c.status, c.user_id, c.completion_date
  from public.certificates c
  where c.id = upper(trim(cert_id))
    and c.status = 'valid'
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- ============================================================
-- B) PROGRESO DE USUARIO (login Google/GitHub + sincronización)
-- Diseño eficiente: 1 fila por usuario, estado compacto en JSONB.
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

-- Cada usuario solo puede leer/escribir su propio progreso
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
-- C) CONFIGURACIÓN EN DASHBOARD (manual, no SQL)
-- ============================================================
-- 1. Authentication → Providers: habilita Google y GitHub y pega sus Client ID/Secret.
-- 2. Authentication → URL Configuration:
--    - Site URL: URL de tu app (ej. https://tudominio.com o http://localhost:4321)
--    - Redirect URLs: añade las URLs donde corre la app.
-- 3. Edge Function issue-certificate: despliega con `supabase functions deploy issue-certificate`.
--    - Si el cliente envía Authorization Bearer (sesión), el certificado se vincula al usuario (user_id).
--    - Para producción se recomienda exigir JWT y validar elegibilidad en servidor.
