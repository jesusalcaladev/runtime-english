# Supabase (verificación de certificados)

## 1) Crear proyecto y obtener claves
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → API** copia:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
3. Crea tu `.env` a partir de `.env.example` y pega las claves.

## 2) Crear tabla y RPC de verificación
1. Abre **SQL Editor** en Supabase.
2. Ejecuta el contenido de [`setup.sql`](./setup.sql).

Esto crea:
- tabla `public.certificates`
- RLS habilitado (sin listado público de la tabla)
- función RPC `public.verify_certificate(cert_id)` (la única lectura pública, por ID)

## 3) Emisión segura de certificados (recomendado)
No insertes certificados desde el cliente con la anon key. Usa la Edge Function incluida:
- Código: [`functions/issue-certificate/index.ts`](./functions/issue-certificate/index.ts)
- Despliegue (con Supabase CLI): `supabase functions deploy issue-certificate`
- La función usa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (disponibles en el entorno de funciones).
- Opcional: define `PUBLIC_CERTIFICATE_ISSUE_URL` en `.env` para que la app pueda llamar al endpoint de emisión.

## 4) Verificación en la app
- Página: `/verify` (acepta `?id=XXXXXX`).
- Cliente: `src/lib/supabase.ts`, `src/lib/certificates.ts`, `src/components/VerifyCertificate.tsx`.

> Tras conectar las claves, instala dependencias (`npm install` / `pnpm install`) y ejecuta la app. La verificación consultará la RPC y mostrará el certificado si es válido.
