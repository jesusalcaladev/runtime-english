import { inferExerciseSkills } from './errorPatterns'
import { isSessionRelevantToGoal } from './goals'
import { getSkillProfile } from './learning'
import {
  getDuePhraseEntries,
  getWeakPhraseEntries,
  isExerciseDue,
  type PhrasebookEntry,
  type ProgressState,
} from './progress'
import type { Exercise } from './types'

export interface PracticeItem {
  exercise: Exercise
  sessionId: string
  sessionSlug: string
  sessionTitle: string
  moduleCode: string
  cefr: string
}

export type PracticeMode = 'review' | 'weak' | 'new' | 'mix' | 'phrases'

export function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickUnique(items: PracticeItem[], n: number): PracticeItem[] {
  const seen = new Set<string>()
  const unique: PracticeItem[] = []
  for (const item of items) {
    if (seen.has(item.exercise.id)) continue
    seen.add(item.exercise.id)
    unique.push(item)
    if (unique.length >= n) break
  }
  return unique
}

export function reviewScore(item: PracticeItem, state: ProgressState, now: number): number {
  const id = item.exercise.id
  const attempts = state.attempts[id] ?? 0
  const doneAt = state.completedExercises[id]
  const done = Boolean(doneAt)
  const srs = state.exerciseSrs[id]
  const due = isExerciseDue(state, id, now)
  const overdueMs = srs ? Math.max(0, now - srs.due) : 0
  const overdueDays = overdueMs / 86_400_000
  const goal = state.settings.goal ?? 'all'
  const goalBoost = isSessionRelevantToGoal(item.sessionSlug, goal) ? 12 : 0

  if (attempts > 0 && !done) return 1200 + attempts * 30 + overdueDays + goalBoost
  if (attempts > 1 && due) return 950 + attempts * 15 + overdueDays + goalBoost
  if (due && attempts > 0) return 800 + overdueDays * 5 + goalBoost
  if (attempts > 1) return 650 + attempts * 10 + goalBoost
  if (!attempts) return 500 + goalBoost
  if (srs) {
    const ageDays = (now - srs.last) / 86_400_000
    return 300 + ageDays + goalBoost
  }
  const ageDays = doneAt ? (now - doneAt) / 86_400_000 : 0
  return 200 + ageDays + goalBoost
}

export function getPracticeStats(items: PracticeItem[], state: ProgressState, now: number) {
  const weak = items.filter((item) => {
    const attempts = state.attempts[item.exercise.id] ?? 0
    const done = Boolean(state.completedExercises[item.exercise.id])
    return attempts > 0 && (!done || attempts > 1)
  }).length
  const unseen = items.filter((item) => !state.attempts[item.exercise.id]).length
  const dueReview = items.filter((item) => isExerciseDue(state, item.exercise.id, now)).length
  const duePhrases = getDuePhraseEntries(state).length
  return { weak, unseen, dueReview, duePhrases, total: items.length }
}

export function buildExercisePool(
  items: PracticeItem[],
  state: ProgressState,
  mode: Exclude<PracticeMode, 'phrases'>,
  count: number,
  now: number,
  random: () => number = Math.random,
): PracticeItem[] {
  const goal = state.settings.goal ?? 'all'
  const byGoal = (arr: PracticeItem[]) =>
    goal === 'all'
      ? arr
      : [...arr].sort(
          (a, b) =>
            (isSessionRelevantToGoal(b.sessionSlug, goal) ? 1 : 0) -
            (isSessionRelevantToGoal(a.sessionSlug, goal) ? 1 : 0),
        )

  const due = items.filter((item) => isExerciseDue(state, item.exercise.id, now))
  const weak = items.filter((item) => {
    const attempts = state.attempts[item.exercise.id] ?? 0
    const done = Boolean(state.completedExercises[item.exercise.id])
    return attempts > 0 && (!done || attempts > 1)
  })
  const unseen = items.filter((item) => !state.attempts[item.exercise.id])

  // Habilidades débiles se intercalan en la mezcla, no solo la sesión actual.
  const weakSkills = new Set(
    getSkillProfile(state)
      .filter((skill) => skill.weakness >= 0.4)
      .map((skill) => skill.skill),
  )
  const score = (item: PracticeItem) =>
    reviewScore(item, state, now) +
    (weakSkills.size && inferExerciseSkills(item.exercise).some((skill) => weakSkills.has(skill))
      ? 90
      : 0)
  const ranked = [...items].sort((a, b) => score(b) - score(a))
  const interleaved = shuffle(ranked.slice(0, Math.max(count * 4, 40)), random)

  let base: PracticeItem[]
  if (mode === 'review') {
    base = [
      ...shuffle(byGoal(due), random),
      ...shuffle(byGoal(weak), random),
      ...interleaved,
      ...shuffle(unseen, random),
    ]
  } else if (mode === 'weak') {
    base =
      weak.length >= 3
        ? shuffle(byGoal(weak), random)
        : [
            ...shuffle(byGoal(weak), random),
            ...shuffle(byGoal(due), random),
            ...interleaved,
            ...shuffle(unseen, random),
          ]
  } else if (mode === 'new') {
    base = unseen.length ? shuffle(byGoal(unseen), random) : interleaved
  } else {
    base = interleaved
  }

  return pickUnique(base, Math.min(count, base.length))
}

export function buildPhrasePool(state: ProgressState, count: number): PhrasebookEntry[] {
  const due = getDuePhraseEntries(state)
  const weakP = getWeakPhraseEntries(state, 40)
  const merged = [...due]
  for (const p of weakP) if (!merged.find((x) => x.id === p.id)) merged.push(p)
  return merged.slice(0, Math.min(count, merged.length || count))
}
