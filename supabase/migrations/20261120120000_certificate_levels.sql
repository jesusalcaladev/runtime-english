-- Migration: certificados por nivel (A1-A2 → B1-B2 → C1-C2)
-- Run in the Supabase SQL Editor (or via Supabase CLI) against the project database.
-- Idempotente: se puede volver a ejecutar sin duplicar nada.

begin;

-- 1) Asegurar la columna de nivel y su valor por defecto.
alter table public.certificates
  add column if not exists level text not null default 'A1-A2';

alter table public.certificates
  alter column level set default 'A1-A2';

-- 2) Normalizar la etiqueta del antiguo certificado de curso completo ("A1 — B2").
update public.certificates
set level = 'A1-A2'
where level in ('A1 — B2', 'A1 - B2', 'A1-B2');

-- 3) RPC de verificación público: devuelve también el nivel del certificado.
--    Solo expone filas válidas; no permite listado público (RLS sigue activo).
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

commit;

-- Notas:
-- - Tras aplicar esta migración, redesplega `issue-certificate` con los secrets
--   CERT_REQUIRED_SESSIONS_A1_A2 / CERT_REQUIRED_EXERCISES_A1_A2 (16 / 109) y
--   CERT_REQUIRED_SESSIONS_B1_B2 / CERT_REQUIRED_EXERCISES_B1_B2 (33 / 222).
-- - Comprueba la verificación con: /verify.html?id=<CERTIFICATE_ID>
