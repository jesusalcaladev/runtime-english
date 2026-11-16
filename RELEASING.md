# Releasing RuntimeEnglish (Web + Android APK)

This document defines the reproducible release process for RuntimeEnglish, including Android APK distribution and the in-app update manifest (`public/app-update.json`).

## Scope

- **Web build:** generated with Astro (`dist/`)
- **Android app:** Capacitor project in `android/` (package `com.runtimeenglish.core`)
- **Update channel (native, no OTA):** installed APK checks `public/app-update.json` and prompts users to download/install a newer APK from GitHub Releases

## Source of truth and version alignment

Before publishing, keep these values aligned for the same release:

| Item                     | File / location                                          | Notes                                                                        |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Web/package version      | `package.json` (`version`)                               | Keep in sync with the app release version                                    |
| npm lock root version    | `package-lock.json` (root/package entries)               | Update when package version changes                                          |
| Android `versionName`    | `android/app/build.gradle` (`defaultConfig.versionName`) | User-visible version (e.g. `1.2.3`)                                          |
| Android `versionCode`    | `android/app/build.gradle` (`defaultConfig.versionCode`) | Integer, must increase on every published APK update                         |
| In-app update manifest   | `public/app-update.json`                                 | Must match the published APK (`versionName`, `versionCode`, `apkUrl`, notes) |
| Git tag / GitHub Release | e.g. `v1.2.3`                                            | Tag the released commit; release hosts the APK asset                         |

> The Android app compares `versionCode` from the manifest against the installed APK build to decide if an update is available.

## Prerequisites

### General

- Node.js + pnpm (recommended) / npm
- Dependencies installed (`pnpm install`)
- Clean working tree for the release commit (recommended)
- GitHub CLI (`gh`) authenticated if publishing releases from terminal

### Android

- JDK 17+ (JDK 21 recommended)
- Android SDK / build tools installed
- `android/local.properties` configured (e.g. `sdk.dir=...`)
- Capacitor/Gradle able to build from `android/`

Example local environment (adjust paths as needed):

```bash
export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

### Signing (required for distributable release APKs)

`android/app/build.gradle` currently defines a `release` build type but **does not include committed signing configuration**. For a distributable release:

- **Debug APKs** are fine for local testing only.
- **Release APKs published to users** must be **signed** with your release keystore (and consistently signed for updates, per Android signing/update rules).
- **Do not commit** keystore files, passwords, or private signing material.

Recommended approach (local, uncommitted):

1. Generate/store a release keystore outside the repo (or in an ignored path).
2. Configure signing locally (Android Studio signing config, or Gradle `signingConfigs` fed by local properties/environment variables).
3. Build a **signed release APK** and verify the signature before publishing.

> If you automate signing later, inject secrets via CI secrets/local environment and keep keystore material out of git.

## Release checklist

### 1. Prepare the release

- [ ] Confirm target version (`X.Y.Z`) and increment rules:
  - [ ] `versionCode` increased (integer, monotonic for updates)
  - [ ] `versionName` updated
- [ ] Update version fields:
  - [ ] `package.json`
  - [ ] `package-lock.json` (root/package version fields)
  - [ ] `android/app/build.gradle` (`versionCode`, `versionName`)
- [ ] Run validation (minimum):
  - [ ] `pnpm check`
  - [ ] `pnpm test`
  - [ ] `pnpm build`
  - [ ] (Optional but recommended) `pnpm check:biome` and `pnpm format:check`
- [ ] Update release notes/changelog content you plan to publish (GitHub Release notes and/or `public/app-update.json` `title`/`notes`)

### 2. Build Android artifacts

#### Debug build (testing/internal)

```bash
pnpm android:apk
```

- Produces a debug APK and copies it to `apks/` as `RuntimeEnglish-v<version>-debug.apk` (per current Gradle/script behavior).

#### Release build (distribution)

```bash
pnpm android:apk:release
```

- Produces a release APK in `android/app/build/outputs/apk/release/` and copies it to `apks/` (current scripts).
- **Important:** ensure the artifact you publish is **signed for release**. If signing is not configured, configure it locally first or sign via your release workflow before publishing.

### 3. Verify the APK artifact

- [ ] Confirm filename/version matches the release (`RuntimeEnglish-v<version>-release.apk` or your signed output naming)
- [ ] Install on a device/emulator and smoke test critical flows (launch, navigation, session/practice, settings, update banner behavior if applicable)
- [ ] Confirm `versionName` / `versionCode` in the installed build match the intended release

### 4. Publish GitHub Release

- [ ] Create and push a git tag for the release commit (e.g. `v1.2.3`)
- [ ] Create a GitHub Release for that tag
- [ ] Upload the **signed release APK** as asset name `RuntimeEnglish.apk` (recommended)
  - This preserves the stable download URL: `.../releases/latest/download/RuntimeEnglish.apk`
  - Also keep a versioned asset name if desired for traceability

Example (after building and signing the release APK locally):

```bash
# Replace the APK path with your signed release artifact
gh release create v1.2.3 apks/RuntimeEnglish-v1.2.3-release.apk#RuntimeEnglish.apk \
  --title "RuntimeEnglish v1.2.3" \
  --notes "<release notes>"
```

> Do **not** publish a debug APK as the production update asset.

### 5. Update the in-app update manifest

Edit `public/app-update.json` to point to the published release asset and match the APK version:

```json
{
  "versionName": "1.2.3",
  "versionCode": 6,
  "apkUrl": "https://github.com/jesusalcaladev/runtime-english/releases/download/v1.2.3/RuntimeEnglish.apk",
  "title": "Nueva versión disponible",
  "notes": "Resumen breve de cambios."
}
```

Checklist:

- [ ] `versionCode` matches the published APK
- [ ] `versionName` matches the published APK
- [ ] `apkUrl` points to the correct GitHub Release asset (versioned URL)
- [ ] `title`/`notes` are user-facing and accurate

### 6. Publish manifest changes and verify update flow

- [ ] Commit and push the manifest/version changes to the branch/ref served by `PUBLIC_APP_UPDATE_URL`
- [ ] Verify the manifest URL is reachable and returns the expected JSON
- [ ] On a device with an older installed build, confirm:
  - [ ] update check detects the new `versionCode`
  - [ ] update prompt appears
  - [ ] download link opens the correct APK asset

## Rollback / hotfix notes

- To stop prompting an update, correct `public/app-update.json` to the intended latest published version/asset.
- For a hotfix, increment `versionCode` again and publish a new signed APK + updated manifest (users compare against `versionCode`, not just `versionName`).
- Keep GitHub Release assets and manifest entries consistent; mismatches cause confusing or broken update prompts.

## Related files

- `android/app/build.gradle` (Android versioning/build config)
- `package.json` (web/package version and scripts)
- `public/app-update.json` (native update manifest)
- `src/lib/appUpdate.ts` (update check logic)
- `AGENT.md` (project operations and conventions)
- `README.md` (project overview and development commands)
