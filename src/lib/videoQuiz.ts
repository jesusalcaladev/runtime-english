import { progressStore } from './progress'
import type { VideoQuizAttempt, VideoQuizProgress } from './videoLabState'

export type { VideoQuizAttempt, VideoQuizProgress } from './videoLabState'

/** El quiz se guarda en `progressStore` para que se sincronice con Supabase. */
export function getVideoQuizProgress(lessonId: string): VideoQuizProgress | undefined {
  return progressStore.getState().videoLab.quiz[lessonId]
}

export function saveVideoQuizAttempt(
  lessonId: string,
  attempt: VideoQuizAttempt,
): VideoQuizProgress {
  return progressStore.saveVideoQuizAttempt(lessonId, attempt)
}

export function clearVideoQuizProgress(lessonId: string): void {
  progressStore.clearVideoQuizProgress(lessonId)
}
