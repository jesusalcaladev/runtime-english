-- Migration: rename DevLingo -> RuntimeEnglish references
-- Run in the Supabase SQL Editor (or via Supabase CLI) against the project database.

begin;

-- Certificates: update the program value in existing rows
update public.certificates
set program = 'RuntimeEnglish'
where program = 'DevLingo';

-- Ensure the new default value on the column
alter table public.certificates
  alter column program set default 'RuntimeEnglish';

commit;

-- Notes:
-- - If other tables/columns contain the value 'DevLingo', update them similarly.
-- - Review/verify that the deployed Edge Function is the current version (issue-certificate)
--   that issues/verifies with program/name "RuntimeEnglish".
-- - If you change the repository/project name or URL, also update secrets, webhooks,
--   deploy integrations (Vercel/GitHub), and Auth configuration (redirect URLs
--   if they apply to the new app scheme: com.runtimeenglish.core://login-callback).
