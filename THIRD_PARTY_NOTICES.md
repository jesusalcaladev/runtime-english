# Third-Party Notices

This document lists third-party software, assets, and services used by **RuntimeEnglish** and provides license/attribution guidance. It is provided for convenience and transparency; it may not be exhaustive.

> **Important:** This project is licensed under `GPL-3.0-or-later` (see [`LICENSE`](LICENSE)). Third-party components remain under their own licenses and terms. You must comply with the applicable licenses/terms for any third-party components you use, modify, or redistribute.

## 1. Project-owned material

Unless otherwise noted, the following are created by the RuntimeEnglish authors and distributed as part of this project under `GPL-3.0-or-later`:
- Application source code in this repository
- Curriculum and learning content in `src/data/curriculum/` and `src/data/slang.ts` (including text/exercises authored for this project)
- Project-specific UI/content and configuration authored for this repository

If any material in the repository is not original or is subject to different terms, it should be explicitly identified and documented here.

## 2. Direct npm dependencies (from `package.json`)

The table below reflects direct dependencies/devDependencies and the license field reported by the installed package metadata at the time this file was generated. Transitive dependencies may have additional licenses; review your lockfile/install tree for a complete picture.

| Package | Installed version | License (reported) |
| --- | ---: | --- |
| @astrojs/check | 0.9.12 | MIT |
| @astrojs/preact | 6.1.6 | MIT |
| @biomejs/biome | 2.6.7 | MIT OR Apache-2.0 |
| @capacitor-community/text-to-speech | 8.0.2 | MIT |
| @capacitor/android | 8.6.2 | MIT |
| @capacitor/app | 8.1.2 | MIT |
| @capacitor/browser | 8.0.5 | MIT |
| @capacitor/cli | 8.6.2 | MIT |
| @capacitor/core | 8.6.2 | MIT |
| @capacitor/local-notifications | 8.3.1 | MIT |
| @fontsource-variable/geist | 5.3.0 | OFL-1.1 |
| @fontsource-variable/geist-mono | 5.3.0 | OFL-1.1 |
| @fontsource-variable/geist-pixel | 5.3.1 | OFL-1.1 |
| @huggingface/transformers | 3.8.1 | Apache-2.0 |
| @lucide/astro | 1.72.0 | ISC |
| @nanostores/preact | 1.1.1 | MIT |
| @playwright/test | 1.65.1 | Apache-2.0 |
| @react-pdf/renderer | 4.9.0 | MIT |
| @supabase/supabase-js | 2.119.0 | MIT |
| @tailwindcss/vite | 4.3.5 | MIT |
| @testing-library/dom | 10.4.2 | MIT |
| @testing-library/preact | 3.2.6 | MIT |
| @testing-library/user-event | 14.6.10 | MIT |
| @vite-pwa/astro | 2.0.2 | MIT |
| @vitest/coverage-v8 | 2.1.9 | MIT |
| astro | 7.4.11 | MIT |
| daisyui | 5.8.0 | MIT |
| date-fns | 4.4.0 | MIT |
| happy-dom | 21.0.4 | MIT |
| jspdf | 4.2.1 | MIT |
| kokoro-js | 1.2.1 | Apache-2.0 |
| lucide-preact | 1.72.0 | ISC |
| minisearch | 7.2.0 | MIT |
| msw | 2.15.0 | MIT |
| nanostores | 1.5.5 | MIT |
| preact | 11.2.0 | MIT |
| tailwindcss | 4.3.5 | MIT |
| ts-fsrs | 6.0.0 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| vitest | 2.1.9 | MIT |
| zod | 4.6.7 | MIT |

**Note:** Some packages are dual-licensed or have additional bundled components. Always consult each package's own `LICENSE`/`NOTICE` files in `node_modules/<package>/` (or upstream repository) for authoritative terms.

## 3. Fonts and icons

- **Geist / Geist Mono / Geist Pixel** (`@fontsource-variable/geist*`): reported as **OFL-1.1** (SIL Open Font License 1.1). Ensure required font copyright/license notices are preserved as applicable when redistributing the fonts or font files.
- **Lucide icons** (`@lucide/astro`, `lucide-preact`): reported as **ISC**. Review upstream license/attribution requirements for redistribution.

## 4. Speech / ML components and runtime-downloaded resources

- **Web/native TTS:** Uses browser Web Speech API and/or native device TTS capabilities (platform-provided).
- **`@huggingface/transformers` (Apache-2.0)** and **`kokoro-js` (Apache-2.0):** the app may download and cache model weights/assets at runtime for the HQ voice feature. **Model files/weights and any associated assets are subject to their own licenses and terms** (which may differ from the library license). Review the specific model cards/repositories and terms for the models used (e.g. Kokoro/TTS models distributed via Hugging Face or other sources) before redistribution or commercial use.
- Do not assume that runtime-downloaded model artifacts are covered by this repository's GPL license.

## 5. Android / Capacitor and Gradle dependencies

The Android app in `android/` is built with Capacitor and the Android/Gradle ecosystem. In addition to npm packages, Android builds may include:
- Capacitor Android libraries/plugins
- AndroidX, Google, Kotlin/Java, and other Maven/Gradle dependencies
- Platform SDK components and build tools (not redistributed by this repo except as required by build artifacts)

These components have their own licenses. When distributing APKs/binaries, review the corresponding Gradle dependency licenses and include any required notices/attributions.

## 6. Other assets and content

- **Static assets** in `public/` (e.g. `favicon.svg`, manifest, `app-update.json`, service worker scripts): verify authorship/licensing for each asset. Project-authored assets may be covered by `GPL-3.0-or-later`; third-party assets must retain their own licenses/attributions.
- **Curriculum/content:** if all learning content is original to the project authors, it may be treated as project-owned material (see section 1). If you choose to license educational content separately (e.g. under a Creative Commons license), document that choice explicitly.
- **Generated artifacts** (`dist/`, `apks/`, Android build outputs): not source-of-truth and should be regenerated from source; distributed binaries must comply with all applicable licenses (including providing corresponding source as required by GPL for covered parts).

## 7. How to update this file

- **After dependency changes:** regenerate/refresh the npm dependency table and review licenses:
  - Inspect direct deps: check `package.json` and each package's license in `node_modules/<package>/package.json` or upstream.
  - Optionally use tooling such as `pnpm licenses list` (or equivalent) to review direct/transitive licenses.
- **After adding assets, fonts, media, or models:** add attribution/license details in the relevant section.
- **Before releases/APK distribution:** verify that required notices, license texts, and corresponding-source obligations are satisfied for all included components.

---

*This file is informational and not legal advice.* For authoritative terms, consult the license texts provided by each upstream project/component.