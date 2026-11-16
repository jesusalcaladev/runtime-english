# Contributing to RuntimeEnglish

Thanks for your interest in contributing to RuntimeEnglish! This guide explains how to set up the project, propose changes, and submit high-quality contributions.

## Table of contents

- [Project overview](#project-overview)
- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Running the project](#running-the-project)
- [Code style and quality](#code-style-and-quality)
- [Testing](#testing)
- [Android (Capacitor) notes](#android-capacitor-notes)
- [Branching, commits, and pull requests](#branching-commits-and-pull-requests)
- [Content and curriculum contributions](#content-and-curriculum-contributions)
- [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)
- [Security issues](#security-issues)

## Project overview

RuntimeEnglish is a web (PWA-ready) and Android app for learning technical English for developers (A1–B2).

- **Frontend:** Astro 7 (static) + Preact islands
- **Styling:** Tailwind CSS 4 + daisyUI 5
- **Mobile:** Capacitor 8 (Android)
- **Tooling:** TypeScript, Biome, Vitest, Playwright
- **Optional backend services:** Supabase (auth/sync/certificates)

For architecture and project-specific conventions, also see [`AGENT.md`](AGENT.md).

## Ways to contribute

- Fix bugs (UI, routing, TTS, progress, Android integration, etc.)
- Improve accessibility, performance, or UX
- Add or refine curriculum content and exercises
- Improve documentation
- Add or improve tests (unit/integration/E2E)
- Improve developer tooling and CI-related workflows

## Development setup

### Prerequisites

- **Node.js** (LTS recommended)
- **pnpm** (recommended; repository includes `pnpm-lock.yaml`)
- **Git**
- For Android work (optional): **JDK 17+** (JDK 21 recommended), **Android SDK**, and Android Studio

### Clone and install

```bash
git clone https://github.com/jesusalcaladev/runtime-english.git
cd runtime-english
pnpm install
```

> If you use npm, install dependencies with `npm install`, but prefer pnpm for consistency with the lockfile.

## Running the project

### Web app (development)

```bash
pnpm dev
```

Astro will print the local development URL (usually `http://localhost:4321`).

### Production build and preview

```bash
pnpm build
pnpm preview
```

### Type checking

```bash
pnpm check
```

## Code style and quality

This repository uses **Biome** for linting/formatting.

```bash
pnpm lint          # Lint
pnpm lint:fix      # Lint with fixes
pnpm format        # Format (write)
pnpm format:check  # Format check
pnpm check:biome   # Biome check
pnpm check:biome:fix
```

### General guidelines

- Follow existing patterns and naming conventions in the codebase.
- Keep changes focused and avoid unrelated refactors in the same PR.
- Prefer clear, maintainable code over clever abstractions.
- Preserve user progress/data compatibility when changing storage formats, keys, or sync behavior.
- For internal navigation changes, keep Capacitor/static routing compatibility in mind (see `src/lib/routes.ts` and `AGENT.md`).
- Do not modify brand/logo assets unless the change explicitly requires it.

## Testing

Run the relevant tests for your change before submitting a PR.

```bash
pnpm test            # Vitest (run once)
pnpm test:watch      # Vitest (watch mode)
pnpm test:coverage   # Coverage report
pnpm test:e2e        # Playwright E2E
pnpm test:e2e:ui     # Playwright UI mode
```

If you add behavior or fix a bug, include or update tests when practical.

## Android (Capacitor) notes

### Sync/build commands

```bash
pnpm android:sync        # Build web + sync to android/
pnpm android:open        # Open in Android Studio
pnpm android:apk         # Sync + debug APK build (copied to apks/)
pnpm android:apk:release # Sync + release APK build (copied to apks/)
```

### Local JDK/SDK environment (example)

```bash
export JAVA_HOME="$HOME/jdks/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
pnpm android:apk
```

> Adjust paths for your machine. See [`AGENT.md`](AGENT.md) for project-specific Android/build notes.

## Branching, commits, and pull requests

### Branching

- Create a branch from the default branch (`main`) for your work.
- Use descriptive branch names, e.g. `fix/tts-fallback-brave`, `feat/practice-filters`, `docs/update-readme`.

### Commits

- Write clear commit messages that explain _what_ and _why_.
- Keep commits logically scoped when possible.
- Avoid committing generated artifacts unless the repository workflow expects them (ask/verify if unsure).

### Pull requests

Before opening a PR:

1. Sync with the latest `main` branch.
2. Run relevant checks locally (`pnpm check`, `pnpm build`, tests/lint as applicable).
3. Verify Android sync/build impact if your change affects mobile behavior.
4. Update documentation when behavior, setup, or workflows change.

In your PR description, include:

- **Summary** of the change
- **Motivation / problem** being solved
- **How to test** (steps, screenshots/video if UI changes)
- **Notes/risks** (migrations, compatibility, follow-ups)

## Content and curriculum contributions

Curriculum and content live primarily under `src/data/`.

When adding or modifying sessions/modules:

- Follow existing data structures and typing patterns.
- Keep IDs/slugs consistent and unique.
- Register new modules in the curriculum index where required.
- Verify routes/navigation and content rendering locally.
- Prefer clear, practical technical English examples relevant to developers.

## Reporting bugs and requesting features

- **Bugs:** include reproduction steps, expected vs actual behavior, environment details (browser/device/OS), and screenshots/logs when possible.
- **Feature requests:** describe the use case, proposed behavior, and any alternatives considered.

If a public issue tracker is enabled for this repository, use it. Otherwise, coordinate with the maintainers/owner.

## Security issues

Please **do not** report security vulnerabilities in public issues. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.
