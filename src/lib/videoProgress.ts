import { progressStore } from './progress'
import type { VideoProgress } from './videoLabState'

export type { VideoProgress } from './videoLabState'

export type VideoProgressMap = Record<string, VideoProgress>

/** El estado de video se guarda en `progressStore` para que se sincronice con Supabase. */
export function getVideoProgress(lessonId: string): VideoProgress | undefined {
  return progressStore.getState().videoLab.progress[lessonId]
}

export function getAllVideoProgress(): VideoProgressMap {
  return progressStore.getState().videoLab.progress
}

export function saveVideoProgress(lessonId: string, progress: VideoProgress): void {
  progressStore.saveVideoProgress(lessonId, progress)
}

export function markVideoCompleted(lessonId: string, duration: number): void {
  saveVideoProgress(lessonId, {
    position: 0,
    duration,
    completed: true,
    updatedAt: Date.now(),
  })
}
