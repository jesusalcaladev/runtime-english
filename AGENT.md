# AGENT.md — RuntimeEnglish

Permanent guide for working in this repository (`lear-english-for-dev`). Keep this file up to date when the architecture, commands, conventions, or build environment change.

## Project overview

- **Name:** RuntimeEnglish (formerly DevEng/DevEng Core). When renaming, **do not modify the logo/icons** (e.g. `public/favicon.svg`, icon assets) unless explicitly requested.
- **What it is:** A web app (static Astro, PWA-ready) and Android app (Capacitor) for learning technical English for developers (A1–B2), with guided sessions, interactive exercises, progress/achievements in `localStorage`, slang, TTS, and certificates.
- **Main stack:** Astro 7 (static), Preact islands (`client:only="preact"`), Tailwind CSS 4 + daisyUI 5, Geist (sans/mono/pixel), Lucide, Capacitor 8.
- **Package/IDs:** npm `name: "runtimeenglish"`, Android `appId/namespace/package`: `com.runtimeenglish.core`, app name: `RuntimeEnglish`.
- **Android updates (no OTA):** The native APK can check a remote manifest (`app-update.json`) to detect a new version and show a notice with an **Update** button (opens the APK download for manual installation). This is not web-bundle OTA; changes require publishing a new APK.

## Relevant structure

- `src/pages/` — Astro routes: `/` (dashboard), `/session/[slug]`, `/slang`, `/achievements`, `/settings`, `/certificate`, `/search`, `/practice`, `/my-lessons`, `/my-lesson` (custom lesson viewer via query params, client-rendered).
- `src/layouts/BaseLayout.astro` — global shell, font/style loading, preferences (theme/TTS), `ClientRouter`, persistent sidebar/topbar/toasts/update notice, Capacitor integration (back button, delegated TTS, OAuth callback).
- `src/components/` — Preact islands (`Dashboard.tsx`, `ExerciseRunner.tsx`, `SidebarNav.tsx`, `SearchView.tsx`, `PracticeView.tsx`, `OnboardingCard.tsx`, `SettingsPanel.tsx`, custom lessons in `custom-lessons/`, etc.), Astro components (`Topbar.astro`, `LessonBlocks.astro`) and `ui/`. Includes `layout/AppUpdateBanner.tsx` to notify about new APK versions on Android.
- `src/data/curriculum/` — modules `m1.ts`…`m9.ts` and registry/helpers in `index.ts` (`MODULES`, `ALL_SESSIONS`, `getNavData`, etc.).
- `src/data/slang.ts` — slang deck.
- `src/lib/` — types (`types.ts`), progress/store (`progress.ts`, `useProgress.ts`), achievements (`achievements.ts`), immersion/i18n (`i18n.ts`), voice (`speech.ts`), toasts (`toast.ts`), APK update logic (`appUpdate.ts`), custom lessons storage/import (`customLessons.ts`), etc.
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

- APKs generados se copian a `apks/` con el nombre `RuntimeEnglish-v<version>-<variant>.apk` (por ejemplo, `apks/RuntimeEnglish-v1.2.3-debug.apk`).
- If Gradle fails due to missing licenses/SDK components, install/accept the required SDK components; if Java is missing, check `JAVA_HOME`.

## Architecture and key behavior

### Navigation and fluidity

- `astro.config.mjs` has **prefetch** enabled (`prefetchAll: true`, `defaultStrategy: "viewport"`) and `build.format: "file"` to generate `.html` pages (e.g. `slang.html`, `session/<slug>.html`).
- **Internal routes (important for APK):** Capacitor Android serves extensionless routes as `index.html` when `server.html5mode` is active (default), causing `ClientRouter`/`fetch` for `/slang` or `/session/...` to receive the dashboard. Therefore, **every internal page link must go through `route()`** (`src/lib/routes.ts`), which adds `.html` to internal routes (preserving `/`, anchors, query strings, and external URLs). Never hardcode extensionless page routes (`/slang`, `/session/x`); use `route("/slang")`, `route(\`/session/${slug}\`)`, etc. Assets with extensions (`/favicon.svg`, `/_astro/*`, `manifest.webmanifest`) are not modified.
- **PWA manifest:** la fuente canónica es `manifest` en `astro.config.mjs` (integración `@vite-pwa/astro`), que genera `/manifest.webmanifest` en build. Evita mantener un `public/manifest.webmanifest` manual en paralelo salvo que se cambie explícitamente la estrategia de generación.
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

- Exercise types: `choice`, `builder`, `write`, `listen`, `speak`, `fill-blank`, `dialogue-order`, `fix-error`, `roleplay` (see `src/lib/types.ts` and `ExerciseRunner.tsx`).
- Content blocks include a `dialogue` type for Duolingo-style scenes: two avatars, sequential TTS playback via `speakLine`, per-line replay, and comprehension questions added as normal exercises after the block. There are 20 conversations integrated into the main sessions of M1–M9. Rendered by `src/components/session/DialogueScene.tsx` in both `LessonBlocks.astro` and `LessonBlocksClient.tsx`.
- Content lives in `src/data/curriculum/*.ts`; `getStaticPaths` and navigation are derived from the curriculum. To add sessions/modules, follow the existing pattern and register modules in `MODULES`. `curriculum.test.ts` enforces roadmap integrity (ids, order, CEFR, prerequisites, dialogue lines, hints, exercise shapes).
- Slang lives in `src/data/slang.ts`; lesson blocks support `slang` by IDs.
- Dev phrasal verbs are covered in M3: `m3-l2` (14 basics) and `m3-l8` (`phrasal-verbs-dev-diario`, 32 chunks grouped by git/deploy, debugging, meetings and code/reviews). New AI-generated lessons must also include 2-4 dev phrasal verbs with Spanish meaning and an English dev example (`buildAiLessonPrompt`).
- Extra exercise types: `match` (pair EN↔ES), `multi-choice` (several correct answers) and `shadow` (listen-and-repeat with mic). Supported by `src/lib/exercise.ts`, the importer and the AI prompt (8 exercises: 6 core + `match` + `shadow`/`multi-choice`). Their UIs live in `src/components/exercise/runner/{MatchInput,MultiChoiceInput,ShadowInput}.tsx`; keep `ExerciseRunner.tsx` as the orchestrator (state, scoring, navigation).
- **Teaching order:** `orderExercises()` in `src/lib/exercise.ts` sorts exercises by stage (1 comprehension: choice/match/multi-choice/listen/dialogue-order/fill-blank → 2 controlled: fix-error/dialogue-branch/builder → 3 production: write/speak/roleplay/shadow), stable within each stage. `ExerciseRunner` applies it on display so raw exercise IDs stay untouched. Every session must include at least one speaking exercise (`speak`/`listen`/`shadow`); `curriculum.test.ts` enforces it.
- **Branching dialogues:** `dialogue-branch` exercise type renders `DialogueBranchInput.tsx` (one best reply per turn, immediate feedback). Seeded in daily/standup, review, incidents, async, demo, meeting-slang and interview sessions.
- **Video → phrase → SRS loop:** `VideoPhraseReview.tsx` shows flashcards only for phrases saved from the current video and grades them with `progressStore.reviewPhrase` (FSRS). Keep it next to `SubtitleList` in `VideoLab`.
- **DialogueScene controls:** `ES` toggles Spanish translations and `Solo audio` hides all text (listening-only). `speak`/`shadow` exercises also report an approximate words-per-minute rate after a successful mic result.
- **Adaptive review:** after a wrong answer, `ExerciseRunner` renders `MiniDrill.tsx` with 1-2 quick questions for the top skill from `detectErrorSkills` (data in `src/data/microDrills.ts`). Keep it non-scoring: it is remediation, not part of the exercise result.
- **Placement test** (`/placement`, `src/lib/placement.ts` + `src/components/placement/PlacementTest.tsx`): 8 questions score A1/A2/B1 and recommend a starting session; result is saved in `localStorage` under `runtimeenglish_placement_v1`.
- **Self-study / VideoLab** (`/learn`, `src/pages/learn.astro`): curated external resources (`src/data/learningResources.ts`) and YouTube videos with adapted, timestamped transcripts. Structure: `youtube.ts` (single, retryable API loader + minimal YT types), `useYouTubePlayer.ts` (player lifecycle, polling, loop/offset/rate), `SubtitleList.tsx` (active cue highlight, auto-scroll, TTS and save-phrase actions), `VideoLab.tsx` (thin composition + controls) and `ResourceExplorer.tsx` (filter/search over the resource directory). Video IDs were verified with YouTube oEmbed. The `en` text and `start`/`end` times are the **complete real YouTube captions** (one cue per caption line, full video); `highlight` and part of `es` are teaching aids, the rest of `es` is machine-translated at authoring time. Regenerate with `npm run captions:fetch -- <youtubeId> [fileName]` (dev-only `youtube-transcript` dependency → `src/data/videoTranscripts/*.ts`); commit the generated files so the app never depends on YouTube at runtime. `SubtitleList` has a "Seguir" toggle for auto-scroll. Keep the ±5s sync control and the "Abrir en YouTube" fallback for WebView/native.

**VideoLab UX:** `VideoLibrary.tsx` is a catalog with YouTube thumbnails, duration badges, level/topic and resume progress; only the selected video mounts a player (avoids multiple iframes). `VideoLab.tsx` keeps a two-column layout on desktop, saves resume position every 5 s (`src/lib/videoProgress.ts`, key `runtimeenglish_video_progress_v1`), offers "Mark as watched", transcript search, per-line mic shadowing, keyboard shortcuts (space / ← → / F), saved-phrase flashcards and 3 comprehension questions per video (`VideoComprehension.tsx`).

**E2E:** `e2e/learning.spec.ts` covers `/learn` resource filters, video library selection/transcript search, the dashboard skeleton/greeting stability and the full `/placement` flow. Run with `npm run test:e2e` (Playwright serves `dist/` on port 4321).

**Native QA checklist (manual, required before releasing a VideoLab change):** build with `pnpm android:apk`, install on a device, open `/learn.html` and confirm (1) the iframe loads and plays, (2) the highlighted line changes with the audio, (3) tapping a line seeks, (4) "Guardar" adds the phrase to the dictionary, (5) "Practicar frases guardadas" grades through FSRS, and (6) with no network the fallback link appears instead of a blank box. `INTERNET` permission and HTTPS iframe are already configured; `allowMixedContent` is false on purpose.

### Release notes / changelog

- `src/data/changelog.ts` holds the release notes (newest entry first, `version` = current app version) and `src/lib/changelog.ts` tracks the last version seen in `localStorage` (`runtimeenglish_changelog_seen_v1`).
- On the first load of a new version (and only after onboarding), `ReleaseNotesModal` shows what changed once; `Ajustes → Novedades` or "Ver todas las versiones" in the sheet reopens the full history via `runtimeenglish:show-changelog`. `ChangelogDot` shows a badge on the topbar settings button until the version is marked seen (`runtimeenglish:changelog-seen`).
- `AppModals.tsx` owns both app-wide dialogs and gives the APK update notice priority. `ResponsiveDialog.tsx` renders a swipeable `BottomSheet.tsx` on phones (drag handle, slide from bottom, safe-area) and a centered `Modal.tsx` on desktop, with distinct action layouts. `useDialogBehavior.ts` handles exit animation, scroll lock, focus trap/restoration and reduced motion; `dialogStack.ts` lets the native back button (`BaseLayout.astro`) close the top dialog before navigating/exiting. Keep changelog version aligned with `package.json` (enforced by `src/lib/changelog.test.ts`) and see `RELEASING.md`.

### Recently added features

- **Search** (`/search`): index built at build time from sessions/blocks/exercises/slang.
- **Quick practice** (`/practice`): mixed rounds (review/new/mix) reusing `ExerciseRunner`.
- **Onboarding** on the dashboard for users who are not onboarded.
- **Basic insights** on the dashboard (e.g. accuracy/attempts, quick access).
- **Custom lessons / Mis lecciones** (`/my-lessons`, `/my-lesson?id=...`): users can create and save personalized lessons locally.
  - **Flow:** enter a topic, copy an optimized AI prompt, generate lesson JSON with an external AI, paste/validate/import the JSON, then open and practice the lesson.
  - **Storage:** local-first in browser `localStorage` key `runtimeenglish_custom_lessons_v1` (`src/lib/customLessons.ts`); no Supabase table/sync for custom lesson content yet.
  - **Implementation:** `src/components/custom-lessons/*` (list/import UI, client block renderer, lesson viewer) + `ExerciseRunner` reuse for practice/progress tracking by custom session/exercise IDs.
  - **Prompt/validation:** import prompt is explicit about required schema/fields per exercise type and requests JSON-only output (no markdown/emojis); importer validates/normalizes supported blocks and exercise formats before saving.

### Voice (TTS)

- `src/lib/speech.ts`: uses native TTS on Capacitor/Android (`@capacitor-community/text-to-speech`) with fallback to the Web Speech API; respects `settings.ttsEnabled`, `ttsRate`, and `ttsEngine` (`system`/`kokoro`). `data-tts` on `<html>` controls visibility of voice controls.
- **Kokoro HQ (performance):** Automatic preloading of the cached model is deferred and conservative. It is not preloaded at startup on native Android just because it is cached; on-demand loading (Settings/explicit use) is prioritized to avoid CPU/memory spikes at app launch. `warmConversationPhrases()` primes system voices and pre-generates the exact dialogue lines when a conversation mounts; it only triggers Kokoro loading when the user selected the HQ engine (and never forces an uncached download on native).

## APK updates (no OTA, recommended for this project)

Simple implemented flow: the installed APK (native Android) checks a remote JSON manifest, compares `versionCode` with the installed version, and, if a newer one is available, shows a banner with **Update**.

### Files and configuration

- **Client:** `src/lib/appUpdate.ts` + `src/components/layout/AppUpdateModal.tsx`, coordinated with the release-notes modal by `src/components/layout/AppModals.tsx` (mounted in `BaseLayout.astro`).
- **Public manifest:** `public/app-update.json` (versioned in git; must point to the published APK).
- **APK distribution:** via **GitHub Releases** (APKs are not versioned in git). The web "Download APK" button uses the latest release download (`releases/latest/download/RuntimeEnglish.apk`) and `app-update.json` must point to the release asset for the corresponding version.
- **Android versioning (actual installed source of truth):** `android/app/build.gradle` → `defaultConfig.versionCode` and `defaultConfig.versionName`.
- **Environment variables (web/build):**
  - `PUBLIC_APP_UPDATE_URL` (recommended): absolute URL to the manifest, e.g. `https://raw.githubusercontent.com/jesusalcaladev/runtime-english/main/public/app-update.json` or wherever `app-update.json` is hosted.
  - `PUBLIC_APP_URL` (optional): site base URL to derive `/app-update.json` if `PUBLIC_APP_UPDATE_URL` is not defined.

### How to publish a new update (APK)

Use the full, reproducible checklist in [RELEASING.md](RELEASING.md). Summary:

1. **Bump and align versions:** update `package.json` (+ lockfile root version), `android/app/build.gradle` (`versionCode`/`versionName`), and prepare matching `public/app-update.json` values for the same release.
2. **Validate and build:** run checks/tests/build, then build Android artifacts (`pnpm android:apk` for debug/testing, `pnpm android:apk:release` for release artifacts copied to `apks/`).
3. **Sign and verify:** publishable APKs must be **signed release** builds (keystore/signing config is local/uncommitted in this repo). Verify install/version (`versionCode`/`versionName`) before publishing.
4. **Publish GitHub Release:** tag the release (e.g. `v1.2.3`) and upload the signed APK as `RuntimeEnglish.apk` (stable `releases/latest/download/RuntimeEnglish.apk` URL), with versioned release notes.
5. **Update manifest and verify flow:** set `public/app-update.json` (`versionName`, `versionCode`, `apkUrl`, `title`, `notes`) to the published release, push to the URL served by `PUBLIC_APP_UPDATE_URL`, and confirm an older install detects and opens the update.

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
