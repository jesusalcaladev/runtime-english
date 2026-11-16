import { CHANGELOG, type ChangelogRelease, CURRENT_APP_VERSION } from '../data/changelog'

const SEEN_VERSION_KEY = 'runtimeenglish_changelog_seen_v1'

/** Dispatched by Settings (or anywhere) to open the full changelog on demand. */
export const SHOW_CHANGELOG_EVENT = 'runtimeenglish:show-changelog'

/** Dispatched when the current version is marked as seen (hides the badge). */
export const CHANGELOG_SEEN_EVENT = 'runtimeenglish:changelog-seen'

/** Compare dotted numeric versions: 1.2.10 > 1.2.4. */
export function compareVersions(a: string, b: string): number {
  const partsA = String(a).split('.')
  const partsB = String(b).split('.')
  const length = Math.max(partsA.length, partsB.length)

  for (let i = 0; i < length; i++) {
    const valueA = Number.parseInt(partsA[i] ?? '0', 10) || 0
    const valueB = Number.parseInt(partsB[i] ?? '0', 10) || 0
    if (valueA !== valueB) return valueA > valueB ? 1 : -1
  }

  return 0
}

function readSeenVersion(): string {
  if (typeof window === 'undefined') return CURRENT_APP_VERSION
  try {
    return window.localStorage.getItem(SEEN_VERSION_KEY) || ''
  } catch {
    return ''
  }
}

/**
 * Releases the user has not seen yet. On first ever load we only show the
 * newest release (so the modal reads as "what's new", not a wall of history).
 */
export function getUnseenReleases(): ChangelogRelease[] {
  const seen = readSeenVersion()
  if (!seen) return CHANGELOG.slice(0, 1)
  return CHANGELOG.filter((release) => compareVersions(release.version, seen) > 0)
}

/** Called when the automatic modal is closed, so it won't show again for this version. */
export function markChangelogSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SEEN_VERSION_KEY, CURRENT_APP_VERSION)
    window.dispatchEvent(new CustomEvent(CHANGELOG_SEEN_EVENT))
  } catch {
    // storage unavailable (private mode / quota): the modal may show again
  }
}
