import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAllVideoProgress,
  getVideoProgress,
  markVideoCompleted,
  saveVideoProgress,
} from './videoProgress'

const store = new Map<string, string>()
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
})

describe('video progress', () => {
  beforeEach(() => store.clear())

  it('saves and reads resume position', () => {
    saveVideoProgress('lesson-1', {
      position: 42,
      duration: 100,
      completed: false,
      updatedAt: 123,
    })
    expect(getVideoProgress('lesson-1')?.position).toBe(42)
    expect(getAllVideoProgress()['lesson-1']?.duration).toBe(100)
  })

  it('marks a video as completed', () => {
    markVideoCompleted('lesson-1', 598)
    expect(getVideoProgress('lesson-1')).toMatchObject({ completed: true, duration: 598 })
  })

  it('returns undefined for unknown videos', () => {
    expect(getVideoProgress('missing')).toBeUndefined()
  })
})
