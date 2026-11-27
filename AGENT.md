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
- `src/data/curriculum/` — modules `m1.ts`…`m11.ts` (m10/m11 are C1/C2 and use `advancedFactory.ts`) and registry/helpers in `index.ts` (`MODULES`, `ALL_SESSIONS`, `getNavData`, etc.).
- `src/data/slang.ts` — slang deck.
- `src/lib/` — types (`types.ts`), progress/store (`progress.ts`, `useProgress.ts`), achievements (`achievements.ts`), immersion/i18n (`i18n.ts`), voice (`speech.ts`), toasts (`toast.ts`), APK update logic (`appUpdate.ts`), custom lessons storage/import (`customLessons.ts`), `certificateLevels.ts` (ordered A1-A2 → B1-B2 → C1-C2, completion and progressive unlock), certificates client (`certificates.ts`), etc.
- `src/styles/global.css` — Tailwind/daisyUI, `runtimeenglish` and `runtimeenglish-dark` themes, base utilities/styles. `.hint-text` is the single scale for auxiliary copy (11 px, `/60`) so helper text stays readable on mobile; do not hide user notes/examples behind `hidden sm:block`.
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
npm test               # full Vitest suite (~40 s)
npm run test:fast      # only src/lib tests (~19 s), fastest feedback loop
npm run test:ui        # only component/hook UI tests (~25 s)

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
- **Level flow (v1.3.0):** the sidebar contains **only navigation** (workspace/tools/progress) plus a level selector. Levels link to `/?level=A1-A2` / `/?level=B1-B2`; the dashboard reads that query param and `Roadmap.tsx` renders **only that level's sessions** (no internal filters). Because `ClientRouter` does not navigate when only the query changes on the same path, the sidebar intercepts the click on the dashboard, calls `history.replaceState` and dispatches `runtimeenglish:select-level`; `Dashboard.tsx` listens to it and switches panels without a reload. Outside the dashboard the link navigates normally.
- `public/sw.js` + registration in the layout provide basic cache/offline behavior on **web** (network-first for HTML, cache-first for static assets, `runtimeenglish-v2` cache, no HTML fallback to the dashboard). On **native (Capacitor)** the layout unregisters SWs and clears `runtimeenglish-*` caches to avoid serving stale HTML; the APK already ships local content.

### Progress, settings, and migrations

- Store in `src/lib/progress.ts`, persisted in `localStorage` under the **`runtimeenglish_v3`** key (legacy `runtimeenglish_v2` is imported when absent).
- **Migration:** If `runtimeenglish_v2` does not exist, data is imported from the legacy key **`deveng_core_v2`**. Legacy slang IDs (`m0-*` → `m7-*`) are also migrated in progress records.
- `ProgressSettings` includes: `theme`, `immersion`, `ttsEnabled`, `ttsRate`, `name`, `onboarded`, `goal`.
- Current XP/rules (reference): +10 XP per correct exercise (first time), +40 XP for completing a session, +5 XP when saving slang (per existing implementation); achievements may grant additional XP.
- Dev/certificate flags: `runtimeenglish_dev` (compatibility with `deveng_dev`).

### Certificates per level

- `src/lib/certificateLevels.ts` is the single source of truth for level order (`A1-A2` → `B1-B2` → `C1-C2`), level stats and progressive unlock (`isLevelUnlocked` requires the previous level complete). `ProgressState.certificates` stores one `CertificateState` per level; the legacy single `certificate` is migrated to A1-A2 and kept as alias.
- `CertificateView.tsx` renders the same printable design for every level: the level badge was removed and `A1-A2` / `B1-B2` is shown inline in the title with a neutral accent that only changes hue. IDs are unique per level (`<base>-A1A2`, `<base>-B1B2`).
- Public verification: `/verify?id=...` calls `verifyCertificate()` which prefers `PUBLIC_CERTIFICATE_VERIFY_URL` (HTTP endpoint, maps HTTP 404 bodies to `not_found`) and otherwise the Supabase RPC `verify_certificate(cert_id)`, which returns `level` and filters `status = 'valid'`.
- Server-side issuance: `supabase/functions/issue-certificate/index.ts` validates the ID suffix, uses per-level thresholds (`CERT_REQUIRED_{SESSIONS,EXERCISES}_A1_A2` / `..._B1_B2`) and rejects B1-B2 with `403 previous_level_incomplete` until A1-A2 is done. `supabase/migrations/20261120120000_certificate_levels.sql` is the canonical migration; `supabase/setup.sql` mirrors it for fresh projects. See `supabase/README.md` before changing eligibility or CORS.

### Exercises and content

- Exercise types: `choice`, `builder`, `write`, `listen`, `speak`, `fill-blank`, `dialogue-order`, `fix-error`, `roleplay` (see `src/lib/types.ts` and `ExerciseRunner.tsx`).
- Content blocks include a `dialogue` type for Duolingo-style scenes: two avatars, sequential TTS playback via `speakLine`, per-line replay, and comprehension questions added as normal exercises after the block. There are 20+ conversations integrated into the main sessions of M1–M9. Rendered by `src/components/session/DialogueScene.tsx` in both `LessonBlocks.astro` and `LessonBlocksClient.tsx`. A dialogue must be a **coherent scene**, not a list of grammar example sentences: every block carries `setting` (where/when), `goal` (what the speakers want) and `context` (the situation shown as an "Escena" card); lines are 4-8, alternate speakers and keep the same name/role per speaker. `dialogue-order` exercises also carry a `context` scene (rendered in `ExerciseRunner`) so the lines are not a context-free list. A replayed line stays highlighted at least `LINE_HIGHLIGHT_MIN_MS` (900 ms) so a near-instant TTS fallback does not make the highlight invisible; `activeToken` prevents a stale scheduled clear from erasing a newer tap. `curriculum.test.ts` and the `customLessons` importer enforce those rules (the importer requires `context` for `dialogue-branch`; the AI prompt asks for one on `dialogue-order` too).
- Content lives in `src/data/curriculum/*.ts`; `getStaticPaths` and navigation are derived from the curriculum. To add sessions/modules, follow the existing pattern and register modules in `MODULES`. `curriculum.test.ts` enforces roadmap integrity (ids, order, CEFR, prerequisites, dialogue lines, hints, exercise shapes).
- **Lesson scanner:** `npm run scan:lessons` (`scripts/scan-lessons.ts` + `src/data/curriculum/scanner.ts`) prints a report of modules/sessions/exercises and checks ids, connectivity (prerequisite IDs, placement/goal slugs), metadata, dialogue/exercise integrity and duplicate content. It exits nonzero on errors; `scanner.test.ts` keeps it green in CI. Use it before/after curriculum edits to spot orphans and near-duplicate sessions.
- Slang lives in `src/data/slang.ts`; lesson blocks support `slang` by IDs.
- Dev phrasal verbs are covered in M3: `m3-l2` (14 basics) and `m3-l8` (`phrasal-verbs-dev-diario`, 32 chunks grouped by git/deploy, debugging, meetings and code/reviews). New AI-generated lessons must also include 2-4 dev phrasal verbs with Spanish meaning and an English dev example (`buildAiLessonPrompt`).
- Extra exercise types: `match` (pair EN↔ES), `multi-choice` (several correct answers) and `shadow` (listen-and-repeat with mic). Supported by `src/lib/exercise.ts`, the importer and the AI prompt (8 exercises: 6 core + `match` + `shadow`/`multi-choice`). Their UIs live in `src/components/exercise/runner/{MatchInput,MultiChoiceInput,ShadowInput}.tsx`; keep `ExerciseRunner.tsx` as the orchestrator (state, scoring, navigation).
- **Teaching order:** `orderExercises()` in `src/lib/exercise.ts` sorts exercises by stage (1 comprehension: choice/match/multi-choice/listen/dialogue-order/fill-blank → 2 controlled: fix-error/dialogue-branch/builder → 3 production: write/speak/roleplay/shadow), stable within each stage. `ExerciseRunner` applies it on display so raw exercise IDs stay untouched. Every session must include at least one speaking exercise (`speak`/`listen`/`shadow`); `curriculum.test.ts` enforces it.
- **Branching dialogues:** `dialogue-branch` exercise type renders `DialogueBranchInput.tsx` (one best reply per turn, immediate feedback). Seeded in daily/standup, review, incidents, async, demo, meeting-slang and interview sessions.
- **Video → phrase → SRS loop:** `VideoPhraseReview.tsx` shows flashcards only for phrases saved from the current video and grades them with `progressStore.reviewPhrase` (FSRS). Keep it next to `SubtitleList` in `VideoLab`.
- **DialogueScene controls:** `ES` toggles Spanish translations and `Solo audio` hides all text (listening-only). The per-line microphone was deliberately removed from dialogues: speaking practice lives in `speak`/`shadow` exercises and VideoLab line shadowing, so bubbles only keep "Escuchar". `speak`/`shadow` exercises report an approximate words-per-minute rate.
- **TTS prefetch (all engines):** `primeSpeechPhrase()` prepares the exact next lines for the selected engine — Kokoro generates audio, Google pre-downloads and caches MP3s (`google.ts`), Piper pre-generates cached audio (`piper.ts`), and the system voice resolves its voice once (`browser.ts`, `warmNativeVoices()`). `DialogueScene` primes 3 lines ahead during auto-play and when a single line is tapped; the "Audio listo" pill uses `getSpeechPhraseStatus()`/`subscribeSpeechPhraseStatus()` (shared signal in `speech/phraseStatus.ts`). Keep Kokoro's uncached-download guard on native.
- **Native microphone:** `recognition.ts` preflights `available()` + permissions, registers listeners **before** `start()` (the plugin resolves `start()` immediately in partial mode and drops later errors), uses watchdogs for silent failures, and falls back to `popup: true` (Android system voice dialog) when the direct recognizer fails. Mic errors in `ExerciseRunner` always offer "Abrir ajustes", and Ajustes has a "Diagnóstico" action. Android emits `onEndOfSpeech` before `onResults`, so a `stopped` event (or the 2.5 s silence timer) only starts a 900 ms final-result grace: never settle on the last partial immediately. `SpeechRecognitionResult.speechDurationMs` measures first-to-last heard word so `ExerciseRunner` computes WPM only from real speech (permission/startup/silence excluded); omit WPM when the engine cannot report it. `isMicLevelMeterSupported()` gates the level bar: the meter opens a second `getUserMedia` stream, so it is disabled on native and mobile web.
- **Session density & consistency:** `curriculum.test.ts` enforces ≤7 exercises, ≤7 blocks, at least one speaking exercise, a full 1→2→3 cycle (comprehension → controlled → production) and at most **4 "special" exercise types** per session. When trimming, preserve one of every special type (shadow/speak/listen/roleplay/match/multi-choice/dialogue-branch/fix-error/fill-blank/dialogue-order) and drop duplicate choice/builder/write items. Every session also keeps at least one advice block (technique/callout). This avoids both overload and sessions that only drill one skill.
- **Adaptive review:** after a wrong answer, `ExerciseFeedback` renders `MiniDrill.tsx` **inside the same feedback card** (1-2 quick questions for the top skill from `detectErrorSkills`, data in `src/data/microDrills.ts`). Do not add a separate drill card: three stacked advisory cards made the UI look broken. Show at most 2 skill chips and keep the drill non-scoring (remediation only).
- **Placement test** (`/placement`, `src/lib/placement.ts` + `src/components/placement/PlacementTest.tsx`): 8 questions score A1/A2/B1 and recommend a starting session; result is saved in `localStorage` under `runtimeenglish_placement_v1`.
- **TTS control (single UI):** `src/components/settings/TtsStudio.tsx` is the **only** pronunciation settings panel. It contains enable switch, speed presets, accent, one-tap easy mode (fast system voice), voice picker, pitch slider, preview/stop, and a collapsed "advanced" section for the HQ Kokoro engine. The old duplicated block was removed from `SettingsPanel.tsx` — do not re-add a second TTS section. Preferences `ttsPitch`/`ttsVoiceName` live in `SpeechSettings`/`ProgressSettings` + `progressSchema`, are read via `getSpeechPitch()`/`getPreferredVoiceName()` in `speech/platform.ts` and applied in `speech/browser.ts` (voice override + pitch multiplier, per-speaker style still applies). `previewVoice()`/`stopTts()` are in `speech/preview.ts`. The preview uses the **selected engine**: Google directly, Piper when it can speak, Kokoro only when already ready (a preview never forces a heavy download), native voice on Android, and otherwise the web voice. Success is signalled by `onstart` (audio is already audible), not `onend`, so a long sample is never cut off by the start deadline. Keep Kokoro/HQ logic untouched: it is optional and cached. Playback mirrors that chain: Google engine falls back to the device voice on Android, the system/native voice falls back to online when no English TTS data exists, and `speakNative()` bounds every plugin call (the plugin's `stop()` clears callbacks without settling them) and retries once without a forced voice index. Web Speech gives local voices the 700 ms start deadline and remote/network voices a longer one (`ttsStartTimeoutForVoice`), so a slow first word is not mistaken for a frozen voice.

**Third engine — Piper:** `src/lib/speech/piper.ts` lazily imports `piper-tts-web` (45 MB chunk, emitted only on demand), uses a CDN for `piper_phonemize` WASM and fetches the voice `en_US-libritts_r-medium` from HuggingFace on first use. It exposes `loadPiper()`, `speakWithPiper()`, status subscription and stop; `playSpeech()` falls back to the device voice if Piper fails. `progressSync` compact format also accepts `eng: 'piper'`. Official `sherpa-onnx` npm is Node-only and React Native wrappers do not apply to Capacitor+Preact, so Piper (the same VITS voices sherpa uses) is the browser-compatible equivalent.

- **Self-study / VideoLab** (`/learn`, `src/pages/learn.astro`): curated external resources (`src/data/learningResources.ts`) and YouTube videos with adapted, timestamped transcripts. Structure: `youtube.ts` (single, retryable API loader + minimal YT types), `useYouTubePlayer.ts` (player lifecycle, polling, loop/offset/rate), `SubtitleList.tsx` (active cue highlight, auto-scroll, TTS and save-phrase actions), `VideoLab.tsx` (thin composition + controls) and `ResourceExplorer.tsx` (filter/search over the resource directory). Video IDs were verified with YouTube oEmbed. The `en` text and `start`/`end` times are the **complete real YouTube captions** (one cue per caption line, full video); `highlight` and part of `es` are teaching aids, the rest of `es` is machine-translated at authoring time. Regenerate with `npm run captions:fetch -- <youtubeId> [fileName]` (dev-only `youtube-transcript` dependency → `src/data/videoTranscripts/*.ts`; the fetcher tries `en`, `en-US`, `en-GB` and `en-orig` tracks); commit the generated files so the app never depends on YouTube at runtime. The 29 curated lessons cover Git, APIs, CI/CD, stand-up meetings, dev vocabulary, communication, interviews, prompts, security, testing, Docker, code review and Agile/sprint vocabulary. The player sets `cc_load_policy: 0` (plus `controls: 0`) so YouTube's own captions never overlay the app's adapted `VideoCue` subtitles. `SubtitleList` has a "Seguir" toggle for auto-scroll. Keep the ±5s sync control and the "Abrir en YouTube" fallback for WebView/native. Sync details: YouTube polls at 80 ms, and auto-pause re-arms after every manual resume so the same cue can be paused twice. In the offline transcript player, `speechRun` forces TTS to replay when a line loops or the learner seeks inside the active cue (the active index alone would not change).

**VideoLab UX:** `VideoLibrary.tsx` is a catalog with YouTube thumbnails, duration badges, level/topic and resume progress; only the selected video mounts a player (avoids multiple iframes). Thumbnails have a local gradient fallback when `i.ytimg.com` is unreachable. `VideoLab.tsx` keeps a two-column layout on desktop, saves resume position every 5 s (`src/lib/videoProgress.ts`, key `runtimeenglish_video_progress_v1`), offers "Mark as watched", transcript search, per-line mic shadowing, keyboard shortcuts (space / ← → / F / C), saved-phrase flashcards and 3 comprehension questions per video (`VideoComprehension.tsx`). Controls are split into two labeled rows (playback / transcript) and the subtitle panel is height-capped with `overscroll-contain`: a manual scroll disables "Seguir" (`SubtitleList.onUserScroll`) so the page and the list never fight for the scroll.

**Rutina de hoy + modo offline:** `src/lib/dailyRoute.ts` builds a deterministic 1-4 step plan (due phrasebook SRS → unfinished video → weakest quiz → new video at the learner's level) capped by `settings.plan.dailyMinutes`; it is frozen for the day in `ProgressState.dailyRoute` (legacy `runtimeenglish_daily_route_v1` / `..._done_v1` keys are migrated once by `readLegacyDailyRoute()`), with per-step completion and `progressStore.resetDailyRoute()` for "Cambiar plan". It travels in the compact Supabase JSON under **`dr`** (normalized + merged by date in `progressSync.ts`, schema in `progressSchema.ts`), so the plan and its checkmarks sync across devices like the rest of progress. `DailyRoute.tsx` renders it above the catalog, can review due phrases inline, lets the learner mark each step done, and auto-marks the phrase step after reviewing all cards. `VideoLibrary.tsx` also offers "Solo sin ver" and sorting (default / unwatched first / most recent / shortest). `useOfflineMode.ts` detects `navigator.onLine` and also lets the user force "Sin conexión" (persisted in `runtimeenglish_learn_offline_v1`); when YouTube fails to load, VideoLab switches automatically. Offline playback uses `useTranscriptPlayer.ts`, which advances through `VideoCue` timings and speaks each line with the existing TTS engine, and exposes the same `PlayerController` contract as `useYouTubePlayer.ts` (`playerTypes.ts`). The 26 transcripts are bundled statically, so comprehension, line practice, phrase saving and SRS review all work without network; the PWA precaches HTML/JS/CSS. The transcript player calls `onFinish` once at the last cue (VideoLab marks the video as watched) and pauses when the tab is hidden.

**Mastery & level panel:** `src/lib/mastery.ts` marks an exercise as mastered after 2 correct streaks and a session as "Dominada" at ≥85% of its exercises (non-blocking: it is a goal indicator, navigation is never locked). `Roadmap.tsx` no longer owns filters: it receives `level` from the dashboard query param and renders only that level's modules/sessions with the mastery badge.

**E2E:** `e2e/learning.spec.ts` covers `/learn` resource filters, video library selection/transcript search, a mocked YouTube player (active cue from `getCurrentTime`, click-to-seek), an accessible-name audit of all visible buttons, the dashboard skeleton/greeting stability and the full `/placement` flow. `e2e/accessibility.spec.ts` audits every main page for visible controls without an accessible name (buttons, links, inputs and images; `alt=""` is allowed for decorative thumbnails), and `e2e/search.spec.ts` covers filtering/clear/keyboard shortcuts and `.html` links. Run with `npm run test:e2e` (Playwright serves `dist/` on port 4321).

**Native QA checklist (manual, required before releasing a VideoLab change):** build with `pnpm android:apk`, install on a device, open `/learn.html` and confirm (1) the iframe loads and plays, (2) the highlighted line changes with the audio, (3) tapping a line seeks, (4) "Guardar" adds the phrase to the dictionary, (5) "Practicar frases guardadas" grades through FSRS, and (6) with no network the fallback link appears instead of a blank box. `INTERNET` permission and HTTPS iframe are already configured; `allowMixedContent` is false on purpose.

### Release notes / changelog

- `src/data/changelog.ts` holds the release notes (newest entry first, `version` = current app version) and `src/lib/changelog.ts` tracks the last version seen in `localStorage` (`runtimeenglish_changelog_seen_v1`).
- On the first load of a new version (and only after onboarding), `ReleaseNotesModal` shows what changed once; `Ajustes → Novedades` or "Ver todas las versiones" in the sheet reopens the full history via `runtimeenglish:show-changelog`. `ChangelogDot` shows a badge on the topbar settings button until the version is marked seen (`runtimeenglish:changelog-seen`).
- `AppModals.tsx` owns both app-wide dialogs and gives the APK update notice priority. `ResponsiveDialog.tsx` renders a swipeable `BottomSheet.tsx` on phones (drag handle, slide from bottom, safe-area) and a centered `Modal.tsx` on desktop, with distinct action layouts. `useDialogBehavior.ts` handles exit animation, scroll lock, focus trap/restoration and reduced motion; `dialogStack.ts` lets the native back button (`BaseLayout.astro`) close the top dialog before navigating/exiting. Keep changelog version aligned with `package.json` (enforced by `src/lib/changelog.test.ts`) and see `RELEASING.md`.

### Recently added features

- **Search** (`/search`): index built at build time from sessions/blocks/exercises/slang. `SearchView.tsx` scores title matches above body matches, ignores accents/case (`normalize()`), caps results at 60 and offers kind chips (`all`/`session`/`vocab`/`phrase`/`slang`/`exercise`) with per-kind counts for the current query. Autofocus is desktop-only (`pointer: fine`) so touch devices do not pop the keyboard; `/` focuses the search box from anywhere (except while typing), `Esc` clears it, the clear button has an accessible name, and the result count is an `aria-live="polite"` status. Results must keep using the `href` values produced by `route()` in `search.astro` for Capacitor compatibility. Covered by `SearchView.ui.test.tsx` and `e2e/search.spec.ts`.
- **Quick practice** (`/practice`): mixed rounds (review/new/mix) reusing `ExerciseRunner`.
- **Onboarding** on the dashboard for users who are not onboarded.
- **Basic insights** on the dashboard (e.g. accuracy/attempts, quick access).
- **Custom lessons / Mis lecciones** (`/my-lessons`, `/my-lesson?id=...`): users can create and save personalized lessons locally.
  - **Flow:** enter a topic, copy an optimized AI prompt, generate lesson JSON with an external AI, paste/validate/import the JSON, then open and practice the lesson.
  - **Storage:** local-first in browser `localStorage` key `runtimeenglish_custom_lessons_v1` (`src/lib/customLessons.ts`); no Supabase table/sync for custom lesson content yet.
  - **Implementation:** `src/components/custom-lessons/*` (list/import UI, client block renderer, lesson viewer) + `ExerciseRunner` reuse for practice/progress tracking by custom session/exercise IDs.
  - **Prompt/validation:** import prompt is explicit about required schema/fields per exercise type and requests JSON-only output (no markdown/emojis); importer validates/normalizes supported blocks and exercise formats before saving.

### Voice (TTS)

- `src/lib/speech.ts`: uses native TTS on Capacitor/Android (`@capacitor-community/text-to-speech`) with fallback to the Web Speech API; respects `settings.ttsEnabled`, `ttsRate`, and `ttsEngine` (`system`/`google`/`kokoro`/`piper`). `data-tts` on `<html>` controls visibility of voice controls. `TtsStudio.tsx` shows the active engine in a one-line readout; do not add a second TTS settings panel.
- **Kokoro HQ (performance):** Automatic preloading of the cached model is deferred and conservative. It is not preloaded at startup on native Android just because it is cached; on-demand loading (Settings/explicit use) is prioritized to avoid CPU/memory spikes at app launch. `warmConversationPhrases()` primes system voices and pre-generates the exact dialogue lines when a conversation mounts; it only triggers Kokoro loading when the user selected the HQ engine (and never forces an uncached download on native). **Session-wide prewarm:** `collectSessionSpeechTexts()` (`src/lib/speech/sessionPhrases.ts`) enumerates every speakable English phrase (blocks + exercises + pronunciation) and `warmSessionPhrases()` primes them with the **active engine only** — Kokoro priority-first-then-queued (cap = cache size), Google bulk MP3 prefetch only on a healthy connection, Piper pre-generation without forcing a download on native, and system/native voices resolved once. It is mounted via `SessionSpeechPrewarm` on `/session/[slug]`, used by custom lessons and by the viewport `IntersectionObserver` in `BaseLayout.astro`.

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
