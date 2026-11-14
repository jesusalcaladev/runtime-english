# RuntimeEnglish

RuntimeEnglish is a web (PWA-ready) and Android app for learning **technical English for developers** (A1–B2). It combines guided sessions, interactive exercises, progress tracking, achievements, pronunciation tools, and a 2026-focused developer slang deck in a fast, offline-friendly experience.

- **Web:** Astro (static) + Preact islands
- **Mobile:** Capacitor (Android)
- **Progress:** local-first (`localStorage`) with optional account sync and certificate verification via Supabase
- **Speech:** native/system TTS with an in-browser HQ voice option (Kokoro)

## Highlights

- **A1–B2 technical English path** with curriculum modules and guided sessions
- **Interactive exercises** (e.g. choice, builder, write) with XP, streaks, and session completion
- **Search and quick practice** (`/search`, `/practice`) to review content efficiently
- **Dictionary / phrasebook** tools for vocabulary practice
- **Achievements and dashboard insights** to track progress
- **Slang deck (2026)** with searchable/filterable developer terms (`/slang`)
- **Pronunciation (TTS)**
  - System/browser or native device voice (depending on platform)
  - Optional in-browser HQ voice (Kokoro) cached after download for reuse
- **PWA-ready web app** and **Android app** (`com.runtimeenglish.core`)
- **Optional Supabase integration** for auth, progress sync, and certificate issuance/verification

## Tech stack

- **Framework:** [Astro 7](https://astro.build/) (static output) with [Preact](https://preactjs.com/) islands (`client:only="preact"`)
- **Mobile:** [Capacitor 8](https://capacitorjs.com/) (Android)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [daisyUI 5](https://daisyui.com/)
- **Fonts:** Geist, Geist Mono, Geist Pixel (Fontsource)
- **Icons:** Lucide (`@lucide/astro`, `lucide-preact`)
- **Speech:** Web Speech API / native TTS plugin + optional [Kokoro](https://github.com/hexgrad/kokoro) in-browser TTS
- **Data/validation/utilities:** Supabase JS, Nanostores, MiniSearch, ts-fsrs, Zod, date-fns
- **Tooling:** TypeScript, Biome, Vitest, Playwright, Astro PWA integration

## Project structure

```text
.
├─ src/
│  ├─ pages/                 # Routes (/, /session/[slug], /search, /practice, /slang, etc.)
│  ├─ layouts/               # Global app shell/layout
│  ├─ components/            # Astro + Preact UI/components
│  ├─ data/
│  │  ├─ curriculum/         # Modules (m1..m8) and curriculum helpers
│  │  └─ slang.ts            # Slang deck
│  ├─ lib/                   # Progress/store, i18n, speech, auth/sync, utilities, types
│  ├─ hooks/                 # Reusable client hooks
│  └─ styles/                # Global styles/themes
├─ public/                   # Static assets, PWA assets, downloadable APK
├─ android/                  # Capacitor Android project
├─ apks/                     # Locally generated APK artifacts
├─ supabase/                 # SQL setup, migrations, and edge functions
├─ capacitor.config.ts
├─ astro.config.mjs
└─ package.json
```

## Getting started

### Prerequisites

- **Node.js** (LTS recommended)
- **pnpm** (recommended, lockfile included) or npm
- For Android builds: **JDK 17+** (JDK 21 recommended), **Android SDK**, and optionally Android Studio

### Install and run (web)

```bash
pnpm install
pnpm dev
```

Then open the local dev URL shown by Astro (typically `http://localhost:4321`).

### Available scripts

```bash
# Development / build
pnpm dev                 # Start Astro dev server
pnpm build               # Build static site to dist/
pnpm preview             # Preview production build
pnpm check               # Astro/TypeScript checks

# Quality
pnpm lint                # Biome lint
pnpm lint:fix            # Biome lint (write)
pnpm format              # Biome format (write)
pnpm format:check        # Biome format check
pnpm check:biome         # Biome check
pnpm check:biome:fix     # Biome check (write)

# Tests
pnpm test                # Vitest (run)
pnpm test:watch          # Vitest (watch)
pnpm test:coverage       # Vitest coverage
pnpm test:e2e            # Playwright tests
pnpm test:e2e:ui         # Playwright UI mode

# Android (Capacitor)
pnpm android:sync        # Build web + sync assets/config to android/
pnpm android:open        # Open Android project in Android Studio
pnpm android:apk         # Sync + assemble debug APK + copy to apks/
pnpm android:apk:release # Sync + assemble release APK + copy to apks/
```

> If you use npm instead of pnpm, replace `pnpm` with `npm run` where appropriate.

## Android development

The Android app is packaged with Capacitor (`appId: com.runtimeenglish.core`, `appName: RuntimeEnglish`).

### Build a debug APK

```bash
pnpm android:apk
```

This runs the web build, syncs Capacitor assets, builds the Android debug APK, and copies it to `apks/`.

### Local environment example (this repository's documented setup)

If your machine uses the paths documented in `AGENT.md`:

```bash
export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
pnpm android:apk
```

You can also open and build from Android Studio:

```bash
pnpm android:open
```

> Notes:
> - Internal web routes must remain compatible with Capacitor static output (`.html` routing handled in-app). Use the project's route helper for internal links when modifying navigation.
> - APK artifacts in `apks/` may be generated locally; the web download button serves `public/runtimeenglish.apk` when present.

## Progress, sync, and certificates

- **Local-first progress:** user progress/settings are stored locally in the browser/app storage.
- **Export/import:** the app supports backup/restore flows in settings (JSON) for moving progress.
- **Optional Supabase features:** authentication, progress sync, and certificate issuance/verification are supported when Supabase is configured and deployed (see `supabase/` for SQL, migrations, and edge functions).
- **Schema migrations:** progress/state migrations are handled in code to preserve compatibility across app updates where possible.

## Pronunciation (TTS)

RuntimeEnglish supports multiple pronunciation paths depending on platform and availability:

- **System/browser TTS** (Web Speech API) on web
- **Native TTS** on Android (Capacitor plugin)
- **HQ in-browser voice (Kokoro)** as an optional downloadable engine (cached for reuse)

If a browser lacks usable system voices, the HQ voice option can provide a more reliable in-browser experience.

## Development notes

- Use the existing project patterns (Astro + Preact islands, Tailwind/daisyUI, current theme tokens).
- Keep internal navigation compatible with Capacitor static routing (see `src/lib/routes.ts` and `AGENT.md`).
- Do not modify brand/logo assets unless explicitly intended.
- Run checks/build/tests relevant to your changes before opening a PR.

## Contributing

Contributions are welcome. Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## Security

If you discover a security issue, please follow the responsible disclosure process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

No license file is currently included in this repository. If you plan to use, distribute, or contribute code, please confirm the licensing terms with the repository maintainers/owner.
