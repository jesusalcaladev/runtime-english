import { differenceInCalendarDays, format } from 'date-fns'
import { ALL_SESSIONS, getAllExerciseIds, levelStats } from '../data/curriculum'
import { evaluateAchievements } from './achievements'
import { onAuthStateChange } from './auth'
import { sanitizeCertificate, sanitizeSettings, sanitizeStreak } from './progressSchema'
import {
  expandState,
  getCurrentUserId,
  isApplyingRemote,
  schedulePush,
  setCurrentUser,
  syncNow,
  withRemoteApply,
} from './progressSync'
import { nextSrsFsrs } from './srsFsrs'
import { emitToast } from './toast'
import type { Exercise } from './types'

export interface ReminderSettings {
  enabled: boolean
  time: string // HH:mm local
  lastNudgeDate: string | null
}

export interface StudyPlan {
  dailyMinutes: number
  dailyExercises: number
  weeklySessions: number
  weeklyExercises: number
  monthlySessions: number
  monthlyExercises: number
  focus: 'daily' | 'interviews' | 'work' | 'all'
  level?: string
}

export interface DiagnosticResult {
  level: 'A1' | 'A2' | 'B1' | 'B2'
  score: number // 0-100
  completedAt: number
}

export interface ProgressSettings {
  theme: 'light' | 'dark'
  immersion: 'auto' | 'es' | 'mixed' | 'en'
  ttsEnabled: boolean
  ttsRate: number
  ttsPitch?: number
  ttsVoiceName?: string
  ttsEngine: 'system' | 'google' | 'kokoro' | 'piper'
  speechLanguage: 'en-US' | 'en-GB'
  reminders: ReminderSettings
  name: string
  onboarded: boolean
  goal: 'daily' | 'interviews' | 'work' | 'all'
  diagnostic?: DiagnosticResult | null
  plan?: StudyPlan | null
  planIntroDismissed?: boolean
}

export interface ExerciseSrs {
  box: number // 0=new/struggling, higher=better retention
  due: number // timestamp ms
  last: number // last review timestamp ms
  correctStreak: number
}

export interface PhrasebookEntry {
  id: string
  en: string
  es: string
  source: string
  addedAt: number
  updatedAt: number
  seen: number
  correct: number
  saved: boolean
  notes?: string
  userExample?: string
  tags?: string[]
  difficulty?: 'easy' | 'normal' | 'hard'
  // Dictionary-specific SRS (flashcards/review)
  box: number
  due: number
  last: number
  correctStreak: number
}

export interface CertificateState {
  id: string
  name: string
  issuedAt: string // ISO date/time
  completionDate: string // human display date
  status?: 'local' | 'pending' | 'issued' | 'verified' | 'revoked' | 'error'
  userId?: string | null
  issuedBy?: 'local' | 'server'
  lastVerifiedAt?: string | null
  shareUrl?: string | null
  lastError?: string | null
}

export interface ErrorEvent {
  id: string
  exerciseId: string
  sessionId?: string
  exerciseType: string
  prompt: string
  userAnswer: string
  correctAnswer: string
  skills: string[] // fine-grained pattern tags (tenses, prepositions, etc.)
  at: number
}

import {
  createDefaultVideoLabState,
  mergeVideoLabStates,
  normalizeVideoLab,
  readLegacyVideoLab,
  type VideoLabState,
  type VideoProgress,
  type VideoQuizAttempt,
  type VideoQuizProgress,
} from './videoLabState'

export interface ProgressState {
  version: number
  xp: number
  completedExercises: Record<string, number>
  completedSessions: Record<string, number>
  attempts: Record<string, number>
  exerciseSrs: Record<string, ExerciseSrs>
  errorEvents: ErrorEvent[]
  savedSlang: string[]
  phrasebook: Record<string, PhrasebookEntry>
  certificate: CertificateState | null
  achievements: Record<string, number>
  streak: {
    current: number
    longest: number
    lastActiveDate: string | null
  }
  settings: ProgressSettings
  startedAt: number
  dictionaryBackfilledAt?: number | null
  /** Progreso y quiz de VideoLab (sincronizado en el mismo JSON de Supabase). */
  videoLab: VideoLabState
  videoLabMigratedAt?: number | null
}

export interface ProgressExportEnvelope {
  format: 'runtimeenglish-progress'
  schemaVersion: number
  exportedAt: string
  app: { name: string; version?: string }
  state: ProgressState
}

export const STORAGE_KEY = 'runtimeenglish_v3'
const LEGACY_STORAGE_KEYS = ['runtimeenglish_v2', 'devlingo_v3', 'devlingo_v2', 'deveng_core_v2']
export const PROGRESS_SCHEMA_VERSION = 3

function preferredTheme(): 'light' | 'dark' {
  if (
    isBrowser() &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

export function createDefaultState(): ProgressState {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    xp: 0,
    completedExercises: {},
    completedSessions: {},
    attempts: {},
    exerciseSrs: {},
    errorEvents: [],
    savedSlang: [],
    phrasebook: {},
    certificate: null,
    achievements: {},
    streak: { current: 0, longest: 0, lastActiveDate: null },
    settings: {
      theme: preferredTheme(),
      immersion: 'auto',
      ttsEnabled: true,
      ttsRate: 1,
      ttsEngine: 'system',
      speechLanguage: 'en-US',
      reminders: { enabled: false, time: '20:00', lastNudgeDate: null },
      name: '',
      onboarded: false,
      goal: 'all',
      diagnostic: null,
      plan: null,
    },
    startedAt: Date.now(),
    dictionaryBackfilledAt: null,
    videoLab: createDefaultVideoLabState(),
    videoLabMigratedAt: null,
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function todayKey(date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

function daysBetween(a: string, b: string): number {
  const first = new Date(`${a}T00:00:00`)
  const second = new Date(`${b}T00:00:00`)
  return differenceInCalendarDays(second, first)
}

// The slang module moved from m0 to m7 so the technical path starts at A1.
// Preserve progress for users who had already completed those sessions.
const LEGACY_ID_MAP: Record<string, string> = {
  // Slang module moved from m0 to m7 so the technical path starts at A1.
  'm0-l1': 'm7-l1',
  'm0-l2': 'm7-l2',
  'm0-l1-e1': 'm7-l1-e1',
  'm0-l1-e2': 'm7-l1-e2',
  'm0-l1-e3': 'm7-l1-e3',
  'm0-l1-e4': 'm7-l1-e4',
  'm0-l2-e1': 'm7-l2-e1',
  'm0-l2-e2': 'm7-l2-e2',
  'm0-l2-e3': 'm7-l2-e3',
  'm0-l2-e4': 'm7-l2-e4',
  // Pronunciación funcional volvió a MOD 02 (A2) y dejó MOD 08 (B1-B2).
  'm8-l2': 'm2-l4',
  'm8-l2-e1': 'm2-l4-e1',
  'm8-l2-e2': 'm2-l4-e2',
  'm8-l2-e3': 'm2-l4-e3',
  'm8-l2-e4': 'm2-l4-e4',
  'm8-l2-e5': 'm2-l4-e5',
  'm8-l2-e6': 'm2-l4-e6',
}

function migrateKeys<T>(record: Record<string, T>): Record<string, T> {
  const next = { ...record }
  for (const [legacyId, currentId] of Object.entries(LEGACY_ID_MAP)) {
    if (legacyId in next) {
      if (!(currentId in next)) next[currentId] = next[legacyId]
      delete next[legacyId]
    }
  }
  return next
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {}
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function getExerciseAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'choice':
      return exercise.options[exercise.answer] ?? ''
    case 'builder':
    case 'write':
    case 'listen':
    case 'speak':
    case 'shadow':
    case 'fix-error':
      return exercise.answer
    case 'multi-choice':
      return exercise.answers.map((index) => exercise.options[index] ?? '').join(' · ')
    case 'match':
      return exercise.pairs.map((pair) => pair.en).join(' · ')
    case 'dialogue-branch':
      return exercise.steps.map((step) => step.line).join(' / ')
    case 'fill-blank':
      return exercise.template
    case 'dialogue-order':
      return exercise.lines.join(' / ')
    case 'roleplay':
      return ''
    default: {
      const exhaustiveCheck: never = exercise
      return exhaustiveCheck
    }
  }
}

function getExerciseLearningText(exercise: Exercise): { en: string; es: string } {
  return {
    en: getExerciseAnswerText(exercise),
    es: exercise.explanation || exercise.prompt || '',
  }
}

const SRS_INTERVALS_MS = [
  10 * 60 * 1000, // 10 min
  24 * 60 * 60 * 1000, // 1 day
  3 * 24 * 60 * 60 * 1000, // 3 days
  7 * 24 * 60 * 60 * 1000, // 7 days
  14 * 24 * 60 * 60 * 1000, // 14 days
  30 * 24 * 60 * 60 * 1000, // 30 days
]

function clampSrsBox(box: number): number {
  if (!Number.isFinite(box)) return 0
  return Math.max(0, Math.min(SRS_INTERVALS_MS.length - 1, Math.round(box)))
}

function normalizeSrsEntry(raw: unknown, fallbackLast = Date.now()): ExerciseSrs | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<ExerciseSrs>
  const box = clampSrsBox(typeof r.box === 'number' ? r.box : 0)
  const last = typeof r.last === 'number' && Number.isFinite(r.last) ? r.last : fallbackLast
  const due =
    typeof r.due === 'number' && Number.isFinite(r.due) ? r.due : last + SRS_INTERVALS_MS[box]
  const correctStreak =
    typeof r.correctStreak === 'number' && Number.isFinite(r.correctStreak)
      ? Math.max(0, Math.round(r.correctStreak))
      : box
  return { box, due, last, correctStreak }
}

// (nextSrs helper removed; using nextSrsFsrs directly)

function seedExerciseSrs(state: ProgressState): Record<string, ExerciseSrs> {
  const seeded: Record<string, ExerciseSrs> = { ...(state.exerciseSrs ?? {}) }
  const now = Date.now()
  // Seed from attempts/completions for legacy or missing entries
  const ids = new Set<string>([
    ...Object.keys(state.attempts ?? {}),
    ...Object.keys(state.completedExercises ?? {}),
  ])
  for (const id of ids) {
    if (seeded[id]) continue
    const attempts = state.attempts[id] ?? 0
    const doneAt = state.completedExercises[id]
    const done = Boolean(doneAt)
    if (attempts <= 0) continue

    if (!done) {
      seeded[id] = { box: 0, due: now, last: doneAt ?? now, correctStreak: 0 }
      continue
    }

    const last = doneAt ?? now
    if (attempts > 1) {
      // Correct but struggled: schedule a near-term FSRS review (Hard-like).
      seeded[id] = nextSrsFsrs(undefined, true, last, { struggled: true })
      // If overdue/migrated long ago, keep it due now for review.
      if (seeded[id].due < now) seeded[id] = { ...seeded[id], due: now }
      continue
    }

    // Correct on first try: simulate FSRS progression based on age for smoother migration.
    const age = Math.max(0, now - last)
    const day = 24 * 60 * 60 * 1000
    let reviews = 1
    if (age > 21 * day) reviews = 4
    else if (age > 10 * day) reviews = 3
    else if (age > 4 * day) reviews = 2
    else if (age > 1 * day) reviews = 1

    let srs = nextSrsFsrs(undefined, true, last)
    let t = Math.max(last + 60_000, Math.min(now, srs.due))
    for (let i = 1; i < reviews; i++) {
      srs = nextSrsFsrs(srs, true, t)
      t = Math.max(t + 60_000, Math.min(now, srs.due))
    }
    seeded[id] = srs
  }
  return seeded
}

function applyDocumentSettings(settings: ProgressSettings) {
  if (!isBrowser()) return
  document.documentElement.dataset.theme =
    settings.theme === 'dark' ? 'runtimeenglish-dark' : 'runtimeenglish'
  document.documentElement.dataset.tts = settings.ttsEnabled ? 'on' : 'off'
}

export function mergeState(raw: unknown): ProgressState {
  const defaults = createDefaultState()
  if (!isRecord(raw)) return defaults

  const unwrapped = unwrapProgressInput(raw)
  const parsed = isRecord(unwrapped) ? unwrapped : isRecord(raw) ? raw : {}

  // If input is in compact sync format (v/ce/cs/se/...), expand it first.
  const baseRecord =
    'v' in parsed || 'ce' in parsed || 'se' in parsed
      ? toRecord(expandState(parsed, defaults))
      : ({ ...defaults, ...parsed } as UnknownRecord)

  const rawSrs = toRecord(baseRecord.exerciseSrs ?? parsed.exerciseSrs)
  const migratedSrs = migrateKeys(rawSrs)
  const normalizedSrs: Record<string, ExerciseSrs> = {}
  for (const [id, value] of Object.entries(migratedSrs)) {
    const normalized = normalizeSrsEntry(value)
    if (normalized) normalizedSrs[id] = normalized
  }

  const rawPhrasebook = toRecord(baseRecord.phrasebook ?? parsed.phrasebook)
  const phrasebook: Record<string, PhrasebookEntry> = {}
  for (const [id, value] of Object.entries(rawPhrasebook)) {
    if (!isRecord(value)) continue

    const en = (getString(value.en) ?? '').trim()
    if (!en) continue

    const es = getString(value.es) ?? ''
    const tags = Array.isArray(value.tags)
      ? value.tags
          .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
          .map((tag) => tag.trim().slice(0, 24))
          .slice(0, 8)
      : []

    const difficultyValue = getString(value.difficulty)
    const addedAt = getNumber(value.addedAt) ?? Date.now()
    const updatedAt = getNumber(value.updatedAt) ?? addedAt
    const correct = getNumber(value.correct) ?? 0
    const box = clampSrsBox(getNumber(value.box) ?? Math.min(correct, SRS_INTERVALS_MS.length - 1))
    const last = getNumber(value.last) ?? updatedAt
    const due = getNumber(value.due) ?? last + SRS_INTERVALS_MS[box]
    const notes = getString(value.notes)
    const userExample = getString(value.userExample)

    phrasebook[id] = {
      id,
      en,
      es,
      source: getString(value.source) ?? '',
      addedAt,
      updatedAt,
      seen: getNumber(value.seen) ?? 0,
      correct,
      saved: getBoolean(value.saved) ?? false,
      notes: notes ? notes.slice(0, 500) : undefined,
      userExample: userExample ? userExample.slice(0, 300) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      difficulty:
        difficultyValue === 'easy' || difficultyValue === 'hard' || difficultyValue === 'normal'
          ? difficultyValue
          : undefined,
      box,
      due,
      last,
      correctStreak: getNumber(value.correctStreak) ?? box,
    }
  }

  const rawCertificate = baseRecord.certificate ?? parsed.certificate ?? null
  const certificate = sanitizeCertificate(rawCertificate) as CertificateState | null

  const rawErrorEvents = Array.isArray(baseRecord.errorEvents ?? parsed.errorEvents)
    ? ((baseRecord.errorEvents ?? parsed.errorEvents) as unknown[])
    : []
  const errorEvents: ErrorEvent[] = rawErrorEvents
    .filter(
      (event): event is UnknownRecord => isRecord(event) && typeof event.exerciseId === 'string',
    )
    .slice(-300)
    .map((event) => {
      const exerciseId = String(event.exerciseId)
      const at = getNumber(event.at) ?? Date.now()
      const skills = Array.isArray(event.skills)
        ? event.skills.filter((skill): skill is string => typeof skill === 'string').slice(0, 6)
        : []

      return {
        id: getString(event.id) ?? `err-${exerciseId}-${Number(at) || Date.now()}`,
        exerciseId,
        sessionId: getString(event.sessionId),
        exerciseType: getString(event.exerciseType) ?? 'unknown',
        prompt: (getString(event.prompt) ?? '').slice(0, 240),
        userAnswer: (getString(event.userAnswer) ?? '').slice(0, 240),
        correctAnswer: (getString(event.correctAnswer) ?? '').slice(0, 240),
        skills,
        at,
      }
    })

  const mergedBase = {
    ...defaults,
    ...baseRecord,
  } as ProgressState & UnknownRecord

  const merged: ProgressState = {
    ...defaults,
    ...mergedBase,
    version: PROGRESS_SCHEMA_VERSION,
    completedExercises: migrateKeys(
      toRecord(mergedBase.completedExercises) as Record<string, number>,
    ),
    completedSessions: migrateKeys(
      toRecord(mergedBase.completedSessions) as Record<string, number>,
    ),
    attempts: migrateKeys(toRecord(mergedBase.attempts) as Record<string, number>),
    exerciseSrs: normalizedSrs,
    errorEvents,
    savedSlang: Array.isArray(mergedBase.savedSlang)
      ? mergedBase.savedSlang.filter((value): value is string => typeof value === 'string')
      : [],
    phrasebook,
    certificate,
    achievements: toRecord(mergedBase.achievements) as Record<string, number>,
    streak: sanitizeStreak(
      (isRecord(mergedBase.streak)
        ? mergedBase.streak
        : defaults.streak) as ProgressState['streak'],
      defaults.streak,
    ),
    dictionaryBackfilledAt: getNumber(mergedBase.dictionaryBackfilledAt) ?? null,
    videoLab: normalizeVideoLab(mergedBase.videoLab),
    videoLabMigratedAt: getNumber(mergedBase.videoLabMigratedAt) ?? null,
    settings: sanitizeSettings(
      { ...defaults.settings, ...(toRecord(mergedBase.settings) as Partial<ProgressSettings>) },
      defaults.settings,
    ) as ProgressSettings,
  }

  merged.exerciseSrs = seedExerciseSrs(merged)
  return merged
}

export function readProgress(): ProgressState {
  if (!isBrowser()) return createDefaultState()
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY)
    let migratedFromLegacy = false
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = window.localStorage.getItem(key)
        if (legacy) {
          raw = legacy
          migratedFromLegacy = true
          break
        }
      }
    }
    const parsed = raw ? JSON.parse(raw) : null
    const state = mergeState(parsed)
    if (
      migratedFromLegacy ||
      (raw &&
        parsed &&
        (parsed.version !== PROGRESS_SCHEMA_VERSION ||
          parsed.format === 'runtimeenglish-progress' ||
          parsed.format === 'devlingo-progress'))
    ) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    }
    return state
  } catch {
    return createDefaultState()
  }
}

type Listener = (state: ProgressState) => void

class ProgressStore {
  private state: ProgressState = createDefaultState()
  private listeners = new Set<Listener>()
  private hydrated = false
  private syncing = false

  constructor() {
    if (isBrowser()) {
      this.state = readProgress()
      this.hydrated = true
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
          this.state = readProgress()
          this.notify()
        }
      })
      this.initCloudSync()
      // One-time migration: VideoLab used to live in its own localStorage keys.
      if (!this.state.videoLabMigratedAt) {
        const legacy = readLegacyVideoLab()
        if (legacy) {
          this.state = {
            ...this.state,
            videoLab: mergeVideoLabStates(legacy, this.state.videoLab),
            videoLabMigratedAt: Date.now(),
          }
          this.persist()
        } else {
          this.state = { ...this.state, videoLabMigratedAt: Date.now() }
          this.persist()
        }
      }
      // One-time dictionary backfill (imports content vocabulary/phrases and previously learned items)
      if (!this.state.dictionaryBackfilledAt) {
        try {
          this.backfillPhrasebook()
        } catch {}
      }
    }
  }

  private initCloudSync() {
    try {
      onAuthStateChange((user) => {
        const nextId = user?.id ?? null
        const prevId = getCurrentUserId()
        setCurrentUser(nextId)
        if (nextId && nextId !== prevId) {
          void this.syncWithCloud(true)
        }
      })
      if (isBrowser()) {
        window.addEventListener('runtimeenglish-sync-retry', () => {
          if (getCurrentUserId()) void this.syncWithCloud(false)
        })
      }
    } catch {
      // Supabase not configured or init error: works locally only
    }
  }

  async syncWithCloud(showToast = false): Promise<boolean> {
    if (!isBrowser() || this.syncing) return false
    if (!getCurrentUserId()) return false
    this.syncing = true
    try {
      const merged = await syncNow(this.getState(), createDefaultState())
      this.applyRemoteState(merged)
      if (showToast) emitToast('Progreso sincronizado con la nube.', 'success')
      return true
    } catch (e) {
      if (showToast) {
        const msg = e instanceof Error ? e.message : 'No se pudo sincronizar.'
        emitToast(`Sincronización pendiente: ${msg}`, 'error')
      }
      return false
    } finally {
      this.syncing = false
    }
  }

  applyRemoteState(next: ProgressState) {
    withRemoteApply(() => {
      this.state = mergeState(next)
      this.persist()
      this.notify()
      applyDocumentSettings(this.state.settings)
    })
  }

  getState(): ProgressState {
    if (!this.hydrated && isBrowser()) {
      this.state = readProgress()
      this.hydrated = true
    }
    return this.state
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  private persist() {
    if (!isBrowser()) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch {
      emitToast('No se pudo guardar el progreso en localStorage.', 'error')
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener(this.state)
    })
  }

  private commit(next: ProgressState) {
    this.state = next
    this.persist()
    this.evaluate(next)
    this.notify()
    if (!isApplyingRemote()) schedulePush(() => this.getState())
  }

  update(updater: (state: ProgressState) => ProgressState) {
    this.commit(updater(this.getState()))
  }

  saveVideoProgress(lessonId: string, progress: VideoProgress) {
    this.update((state) => ({
      ...state,
      videoLab: {
        ...state.videoLab,
        progress: { ...state.videoLab.progress, [lessonId]: progress },
      },
    }))
  }

  saveVideoQuizAttempt(lessonId: string, attempt: VideoQuizAttempt): VideoQuizProgress {
    const current = this.getState().videoLab.quiz[lessonId]
    const attempts = [attempt, ...(current?.attempts ?? [])].slice(0, 5)
    const updated: VideoQuizProgress = {
      attempts,
      bestCorrect: Math.max(attempt.correct, current?.bestCorrect ?? 0),
      missedQuestionIds: attempt.missedQuestionIds.filter((id) => attempt.questionIds.includes(id)),
    }
    this.update((state) => ({
      ...state,
      videoLab: {
        ...state.videoLab,
        quiz: { ...state.videoLab.quiz, [lessonId]: updated },
      },
    }))
    return updated
  }

  clearVideoQuizProgress(lessonId: string) {
    this.update((state) => {
      const quiz = { ...state.videoLab.quiz }
      delete quiz[lessonId]
      return { ...state, videoLab: { ...state.videoLab, quiz } }
    })
  }

  private evaluate(state: ProgressState) {
    let next = state
    const unlocked: ReturnType<typeof evaluateAchievements> = []

    // Achievements grant XP, and that XP can unlock another achievement in a chain.
    for (let round = 0; round < 4; round++) {
      const found = evaluateAchievements(next)
      if (found.length === 0) break
      unlocked.push(...found)
      const timestamp = Date.now()
      next = {
        ...next,
        achievements: {
          ...next.achievements,
          ...Object.fromEntries(found.map((achievement) => [achievement.id, timestamp])),
        },
        xp: next.xp + found.reduce((sum, achievement) => sum + achievement.xp, 0),
      }
    }

    if (unlocked.length === 0) return
    this.state = {
      ...this.state,
      achievements: next.achievements,
      xp: next.xp,
    }
    this.persist()
    if (!isApplyingRemote()) schedulePush(() => this.getState())
    unlocked.forEach((achievement) => {
      emitToast(`Logro desbloqueado · ${achievement.title}`, 'achievement')
    })
  }

  recordExercise(
    exercise: Exercise,
    correct: boolean,
    detail?: {
      userAnswer?: string
      correctAnswer?: string
      skills?: string[]
      sessionId?: string
    },
  ) {
    this.update((state) => {
      const now = Date.now()
      const previousAttempts = state.attempts[exercise.id] ?? 0
      const attempts = { ...state.attempts, [exercise.id]: previousAttempts + 1 }
      const struggled = correct && previousAttempts > 0
      const exerciseSrs = {
        ...state.exerciseSrs,
        [exercise.id]: nextSrsFsrs(state.exerciseSrs[exercise.id], correct, now, { struggled }),
      }

      let phrasebook = state.phrasebook
      if (correct) {
        const { en, es } = getExerciseLearningText(exercise)
        if (en.trim()) {
          phrasebook = upsertPhrase(phrasebook, {
            en,
            es,
            source: 'Práctica',
            correct: true,
            saved: false,
          })
        }
      }

      let errorEvents = state.errorEvents ?? []
      if (!correct) {
        const event: ErrorEvent = {
          id: `${now}-${exercise.id}-${Math.random().toString(36).slice(2, 7)}`,
          exerciseId: exercise.id,
          sessionId: detail?.sessionId,
          exerciseType: exercise.type,
          prompt: (exercise.prompt || '').slice(0, 240),
          userAnswer: (detail?.userAnswer || '').slice(0, 240),
          correctAnswer: (detail?.correctAnswer || '').slice(0, 240),
          skills: Array.isArray(detail?.skills) ? detail?.skills.slice(0, 6) : [],
          at: now,
        }
        errorEvents = [...errorEvents, event].slice(-300)
        return { ...state, attempts, exerciseSrs, phrasebook, errorEvents }
      }

      const alreadyDone = Boolean(state.completedExercises[exercise.id])
      const completedExercises = alreadyDone
        ? state.completedExercises
        : { ...state.completedExercises, [exercise.id]: now }

      return {
        ...state,
        attempts,
        exerciseSrs,
        phrasebook,
        errorEvents,
        completedExercises,
        xp: alreadyDone ? state.xp : state.xp + 10,
        streak: updateStreak(state.streak),
      }
    })
  }

  reviewPhrase(id: string, correct: boolean) {
    this.update((state) => {
      const prev = state.phrasebook[id]
      if (!prev) return state
      const now = Date.now()
      const srs = nextPhraseSrs(prev, correct, now)
      return {
        ...state,
        xp: state.xp + (correct ? 4 : 0),
        streak: correct ? updateStreak(state.streak) : state.streak,
        phrasebook: {
          ...state.phrasebook,
          [id]: {
            ...prev,
            updatedAt: now,
            seen: prev.seen + 1,
            correct: prev.correct + (correct ? 1 : 0),
            ...srs,
          },
        },
      }
    })
  }

  savePhrase(en: string, es: string, source = 'Manual') {
    const cleanEn = en.trim()
    if (!cleanEn) return
    this.update((state) => ({
      ...state,
      phrasebook: upsertPhrase(state.phrasebook, {
        en: cleanEn,
        es: (es || '').trim(),
        source,
        correct: false,
        saved: true,
        markSeen: false,
      }),
    }))
  }

  togglePhrase(en: string, es: string, source = 'Lección') {
    const id = phraseId(en)
    this.update((state) => {
      const existing = state.phrasebook[id]
      if (existing?.saved) {
        if (existing.correct > 0 || existing.seen > 0) {
          return {
            ...state,
            phrasebook: {
              ...state.phrasebook,
              [id]: { ...existing, saved: false, updatedAt: Date.now() },
            },
          }
        }
        const next = { ...state.phrasebook }
        delete next[id]
        return { ...state, phrasebook: next }
      }
      return {
        ...state,
        phrasebook: upsertPhrase(state.phrasebook, {
          en,
          es,
          source,
          correct: false,
          saved: true,
          markSeen: false,
        }),
      }
    })
  }

  removePhrase(id: string) {
    this.update((state) => {
      if (!state.phrasebook[id]) return state
      const next = { ...state.phrasebook }
      delete next[id]
      return { ...state, phrasebook: next }
    })
  }

  backfillPhrasebook() {
    this.update((state) => {
      if (state.dictionaryBackfilledAt) return state
      const phrasebook = backfillPhrasebookState(state)
      return { ...state, phrasebook, dictionaryBackfilledAt: Date.now() }
    })
  }

  setCertificate(certificate: NonNullable<ProgressState['certificate']>) {
    this.update((state) => {
      const prev = state.certificate
      if (
        prev &&
        prev.id === certificate.id &&
        prev.name === certificate.name &&
        prev.issuedAt === certificate.issuedAt &&
        prev.completionDate === certificate.completionDate
      ) {
        return state
      }
      return { ...state, certificate }
    })
  }

  updatePhrase(
    id: string,
    patch: Partial<
      Pick<PhrasebookEntry, 'es' | 'notes' | 'userExample' | 'tags' | 'difficulty' | 'saved'>
    >,
  ) {
    this.update((state) => {
      const prev = state.phrasebook[id]
      if (!prev) return state
      const next: PhrasebookEntry = {
        ...prev,
        ...patch,
        es: patch.es !== undefined ? patch.es : prev.es,
        notes:
          patch.notes !== undefined ? (patch.notes || '').slice(0, 500) || undefined : prev.notes,
        userExample:
          patch.userExample !== undefined
            ? (patch.userExample || '').slice(0, 300) || undefined
            : prev.userExample,
        tags:
          patch.tags !== undefined
            ? patch.tags
                .filter((t) => t?.trim())
                .map((t) => t.trim().slice(0, 24))
                .slice(0, 8)
            : prev.tags,
        difficulty: patch.difficulty !== undefined ? patch.difficulty : prev.difficulty,
        saved: patch.saved !== undefined ? patch.saved : prev.saved,
        updatedAt: Date.now(),
      }
      return { ...state, phrasebook: { ...state.phrasebook, [id]: next } }
    })
  }

  completeSession(sessionId: string) {
    this.update((state) => {
      if (state.completedSessions[sessionId]) return state
      return {
        ...state,
        completedSessions: {
          ...state.completedSessions,
          [sessionId]: Date.now(),
        },
        xp: state.xp + 40,
      }
    })
  }

  toggleSavedSlang(id: string) {
    this.update((state) => {
      const exists = state.savedSlang.includes(id)
      return {
        ...state,
        savedSlang: exists
          ? state.savedSlang.filter((entry) => entry !== id)
          : [...state.savedSlang, id],
        xp: exists ? state.xp : state.xp + 5,
      }
    })
  }

  setSettings(patch: Partial<ProgressSettings>) {
    this.update((state) => ({
      ...state,
      settings: { ...state.settings, ...patch },
    }))
    const settings = this.getState().settings
    applyDocumentSettings(settings)
    if (isBrowser() && 'reminders' in patch) {
      void import('./notifications').then((m) => m.syncStreakReminder(settings)).catch(() => {})
    }
  }

  importProgress(raw: unknown): boolean {
    if (!isRecord(raw)) return false

    const candidate = unwrapProgressInput(raw)
    if (!isRecord(candidate)) return false

    const looksLikeState =
      typeof candidate.xp === 'number' ||
      'completedExercises' in candidate ||
      'completedSessions' in candidate ||
      'settings' in candidate ||
      'v' in candidate ||
      'ce' in candidate ||
      'cs' in candidate
    if (!looksLikeState) return false

    const next = mergeState(raw)
    if (!Number.isFinite(next.xp) || next.xp < 0) next.xp = 0

    this.state = next
    this.persist()
    this.notify()
    applyDocumentSettings(next.settings)
    if (!isApplyingRemote()) schedulePush(() => this.getState())
    if (isBrowser()) {
      void import('./notifications')
        .then((m) => m.syncStreakReminder(next.settings))
        .catch(() => {})
    }
    return true
  }

  exportProgress(): ProgressExportEnvelope {
    return exportProgressEnvelope(this.getState())
  }

  setTheme(theme: ProgressSettings['theme']) {
    this.setSettings({ theme })
  }

  reset() {
    const defaults = createDefaultState()
    this.commit(defaults)
    applyDocumentSettings(defaults.settings)
    if (isBrowser()) {
      void import('./notifications')
        .then((m) => m.syncStreakReminder(defaults.settings))
        .catch(() => {})
    }
    emitToast('Progreso reiniciado. Empezamos de cero.', 'info')
  }

  getXpLevel(): { level: number; label: string; intoLevel: number; nextAt: number } {
    const xp = this.getState().xp
    const level = Math.max(1, Math.floor(xp / 150) + 1)
    const intoLevel = xp % 150
    const labels = ['Rookie', 'Junior', 'Mid', 'Senior', 'Staff', 'Principal']
    return {
      level,
      label: labels[Math.min(labels.length - 1, level - 1)],
      intoLevel,
      nextAt: 150,
    }
  }
}

function updateStreak(streak: ProgressState['streak']): ProgressState['streak'] {
  const today = todayKey()
  if (streak.lastActiveDate === today) return streak

  let current = 1
  if (streak.lastActiveDate && daysBetween(streak.lastActiveDate, today) === 1) {
    current = streak.current + 1
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
  }
}

function normalizePhraseKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function phraseId(en: string): string {
  const norm = normalizePhraseKey(en).replace(/\s+/g, '-').slice(0, 80)
  return norm || `p-${Math.abs(hashString(en))}`
}

function hashString(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return h
}

function nextPhraseSrs(prev: PhrasebookEntry | undefined, correct: boolean, now = Date.now()) {
  const base = prev
    ? {
        box: prev.box ?? 0,
        due: prev.due ?? now,
        last: prev.last ?? now,
        correctStreak: prev.correctStreak ?? 0,
      }
    : undefined
  return nextSrsFsrs(base, correct, now)
}

function upsertPhrase(
  phrasebook: Record<string, PhrasebookEntry>,
  input: {
    en: string
    es: string
    source: string
    correct: boolean
    saved?: boolean
    markSeen?: boolean
    reviewed?: boolean
  },
): Record<string, PhrasebookEntry> {
  const en = input.en.trim()
  if (!en) return phrasebook
  const id = phraseId(en)
  const now = Date.now()
  const prev = phrasebook[id]
  const markSeen = input.markSeen !== false
  const incomingEs = (input.es || '').trim()
  const srs = input.reviewed ? nextPhraseSrs(prev, input.correct, now) : null
  const next: PhrasebookEntry = {
    id,
    en: prev?.en && prev.en.length >= en.length ? prev.en : en,
    es: !prev?.es
      ? incomingEs
      : !incomingEs
        ? prev.es
        : incomingEs.length >= prev.es.length
          ? incomingEs
          : prev.es,
    source: input.source || prev?.source || '',
    addedAt: prev?.addedAt ?? now,
    updatedAt: now,
    seen: (prev?.seen ?? 0) + (markSeen ? 1 : 0),
    correct: (prev?.correct ?? 0) + (input.correct ? 1 : 0),
    saved: Boolean(prev?.saved || input.saved),
    notes: prev?.notes,
    userExample: prev?.userExample,
    tags: prev?.tags,
    difficulty: prev?.difficulty,
    box: srs ? srs.box : (prev?.box ?? 0),
    due: srs ? srs.due : (prev?.due ?? now),
    last: srs ? srs.last : (prev?.last ?? now),
    correctStreak: srs ? srs.correctStreak : (prev?.correctStreak ?? 0),
  }
  if (!prev && !srs) next.due = now + SRS_INTERVALS_MS[0]
  return { ...phrasebook, [id]: next }
}

function unwrapProgressInput(raw: unknown): unknown {
  if (!isRecord(raw)) return raw

  const format = getString(raw.format)
  const state = raw.state

  if ((format === 'runtimeenglish-progress' || format === 'devlingo-progress') && isRecord(state)) {
    return state
  }

  if (isRecord(state) && ('schemaVersion' in raw || 'exportedAt' in raw)) {
    return state
  }

  return raw
}

function exportProgressEnvelope(state: ProgressState): ProgressExportEnvelope {
  return {
    format: 'runtimeenglish-progress',
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: { name: 'RuntimeEnglish' },
    state,
  }
}

function backfillPhrasebookState(state: ProgressState): Record<string, PhrasebookEntry> {
  let phrasebook = { ...(state.phrasebook ?? {}) }

  try {
    for (const { session } of ALL_SESSIONS) {
      for (const block of session.blocks) {
        if (block.type === 'vocab') {
          for (const item of block.items) {
            phrasebook = upsertPhrase(phrasebook, {
              en: item.en,
              es: item.example ? `${item.es} · Ejemplo: ${item.example}` : item.es,
              source: `Vocabulario · ${session.title}`,
              correct: false,
              saved: false,
              markSeen: false,
            })
          }
        } else if (block.type === 'phrases') {
          for (const item of block.items) {
            phrasebook = upsertPhrase(phrasebook, {
              en: item.en,
              es: item.es,
              source: `Frases · ${session.title}`,
              correct: false,
              saved: false,
              markSeen: false,
            })
          }
        }
      }

      for (const exercise of session.exercises) {
        if (!state.completedExercises[exercise.id]) continue
        const { en, es } = getExerciseLearningText(exercise)
        if (!en.trim()) continue

        phrasebook = upsertPhrase(phrasebook, {
          en,
          es,
          source: `Aprendida · ${session.title}`,
          correct: true,
          saved: false,
          markSeen: false,
        })
      }
    }
  } catch {
    // Ignore backfill errors.
  }

  return phrasebook
}

const globalKey = '__runtimeenglish_progress_store__'

type GlobalProgressStore = typeof globalThis & {
  __runtimeenglish_progress_store__?: ProgressStore
}

const globalStore = globalThis as GlobalProgressStore
let store = globalStore[globalKey]
if (!store) {
  store = new ProgressStore()
  globalStore[globalKey] = store
}
export const progressStore: ProgressStore = store

export function isExerciseDue(state: ProgressState, exerciseId: string, now = Date.now()): boolean {
  const srs = state.exerciseSrs[exerciseId]
  if (!srs) {
    // If attempted but SRS is not seeded yet, consider it due
    return (state.attempts[exerciseId] ?? 0) > 0 && !state.completedExercises[exerciseId]
  }
  return srs.due <= now
}

export function getDueExerciseIds(
  state: ProgressState,
  allExerciseIds: string[],
  now = Date.now(),
): string[] {
  return allExerciseIds.filter((id) => isExerciseDue(state, id, now))
}

export function getReviewStats(
  state: ProgressState,
  allExerciseIds: string[],
  now = Date.now(),
): { due: number; weak: number; unseen: number } {
  let due = 0
  let weak = 0
  let unseen = 0
  for (const id of allExerciseIds) {
    const attempts = state.attempts[id] ?? 0
    const done = Boolean(state.completedExercises[id])
    if (attempts === 0) unseen++
    if (attempts > 0 && (!done || attempts > 1)) weak++
    if (isExerciseDue(state, id, now)) due++
  }
  return { due, weak, unseen }
}

export function exerciseProgress(): { done: number; total: number; pct: number } {
  const state = progressStore.getState()
  const ids = getAllExerciseIds()
  const done = ids.filter((id) => state.completedExercises[id]).length
  return {
    done,
    total: ids.length,
    pct: ids.length === 0 ? 0 : Math.round((done / ids.length) * 100),
  }
}

export function cefrNow(): 'A1-A2' | 'A2 → B1' | 'B1-B2' {
  const state = progressStore.getState()
  const a = levelStats('A1-A2', state.completedSessions).pct
  const b = levelStats('B1-B2', state.completedSessions).pct
  if (a >= 90 && b >= 40) return 'B1-B2'
  if (a >= 50) return 'A2 → B1'
  return 'A1-A2'
}

export function isSessionComplete(state: ProgressState, sessionId: string): boolean {
  return Boolean(state.completedSessions[sessionId])
}

export function isExerciseDone(state: ProgressState, exerciseId: string): boolean {
  return Boolean(state.completedExercises[exerciseId])
}

export function isPhraseDue(entry: PhrasebookEntry, now = Date.now()): boolean {
  return (entry.due ?? 0) <= now
}

export function getDuePhraseEntries(state: ProgressState, now = Date.now()): PhrasebookEntry[] {
  return Object.values(state.phrasebook ?? {})
    .filter((e) => isPhraseDue(e, now))
    .sort((a, b) => a.due - b.due || a.correct - b.correct)
}

export function getWeakPhraseEntries(state: ProgressState, limit = 20): PhrasebookEntry[] {
  return Object.values(state.phrasebook ?? {})
    .filter((e) => (e.seen ?? 0) > 0 || e.saved || (e.correct ?? 0) > 0)
    .sort((a, b) => {
      const sa =
        (a.correct ?? 0) / Math.max(1, a.seen || a.correct || 1) + (isPhraseDue(a) ? -1 : 0)
      const sb =
        (b.correct ?? 0) / Math.max(1, b.seen || b.correct || 1) + (isPhraseDue(b) ? -1 : 0)
      return sa - sb || a.updatedAt - b.updatedAt
    })
    .slice(0, limit)
}
