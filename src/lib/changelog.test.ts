import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CHANGELOG, CURRENT_APP_VERSION } from '../data/changelog'
import { compareVersions, getUnseenReleases, markChangelogSeen } from './changelog'

const originalWindow = globalThis.window

function createStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
  }
}

describe('changelog', () => {
  beforeEach(() => {
    globalThis.window = {
      localStorage: createStorageMock(),
    } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error cleanup test-only global
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  it('keeps the newest release aligned with package.json', () => {
    const pkg = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as { version: string }
    expect(CURRENT_APP_VERSION).toBe(pkg.version)
    expect(CHANGELOG[0]?.version).toBe(CURRENT_APP_VERSION)
  })

  it('has valid, descending releases', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0)
    for (const release of CHANGELOG) {
      expect(release.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(release.title.length).toBeGreaterThan(0)
      expect(release.entries.length).toBeGreaterThan(0)
    }
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(compareVersions(CHANGELOG[i - 1]!.version, CHANGELOG[i]!.version)).toBeGreaterThan(0)
    }
  })

  it('compares dotted versions numerically', () => {
    expect(compareVersions('1.2.10', '1.2.4')).toBeGreaterThan(0)
    expect(compareVersions('1.2.4', '1.2.4')).toBe(0)
    expect(compareVersions('1.2.0', '1.3.0')).toBeLessThan(0)
  })

  it('shows only the latest release on first ever load', () => {
    const releases = getUnseenReleases()
    expect(releases).toHaveLength(1)
    expect(releases[0]?.version).toBe(CURRENT_APP_VERSION)
  })

  it('does not show a release again after it was marked as seen', () => {
    markChangelogSeen()
    expect(getUnseenReleases()).toHaveLength(0)
  })
})
