-- Migración: renombrar referencias de DevLingo -> RuntimeEnglish
-- Ejecutar en el SQL Editor de Supabase (o vía Supabase CLI) sobre la base de datos del proyecto.

begin;

-- Certificados: actualizar programa en filas existentes
update public.certificates
set program = 'RuntimeEnglish'
where program = 'DevLingo';

-- Asegurar el valor por defecto nuevo en la columna
alter table public.certificates
  alter column program set default 'RuntimeEnglish';

commit;

-- Notas:
-- - Si existen otras tablas/columnas con el valor 'DevLingo', actualízalas de forma similar.
-- - Revisa/verifica que la Edge Function desplegada sea la versión actual (issue-certificate)
--   que emite/verifica con program/name "RuntimeEnglish".
-- - Si cambias el nombre/URL del repositorio o del proyecto, actualiza también los secretos,
--   webhooks, integraciones de deploy (Vercel/GitHub) y la configuración de Auth (redirect URLs
--   si aplica al nuevo esquema de app: com.runtimeenglish.core://login-callback).