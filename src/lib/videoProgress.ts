export interface VideoProgress {
  position: number
  duration: number
  completed: boolean
  updatedAt: number
}

export type VideoProgressMap = Record<string, VideoProgress>

const STORAGE_KEY = 'runtimeenglish_video_progress_v1'

function read(): VideoProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as VideoProgressMap
  } catch {
    return {}
  }
}

export function getVideoProgress(lessonId: string): VideoProgress | undefined {
  const entry = read()[lessonId]
  if (!entry || typeof entry.position !== 'number') return undefined
  return entry
}

export function getAllVideoProgress(): VideoProgressMap {
  return read()
}

export function saveVideoProgress(lessonId: string, progress: VideoProgress): void {
  if (typeof window === 'undefined') return
  try {
    const all = read()
    all[lessonId] = progress
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Almacenamiento no disponible: el video sigue siendo reproducible.
  }
}

export function markVideoCompleted(lessonId: string, duration: number): void {
  saveVideoProgress(lessonId, {
    position: 0,
    duration,
    completed: true,
    updatedAt: Date.now(),
  })
}
