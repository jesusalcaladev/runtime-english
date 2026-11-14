# AGENT.md — DevLingo

Guía permanente para trabajar en este repositorio (`lear-english-for-dev`). Mantén este archivo actualizado cuando cambien la arquitectura, comandos, convenciones o el entorno de build.

## Resumen del proyecto

- **Nombre:** DevLingo (antes DevEng/DevEng Core). Al renombrar, **no modificar el logo/íconos** (p. ej. `public/favicon.svg`, assets de icono) salvo petición explícita.
- **Qué es:** App web (Astro estático, PWA-ready) y Android (Capacitor) para aprender inglés técnico para developers (A1–B2), con sesiones guiadas, ejercicios interactivos, progreso/logros en `localStorage`, slang, TTS y certificado.
- **Stack principal:** Astro 7 (static), Preact islands (`client:only="preact"`), Tailwind CSS 4 + daisyUI 5, Geist (sans/mono/pixel), Lucide, Capacitor 8.
- **Paquete/IDs:** npm `name: "devlingo"`, Android `appId/namespace/package`: `com.devlingo.core`, app name: `DevLingo`.

## Estructura relevante

- `src/pages/` — rutas Astro: `/` (dashboard), `/session/[slug]`, `/slang`, `/achievements`, `/settings`, `/certificate`, `/search`, `/practice`.
- `src/layouts/BaseLayout.astro` — shell global, carga de fuentes/estilos, preferencias (tema/TTS), `ClientRouter`, sidebar/topbar/toasts persistentes, integración Capacitor (back button, TTS delegado).
- `src/components/` — islas Preact (`Dashboard.tsx`, `ExerciseRunner.tsx`, `SidebarNav.tsx`, `SearchView.tsx`, `PracticeView.tsx`, `OnboardingCard.tsx`, `SettingsPanel.tsx`, etc.), componentes Astro (`Topbar.astro`, `LessonBlocks.astro`) y `ui/`.
- `src/data/curriculum/` — módulos `m1.ts`…`m8.ts` y registro/helpers en `index.ts` (`MODULES`, `ALL_SESSIONS`, `getNavData`, etc.).
- `src/data/slang.ts` — deck de slang.
- `src/lib/` — tipos (`types.ts`), progreso/store (`progress.ts`, `useProgress.ts`), logros (`achievements.ts`), inmersión/i18n (`i18n.ts`), voz (`speech.ts`), toasts (`toast.ts`).
- `src/styles/global.css` — Tailwind/daisyUI, temas `devlingo` y `devlingo-dark`, utilidades/estilos base.
- `public/` — `favicon.svg`, `manifest.webmanifest`, `sw.js` (service worker para web; desactivado/limpiado en APK nativo).
- `src/lib/routes.ts` — helper `route()` para generar enlaces internos `.html` compatibles con Capacitor/APK.
- `android/` — proyecto nativo Capacitor; `dist/` — build web; `apks/` — APKs generados.

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

- APK debug generado/copiado en: `apks/DevLingo-v1.1.0-debug.apk` (nombre según variante/versionado de Gradle).
- Si Gradle falla por licencias/SDK faltante, instalar/aceptar componentes del SDK correspondiente; si falta Java, revisar `JAVA_HOME`.

## Arquitectura y comportamiento clave

### Navegación y fluidez
- `astro.config.mjs` tiene **prefetch** habilitado (`prefetchAll: true`, `defaultStrategy: "viewport"`) y `build.format: "file"` para generar páginas `.html` (p. ej. `slang.html`, `session/<slug>.html`).
- **Rutas internas (importante para APK):** Capacitor Android sirve rutas sin extensión como `index.html` cuando `server.html5mode` está activo (default), lo que hace que `ClientRouter`/`fetch` de `/slang` o `/session/...` reciba el dashboard. Por eso **todo enlace interno de página debe pasar por `route()`** (`src/lib/routes.ts`), que añade `.html` a rutas internas (respeta `/`, anclas, query y URLs externas). Nunca hardcodear rutas de página sin extensión (`/slang`, `/session/x`); usar `route("/slang")`, `route(\`/session/${slug}\`)`, etc. Assets con extensión (`/favicon.svg`, `/_astro/*`, `manifest.webmanifest`) no se modifican.
- `BaseLayout.astro` usa **`ClientRouter`** (`astro:transitions`) y `transition:persist` en sidebar/toasts para mantener el estado/UI del shell entre páginas (navegación fluida sin recarga completa, estilo app).
  - **Android/Capacitor:** el botón atrás se maneja con `@capacitor/app`. Evitar sobrescribir/stubear APIs de navegación o forzar `window.location` globalmente en nativo salvo diagnóstico, ya que puede romper el enrutado del cliente. Validar siempre en APK que los enlaces cambien de página.
- `public/sw.js` + registro en layout proveen cache/offline básico en **web** (network-first para HTML, cache-first para assets estáticos, cache `devlingo-v2`, sin fallback de HTML al dashboard). En **nativo (Capacitor)** el layout desregistra SWs y limpia caches `devlingo-*` para evitar servir HTML obsoleto; el APK ya entrega contenido local.

### Progreso, settings y migraciones
- Store en `src/lib/progress.ts`, persistido en `localStorage` con clave **`devlingo_v2`**.
- **Migración:** si no existe `devlingo_v2`, se importa desde la clave legacy **`deveng_core_v2`**. También se migran IDs legacy de slang (`m0-*` → `m7-*`) en registros de progreso.
- `ProgressSettings` incluye: `theme`, `immersion`, `ttsEnabled`, `ttsRate`, `name`, `onboarded`, `goal`.
- XP/reglas actuales (referencia): +10 XP por ejercicio correcto (primera vez), +40 XP por completar sesión, +5 XP al guardar slang (según implementación existente); logros pueden otorgar XP adicional.
- Flags dev/certificado: `devlingo_dev` (compatibilidad con `deveng_dev`).

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
- `src/lib/speech.ts`: usa TTS nativo en Capacitor/Android (`@capacitor-community/text-to-speech`) con fallback a Web Speech API; respeta `settings.ttsEnabled` y `ttsRate`. `data-tts` en `<html>` controla visibilidad de controles de voz.

## Convenciones de trabajo

- **No tocar el logo** ni assets de marca gráfica salvo solicitud explícita.
- Mantener consistencia con el estilo, nombres y patrones existentes (Astro + Preact islands, Tailwind/daisyUI, tokens/temas `devlingo`).
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
