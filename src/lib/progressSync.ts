import { ACHIEVEMENTS } from './achievements'
import type {
  CertificateState,
  ExerciseSrs,
  PhrasebookEntry,
  ProgressSettings,
  ProgressState,
} from './progress'
import { parseCompactState } from './progressSchema'
import { supabase } from './supabase'
import type { Level } from './types'
import {
  type CompactVideoLab,
  compactVideoLab,
  createDefaultVideoLabState,
  expandVideoLab,
  mergeVideoLabStates,
} from './videoLabState'

const TABLE = 'user_progress'
const SYNC_META_KEY = 'runtimeenglish_sync_meta_v1'
const SYNC_HISTORY_MAX = 30
const BASE_RETRY_MS = 5_000
const MAX_RETRY_MS = 120_000
const SYNC_DEBOUNCE_MS = 2_500

export type SyncPhase = 'idle' | 'syncing' | 'pending' | 'error' | 'offline' | 'disabled'

export interface SyncHistoryEntry {
  at: string
  type: 'push' | 'pull' | 'merge' | 'error' | 'conflict' | 'auth'
  ok: boolean
  message: string
  details?: string
}

export interface SyncMeta {
  userId: string | null
  lastSyncedAt: string | null
  lastAttemptAt: string | null
  lastSuccessAt: string | null
  lastError: string | null
  lastRemoteUpdatedAt: string | null
  pending: boolean
  retryCount: number
  nextRetryAt: string | null
  history: SyncHistoryEntry[]
  conflictCount: number
}

export interface SyncStatus extends SyncMeta {
  phase: SyncPhase
  online: boolean
  configured: boolean
}

interface CompactReminderState {
  en?: boolean
  tm?: string
  ld?: string | null
}

interface CompactSettingsState {
  th?: 'light' | 'dark'
  im?: 'auto' | 'es' | 'mixed' | 'en'
  tts?: boolean
  rate?: number
  eng?: 'system' | 'google' | 'kokoro' | 'piper'
  lng?: 'en-US' | 'en-GB'
  name?: string
  ob?: boolean
  goal?: 'daily' | 'interviews' | 'work' | 'all'
  rem?: CompactReminderState
}

interface CompactStreakState {
  current?: number
  longest?: number
  lastActiveDate?: string | null
}

interface CompactCertificateState {
  level?: Level
  id?: string
  name?: string
  issuedAt?: string
  issued_at?: string
  completionDate?: string
  completion_date?: string
  status?: CertificateState['status']
  userId?: string | null
  user_id?: string | null
  issuedBy?: CertificateState['issuedBy']
  lastVerifiedAt?: string | null
  shareUrl?: string | null
  lastError?: string | null
}

interface CompactProgressState {
  v?: number
  xp?: number
  st?: number
  ce?: Record<string, number>
  cs?: Record<string, number>
  at?: Record<string, number>
  sr?: Record<string, unknown>
  ss?: string[]
  pb?: Record<string, unknown>
  cert?: unknown
  certs?: Record<string, unknown>
  ac?: Record<string, number>
  sk?: CompactStreakState
  se?: CompactSettingsState
  vl?: CompactVideoLab
}

type UnknownRecord = Record<string, unknown>

let currentUserId: string | null = null
let applyingRemote = false
let pushTimer: ReturnType<typeof setTimeout> | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
let lastPushFingerprint = ''
const listeners = new Set<(status: SyncStatus) => void>()

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function nowIso(): string {
  return new Date().toISOString()
}

function defaultMeta(): SyncMeta {
  return {
    userId: currentUserId,
    lastSyncedAt: null,
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastError: null,
    lastRemoteUpdatedAt: null,
    pending: false,
    retryCount: 0,
    nextRetryAt: null,
    history: [],
    conflictCount: 0,
  }
}

function readMeta(): SyncMeta {
  if (!isBrowser()) return defaultMeta()

  try {
    const raw = window.localStorage.getItem(SYNC_META_KEY)
    if (!raw) return defaultMeta()

    const parsed = JSON.parse(raw) as Partial<SyncMeta>
    return {
      ...defaultMeta(),
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, SYNC_HISTORY_MAX) : [],
    }
  } catch {
    return defaultMeta()
  }
}

function writeMeta(meta: SyncMeta): void {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta))
  } catch {
    // Ignore storage write failures.
  }
}

let metaState: SyncMeta = readMeta()

function computePhase(meta: SyncMeta): SyncPhase {
  const online = isBrowser() ? navigator.onLine !== false : true
  if (!supabase) return 'disabled'
  if (!currentUserId) return 'idle'
  if (!online) return 'offline'
  if (meta.lastError && meta.pending) return 'error'
  if (meta.pending) return 'pending'
  return 'idle'
}

export function getSyncStatus(): SyncStatus {
  return {
    ...metaState,
    userId: currentUserId,
    phase: computePhase(metaState),
    online: isBrowser() ? navigator.onLine !== false : true,
    configured: Boolean(supabase),
  }
}

function notify(): void {
  const status = getSyncStatus()
  listeners.forEach((listener) => {
    listener(status)
  })
}

export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  listeners.add(listener)
  listener(getSyncStatus())
  return () => listeners.delete(listener)
}

function updateMeta(patch: Partial<SyncMeta>, entry?: SyncHistoryEntry): void {
  const history = entry
    ? [entry, ...(metaState.history ?? [])].slice(0, SYNC_HISTORY_MAX)
    : (metaState.history ?? [])

  metaState = { ...metaState, ...patch, history }
  writeMeta(metaState)
  notify()
}

function pushHistory(
  type: SyncHistoryEntry['type'],
  ok: boolean,
  message: string,
  details?: string,
): void {
  updateMeta({}, { at: nowIso(), type, ok, message, details })
}

function isEmptyRecord(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length === 0
}

export function compactState(state: ProgressState): Record<string, unknown> {
  const compact: Record<string, unknown> = {
    v: 3,
    xp: state.xp,
    st: state.startedAt,
  }

  if (!isEmptyRecord(state.completedExercises)) compact.ce = state.completedExercises
  if (!isEmptyRecord(state.completedSessions)) compact.cs = state.completedSessions
  if (!isEmptyRecord(state.attempts)) compact.at = state.attempts
  if (!isEmptyRecord(state.exerciseSrs)) compact.sr = state.exerciseSrs
  if (state.savedSlang.length > 0) compact.ss = state.savedSlang
  if (!isEmptyRecord(state.phrasebook)) compact.pb = state.phrasebook
  if (state.certificate) compact.cert = state.certificate
  if (!isEmptyRecord(state.certificates)) compact.certs = state.certificates
  if (!isEmptyRecord(state.achievements)) compact.ac = state.achievements
  const videoLab = compactVideoLab(state.videoLab ?? createDefaultVideoLabState())
  if (videoLab) compact.vl = videoLab
  if (state.streak.current || state.streak.longest || state.streak.lastActiveDate) {
    compact.sk = state.streak
  }

  const settings = state.settings
  compact.se = {
    th: settings.theme,
    im: settings.immersion,
    tts: settings.ttsEnabled,
    rate: settings.ttsRate,
    eng: settings.ttsEngine,
    lng: settings.speechLanguage,
    name: settings.name || '',
    ob: settings.onboarded,
    goal: settings.goal,
    rem: {
      en: settings.reminders.enabled,
      tm: settings.reminders.time,
      ld: settings.reminders.lastNudgeDate,
    },
  } satisfies CompactSettingsState

  return compact
}

function asNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}

  const result: Record<string, number> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      result[key] = entry
    }
  }
  return result
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function asSrsRecord(value: unknown): Record<string, ExerciseSrs> {
  if (!isRecord(value)) return {}

  const result: Record<string, ExerciseSrs> = {}
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue

    const box = toOptionalFiniteNumber(entry.box)
    const due = toOptionalFiniteNumber(entry.due)
    const last = toOptionalFiniteNumber(entry.last)
    const correctStreak = toOptionalFiniteNumber(entry.correctStreak)
    if (
      box === undefined ||
      due === undefined ||
      last === undefined ||
      correctStreak === undefined
    ) {
      continue
    }

    result[id] = { box, due, last, correctStreak }
  }
  return result
}

function asPhrasebookRecord(value: unknown): Record<string, PhrasebookEntry> {
  if (!isRecord(value)) return {}

  const result: Record<string, PhrasebookEntry> = {}
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue

    const en = toStringValue(entry.en).trim()
    if (!en) continue

    const addedAt = toFiniteNumber(entry.addedAt, Date.now())
    const updatedAt = toFiniteNumber(entry.updatedAt, addedAt)
    const box = toFiniteNumber(entry.box, 0)
    const last = toFiniteNumber(entry.last, updatedAt)
    const due = toFiniteNumber(entry.due, last)
    const tags = Array.isArray(entry.tags)
      ? entry.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 8)
      : undefined
    const difficulty = toStringValue(entry.difficulty)

    result[id] = {
      id,
      en,
      es: toStringValue(entry.es),
      source: toStringValue(entry.source),
      addedAt,
      updatedAt,
      seen: toFiniteNumber(entry.seen, 0),
      correct: toFiniteNumber(entry.correct, 0),
      saved: Boolean(entry.saved),
      notes: typeof entry.notes === 'string' ? entry.notes : undefined,
      userExample: typeof entry.userExample === 'string' ? entry.userExample : undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
      difficulty:
        difficulty === 'easy' || difficulty === 'normal' || difficulty === 'hard'
          ? difficulty
          : undefined,
      box,
      due,
      last,
      correctStreak: toFiniteNumber(entry.correctStreak, 0),
    }
  }

  return result
}

function asCertificate(value: unknown): CertificateState | null {
  if (!isRecord(value)) return null

  const raw = value as CompactCertificateState & UnknownRecord
  const id = toStringValue(raw.id).trim().toUpperCase()
  const name = toStringValue(raw.name).trim()
  const issuedAt = toStringValue(raw.issuedAt || raw.issued_at).trim()
  const completionDate = toStringValue(raw.completionDate || raw.completion_date).trim()

  if (!id || !name || !issuedAt || !completionDate) {
    return null
  }

  const status = raw.status
  const issuedBy = raw.issuedBy

  return {
    id,
    name,
    issuedAt,
    completionDate,
    level:
      raw.level === 'A1-A2' || raw.level === 'B1-B2' || raw.level === 'C1-C2'
        ? raw.level
        : undefined,
    status:
      status === 'local' ||
      status === 'pending' ||
      status === 'issued' ||
      status === 'verified' ||
      status === 'revoked' ||
      status === 'error'
        ? status
        : 'local',
    userId:
      typeof raw.userId === 'string' || raw.userId === null
        ? raw.userId
        : toNullableString(raw.user_id),
    issuedBy: issuedBy === 'server' || issuedBy === 'local' ? issuedBy : 'local',
    lastVerifiedAt: toNullableString(raw.lastVerifiedAt),
    shareUrl: toNullableString(raw.shareUrl),
    lastError: toNullableString(raw.lastError),
  }
}

function asCertificates(
  value: unknown,
  legacy: CertificateState | null,
): Partial<Record<Level, CertificateState>> {
  const result: Partial<Record<Level, CertificateState>> = {}
  if (isRecord(value)) {
    for (const [key, raw] of Object.entries(value)) {
      if (key !== 'A1-A2' && key !== 'B1-B2' && key !== 'C1-C2') continue
      const cert = asCertificate(raw)
      if (cert) result[key as Level] = { ...cert, level: cert.level ?? (key as Level) }
    }
  }
  if (legacy) {
    const target: Level = legacy.level ?? 'A1-A2'
    if (!result[target]) result[target] = { ...legacy, level: target }
  }
  return result
}

function toCompactState(raw: unknown): CompactProgressState | null {
  const parsed = parseCompactState(raw)
  if (parsed) return parsed as CompactProgressState
  return isRecord(raw) ? (raw as CompactProgressState) : null
}

export function expandState(raw: unknown, defaults: ProgressState): ProgressState {
  if (!isRecord(raw)) return defaults

  const compactCandidate = 'v' in raw || 'ce' in raw || 'cs' in raw || 'se' in raw || 'vl' in raw
  if (!compactCandidate) {
    return { ...defaults, ...(raw as Partial<ProgressState>) } as ProgressState
  }

  const compact = toCompactState(raw)
  if (!compact) return defaults

  const settings = compact.se ?? {}
  const reminders = settings.rem ?? {}
  const streak = compact.sk ?? {}

  const expandedSettings: ProgressSettings = {
    ...defaults.settings,
    theme: settings.th === 'dark' ? 'dark' : 'light',
    immersion:
      settings.im === 'auto' ||
      settings.im === 'es' ||
      settings.im === 'mixed' ||
      settings.im === 'en'
        ? settings.im
        : defaults.settings.immersion,
    ttsEnabled: typeof settings.tts === 'boolean' ? settings.tts : defaults.settings.ttsEnabled,
    ttsRate: toFiniteNumber(settings.rate, defaults.settings.ttsRate),
    ttsEngine:
      settings.eng === 'kokoro' || settings.eng === 'piper' || settings.eng === 'google'
        ? settings.eng
        : 'system',
    speechLanguage: settings.lng === 'en-GB' ? 'en-GB' : 'en-US',
    name: toStringValue(settings.name, ''),
    onboarded: Boolean(settings.ob),
    goal:
      settings.goal === 'daily' ||
      settings.goal === 'interviews' ||
      settings.goal === 'work' ||
      settings.goal === 'all'
        ? settings.goal
        : 'all',
    reminders: {
      enabled: Boolean(reminders.en),
      time:
        typeof reminders.tm === 'string' && /^\d{2}:\d{2}$/.test(reminders.tm)
          ? reminders.tm
          : '20:00',
      lastNudgeDate: typeof reminders.ld === 'string' ? reminders.ld : null,
    },
  }

  const certificate = asCertificate(compact.cert)
  const certificates = asCertificates(compact.certs, certificate)

  return {
    ...defaults,
    version: toFiniteNumber(compact.v, 3),
    xp: toFiniteNumber(compact.xp, 0),
    startedAt: toFiniteNumber(compact.st, defaults.startedAt),
    completedExercises: asNumberRecord(compact.ce),
    completedSessions: asNumberRecord(compact.cs),
    attempts: asNumberRecord(compact.at),
    exerciseSrs: asSrsRecord(compact.sr),
    savedSlang: asStringArray(compact.ss),
    phrasebook: asPhrasebookRecord(compact.pb),
    certificate,
    certificates,
    achievements: asNumberRecord(compact.ac),
    videoLab: compact.vl ? expandVideoLab(compact.vl) : createDefaultVideoLabState(),
    streak: {
      current: toFiniteNumber(streak.current, 0),
      longest: toFiniteNumber(streak.longest, 0),
      lastActiveDate: typeof streak.lastActiveDate === 'string' ? streak.lastActiveDate : null,
    },
    settings: expandedSettings,
  }
}

function unionMinTs(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = { ...a }
  for (const [key, value] of Object.entries(b)) {
    if (!(key in result) || value < result[key]) {
      result[key] = value
    }
  }
  return result
}

function maxAttempts(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = { ...a }
  for (const [key, value] of Object.entries(b)) {
    result[key] = Math.max(result[key] ?? 0, value)
  }
  return result
}

function unionStrings(a: string[], b: string[]): string[] {
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]))
}

function achievementXpTotal(unlocked: Record<string, number>): number {
  let sum = 0
  for (const achievement of ACHIEVEMENTS) {
    if (unlocked[achievement.id]) sum += achievement.xp
  }
  return sum
}

function recomputeXp(
  state: Pick<
    ProgressState,
    'completedExercises' | 'completedSessions' | 'savedSlang' | 'achievements'
  >,
): number {
  return (
    Object.keys(state.completedExercises ?? {}).length * 10 +
    Object.keys(state.completedSessions ?? {}).length * 40 +
    (state.savedSlang ?? []).length * 5 +
    achievementXpTotal(state.achievements ?? {})
  )
}

function mergeStreak(
  a: ProgressState['streak'],
  b: ProgressState['streak'],
): ProgressState['streak'] {
  const pick = (first: ProgressState['streak'], second: ProgressState['streak']) => {
    if (!first?.lastActiveDate) return second
    if (!second?.lastActiveDate) return first

    if (first.lastActiveDate === second.lastActiveDate) {
      return {
        current: Math.max(first.current, second.current),
        longest: Math.max(first.longest, second.longest),
        lastActiveDate: first.lastActiveDate,
      }
    }

    return first.lastActiveDate > second.lastActiveDate ? first : second
  }

  const chosen = pick(a, b) ?? a ?? b
  return {
    current: chosen?.current ?? 0,
    longest: Math.max(a?.longest ?? 0, b?.longest ?? 0, chosen?.longest ?? 0),
    lastActiveDate: chosen?.lastActiveDate ?? null,
  }
}

function mergeExerciseSrs(
  a: ProgressState['exerciseSrs'] | undefined,
  b: ProgressState['exerciseSrs'] | undefined,
): ProgressState['exerciseSrs'] {
  const result: ProgressState['exerciseSrs'] = { ...(a ?? {}) }

  for (const [id, remoteEntry] of Object.entries(b ?? {})) {
    const localEntry = result[id]
    if (!localEntry) {
      result[id] = remoteEntry
      continue
    }

    if (remoteEntry.last > localEntry.last) {
      result[id] = remoteEntry
      continue
    }

    if (remoteEntry.last === localEntry.last && remoteEntry.box >= localEntry.box) {
      result[id] = remoteEntry
    }
  }

  return result
}

function mergePhrasebook(
  a: Record<string, PhrasebookEntry> | undefined,
  b: Record<string, PhrasebookEntry> | undefined,
): Record<string, PhrasebookEntry> {
  const result: Record<string, PhrasebookEntry> = { ...(a ?? {}) }

  for (const [id, remoteEntry] of Object.entries(b ?? {})) {
    const localEntry = result[id]
    if (!localEntry) {
      result[id] = remoteEntry
      continue
    }

    const updatedAt = Math.max(localEntry.updatedAt ?? 0, remoteEntry.updatedAt ?? 0)
    result[id] = {
      ...localEntry,
      ...remoteEntry,
      id,
      en:
        (remoteEntry.en?.length ?? 0) >= (localEntry.en?.length ?? 0)
          ? remoteEntry.en
          : localEntry.en,
      es:
        (remoteEntry.es?.length ?? 0) >= (localEntry.es?.length ?? 0)
          ? remoteEntry.es
          : localEntry.es,
      source: remoteEntry.source || localEntry.source || '',
      addedAt: Math.min(localEntry.addedAt ?? updatedAt, remoteEntry.addedAt ?? updatedAt),
      updatedAt,
      seen: Math.max(localEntry.seen ?? 0, remoteEntry.seen ?? 0),
      correct: Math.max(localEntry.correct ?? 0, remoteEntry.correct ?? 0),
      saved: Boolean(localEntry.saved || remoteEntry.saved),
      tags:
        (remoteEntry.tags?.length ?? 0) >= (localEntry.tags?.length ?? 0)
          ? remoteEntry.tags
          : localEntry.tags,
      notes:
        (remoteEntry.notes?.length ?? 0) >= (localEntry.notes?.length ?? 0)
          ? remoteEntry.notes
          : localEntry.notes,
      userExample:
        (remoteEntry.userExample?.length ?? 0) >= (localEntry.userExample?.length ?? 0)
          ? remoteEntry.userExample
          : localEntry.userExample,
      difficulty: remoteEntry.difficulty ?? localEntry.difficulty,
      box: Math.max(localEntry.box ?? 0, remoteEntry.box ?? 0),
      due: Math.max(localEntry.due ?? 0, remoteEntry.due ?? 0),
      last: Math.max(localEntry.last ?? 0, remoteEntry.last ?? 0),
      correctStreak: Math.max(localEntry.correctStreak ?? 0, remoteEntry.correctStreak ?? 0),
    }
  }

  return result
}

function certificateRank(certificate: CertificateState | null | undefined): number {
  if (!certificate) return -1
  const issuedByScore = certificate.issuedBy === 'server' ? 2 : 0
  const statusScore = certificate.status === 'verified' || certificate.status === 'issued' ? 1 : 0
  return issuedByScore + statusScore
}

function mergeCertificate(
  localCertificate: CertificateState | null | undefined,
  remoteCertificate: CertificateState | null | undefined,
): CertificateState | null {
  if (!localCertificate) return remoteCertificate ?? null
  if (!remoteCertificate) return localCertificate ?? null

  const localRank = certificateRank(localCertificate)
  const remoteRank = certificateRank(remoteCertificate)
  if (remoteRank !== localRank) {
    return remoteRank > localRank
      ? { ...localCertificate, ...remoteCertificate }
      : { ...remoteCertificate, ...localCertificate }
  }

  const localTime = Date.parse(localCertificate.issuedAt || '') || 0
  const remoteTime = Date.parse(remoteCertificate.issuedAt || '') || 0
  const newer = remoteTime >= localTime ? remoteCertificate : localCertificate
  const older = remoteTime >= localTime ? localCertificate : remoteCertificate
  return { ...older, ...newer }
}

function mergeCertificates(
  local: Partial<Record<Level, CertificateState>> | undefined,
  remote: Partial<Record<Level, CertificateState>> | undefined,
): Partial<Record<Level, CertificateState>> {
  const result: Partial<Record<Level, CertificateState>> = {}
  const levels: Level[] = ['A1-A2', 'B1-B2', 'C1-C2']
  for (const level of levels) {
    const merged = mergeCertificate(local?.[level], remote?.[level])
    if (merged) result[level] = { ...merged, level: merged.level ?? level }
  }
  return result
}

export interface MergeReport {
  merged: ProgressState
  hadConflict: boolean
  notes: string[]
}

export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  return mergeProgressDetailed(local, remote).merged
}

export function mergeProgressDetailed(local: ProgressState, remote: ProgressState): MergeReport {
  const notes: string[] = []

  const completedExercises = unionMinTs(
    local.completedExercises ?? {},
    remote.completedExercises ?? {},
  )
  const completedSessions = unionMinTs(
    local.completedSessions ?? {},
    remote.completedSessions ?? {},
  )
  const attempts = maxAttempts(local.attempts ?? {}, remote.attempts ?? {})
  const exerciseSrs = mergeExerciseSrs(local.exerciseSrs, remote.exerciseSrs)
  const savedSlang = unionStrings(local.savedSlang ?? [], remote.savedSlang ?? [])
  const phrasebook = mergePhrasebook(local.phrasebook, remote.phrasebook)
  const certificate = mergeCertificate(local.certificate, remote.certificate)
  const certificates = mergeCertificates(local.certificates, remote.certificates)
  const achievements = unionMinTs(local.achievements ?? {}, remote.achievements ?? {})
  const videoLab = mergeVideoLabStates(
    local.videoLab ?? createDefaultVideoLabState(),
    remote.videoLab ?? createDefaultVideoLabState(),
  )
  const streak = mergeStreak(local.streak, remote.streak)
  const xp = Math.max(
    local.xp ?? 0,
    remote.xp ?? 0,
    recomputeXp({ completedExercises, completedSessions, savedSlang, achievements }),
  )

  const settings: ProgressSettings = { ...local.settings, ...remote.settings }
  if (local.settings?.theme && !remote.settings?.theme) {
    settings.theme = local.settings.theme
  }

  const hadConflict = JSON.stringify(compactState(local)) !== JSON.stringify(compactState(remote))
  if (hadConflict) {
    notes.push('Se fusionaron cambios locales y remotos.')
  }

  const merged: ProgressState = {
    ...local,
    ...remote,
    version: Math.max(local.version ?? 2, remote.version ?? 2, 3),
    completedExercises,
    completedSessions,
    attempts,
    exerciseSrs,
    savedSlang,
    phrasebook,
    certificate,
    certificates,
    achievements,
    videoLab,
    streak,
    xp,
    startedAt: Math.min(local.startedAt ?? Date.now(), remote.startedAt ?? Date.now()),
    settings,
  }

  return { merged, hadConflict, notes }
}

export function isApplyingRemote(): boolean {
  return applyingRemote
}

export function setCurrentUser(userId: string | null): void {
  const previousUserId = currentUserId
  currentUserId = userId

  if (!userId && pushTimer) {
    clearTimeout(pushTimer)
    pushTimer = null
  }
  if (!userId && retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  if (userId !== previousUserId) {
    updateMeta({
      userId,
      lastError: null,
      retryCount: 0,
      nextRetryAt: null,
      pending: userId ? metaState.pending : false,
    })
    pushHistory(
      'auth',
      true,
      userId ? 'Sesión iniciada, listo para sincronizar.' : 'Sesión cerrada.',
    )
  } else {
    notify()
  }
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export async function pullRemote(
  defaults: ProgressState,
): Promise<{ state: ProgressState; updatedAt: string } | null> {
  if (!supabase || !currentUserId) return null

  const { data, error } = await supabase
    .from(TABLE)
    .select('state, updated_at')
    .eq('user_id', currentUserId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const expanded = expandState((data as { state: unknown }).state, defaults)
  return {
    state: expanded,
    updatedAt: toStringValue((data as { updated_at?: unknown }).updated_at, nowIso()),
  }
}

function fingerprint(state: ProgressState): string {
  try {
    return JSON.stringify(compactState(state))
  } catch {
    return String(Date.now())
  }
}

export async function pushRemote(state: ProgressState, force = false): Promise<boolean> {
  if (!supabase || !currentUserId) return false
  if (applyingRemote && !force) return false

  if (isBrowser() && navigator.onLine === false) {
    updateMeta({ pending: true, lastError: 'Sin conexión. Se reintentará al volver online.' })
    return false
  }

  const stateFingerprint = fingerprint(state)
  if (!force && stateFingerprint === lastPushFingerprint && !metaState.pending) {
    return true
  }

  updateMeta({ lastAttemptAt: nowIso(), pending: true })

  const payload = { user_id: currentUserId, state: compactState(state) }
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'user_id' })

  if (error) {
    const message = error.message || 'Error al sincronizar'
    const retryCount = (metaState.retryCount || 0) + 1
    const delay = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** Math.min(retryCount, 6))

    updateMeta({
      lastError: message,
      pending: true,
      retryCount,
      nextRetryAt: new Date(Date.now() + delay).toISOString(),
    })
    pushHistory('error', false, 'No se pudo subir el progreso.', message)
    scheduleRetry(delay)
    return false
  }

  lastPushFingerprint = stateFingerprint
  updateMeta({
    lastError: null,
    pending: false,
    retryCount: 0,
    nextRetryAt: null,
    lastSyncedAt: nowIso(),
    lastSuccessAt: nowIso(),
  })
  pushHistory('push', true, 'Progreso sincronizado con la nube.')
  return true
}

function scheduleRetry(delay: number): void {
  if (retryTimer) clearTimeout(retryTimer)

  retryTimer = setTimeout(() => {
    retryTimer = null
    notify()
    try {
      if (isBrowser()) window.dispatchEvent(new CustomEvent('runtimeenglish-sync-retry'))
    } catch {
      // Ignore event dispatch failures.
    }
  }, delay)
}

export function schedulePush(getState: () => ProgressState): void {
  if (!currentUserId || applyingRemote) return

  updateMeta({ pending: true, lastError: null })

  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    void pushRemote(getState())
  }, SYNC_DEBOUNCE_MS)
}

export async function syncNow(
  local: ProgressState,
  defaults: ProgressState,
): Promise<ProgressState> {
  if (!supabase || !currentUserId) return local

  updateMeta({ lastAttemptAt: nowIso() })

  if (isBrowser() && navigator.onLine === false) {
    updateMeta({
      pending: true,
      lastError:
        'Sin conexión. Los cambios se guardaron localmente y se sincronizarán al reconectar.',
    })
    pushHistory('error', false, 'Sin conexión.', 'offline')
    return local
  }

  try {
    const remote = await pullRemote(defaults)
    let merged = local
    let hadConflict = false

    if (remote) {
      const result = mergeProgressDetailed(local, remote.state)
      merged = result.merged
      hadConflict = result.hadConflict
      updateMeta({
        lastRemoteUpdatedAt: remote.updatedAt,
        conflictCount: hadConflict
          ? (metaState.conflictCount || 0) + 1
          : metaState.conflictCount || 0,
      })
      pushHistory(
        hadConflict ? 'conflict' : 'merge',
        true,
        hadConflict
          ? 'Conflicto resuelto: se fusionaron cambios locales y remotos.'
          : 'Progreso remoto fusionado.',
        remote.updatedAt,
      )
    } else {
      pushHistory('pull', true, 'No había progreso remoto. Se subirá el progreso local.')
    }

    applyingRemote = true
    try {
      await pushRemote(merged, true)
    } finally {
      applyingRemote = false
    }

    return merged
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de sincronización'
    const retryCount = (metaState.retryCount || 0) + 1
    const delay = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** Math.min(retryCount, 6))

    updateMeta({
      lastError: message,
      pending: true,
      retryCount,
      nextRetryAt: new Date(Date.now() + delay).toISOString(),
    })
    pushHistory('error', false, 'Fallo de sincronización.', message)
    scheduleRetry(delay)
    throw error
  }
}

export function withRemoteApply<T>(fn: () => T): T {
  applyingRemote = true
  try {
    return fn()
  } finally {
    applyingRemote = false
  }
}

export function clearSyncError(): void {
  updateMeta({ lastError: null, retryCount: 0, nextRetryAt: null })
}

export function getSyncHistory(): SyncHistoryEntry[] {
  return metaState.history ?? []
}

// Auto-retry on reconnect.
if (isBrowser()) {
  window.addEventListener('online', () => {
    updateMeta({ lastError: null })
    pushHistory('pull', true, 'Conexión restablecida. Reintentando sincronización...')
    try {
      window.dispatchEvent(new CustomEvent('runtimeenglish-sync-retry'))
    } catch {
      // Ignore event dispatch failures.
    }
  })

  window.addEventListener('offline', () => {
    updateMeta({ pending: true, lastError: 'Sin conexión. Los cambios se guardarán localmente.' })
    pushHistory('error', false, 'Sin conexión.', 'offline')
  })
}
