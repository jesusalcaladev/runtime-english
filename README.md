# DevEng // CORE

App web (PWA-ready) y Android para aprender inglés técnico de A1 a B2. 24 sesiones, 96 ejercicios
interactivos, progreso y logros con objetivos medibles en `localStorage`, y un deck de 51 términos
de slang actualizado a **noviembre de 2026**. Interfaz responsive con estética de workspace
minimalista, superficies neutras y tipografía Geist.

## Stack

- **Astro 7** (static output) + **Preact** islands para las partes interactivas.
- **Capacitor 8** para empaquetar el build web como app Android.
- **Tailwind CSS 4** + **daisyUI 5** como librería de componentes/temas.
- **Geist**, **Geist Mono** y **Geist Pixel** self-hosted con Fontsource.
- **Lucide** (`@lucide/astro` y `lucide-preact`) para iconos.
- **Speech Synthesis API** para pronunciación (sin backend).
- Progreso local: no hay cuenta ni base de datos.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve el build
npm run check    # typecheck de Astro + TS
npm run android:sync  # build + copia los assets a android/
npm run android:open  # abre el proyecto en Android Studio
```

## Estructura

```
src/
├── data/
│   ├── curriculum/
│   │   ├── index.ts       # registro de módulos + helpers de navegación/stats
│   │   ├── m1.ts … m6.ts  # ruta técnica A1–B2
│   │   ├── m7.ts          # slang y cultura 2026 (último módulo)
│   └── slang.ts           # deck de slang (51 términos, fuente de /slang)
├── lib/
│   ├── progress.ts        # store + localStorage + XP/racha/sesiones
│   ├── achievements.ts    # definición y evaluación de logros
│   ├── i18n.ts            # inmersión progresiva de la interfaz
│   ├── speech.ts          # TTS inglés
│   └── types.ts           # tipos de contenido y ejercicios
├── components/
│   ├── Dashboard.tsx      # roadmap y progreso
│   ├── ExerciseRunner.tsx # motor de ejercicios con mapa, atajos y control
│   ├── SessionProgressCard.tsx # estado/replay de la sesión
│   ├── SlangExplorer.tsx  # buscador/filtros del slang
│   ├── AchievementsGrid.tsx
│   ├── SettingsPanel.tsx
│   ├── LessonBlocks.astro # render de bloques de contenido
│   └── ui/                # Button, Badge, Card, ProgressBar, Logo…
├── layouts/BaseLayout.astro
└── pages/                 # /, /slang, /achievements, /settings, /session/[slug]

android/                   # proyecto nativo generado por Capacitor
capacitor.config.ts        # appId, nombre, webDir y tema del sistema
```

## Android

El proyecto usa [Capacitor](https://capacitorjs.com/) con `appId` `com.deveng.core`, tema oscuro
`#101010`, iconos e splash propios y manejo del botón atrás de Android.

Requisitos para compilar: **JDK 17+** y **Android SDK** instalados, además de Android Studio.

```bash
npm run android:sync   # genera dist/ y lo copia a android/
npm run android:open   # abre Android Studio
```

En Android Studio: `Build > Generate Signed Bundle / APK`. Para Play Store se sube un **AAB**
firmado con una keystore propia; esa keystore y los archivos de firma no deben commitearse.

El progreso vive en el `localStorage` del WebView. El export/import JSON de Ajustes sirve como
respaldo si se borran los datos de la app.

La pronunciación usa Web Speech en navegador y el motor TTS nativo de Android dentro de la app.
Si el dispositivo no tiene una voz en inglés instalada, la app lo avisa para instalarla.

## Añadir una sesión

1. Abre el módulo correspondiente (`src/data/curriculum/mN.ts`).
2. Añade un objeto a `sessions`. El `slug` es la URL pública (`/session/mi-slug`).
3. Usa bloques de contenido y ejercicios tipados:

```ts
{
  id: "m8-l1",
  slug: "mi-nueva-sesion",
  title: "Mi nueva sesión",
  step: "B2 · Paso 6.1",
  cefr: "B2",
  minutes: 10,
  summary: "Resumen de una línea.",
  objectives: ["Objetivo 1", "Objetivo 2"],
  blocks: [
    { type: "technique", name: "Técnica", desc: "Explicación." },
    { type: "vocab", title: "Vocabulario", items: [
      { en: "deploy", es: "desplegar", example: "We deploy on Fridays." }
    ]},
    { type: "callout", tone: "tip", title: "Truco", body: "..." }
  ],
  pronunciation: "We deploy on Fridays.",
  exercises: [
    { id: "m8-l1-e1", type: "choice", prompt: "…", options: ["a", "b"], answer: 0, explanation: "…" },
    { id: "m8-l1-e2", type: "builder", prompt: "…", words: ["We", "deploy"], answer: "We deploy", explanation: "…" },
    { id: "m8-l1-e3", type: "write", prompt: "…", answer: "We deploy on Fridays.", accept: ["We deploy Fridays."], explanation: "…" }
  ]
}
```

No hay que tocar páginas ni componentes: `getStaticPaths` crea la ruta, el sidebar la lista y el
dashboard la incluye.

### Bloques disponibles

`technique`, `text`, `vocab`, `table`, `phrases`, `tenses`, `slang` (por IDs de `slang.ts`) y
`callout` (tip/warning/info).

### Ejercicios

- `choice`: `options` + `answer` (índice).
- `builder`: `words` + `answer`; se compara el orden elegido con el texto normalizado.
- `write`: `answer` + `accept[]` opcional; también se normalizan mayúsculas/puntuación.

Cada acierto suma **10 XP**; completar una sesión suma **40 XP**. El runner permite saltar
entre ejercicios, reiniciar la práctica y usar atajos (`←` `→`, `Enter`, `1–4`). Una sesión solo
se completa cuando todos sus ejercicios están resueltos.

## Añadir un módulo

Crea `src/data/curriculum/m8.ts` exportando un `Module` y regístralo en `MODULES`
(`src/data/curriculum/index.ts`). Aparecerá automáticamente agrupado por `level` (`A1-A2` o
`B1-B2`).

## Logros y progreso

- Clave de localStorage: `deveng_core_v2`.
- Se guardan: XP, ejercicios y sesiones completadas, intentos, racha, slang guardado, logros y
  ajustes (tema, inmersión, velocidad TTS, nombre).
- Para crear un logro: añade una entrada a `ACHIEVEMENTS` en `src/lib/achievements.ts` con un
  `check(state)` y un `icon` de Lucide. La evaluación es automática. Si el logro tiene `target` y
  `progress(state)`, la galería muestra una barra con el avance real.
- **Exportar / importar**: Ajustes → Datos y progreso. El JSON permite mover el avance entre
  navegadores.
- **Reiniciar todo**: Ajustes → Zona de riesgo.

## Inmersión progresiva

`src/lib/i18n.ts` decide el idioma de la interfaz con una puntuación de preparación (0–100):

- 55% avance de sesiones A1–A2, 20% ejercicios resueltos, 15% precisión y 10% avance B1–B2.
- 28+ puntos → etiquetas bilingües.
- 58+ puntos con al menos 55% de A1–A2 y 55% de precisión → interfaz en inglés.

El contenido también sube de nivel: explicaciones en español en A1-A2 y en inglés en B1-B2.
Ajustes muestra el desglose y el siguiente objetivo; el usuario puede forzar el modo manualmente.

## Slang

El deck vive en `src/data/slang.ts`. Cada entrada incluye `status` (`consolidado`, `en alza`,
`2026`), `register`, ejemplo, traducción, fecha de revisión y `caution` cuando el término puede
sonar ofensivo. Para actualizarlo, añade entradas y actualiza `updated`. La portada y `/slang`
muestran los conteos automáticamente.

## Diseño

- Tipografía de interfaz: **Geist Variable**; código y datos: **Geist Mono Variable**.
- Títulos, marca y cifras destacadas: **Geist Pixel Variable** (variante grid mediante el eje
  `ELSH`).
- Sin bordes decorativos: las jerarquías se construyen con superficies (`base-100/200/300`),
  espacio y contraste. El tema oscuro arranca en `#101010`.
- Iconos Lucide en toda la interfaz; sin emojis.

## Siguiente iteración

- Envolver la PWA con Capacitor para App Store / Play Store (la UI ya es responsive).
- Más sesiones (speaking con micrófono, listening con audio) y repaso espaciado.
- Sincronización opcional de progreso y pruebas E2E.
