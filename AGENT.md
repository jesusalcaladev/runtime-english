# AGENT.md — RuntimeEnglish

Permanent guide for working in this repository (`lear-english-for-dev`). Keep this file up to date when the architecture, commands, conventions, or build environment change.

## Project overview

- **Name:** RuntimeEnglish (formerly DevEng/DevEng Core). When renaming, **do not modify the logo/icons** (e.g. `public/favicon.svg`, icon assets) unless explicitly requested.
- **What it is:** A web app (static Astro, PWA-ready) and Android app (Capacitor) for learning technical English for developers (A1–B2), with guided sessions, interactive exercises, progress/achievements in `localStorage`, slang, TTS, and certificates.
- **Main stack:** Astro 7 (static), Preact islands (`client:only="preact"`), Tailwind CSS 4 + daisyUI 5, Geist (sans/mono/pixel), Lucide, Capacitor 8.
- **Package/IDs:** npm `name: "runtimeenglish"`, Android `appId/namespace/package`: `com.runtimeenglish.core`, app name: `RuntimeEnglish`.
- **Android updates (no OTA):** The native APK can check a remote manifest (`app-update.json`) to detect a new version and show a notice with an **Update** button (opens the APK download for manual installation). This is not web-bundle OTA; changes require publishing a new APK.

## Relevant structure

- `src/pages/` — Astro routes: `/` (dashboard), `/session/[slug]`, `/slang`, `/achievements`, `/settings`, `/certificate`, `/search`, `/practice`.
- `src/layouts/BaseLayout.astro` — global shell, font/style loading, preferences (theme/TTS), `ClientRouter`, persistent sidebar/topbar/toasts/update notice, Capacitor integration (back button, delegated TTS, OAuth callback).
- `src/components/` — Preact islands (`Dashboard.tsx`, `ExerciseRunner.tsx`, `SidebarNav.tsx`, `SearchView.tsx`, `PracticeView.tsx`, `OnboardingCard.tsx`, `SettingsPanel.tsx`, etc.), Astro components (`Topbar.astro`, `LessonBlocks.astro`) and `ui/`. Includes `layout/AppUpdateBanner.tsx` to notify about new APK versions on Android.
- `src/data/curriculum/` — modules `m1.ts`…`m9.ts` and registry/helpers in `index.ts` (`MODULES`, `ALL_SESSIONS`, `getNavData`, etc.).
- `src/data/slang.ts` — slang deck.
- `src/lib/` — types (`types.ts`), progress/store (`progress.ts`, `useProgress.ts`), achievements (`achievements.ts`), immersion/i18n (`i18n.ts`), voice (`speech.ts`), toasts (`toast.ts`), APK update logic (`appUpdate.ts`), etc.
- `src/styles/global.css` — Tailwind/daisyUI, `runtimeenglish` and `runtimeenglish-dark` themes, base utilities/styles.
- `public/` — `favicon.svg`, `manifest.webmanifest`, `sw.js`/custom SW, `app-update.json` (update manifest for the native APK). **APK binaries are not versioned** (`public/runtimeenglish.apk` and `public/*.apk` are ignored).
- `src/lib/routes.ts` — `route()` helper to generate internal `.html` links compatible with Capacitor/APK.
- `android/` — native Capacitor project; `dist/` — web build; `apks/` — locally generated APKs (ignored in git, except `.gitkeep`). APKs are distributed via **GitHub Releases**.

## Commands

Run from the project root:

```bash
npm install
npm run dev            # Astro dev server
npm run build          # generates dist/
npm run preview        # serves dist/
npm run check          # astro check (types/diagnostics)

npm run android:sync   # build + cap sync android (updates assets/config in android/)
npm run android:open   # opens the project in Android Studio
npm run android:apk    # android:sync + Gradle assembleDebug and copies APK to apks/
npm run android:apk:release
```

## Local environment for building the APK (this machine)

Tools already installed in this environment:

- **JDK 21:** `~/jdks/jdk-21.0.13+9` (`$HOME/jdks/jdk-21.0.13+9/bin/java`)
- **Android SDK:** `~/android-sdk` (with `cmdline-tools`, `platform-tools`, `build-tools`)
- **Android config:** `android/local.properties` → `sdk.dir=/home/<<$HOME>>/android-sdk`

To build the APK from the terminal:

```bash
export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
npm run android:apk
```

- Debug APK generated/copied to: `apks/RuntimeEnglish-v1.1.0-debug.apk` (name depends on Gradle variant/versioning).
- If Gradle fails due to missing licenses/SDK components, install/accept the required SDK components; if Java is missing, check `JAVA_HOME`.

## Architecture and key behavior

### Navigation and fluidity

- `astro.config.mjs` has **prefetch** enabled (`prefetchAll: true`, `defaultStrategy: "viewport"`) and `build.format: "file"` to generate `.html` pages (e.g. `slang.html`, `session/<slug>.html`).
- **Internal routes (important for APK):** Capacitor Android serves extensionless routes as `index.html` when `server.html5mode` is active (default), causing `ClientRouter`/`fetch` for `/slang` or `/session/...` to receive the dashboard. Therefore, **every internal page link must go through `route()`** (`src/lib/routes.ts`), which adds `.html` to internal routes (preserving `/`, anchors, query strings, and external URLs). Never hardcode extensionless page routes (`/slang`, `/session/x`); use `route("/slang")`, `route(\`/session/${slug}\`)`, etc. Assets with extensions (`/favicon.svg`, `/_astro/*`, `manifest.webmanifest`) are not modified.
- `BaseLayout.astro` uses **`ClientRouter`** (`astro:transitions`) and `transition:persist` on sidebar/toasts to keep shell state/UI across pages (fluid, app-like navigation without full reloads).
  - **Android/Capacitor:** The back button is handled with `@capacitor/app`. Avoid overriding/stubbing navigation APIs or forcing `window.location` globally on native except for diagnostics, as it can break client routing. Always validate in the APK that links navigate to the correct page.
- `public/sw.js` + registration in the layout provide basic cache/offline behavior on **web** (network-first for HTML, cache-first for static assets, `runtimeenglish-v2` cache, no HTML fallback to the dashboard). On **native (Capacitor)** the layout unregisters SWs and clears `runtimeenglish-*` caches to avoid serving stale HTML; the APK already ships local content.

### Progress, settings, and migrations

- Store in `src/lib/progress.ts`, persisted in `localStorage` under the **`runtimeenglish_v2`** key.
- **Migration:** If `runtimeenglish_v2` does not exist, data is imported from the legacy key **`deveng_core_v2`**. Legacy slang IDs (`m0-*` → `m7-*`) are also migrated in progress records.
- `ProgressSettings` includes: `theme`, `immersion`, `ttsEnabled`, `ttsRate`, `name`, `onboarded`, `goal`.
- Current XP/rules (reference): +10 XP per correct exercise (first time), +40 XP for completing a session, +5 XP when saving slang (per existing implementation); achievements may grant additional XP.
- Dev/certificate flags: `runtimeenglish_dev` (compatibility with `deveng_dev`).

### Exercises and content

- Exercise types: `choice`, `builder`, `write` (see `src/lib/types.ts` and `ExerciseRunner.tsx`).
- Content lives in `src/data/curriculum/*.ts`; `getStaticPaths` and navigation are derived from the curriculum. To add sessions/modules, follow the existing pattern and register modules in `MODULES`.
- Slang lives in `src/data/slang.ts`; lesson blocks support `slang` by IDs.

### Recently added features

- **Search** (`/search`): index built at build time from sessions/blocks/exercises/slang.
- **Quick practice** (`/practice`): mixed rounds (review/new/mix) reusing `ExerciseRunner`.
- **Onboarding** on the dashboard for users who are not onboarded.
- **Basic insights** on the dashboard (e.g. accuracy/attempts, quick access).

### Voice (TTS)

- `src/lib/speech.ts`: uses native TTS on Capacitor/Android (`@capacitor-community/text-to-speech`) with fallback to the Web Speech API; respects `settings.ttsEnabled`, `ttsRate`, and `ttsEngine` (`system`/`kokoro`). `data-tts` on `<html>` controls visibility of voice controls.
- **Kokoro HQ (performance):** Automatic preloading of the cached model is deferred and conservative. It is not preloaded at startup on native Android just because it is cached; on-demand loading (Settings/explicit use) is prioritized to avoid CPU/memory spikes at app launch.

## APK updates (no OTA, recommended for this project)

Simple implemented flow: the installed APK (native Android) checks a remote JSON manifest, compares `versionCode` with the installed version, and, if a newer one is available, shows a banner with **Update**.

### Files and configuration

- **Client:** `src/lib/appUpdate.ts` + `src/components/layout/AppUpdateBanner.tsx` (mounted in `BaseLayout.astro`).
- **Public manifest:** `public/app-update.json` (versioned in git; must point to the published APK).
- **APK distribution:** via **GitHub Releases** (APKs are not versioned in git). The web "Download APK" button uses the latest release download (`releases/latest/download/RuntimeEnglish.apk`) and `app-update.json` must point to the release asset for the corresponding version.
- **Android versioning (actual installed source of truth):** `android/app/build.gradle` → `defaultConfig.versionCode` and `defaultConfig.versionName`.
- **Environment variables (web/build):**
  - `PUBLIC_APP_UPDATE_URL` (recommended): absolute URL to the manifest, e.g. `https://raw.githubusercontent.com/jesusalcaladev/runtime-english/main/public/app-update.json` or wherever `app-update.json` is hosted.
  - `PUBLIC_APP_URL` (optional): site base URL to derive `/app-update.json` if `PUBLIC_APP_UPDATE_URL` is not defined.

### How to publish a new update (APK)

1. **Increment the Android version** in `android/app/build.gradle`:
   - Increase `versionCode` (integer, required to detect updates).
   - Update `versionName` (user-visible, e.g. `1.2.3`).
2. **Build the APK** (local artifact, not versioned in git):

   ```bash
   export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
   export ANDROID_HOME="$HOME/android-sdk"
   export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
   npm run android:apk
   ```

   - Copies APKs to `apks/` (ignored in git).
3. **Publish the APK on GitHub Releases** (requires authenticated `gh`):
   - Create/publish a release with a version tag (e.g. `v1.2.3`) and upload the asset as `RuntimeEnglish.apk` so the stable `/releases/latest/download/RuntimeEnglish.apk` link works.
   - Example: `gh release create v1.2.3 apks/RuntimeEnglish-v1.2.3-debug.apk#RuntimeEnglish.apk --title "RuntimeEnglish v1.2.3" --notes "..."`
4. **Update the manifest** `public/app-update.json` and push it to the repo/hosting configured in `PUBLIC_APP_UPDATE_URL`:
   - `versionCode`/`versionName`: must match the published APK.
   - `apkUrl`: URL of that version's release asset (e.g. `https://github.com/jesusalcaladev/runtime-english/releases/download/v1.2.3/RuntimeEnglish.apk`).
   - `title`/`notes`: notice text.
5. **Behavior in the installed app:**
   - The APK checks `PUBLIC_APP_UPDATE_URL`, compares `versionCode`, and shows **Update** if a newer version is available.
   - When **Update** is tapped, the APK download opens (release asset); the user must install it manually.
   - Native changes always require a new APK; this flow does not replace native code OTA.

## Working conventions

- **Do not touch the logo** or brand graphic assets unless explicitly requested.
- Maintain consistency with existing style, naming, and patterns (Astro + Preact islands, Tailwind/daisyUI, `runtimeenglish` tokens/themes).
- Prefer dedicated read/edit/search tools over shell commands when possible; make targeted, coherent changes.
- When renaming visible or internal identifiers, update them consistently (UI, config, themes, storage keys/events, Android) and consider migrations to avoid losing user data.
- Verify with `npm run check` and `npm run build` after relevant changes; sync Android (`npm run android:sync` or `npm run android:apk`) when changes must be reflected in the native app.
- `android/app/build/`, `dist/`, `node_modules/`, `apks/*.apk`, and generated artifacts should not be edited manually unless specifically necessary; regenerate them from sources/scripts.

## Known pending items / future ideas

- Real spaced repetition (SRS), listening with audio, speaking/recognition, and pronunciation feedback.
- Cloud sync/accounts, scheduled local notifications on Android.
- More exercise types, more content/role-based paths, more advanced search/filtering.
- More robust PWA/offline behavior and E2E/CI tests.
- README and other documents may need updates if new flows or dependencies are added.
