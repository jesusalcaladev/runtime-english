import { ACHIEVEMENTS } from "./achievements";
import type { ProgressSettings, ProgressState } from "./progress";
import { parseCompactState } from "./progressSchema";
import { supabase } from "./supabase";

const TABLE = "user_progress";
const SYNC_META_KEY = "runtimeenglish_sync_meta_v1";
const SYNC_HISTORY_MAX = 30;
const BASE_RETRY_MS = 5000;
const MAX_RETRY_MS = 120000;
const SYNC_DEBOUNCE_MS = 2500;

export type SyncPhase = "idle" | "syncing" | "pending" | "error" | "offline" | "disabled";

export interface SyncHistoryEntry {
  at: string;
  type: "push" | "pull" | "merge" | "error" | "conflict" | "auth";
  ok: boolean;
  message: string;
  details?: string;
}

export interface SyncMeta {
  userId: string | null;
  lastSyncedAt: string | null;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  lastRemoteUpdatedAt: string | null;
  pending: boolean;
  retryCount: number;
  nextRetryAt: string | null;
  history: SyncHistoryEntry[];
  conflictCount: number;
}

export interface SyncStatus extends SyncMeta {
  phase: SyncPhase;
  online: boolean;
  configured: boolean;
}

let currentUserId: string | null = null;
let applyingRemote = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let lastPushFingerprint = "";
const listeners = new Set<(s: SyncStatus) => void>();

function nowIso() {
  return new Date().toISOString();
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
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readMeta(): SyncMeta {
  if (!isBrowser()) return defaultMeta();
  try {
    const raw = window.localStorage.getItem(SYNC_META_KEY);
    if (!raw) return defaultMeta();
    const p = JSON.parse(raw) as Partial<SyncMeta>;
    return {
      ...defaultMeta(),
      ...p,
      history: Array.isArray(p.history) ? p.history.slice(0, SYNC_HISTORY_MAX) : [],
    };
  } catch {
    return defaultMeta();
  }
}

function writeMeta(meta: SyncMeta) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {}
}

let metaState: SyncMeta = readMeta();

function computePhase(m: SyncMeta): SyncPhase {
  const online = isBrowser() ? navigator.onLine !== false : true;
  if (!supabase) return "disabled";
  if (!currentUserId) return "idle";
  if (!online) return "offline";
  if (m.lastError && m.pending) return "error";
  if (m.pending) return "pending";
  return "idle";
}

export function getSyncStatus(): SyncStatus {
  return {
    ...metaState,
    userId: currentUserId,
    phase: computePhase(metaState),
    online: isBrowser() ? navigator.onLine !== false : true,
    configured: !!supabase,
  };
}

function notify() {
  const s = getSyncStatus();
  listeners.forEach((l) => l(s));
}

export function subscribeSyncStatus(listener: (s: SyncStatus) => void): () => void {
  listeners.add(listener);
  listener(getSyncStatus());
  return () => listeners.delete(listener);
}

function updateMeta(patch: Partial<SyncMeta>, entry?: SyncHistoryEntry) {
  const history = entry
    ? [entry, ...(metaState.history || [])].slice(0, SYNC_HISTORY_MAX)
    : metaState.history || [];
  metaState = { ...metaState, ...patch, history };
  writeMeta(metaState);
  notify();
}

function pushHistory(
  type: SyncHistoryEntry["type"],
  ok: boolean,
  message: string,
  details?: string,
) {
  updateMeta({}, { at: nowIso(), type, ok, message, details });
}

// --- Compaction to save space (omits empty/trivial defaults) ---
function isEmptyRecord(v: unknown): boolean {
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0;
}

export function compactState(state: ProgressState): Record<string, unknown> {
  const out: Record<string, unknown> = { v: 3, xp: state.xp, st: state.startedAt };
  if (!isEmptyRecord(state.completedExercises)) out.ce = state.completedExercises;
  if (!isEmptyRecord(state.completedSessions)) out.cs = state.completedSessions;
  if (!isEmptyRecord(state.attempts)) out.at = state.attempts;
  if (!isEmptyRecord((state as any).exerciseSrs)) out.sr = (state as any).exerciseSrs;
  if (state.savedSlang.length) out.ss = state.savedSlang;
  if (!isEmptyRecord((state as any).phrasebook)) out.pb = (state as any).phrasebook;
  if ((state as any).certificate) out.cert = (state as any).certificate;
  if (!isEmptyRecord(state.achievements)) out.ac = state.achievements;
  if (state.streak.current || state.streak.longest || state.streak.lastActiveDate)
    out.sk = state.streak;
  const s = state.settings;
  out.se = {
    th: s.theme,
    im: s.immersion,
    tts: s.ttsEnabled,
    rate: s.ttsRate,
    eng: s.ttsEngine,
    name: s.name || "",
    ob: s.onboarded,
    goal: s.goal,
    rem: { en: s.reminders.enabled, tm: s.reminders.time, ld: s.reminders.lastNudgeDate },
  };
  return out;
}

function asRecord(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return v as Record<string, number>;
}
function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export function expandState(raw: unknown, defaults: ProgressState): ProgressState {
  if (!raw || typeof raw !== "object") return defaults;
  const rawObj = raw as any;
  // Supports compact format (v/ce/cs/...) and full format (version/completedExercises/...)
  const compact = "v" in rawObj || "ce" in rawObj || "cs" in rawObj;
  if (!compact) {
    // Delegates to the store mergeState via a partial full structure
    return { ...defaults, ...(rawObj as Partial<ProgressState>) } as ProgressState;
  }
  const r = parseCompactState(rawObj) ?? rawObj;
  const se = (r as any).se || {};
  const rem = se.rem || {};
  const settings: ProgressSettings = {
    ...defaults.settings,
    theme: se.th === "dark" ? "dark" : "light",
    immersion: ["auto", "es", "mixed", "en"].includes(se.im) ? se.im : defaults.settings.immersion,
    ttsEnabled: typeof se.tts === "boolean" ? se.tts : defaults.settings.ttsEnabled,
    ttsRate: typeof se.rate === "number" ? se.rate : defaults.settings.ttsRate,
    ttsEngine: se.eng === "kokoro" ? "kokoro" : "system",
    name: typeof se.name === "string" ? se.name : "",
    onboarded: Boolean(se.ob),
    goal: ["daily", "interviews", "work", "all"].includes(se.goal) ? se.goal : "all",
    reminders: {
      enabled: Boolean(rem.en),
      time: typeof rem.tm === "string" && /^\d{2}:\d{2}$/.test(rem.tm) ? rem.tm : "20:00",
      lastNudgeDate: typeof rem.ld === "string" ? rem.ld : null,
    },
  } as ProgressSettings;
  const sk = r.sk || {};
  return {
    ...defaults,
    version: typeof r.v === "number" ? r.v : 3,
    xp: typeof r.xp === "number" ? r.xp : 0,
    startedAt: typeof r.st === "number" ? r.st : defaults.startedAt,
    completedExercises: asRecord(r.ce),
    completedSessions: asRecord(r.cs),
    attempts: asRecord(r.at),
    exerciseSrs: (r.sr && typeof r.sr === "object" && !Array.isArray(r.sr) ? r.sr : {}) as any,
    savedSlang: asStringArray(r.ss),
    phrasebook: (r.pb && typeof r.pb === "object" && !Array.isArray(r.pb) ? r.pb : {}) as any,
    certificate: (r.cert && typeof r.cert === "object"
      ? {
          id: String(r.cert.id || "").toUpperCase(),
          name: String(r.cert.name || ""),
          issuedAt: String(r.cert.issuedAt || r.cert.issued_at || ""),
          completionDate: String(r.cert.completionDate || r.cert.completion_date || ""),
          status: r.cert.status || "local",
          userId: r.cert.userId ?? r.cert.user_id ?? null,
          issuedBy: r.cert.issuedBy || "local",
          lastVerifiedAt: r.cert.lastVerifiedAt ?? null,
          shareUrl: r.cert.shareUrl ?? null,
          lastError: r.cert.lastError ?? null,
        }
      : null) as any,
    achievements: asRecord(r.ac),
    streak: {
      current: typeof sk.current === "number" ? sk.current : 0,
      longest: typeof sk.longest === "number" ? sk.longest : 0,
      lastActiveDate: typeof sk.lastActiveDate === "string" ? sk.lastActiveDate : null,
    },
    settings,
  } as ProgressState;
}

function unionMinTs(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (!(k in out) || (typeof v === "number" && v < out[k])) out[k] = v;
  }
  return out;
}
function maxAttempts(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = Math.max(out[k] ?? 0, typeof v === "number" ? v : 0);
  }
  return out;
}
function unionStrings(a: string[], b: string[]): string[] {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}
function achievementXpTotal(unlocked: Record<string, number>): number {
  let sum = 0;
  for (const a of ACHIEVEMENTS) if (unlocked[a.id]) sum += a.xp;
  return sum;
}
function recomputeXp(
  state: Pick<
    ProgressState,
    "completedExercises" | "completedSessions" | "savedSlang" | "achievements"
  >,
): number {
  return (
    Object.keys(state.completedExercises || {}).length * 10 +
    Object.keys(state.completedSessions || {}).length * 40 +
    (state.savedSlang || []).length * 5 +
    achievementXpTotal(state.achievements || {})
  );
}
function mergeStreak(
  a: ProgressState["streak"],
  b: ProgressState["streak"],
): ProgressState["streak"] {
  const pick = (x: ProgressState["streak"], y: ProgressState["streak"]) => {
    if (!x?.lastActiveDate) return y;
    if (!y?.lastActiveDate) return x;
    if (x.lastActiveDate === y.lastActiveDate) {
      return {
        current: Math.max(x.current, y.current),
        longest: Math.max(x.longest, y.longest),
        lastActiveDate: x.lastActiveDate,
      };
    }
    return x.lastActiveDate > y.lastActiveDate ? x : y;
  };
  const chosen = pick(a, b) || a || b;
  return {
    ...chosen,
    longest: Math.max(a?.longest || 0, b?.longest || 0, chosen?.longest || 0),
  } as any;
}
function mergeExerciseSrs(
  a: ProgressState["exerciseSrs"] | undefined,
  b: ProgressState["exerciseSrs"] | undefined,
): ProgressState["exerciseSrs"] {
  const out: ProgressState["exerciseSrs"] = { ...(a ?? {}) };
  for (const [id, sb] of Object.entries(b ?? {})) {
    const sa = out[id] as any;
    if (!sa) {
      out[id] = sb as any;
      continue;
    }
    const lb = (sb as any).last ?? 0;
    const la = sa.last ?? 0;
    if (lb > la) out[id] = sb as any;
    else if (lb === la && ((sb as any).box ?? 0) >= (sa.box ?? 0)) out[id] = sb as any;
  }
  return out;
}
function mergePhrasebook(
  a: Record<string, any> | undefined,
  b: Record<string, any> | undefined,
): Record<string, any> {
  const out: Record<string, any> = { ...(a ?? {}) };
  for (const [id, rb] of Object.entries(b ?? {})) {
    const ra = out[id];
    if (!ra) {
      out[id] = rb;
      continue;
    }
    const updatedAt = Math.max(ra.updatedAt ?? 0, rb.updatedAt ?? 0);
    out[id] = {
      ...ra,
      ...rb,
      id,
      en: (rb.en?.length ?? 0) >= (ra.en?.length ?? 0) ? rb.en : ra.en,
      es: (rb.es?.length ?? 0) >= (ra.es?.length ?? 0) ? rb.es : ra.es || "",
      source: rb.source || ra.source || "",
      addedAt: Math.min(ra.addedAt ?? updatedAt, rb.addedAt ?? updatedAt),
      updatedAt,
      seen: Math.max(ra.seen ?? 0, rb.seen ?? 0),
      correct: Math.max(ra.correct ?? 0, rb.correct ?? 0),
      saved: Boolean(ra.saved || rb.saved),
    };
  }
  return out;
}
function mergeCertificate(a: any, b: any): any {
  if (!a) return b || null;
  if (!b) return a || null;
  // Prefer server-issued/verified, otherwise the latest issuedAt
  const rank = (c: any) =>
    (c?.issuedBy === "server" ? 2 : 0) +
    (c?.status === "verified" || c?.status === "issued" ? 1 : 0);
  const ra = rank(a),
    rb = rank(b);
  if (rb !== ra) return rb > ra ? { ...a, ...b } : { ...b, ...a };
  const ta = Date.parse(a.issuedAt || "") || 0;
  const tb = Date.parse(b.issuedAt || "") || 0;
  const newer = tb >= ta ? b : a;
  const older = tb >= ta ? a : b;
  return { ...older, ...newer };
}

export interface MergeReport {
  merged: ProgressState;
  hadConflict: boolean;
  notes: string[];
}

export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  return mergeProgressDetailed(local, remote).merged;
}

export function mergeProgressDetailed(local: ProgressState, remote: ProgressState): MergeReport {
  const notes: string[] = [];
  const completedExercises = unionMinTs(
    local.completedExercises || {},
    remote.completedExercises || {},
  );
  const completedSessions = unionMinTs(
    local.completedSessions || {},
    remote.completedSessions || {},
  );
  const attempts = maxAttempts(local.attempts || {}, remote.attempts || {});
  const exerciseSrs = mergeExerciseSrs(local.exerciseSrs as any, remote.exerciseSrs as any);
  const savedSlang = unionStrings(local.savedSlang || [], remote.savedSlang || []);
  const phrasebook = mergePhrasebook(local.phrasebook as any, remote.phrasebook as any);
  const certificate = mergeCertificate((local as any).certificate, (remote as any).certificate);
  const achievements = unionMinTs(local.achievements || {}, remote.achievements || {});
  const streak = mergeStreak(local.streak, remote.streak);
  const xp = Math.max(
    local.xp || 0,
    remote.xp || 0,
    recomputeXp({ completedExercises, completedSessions, savedSlang, achievements }),
  );

  // Settings: conservative union + prefer profile/remote fields when present
  const settings = { ...local.settings, ...remote.settings } as ProgressSettings;
  // Device preferences (theme/tts, etc.) are merged conservatively; perfect last-write merge is not guaranteed, so we union values
  if (local.settings?.theme && !remote.settings?.theme) settings.theme = local.settings.theme;

  const hadConflict = JSON.stringify(compactState(local)) !== JSON.stringify(compactState(remote));
  if (hadConflict) notes.push("Se fusionaron cambios locales y remotos.");

  const merged: ProgressState = {
    ...local,
    ...remote,
    version: Math.max(local.version || 2, remote.version || 2, 3),
    completedExercises,
    completedSessions,
    attempts,
    exerciseSrs,
    savedSlang,
    phrasebook,
    certificate,
    achievements,
    streak,
    xp,
    startedAt: Math.min(local.startedAt || Date.now(), remote.startedAt || Date.now()),
    settings,
  } as ProgressState;

  return { merged, hadConflict, notes };
}

export function isApplyingRemote(): boolean {
  return applyingRemote;
}

export function setCurrentUser(userId: string | null) {
  const prev = currentUserId;
  currentUserId = userId;
  if (!userId && pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (!userId && retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (userId !== prev) {
    updateMeta({
      userId,
      lastError: null,
      retryCount: 0,
      nextRetryAt: null,
      pending: !!userId && metaState.pending,
    });
    pushHistory(
      "auth",
      true,
      userId ? "Sesión iniciada, listo para sincronizar." : "Sesión cerrada.",
    );
  } else {
    notify();
  }
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export async function pullRemote(
  defaults: ProgressState,
): Promise<{ state: ProgressState; updatedAt: string } | null> {
  if (!supabase || !currentUserId) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select("state, updated_at")
    .eq("user_id", currentUserId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const expanded = expandState(data.state, defaults);
  return { state: expanded, updatedAt: data.updated_at as string };
}

function fingerprint(state: ProgressState): string {
  try {
    return JSON.stringify(compactState(state));
  } catch {
    return String(Date.now());
  }
}

export async function pushRemote(state: ProgressState, force = false): Promise<boolean> {
  if (!supabase || !currentUserId) return false;
  if (applyingRemote && !force) return false;
  if (isBrowser() && navigator.onLine === false) {
    updateMeta({ pending: true, lastError: "Sin conexión. Se reintentará al volver online." });
    return false;
  }
  const fp = fingerprint(state);
  if (!force && fp === lastPushFingerprint && !metaState.pending) return true;

  updateMeta({ lastAttemptAt: nowIso(), pending: true });
  const payload = { user_id: currentUserId, state: compactState(state) };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "user_id" });
  if (error) {
    const msg = error.message || "Error al sincronizar";
    const retryCount = (metaState.retryCount || 0) + 1;
    const delay = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** Math.min(retryCount, 6));
    updateMeta({
      lastError: msg,
      pending: true,
      retryCount,
      nextRetryAt: new Date(Date.now() + delay).toISOString(),
    });
    pushHistory("error", false, "No se pudo subir el progreso.", msg);
    scheduleRetry(delay);
    return false;
  }
  lastPushFingerprint = fp;
  updateMeta({
    lastError: null,
    pending: false,
    retryCount: 0,
    nextRetryAt: null,
    lastSyncedAt: nowIso(),
    lastSuccessAt: nowIso(),
  });
  pushHistory("push", true, "Progreso sincronizado con la nube.");
  return true;
}

function scheduleRetry(delay: number) {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    notify();
    // Consumer should trigger sync/push via events; emit status so the UI can react
    try {
      if (isBrowser()) window.dispatchEvent(new CustomEvent("runtimeenglish-sync-retry"));
    } catch {}
  }, delay);
}

export function schedulePush(getState: () => ProgressState) {
  if (!currentUserId || applyingRemote) return;
  updateMeta({ pending: true, lastError: null });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushRemote(getState());
  }, SYNC_DEBOUNCE_MS);
}

export async function syncNow(
  local: ProgressState,
  defaults: ProgressState,
): Promise<ProgressState> {
  if (!supabase || !currentUserId) return local;
  updateMeta({ lastAttemptAt: nowIso() });
  if (isBrowser() && navigator.onLine === false) {
    updateMeta({
      pending: true,
      lastError:
        "Sin conexión. Los cambios se guardaron localmente y se sincronizarán al reconectar.",
    });
    pushHistory("error", false, "Sin conexión.", "offline");
    return local;
  }
  try {
    const remote = await pullRemote(defaults);
    let merged = local;
    let hadConflict = false;
    if (remote) {
      const res = mergeProgressDetailed(local, remote.state);
      merged = res.merged;
      hadConflict = res.hadConflict;
      updateMeta({
        lastRemoteUpdatedAt: remote.updatedAt,
        conflictCount: hadConflict
          ? (metaState.conflictCount || 0) + 1
          : metaState.conflictCount || 0,
      });
      pushHistory(
        hadConflict ? "conflict" : "merge",
        true,
        hadConflict
          ? "Conflicto resuelto: se fusionaron cambios locales y remotos."
          : "Progreso remoto fusionado.",
        remote.updatedAt,
      );
    } else {
      pushHistory("pull", true, "No había progreso remoto. Se subirá el progreso local.");
    }
    applyingRemote = true;
    try {
      await pushRemote(merged, true);
    } finally {
      applyingRemote = false;
    }
    return merged;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de sincronización";
    const retryCount = (metaState.retryCount || 0) + 1;
    const delay = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** Math.min(retryCount, 6));
    updateMeta({
      lastError: msg,
      pending: true,
      retryCount,
      nextRetryAt: new Date(Date.now() + delay).toISOString(),
    });
    pushHistory("error", false, "Fallo de sincronización.", msg);
    scheduleRetry(delay);
    throw e;
  }
}

export function withRemoteApply<T>(fn: () => T): T {
  applyingRemote = true;
  try {
    return fn();
  } finally {
    applyingRemote = false;
  }
}

export function clearSyncError() {
  updateMeta({ lastError: null, retryCount: 0, nextRetryAt: null });
}

export function getSyncHistory(): SyncHistoryEntry[] {
  return metaState.history || [];
}

// Auto-retry on reconnect
if (isBrowser()) {
  window.addEventListener("online", () => {
    updateMeta({ lastError: null });
    pushHistory("pull", true, "Conexión restablecida. Reintentando sincronización...");
    try {
      window.dispatchEvent(new CustomEvent("runtimeenglish-sync-retry"));
    } catch {}
  });
  window.addEventListener("offline", () => {
    updateMeta({ pending: true, lastError: "Sin conexión. Los cambios se guardarán localmente." });
    pushHistory("error", false, "Sin conexión.", "offline");
  });
}
