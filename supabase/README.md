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

## 3) Emisión segura de certificados (producción)
No insertes certificados desde el cliente con la anon key. Usa la Edge Function endurecida incluida:
- Código: [`functions/issue-certificate/index.ts`](./functions/issue-certificate/index.ts)
- Despliegue (con Supabase CLI): `supabase functions deploy issue-certificate`
- La función **exige JWT válido** (usuario autenticado), **valida elegibilidad en servidor** antes de emitir y **no permite emisión abierta**.

### Variables de entorno (Edge Function)
Configúralas como secretos/variables de la función (además de `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, disponibles por defecto):
- `ALLOWED_ORIGINS` (recomendado): orígenes permitidos para CORS, separados por coma. Ej: `https://tu-dominio.com,https://www.tu-dominio.com` (o `PUBLIC_APP_URL`). Si no se define, se rechazan peticiones cross-origin con `Origin`.
- `CERT_REQUIRED_SESSIONS` (requerido para emitir): número mínimo de sesiones completadas (según `user_progress`) para ser elegible.
- `CERT_REQUIRED_EXERCISES` (requerido para emitir): número mínimo de ejercicios completados para ser elegible.

> Si `CERT_REQUIRED_SESSIONS/EXERCISES` no están configurados, la función responde `503 issuance_not_configured` (fail-closed) para evitar emisión sin política de elegibilidad.

### Cliente
- Opcional: define `PUBLIC_CERTIFICATE_ISSUE_URL` en `.env` para que la app pueda llamar al endpoint de emisión.
- El cliente debe enviar la sesión (`Authorization: Bearer <access_token>`); la app lo hace automáticamente cuando el usuario está autenticado.

## 4) Verificación en la app
- Página: `/verify` (acepta `?id=XXXXXX`).
- Cliente: `src/lib/supabase.ts`, `src/lib/certificates.ts`, `src/components/VerifyCertificate.tsx`.

> Tras conectar las claves, instala dependencias (`npm install` / `pnpm install`) y ejecuta la app. La verificación consultará la RPC y mostrará el certificado si es válido.
