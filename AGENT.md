# AGENT.md — RuntimeEnglish

Guía permanente para trabajar en este repositorio (`lear-english-for-dev`). Mantén este archivo actualizado cuando cambien la arquitectura, comandos, convenciones o el entorno de build.

## Resumen del proyecto

- **Nombre:** RuntimeEnglish (antes DevEng/DevEng Core). Al renombrar, **no modificar el logo/íconos** (p. ej. `public/favicon.svg`, assets de icono) salvo petición explícita.
- **Qué es:** App web (Astro estático, PWA-ready) y Android (Capacitor) para aprender inglés técnico para developers (A1–B2), con sesiones guiadas, ejercicios interactivos, progreso/logros en `localStorage`, slang, TTS y certificado.
- **Stack principal:** Astro 7 (static), Preact islands (`client:only="preact"`), Tailwind CSS 4 + daisyUI 5, Geist (sans/mono/pixel), Lucide, Capacitor 8.
- **Paquete/IDs:** npm `name: "runtimeenglish"`, Android `appId/namespace/package`: `com.runtimeenglish.core`, app name: `RuntimeEnglish`.
- **Actualizaciones Android (sin OTA):** la APK nativa puede consultar un manifiesto remoto (`app-update.json`) para detectar una nueva versión y mostrar un aviso con botón **Actualizar** (abre la descarga del APK para instalar manualmente). No es OTA de bundle web; los cambios requieren publicar un nuevo APK.

## Estructura relevante

- `src/pages/` — rutas Astro: `/` (dashboard), `/session/[slug]`, `/slang`, `/achievements`, `/settings`, `/certificate`, `/search`, `/practice`.
- `src/layouts/BaseLayout.astro` — shell global, carga de fuentes/estilos, preferencias (tema/TTS), `ClientRouter`, sidebar/topbar/toasts/aviso de actualización persistentes, integración Capacitor (back button, TTS delegado, OAuth callback).
- `src/components/` — islas Preact (`Dashboard.tsx`, `ExerciseRunner.tsx`, `SidebarNav.tsx`, `SearchView.tsx`, `PracticeView.tsx`, `OnboardingCard.tsx`, `SettingsPanel.tsx`, etc.), componentes Astro (`Topbar.astro`, `LessonBlocks.astro`) y `ui/`. Incluye `layout/AppUpdateBanner.tsx` para avisar nuevas versiones de APK en Android.
- `src/data/curriculum/` — módulos `m1.ts`…`m9.ts` y registro/helpers en `index.ts` (`MODULES`, `ALL_SESSIONS`, `getNavData`, etc.).
- `src/data/slang.ts` — deck de slang.
- `src/lib/` — tipos (`types.ts`), progreso/store (`progress.ts`, `useProgress.ts`), logros (`achievements.ts`), inmersión/i18n (`i18n.ts`), voz (`speech.ts`), toasts (`toast.ts`), actualización de APK (`appUpdate.ts`), etc.
- `src/styles/global.css` — Tailwind/daisyUI, temas `runtimeenglish` y `runtimeenglish-dark`, utilidades/estilos base.
- `public/` — `favicon.svg`, `manifest.webmanifest`, `sw.js`/SW custom, `app-update.json` (manifiesto de actualización para APK nativa). **No se versionan binarios APK** (`public/runtimeenglish.apk` y `public/*.apk` están ignorados).
- `src/lib/routes.ts` — helper `route()` para generar enlaces internos `.html` compatibles con Capacitor/APK.
- `android/` — proyecto nativo Capacitor; `dist/` — build web; `apks/` — APKs generadas localmente (ignoradas en git, excepto `.gitkeep`). Los APKs se distribuyen vía **GitHub Releases**.

## Comandos

Ejecutar desde la raíz del proyecto:

```bash
npm install
npm run dev            # servidor de desarrollo Astro
npm run build          # genera dist/
npm run preview        # sirve dist/
npm run check          # astro check (tipos/diagnósticos)

npm run android:sync   # build + cap sync android (actualiza assets/config en android/)
npm run android:open   # abre el proyecto en Android Studio
npm run android:apk    # android:sync + Gradle assembleDebug y copia APK a apks/
npm run android:apk:release
```

## Entorno local para compilar APK (esta máquina)

En este entorno se ubicaron herramientas ya instaladas:

- **JDK 21:** `~/jdks/jdk-21.0.13+9` (`$HOME/jdks/jdk-21.0.13+9/bin/java`)
- **Android SDK:** `~/android-sdk` (con `cmdline-tools`, `platform-tools`, `build-tools`)
- **Config Android:** `android/local.properties` → `sdk.dir=/home/jesusalcala/android-sdk`

Para compilar APK desde terminal:

```bash
export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
npm run android:apk
```

- APK debug generado/copiado en: `apks/RuntimeEnglish-v1.1.0-debug.apk` (nombre según variante/versionado de Gradle).
- Si Gradle falla por licencias/SDK faltante, instalar/aceptar componentes del SDK correspondiente; si falta Java, revisar `JAVA_HOME`.

## Arquitectura y comportamiento clave

### Navegación y fluidez
- `astro.config.mjs` tiene **prefetch** habilitado (`prefetchAll: true`, `defaultStrategy: "viewport"`) y `build.format: "file"` para generar páginas `.html` (p. ej. `slang.html`, `session/<slug>.html`).
- **Rutas internas (importante para APK):** Capacitor Android sirve rutas sin extensión como `index.html` cuando `server.html5mode` está activo (default), lo que hace que `ClientRouter`/`fetch` de `/slang` o `/session/...` reciba el dashboard. Por eso **todo enlace interno de página debe pasar por `route()`** (`src/lib/routes.ts`), que añade `.html` a rutas internas (respeta `/`, anclas, query y URLs externas). Nunca hardcodear rutas de página sin extensión (`/slang`, `/session/x`); usar `route("/slang")`, `route(\`/session/${slug}\`)`, etc. Assets con extensión (`/favicon.svg`, `/_astro/*`, `manifest.webmanifest`) no se modifican.
- `BaseLayout.astro` usa **`ClientRouter`** (`astro:transitions`) y `transition:persist` en sidebar/toasts para mantener el estado/UI del shell entre páginas (navegación fluida sin recarga completa, estilo app).
  - **Android/Capacitor:** el botón atrás se maneja con `@capacitor/app`. Evitar sobrescribir/stubear APIs de navegación o forzar `window.location` globalmente en nativo salvo diagnóstico, ya que puede romper el enrutado del cliente. Validar siempre en APK que los enlaces cambien de página.
- `public/sw.js` + registro en layout proveen cache/offline básico en **web** (network-first para HTML, cache-first para assets estáticos, cache `runtimeenglish-v2`, sin fallback de HTML al dashboard). En **nativo (Capacitor)** el layout desregistra SWs y limpia caches `runtimeenglish-*` para evitar servir HTML obsoleto; el APK ya entrega contenido local.

### Progreso, settings y migraciones
- Store en `src/lib/progress.ts`, persistido en `localStorage` con clave **`runtimeenglish_v2`**.
- **Migración:** si no existe `runtimeenglish_v2`, se importa desde la clave legacy **`deveng_core_v2`**. También se migran IDs legacy de slang (`m0-*` → `m7-*`) en registros de progreso.
- `ProgressSettings` incluye: `theme`, `immersion`, `ttsEnabled`, `ttsRate`, `name`, `onboarded`, `goal`.
- XP/reglas actuales (referencia): +10 XP por ejercicio correcto (primera vez), +40 XP por completar sesión, +5 XP al guardar slang (según implementación existente); logros pueden otorgar XP adicional.
- Flags dev/certificado: `runtimeenglish_dev` (compatibilidad con `deveng_dev`).

### Ejercicios y contenido
- Tipos de ejercicio: `choice`, `builder`, `write` (ver `src/lib/types.ts` y `ExerciseRunner.tsx`).
- El contenido vive en `src/data/curriculum/*.ts`; `getStaticPaths` y la navegación se derivan del currículo. Para añadir sesiones/módulos, seguir el patrón existente y registrar módulos en `MODULES`.
- Slang en `src/data/slang.ts`; bloques de lección soportan `slang` por IDs.

### Funcionalidades añadidas recientemente
- **Búsqueda** (`/search`): índice construido en build desde sesiones/bloques/ejercicios/slang.
- **Práctica rápida** (`/practice`): rondas mezcladas (reforzar/nuevos/mezcla) reutilizando `ExerciseRunner`.
- **Onboarding** en dashboard para usuarios no onboarded.
- **Insights** básicos en dashboard (p. ej. precisión/intentos, accesos rápidos).

### Voz (TTS)
- `src/lib/speech.ts`: usa TTS nativo en Capacitor/Android (`@capacitor-community/text-to-speech`) con fallback a Web Speech API; respeta `settings.ttsEnabled`, `ttsRate` y `ttsEngine` (`system`/`kokoro`). `data-tts` en `<html>` controla visibilidad de controles de voz.
- **Kokoro HQ (rendimiento):** la precarga automática del modelo en caché es diferida y conservadora. No se precarga al arranque en Android nativo solo por estar en caché; se prioriza la carga bajo demanda (Ajustes/uso explícito) para evitar picos de CPU/memoria al iniciar la app.

## Actualización de APK (sin OTA, recomendada para este proyecto)

Flujo simple implementado: la APK instalada (Android nativa) consulta un manifiesto JSON remoto, compara `versionCode` con la versión instalada y, si hay una nueva, muestra un banner con **Actualizar**.

### Archivos y configuración
- **Cliente:** `src/lib/appUpdate.ts` + `src/components/layout/AppUpdateBanner.tsx` (montado en `BaseLayout.astro`).
- **Manifiesto público:** `public/app-update.json` (versionado en git; debe apuntar al APK publicado).
- **Distribución de APK:** vía **GitHub Releases** (no se versionan APKs en git). El botón web "Descargar APK" usa la descarga del último release (`releases/latest/download/RuntimeEnglish.apk`) y `app-update.json` debe apuntar al asset de release de la versión correspondiente.
- **Versionado Android (fuente real instalada):** `android/app/build.gradle` → `defaultConfig.versionCode` y `defaultConfig.versionName`.
- **Variables de entorno (web/build):**
  - `PUBLIC_APP_UPDATE_URL` (recomendado): URL absoluta al manifiesto, ej. `https://raw.githubusercontent.com/jesusalcaladev/runtime-english/main/public/app-update.json` o la URL donde se hospede `app-update.json`.
  - `PUBLIC_APP_URL` (opcional): base del sitio para derivar `/app-update.json` si no se define `PUBLIC_APP_UPDATE_URL`.

### Cómo publicar una nueva actualización (APK)
1. **Incrementa versión Android** en `android/app/build.gradle`:
   - Sube `versionCode` (entero, obligatorio para detectar actualización).
   - Actualiza `versionName` (visible para el usuario, ej. `1.2.3`).
2. **Genera el APK** (artefacto local, no versionado en git):
   ```bash
   export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
   export ANDROID_HOME="$HOME/android-sdk"
   export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
   npm run android:apk
   ```
   - Copia APKs a `apks/` (ignorados en git).
3. **Publica el APK en GitHub Releases** (requiere `gh` autenticado):
   - Crea/publica un release con tag de versión (ej. `v1.2.3`) y sube el asset como `RuntimeEnglish.apk` para que funcione el enlace estable `/releases/latest/download/RuntimeEnglish.apk`.
   - Ejemplo: `gh release create v1.2.3 apks/RuntimeEnglish-v1.2.3-debug.apk#RuntimeEnglish.apk --title "RuntimeEnglish v1.2.3" --notes "..."`
4. **Actualiza el manifiesto** `public/app-update.json` y súbelo al repo/hosting configurado en `PUBLIC_APP_UPDATE_URL`:
   - `versionCode`/`versionName`: deben coincidir con el APK publicado.
   - `apkUrl`: URL del asset de release de esa versión (ej. `https://github.com/jesusalcaladev/runtime-english/releases/download/v1.2.3/RuntimeEnglish.apk`).
   - `title`/`notes`: texto del aviso.
5. **Comportamiento en la app instalada:**
   - La APK consulta `PUBLIC_APP_UPDATE_URL`, compara `versionCode` y muestra **Actualizar** si hay una versión nueva.
   - Al pulsar **Actualizar**, se abre la descarga del APK (asset de release); el usuario debe instalarlo manualmente.
   - Cambios nativos siempre requieren nuevo APK; este flujo no reemplaza OTA de código nativo.

## Convenciones de trabajo

- **No tocar el logo** ni assets de marca gráfica salvo solicitud explícita.
- Mantener consistencia con el estilo, nombres y patrones existentes (Astro + Preact islands, Tailwind/daisyUI, tokens/temas `runtimeenglish`).
- Preferir herramientas dedicadas de edición/lectura/búsqueda sobre comandos de shell cuando sea posible; cambios dirigidos y coherentes.
- Al renombrar identificadores visibles o internos, actualizar de forma consistente (UI, config, temas, storage keys/eventos, Android) y considerar migraciones para no perder datos de usuario.
- Verificar con `npm run check` y `npm run build` tras cambios relevantes; sincronizar Android (`npm run android:sync` o `npm run android:apk`) cuando el cambio deba reflejarse en la app nativa.
- `android/app/build/`, `dist/`, `node_modules/`, `apks/*.apk` y artefactos generados no deben editarse manualmente salvo necesidad específica; regenerarlos desde las fuentes/scripts.

## Pendientes conocidos / ideas futuras

- Repaso espaciado (SRS) real, listening con audio, speaking/reconocimiento y feedback de pronunciación.
- Sincronización en la nube/cuentas, notificaciones locales programadas en Android.
- Más tipos de ejercicios, más contenido/rutas por rol, búsqueda/filtrado más avanzado.
- PWA/offline más robusto y pruebas E2E/CI.
- README y otros documentos pueden requerir actualización si se agregan flujos o dependencias nuevas.
