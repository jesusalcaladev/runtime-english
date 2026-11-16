import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@capacitor/app', () => ({
  App: {
    getInfo: vi.fn(),
  },
}))

vi.mock('@capacitor/browser', () => ({
  Browser: {
    open: vi.fn(),
  },
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
  },
}))

import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { checkForAppUpdateDetailed, dismissAppUpdate, getAppUpdateManifestUrl } from './appUpdate'

const originalWindow = globalThis.window

function createStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
  }
}

describe('appUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
    vi.mocked(Capacitor.getPlatform).mockReturnValue('web')
    globalThis.window = {
      localStorage: createStorageMock(),
    } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalWindow === undefined) {
      // @ts-expect-error cleanup test-only global
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  describe('getAppUpdateManifestUrl', () => {
    it('prefers PUBLIC_APP_UPDATE_URL when set', () => {
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', 'https://example.com/custom/app-update.json')
      vi.stubEnv('PUBLIC_APP_URL', 'https://ignored.example.com')
      expect(getAppUpdateManifestUrl()).toBe('https://example.com/custom/app-update.json')
    })

    it('derives manifest URL from PUBLIC_APP_URL when explicit URL is missing', () => {
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', '')
      vi.stubEnv('PUBLIC_APP_URL', 'https://runtime.example.com/base')
      expect(getAppUpdateManifestUrl()).toBe('https://runtime.example.com/app-update.json')
    })

    it('returns null when update URLs are not configured', () => {
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', '')
      vi.stubEnv('PUBLIC_APP_URL', '')
      expect(getAppUpdateManifestUrl()).toBeNull()
    })
  })

  describe('checkForAppUpdateDetailed', () => {
    it('returns no-window when window is unavailable', async () => {
      // @ts-expect-error test-only global
      delete globalThis.window
      const result = await checkForAppUpdateDetailed({ force: true })
      expect(result).toEqual({ status: 'error', info: null, error: 'no-window' })
    })

    it('returns not-native outside native Android', async () => {
      const result = await checkForAppUpdateDetailed({ force: true })
      expect(result).toEqual({ status: 'not-native', info: null })
      expect(vi.mocked(App.getInfo)).not.toHaveBeenCalled()
    })

    it('returns not-configured on native Android when manifest URL is missing', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', '')
      vi.stubEnv('PUBLIC_APP_URL', '')

      const result = await checkForAppUpdateDetailed({ force: true })
      expect(result).toEqual({ status: 'not-configured', info: null, manifestUrl: null })
    })

    it('returns throttled when checked recently without force', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', 'https://example.com/app-update.json')
      window.localStorage.setItem('runtimeenglish_update_last_check_v1', String(Date.now()))

      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const result = await checkForAppUpdateDetailed()
      expect(result.status).toBe('throttled')
      expect(result.manifestUrl).toBe('https://example.com/app-update.json')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns up-to-date when remote build is not newer', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', 'https://example.com/app-update.json')
      vi.mocked(App.getInfo).mockResolvedValue({ version: '1.2.3', build: '6' } as any)

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ versionCode: 6, versionName: '1.2.3', apkUrl: 'https://x/a.apk' }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await checkForAppUpdateDetailed({ force: true })
      expect(result.status).toBe('up-to-date')
      expect(result.info).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('returns update-available for newer remote build and resolves relative apk URL', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', 'https://example.com/releases/app-update.json')
      vi.mocked(App.getInfo).mockResolvedValue({ version: '1.2.3', build: '6' } as any)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            versionCode: 7,
            versionName: '1.3.0',
            apkUrl: '/downloads/RuntimeEnglish.apk',
            title: 'Update',
            notes: 'Fixes',
          }),
        }),
      )

      const result = await checkForAppUpdateDetailed({ force: true })
      expect(result.status).toBe('update-available')
      expect(result.info).toMatchObject({
        currentBuild: 6,
        latestBuild: 7,
        latestVersionName: '1.3.0',
        apkUrl: 'https://example.com/downloads/RuntimeEnglish.apk',
        title: 'Update',
        notes: 'Fixes',
        mandatory: false,
      })
    })

    it('respects dismissed build unless forced', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      vi.stubEnv('PUBLIC_APP_UPDATE_URL', 'https://example.com/app-update.json')
      vi.mocked(App.getInfo).mockResolvedValue({ version: '1.2.3', build: '6' } as any)
      dismissAppUpdate(7)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ versionCode: 7, versionName: '1.3.0', apkUrl: 'https://x/a.apk' }),
        }),
      )

      const dismissed = await checkForAppUpdateDetailed({ force: false })
      expect(dismissed.status).toBe('dismissed')

      window.localStorage.setItem('runtimeenglish_update_last_check_v1', '0')
      const forced = await checkForAppUpdateDetailed({ force: true })
      expect(forced.status).toBe('update-available')
    })
  })
})
