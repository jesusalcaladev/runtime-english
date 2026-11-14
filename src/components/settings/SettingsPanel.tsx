import { useState } from "preact/hooks";
import type { SyncStatus } from "../../lib/progressSync";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Download,
  Info,
  Languages,
  Loader2,
  LogOut,
  Moon,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Upload,
  User,
  Volume2,
} from "lucide-preact";

function GoogleIcon(props: { class?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class={props.class}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.5 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12S6.7 21.7 12 21.7c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.2H12z" />
    </svg>
  );
}

function GitHubIcon(props: { class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={props.class}>
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

import type { LearningGoal } from "../../lib/goals";
import { getLanguageStatus } from "../../lib/i18n";
import { kokoroIsCached, loadKokoro, stopSpeech } from "../../lib/speech";
import { signInWithProvider, signOut } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { clearSyncError } from "../../lib/progressSync";
import { progressStore, type ProgressSettings } from "../../lib/progress";
import { emitToast } from "../../lib/toast";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useKokoroStatus } from "../../hooks/useKokoroStatus";
import { useProgress } from "../../hooks/useProgress";
import { useSyncStatus } from "../../hooks/useSyncStatus";

const IMMERSION_OPTIONS: {
  value: ProgressSettings["immersion"];
  label: string;
  description: string;
}[] = [
  {
    value: "auto",
    label: "Automático",
    description: "Mixta al 28 de preparación e inglés al 58, con 55% de precisión y de A1-A2.",
  },
  { value: "es", label: "Español", description: "Navegación y botones siempre en español." },
  { value: "mixed", label: "Mixto", description: "Etiquetas bilingües: español · English." },
  { value: "en", label: "English", description: "Interfaz en inglés. El contenido sigue bilingüe." },
];

const STAGE_LABEL = { es: "Español", mixed: "Mixto", en: "English" } as const;

type SectionId = "profile" | "account" | "appearance" | "audio" | "data";

function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  open,
  onToggle,
  badge,
  children,
}: {
  id: SectionId;
  title: string;
  description: string;
  icon: typeof User;
  open: boolean;
  onToggle: () => void;
  badge?: preact.ComponentChildren;
  children: preact.ComponentChildren;
}) {
  return (
    <section id={id} class="rounded-3xl bg-base-200 p-1.5 sm:p-2">
      <button
        type="button"
        onClick={onToggle}
        class="flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-4 text-left transition hover:bg-base-100/40 sm:px-5"
        aria-expanded={open}
      >
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-100/70 text-base-content/55">
            <Icon class="h-4 w-4" />
          </span>
          <div class="min-w-0">
            <h2 class="text-sm font-medium">{title}</h2>
            <p class="mt-0.5 truncate text-[11px] text-base-content/40">{description}</p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          {badge}
          {open ? <ChevronUp class="h-4 w-4 text-base-content/40" /> : <ChevronDown class="h-4 w-4 text-base-content/40" />}
        </div>
      </button>
      {open && <div class="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">{children}</div>}
    </section>
  );
}

function SyncStatusBar({ syncStatus }: { syncStatus: SyncStatus }) {
  if (!isSupabaseConfigured()) return null;
  const phase = syncStatus.phase;
  const tone =
    phase === "error"
      ? "bg-error/10 text-error ring-error/20"
      : phase === "offline" || phase === "pending"
        ? "bg-warning/10 text-warning ring-warning/20"
        : syncStatus.lastSyncedAt
          ? "bg-success/10 text-success ring-success/20"
          : "bg-base-200 text-base-content/60 ring-base-content/10";
  const label =
    phase === "syncing"
      ? "Sincronizando…"
      : phase === "offline"
        ? "Sin conexión"
        : phase === "error"
          ? "Error de sincronización"
          : syncStatus.pending
            ? "Cambios pendientes"
            : syncStatus.lastSyncedAt
              ? "Sincronizado"
              : "Listo para sincronizar";
  return (
    <div class={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-[12px] ring-1 ${tone}`}>
      <div class="flex items-center gap-2">
        <Cloud class="h-4 w-4" />
        <span class="font-medium">{label}</span>
        <span class="text-current/70">· Última sync: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : "nunca"}</span>
      </div>
      {syncStatus.lastError && <span class="max-w-full truncate text-current/80">{syncStatus.lastError}</span>}
    </div>
  );
}

export default function SettingsPanel() {
  const state = useProgress();
  const kokoro = useKokoroStatus();
  const syncStatus = useSyncStatus();
  const authUser = useAuthSession();
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    profile: true,
    account: true,
    appearance: false,
    audio: false,
    data: false,
  });
  const [authBusy, setAuthBusy] = useState<"google" | "github" | "out" | "sync" | null>(null);
  const [showSyncHistory, setShowSyncHistory] = useState(false);
  const language = getLanguageStatus(state);
  const stage = language.stage;
  const completedSessions = Object.keys(state.completedSessions).length;
  const completedExercises = Object.keys(state.completedExercises).length;
  const nextStageLabel =
    language.autoStage === "es" ? "Etiquetas bilingües" : language.autoStage === "mixed" ? "Interfaz en inglés" : "Inglés desbloqueado";

  function toggle(id: SectionId) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  function exportProgress() {
    const envelope = progressStore.exportProgress();
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devlingo-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    emitToast("Progreso exportado (con metadatos y versión de esquema).", "success");
  }

  async function importProgress(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!progressStore.importProgress(raw)) throw new Error("invalid");
      emitToast("Progreso importado y migrado al esquema actual. Recargando…", "success");
      setTimeout(() => window.location.reload(), 700);
    } catch {
      emitToast("El archivo no es un respaldo válido de DevLingo (o está dañado).", "error");
      input.value = "";
    }
  }

  return (
    <div class="space-y-3">
      <SyncStatusBar syncStatus={syncStatus} />

      <SectionCard id="profile" title="Perfil y plan" description="Nombre, objetivo y metas de estudio." icon={User} open={open.profile} onToggle={() => toggle("profile")}>
        <div class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div class="space-y-4">
              <label class="flex flex-col gap-1.5">
                <span class="text-[11px] font-medium text-base-content/45">Tu nombre</span>
                <input
                  type="text"
                  value={state.settings.name}
                  onInput={(event) => progressStore.setSettings({ name: (event.target as HTMLInputElement).value.slice(0, 40) })}
                  placeholder="Developer"
                  class="h-10 w-full rounded-xl bg-base-100 px-3.5 text-sm text-base-content placeholder:text-base-content/25"
                />
              </label>
              <div>
                <span class="text-[11px] font-medium text-base-content/45">Objetivo principal</span>
                <p class="mt-0.5 text-[10px] text-base-content/35">Personaliza recomendaciones (no bloquea la ruta).</p>
                <div class="mt-2 grid gap-2 sm:grid-cols-2">
                  {([
                    { id: "daily" as LearningGoal, label: "Trabajo diario", desc: "Slack, PRs y reuniones" },
                    { id: "interviews" as LearningGoal, label: "Entrevistas", desc: "Explicar experiencia y diseño" },
                    { id: "work" as LearningGoal, label: "Inglés técnico", desc: "Docs, bugs e incidentes" },
                    { id: "all" as LearningGoal, label: "Ruta completa", desc: "Recomendaciones equilibradas" },
                  ]).map((g) => {
                    const active = state.settings.goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => progressStore.setSettings({ goal: g.id })}
                        class={`rounded-xl px-3.5 py-3 text-left transition ${active ? "bg-base-content text-base-100" : "bg-base-100/50 text-base-content/70 hover:bg-base-100"}`}
                      >
                        <div class="flex items-center justify-between gap-2">
                          <p class="text-[12px] font-medium">{g.label}</p>
                          {active && <Check class="h-3.5 w-3.5 shrink-0" />}
                        </div>
                        <p class={`mt-0.5 text-[10px] ${active ? "text-base-100/70" : "text-base-content/40"}`}>{g.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1.5 sm:min-w-[220px]">
              {[
                { label: "Sesiones", value: completedSessions },
                { label: "Ejercicios", value: completedExercises },
                { label: "XP", value: state.xp },
              ].map((stat) => (
                <div key={stat.label} class="rounded-xl bg-base-100/60 px-3 py-2 text-center">
                  <p class="font-mono text-sm font-medium">{stat.value}</p>
                  <p class="mt-0.5 text-[8px] tracking-wide text-base-content/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div class="rounded-2xl bg-base-100/40 p-4">
            <div class="flex items-center gap-2">
              <Target class="h-4 w-4 text-accent" />
              <h3 class="text-sm font-medium">Plan de estudio y metas</h3>
            </div>
            <div class="mt-3 space-y-3">
              {state.settings.diagnostic && (
                <div class="rounded-xl bg-base-100/60 p-3 text-[12px] text-base-content/65">
                  Diagnóstico: nivel <span class="font-mono font-semibold text-accent">{state.settings.diagnostic.level}</span> ({state.settings.diagnostic.score}%).
                  {state.settings.plan?.level ? ` Plan enfocado en ${state.settings.plan.level}.` : ""}
                </div>
              )}
              {(() => {
                const plan = state.settings.plan || {
                  dailyMinutes: 10, dailyExercises: 6, weeklySessions: 4, weeklyExercises: 24, monthlySessions: 14, monthlyExercises: 90, focus: state.settings.goal, level: state.settings.diagnostic?.level || "A1",
                };
                const setPlan = (patch: any) => progressStore.setSettings({ plan: { ...plan, ...patch, focus: state.settings.goal } as any } as any);
                const num = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Number(v) || min));
                return (
                  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Minutos por día</span><input type="number" min="5" max="120" value={plan.dailyMinutes} onInput={(e:any)=>setPlan({dailyMinutes:num(e.target.value,5,120)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Ejercicios por día</span><input type="number" min="1" max="100" value={plan.dailyExercises} onInput={(e:any)=>setPlan({dailyExercises:num(e.target.value,1,100)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Sesiones por semana</span><input type="number" min="1" max="30" value={plan.weeklySessions} onInput={(e:any)=>setPlan({weeklySessions:num(e.target.value,1,30)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Ejercicios por semana</span><input type="number" min="1" max="300" value={plan.weeklyExercises} onInput={(e:any)=>setPlan({weeklyExercises:num(e.target.value,1,300)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Sesiones por mes</span><input type="number" min="1" max="120" value={plan.monthlySessions} onInput={(e:any)=>setPlan({monthlySessions:num(e.target.value,1,120)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                    <label class="space-y-1 rounded-xl bg-base-100/50 p-3"><span class="text-[11px] font-medium text-base-content/55">Ejercicios por mes</span><input type="number" min="1" max="1200" value={plan.monthlyExercises} onInput={(e:any)=>setPlan({monthlyExercises:num(e.target.value,1,1200)})} class="h-9 w-full rounded-lg bg-base-100 px-3 text-sm" /></label>
                  </div>
                );
              })()}
              <p class="text-[11px] leading-relaxed text-base-content/45">Estas metas alimentan tu feedback de constancia en el dashboard (diario, semanal y mensual).</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="account"
        title="Cuenta y sincronización"
        description="Progreso, diccionario y certificado en la nube."
        icon={Cloud}
        open={open.account}
        onToggle={() => toggle("account")}
        badge={
          isSupabaseConfigured() ? (
            <span class={`rounded-full px-2 py-1 text-[10px] font-medium ${syncStatus.phase === "error" ? "bg-error/10 text-error" : syncStatus.phase === "offline" || syncStatus.pending ? "bg-warning/10 text-warning" : syncStatus.lastSyncedAt ? "bg-success/10 text-success" : "bg-base-100 text-base-content/50"}`}>
              {syncStatus.phase === "error" ? "Error" : syncStatus.phase === "offline" ? "Offline" : syncStatus.pending ? "Pendiente" : syncStatus.lastSyncedAt ? "Sync" : "Sin sync"}
            </span>
          ) : null
        }
      >
        {!isSupabaseConfigured() ? (
          <p class="rounded-2xl bg-base-100/45 p-4 text-[11px] leading-relaxed text-base-content/55">
            {import.meta.env.DEV ? (
              <>Sincronización no configurada. Añade <code class="font-mono">PUBLIC_SUPABASE_URL</code> y <code class="font-mono">PUBLIC_SUPABASE_ANON_KEY</code> en <code class="font-mono">.env</code> y ejecuta <code class="font-mono">supabase/setup.sql</code>.</>
            ) : (
              "La sincronización en la nube no está disponible en esta versión."
            )}
          </p>
        ) : authUser ? (
          <div class="space-y-3">
            <div class="rounded-2xl bg-base-100/45 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-medium">{authUser.name || "Cuenta conectada"}</p>
                  <p class="mt-0.5 text-[11px] text-base-content/55">{authUser.email || "Sesión activa"}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <span class={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium ${syncStatus.phase === "error" ? "bg-error/10 text-error" : syncStatus.phase === "offline" || syncStatus.pending ? "bg-warning/10 text-warning" : syncStatus.lastSyncedAt ? "bg-success/10 text-success" : "bg-base-200 text-base-content/60"}`}>
                      <span class={`h-1.5 w-1.5 rounded-full ${syncStatus.phase === "error" ? "bg-error" : syncStatus.phase === "offline" || syncStatus.pending ? "bg-warning" : syncStatus.lastSyncedAt ? "bg-success" : "bg-base-content/30"}`}></span>
                      {syncStatus.phase === "syncing" ? "Sincronizando…" : syncStatus.phase === "offline" ? "Sin conexión" : syncStatus.phase === "error" ? "Error de sincronización" : syncStatus.pending ? "Cambios pendientes" : syncStatus.lastSyncedAt ? "Sincronizado" : "Listo para sincronizar"}
                    </span>
                    <span class="text-base-content/45">Última sync: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : "nunca"}</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" disabled={authBusy !== null} onClick={async () => { setAuthBusy("sync"); clearSyncError(); await progressStore.syncWithCloud(true); setAuthBusy(null); }} class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium text-base-content/70 hover:text-base-content disabled:opacity-50">
                    <RefreshCw class={`h-3.5 w-3.5 ${authBusy === "sync" ? "animate-spin" : ""}`} /> {syncStatus.phase === "error" || syncStatus.pending ? "Reintentar" : "Sincronizar"}
                  </button>
                  <button type="button" disabled={authBusy !== null} onClick={async () => { setAuthBusy("out"); const { error } = await signOut(); setAuthBusy(null); if (error) emitToast(error, "error"); else emitToast("Sesión cerrada. Tu progreso sigue en este dispositivo.", "info"); }} class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium text-base-content/70 hover:text-base-content disabled:opacity-50">
                    <LogOut class="h-3.5 w-3.5" /> Cerrar sesión
                  </button>
                </div>
              </div>
              {syncStatus.lastError && (
                <div class="mt-3 rounded-xl bg-error/10 px-3 py-2.5 text-[11px] text-error">
                  <p class="font-medium">No se pudo completar la última sincronización.</p>
                  <p class="mt-0.5 break-words text-error/80">{syncStatus.lastError}</p>
                  {syncStatus.nextRetryAt && <p class="mt-1 text-[10px] text-error/70">Próximo reintento automático: {new Date(syncStatus.nextRetryAt).toLocaleTimeString()}</p>}
                </div>
              )}
              <button type="button" onClick={() => setShowSyncHistory((v) => !v)} class="mt-3 text-[10px] font-medium text-base-content/45 hover:text-base-content/70">
                {showSyncHistory ? "Ocultar historial de sincronización" : "Ver historial de sincronización y conflictos"}
              </button>
              {showSyncHistory && (
                <div class="mt-2 max-h-48 space-y-1.5 overflow-auto rounded-xl bg-base-100/60 p-2.5">
                  {(syncStatus.history || []).length === 0 ? (
                    <p class="text-[10px] text-base-content/40">Aún no hay eventos de sincronización.</p>
                  ) : (
                    (syncStatus.history || []).slice(0, 12).map((h, idx) => (
                      <div key={idx} class="rounded-lg bg-base-100 px-2.5 py-2 text-[10px]">
                        <div class="flex items-center justify-between gap-2">
                          <span class={h.ok ? "font-medium text-base-content/70" : "font-medium text-error"}>{h.message}</span>
                          <span class="shrink-0 text-base-content/35">{new Date(h.at).toLocaleString()}</span>
                        </div>
                        {h.details && <p class="mt-0.5 break-words text-base-content/40">{h.details}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <p class="flex items-start gap-1.5 text-[10px] leading-relaxed text-base-content/35"><Info class="mt-0.5 h-3 w-3 shrink-0" /> Fusión automática sin pérdida. Offline: cambios pendientes y reintentos automáticos al reconectar.</p>
          </div>
        ) : (
          <div class="space-y-3">
            <p class="text-[11px] leading-relaxed text-base-content/55">Inicia sesión para respaldar tu progreso y sincronizarlo entre dispositivos (web y móvil).</p>
            <div class="grid gap-2 sm:grid-cols-2">
              <button type="button" disabled={authBusy !== null} onClick={async () => { setAuthBusy("google"); const { error } = await signInWithProvider("google"); if (error) { emitToast(error, "error"); setAuthBusy(null); } }} class="flex h-11 items-center justify-center gap-2 rounded-xl bg-base-100 text-sm font-medium text-base-content hover:bg-base-100/80 disabled:opacity-50">
                {authBusy === "google" ? <Loader2 class="h-4 w-4 animate-spin" /> : <GoogleIcon class="h-4 w-4" />} Continuar con Google
              </button>
              <button type="button" disabled={authBusy !== null} onClick={async () => { setAuthBusy("github"); const { error } = await signInWithProvider("github"); if (error) { emitToast(error, "error"); setAuthBusy(null); } }} class="flex h-11 items-center justify-center gap-2 rounded-xl bg-base-content text-sm font-medium text-base-100 hover:opacity-90 disabled:opacity-50">
                {authBusy === "github" ? <Loader2 class="h-4 w-4 animate-spin" /> : <GitHubIcon class="h-4 w-4" />} Continuar con GitHub
              </button>
            </div>
            <p class="flex items-start gap-1.5 text-[10px] leading-relaxed text-base-content/35"><Info class="mt-0.5 h-3 w-3 shrink-0" /> Tu progreso actual se mantiene en este dispositivo y se fusionará con tu cuenta al iniciar sesión.</p>
          </div>
        )}
      </SectionCard>

      <SectionCard id="appearance" title="Apariencia e idioma" description="Tema, inmersión y estado de idioma." icon={Languages} open={open.appearance} onToggle={() => toggle("appearance")} badge={<span class="rounded-full bg-base-100/70 px-2.5 py-1 font-mono text-[9px] text-base-content/45">{STAGE_LABEL[stage]}</span>}>
        <div class="space-y-5">
          <div>
            <div class="flex items-center gap-2"><Sun class="h-4 w-4 text-base-content/50" /><h3 class="text-sm font-medium">Tema</h3></div>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
              {[
                { value: "light" as const, label: "Claro", icon: Sun, preview: "bg-[#ffffff]" },
                { value: "dark" as const, label: "Oscuro", icon: Moon, preview: "bg-[#101010]" },
              ].map((option) => {
                const active = state.settings.theme === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => progressStore.setTheme(option.value)} class={`rounded-2xl p-2 text-left transition ${active ? "bg-base-100" : "bg-base-100/40 hover:bg-base-100/70"}`}>
                    <span class={`flex h-14 items-end overflow-hidden rounded-xl ${option.preview} p-2`}><span class={`h-1.5 w-2/3 rounded-full ${option.value === "dark" ? "bg-white/20" : "bg-black/10"}`} /></span>
                    <span class="mt-2 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-medium"><option.icon class="h-3.5 w-3.5 text-base-content/40" />{option.label}{active && <Check class="ml-auto h-3.5 w-3.5 text-accent" />}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div class="rounded-2xl bg-base-100/40 p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div><p class="text-[10px] text-base-content/35">Preparación para inglés</p><p class="mt-1 font-mono text-[1.6rem] font-medium leading-none tracking-tight">{language.score}<span class="text-sm font-normal text-base-content/30"> / 100</span></p></div>
              <span class="rounded-full bg-base-100/70 px-2.5 py-1 font-mono text-[9px] text-base-content/40">{language.nextTarget === null ? "Inglés desbloqueado" : `${nextStageLabel} · ${language.nextTarget}`}</span>
            </div>
            <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]"><div class="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(100, language.score)}%` }} /></div>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[{ label: "A1–A2", value: `${language.a1Pct}%` }, { label: "Precisión", value: `${language.accuracyPct}%` }, { label: "Ejercicios", value: `${language.exercisePct}%` }, { label: "B1–B2", value: `${language.b1Pct}%` }].map((metric) => (
                <div key={metric.label} class="rounded-xl bg-base-100/55 px-2.5 py-2"><p class="font-mono text-[11px] font-medium">{metric.value}</p><p class="mt-0.5 text-[8px] text-base-content/30">{metric.label}</p></div>
              ))}
            </div>
            <p class="mt-3 text-[10px] leading-relaxed text-base-content/40">{language.reason}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium">Inmersión progresiva</h3>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              {IMMERSION_OPTIONS.map((option) => {
                const active = state.settings.immersion === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => progressStore.setSettings({ immersion: option.value })} class={`rounded-2xl p-3.5 text-left transition ${active ? "bg-base-100" : "bg-base-100/40 hover:bg-base-100/70"}`}>
                    <div class="flex items-center justify-between gap-2"><span class={`text-xs font-medium ${active ? "text-base-content" : "text-base-content/60"}`}>{option.label}</span><span class={`flex h-4 w-4 items-center justify-center rounded-full ${active ? "bg-accent text-accent-content" : "bg-base-300"}`}>{active && <Check class="h-2.5 w-2.5" />}</span></div>
                    <p class="mt-1.5 text-[10px] leading-relaxed text-base-content/35">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="audio" title="Audio y recordatorios" description="Pronunciación, voz HQ y avisos de racha." icon={Volume2} open={open.audio} onToggle={() => toggle("audio")}>
        <div class="space-y-5">
          <div class="rounded-2xl bg-base-100/45 p-4">
            <div class="flex items-center gap-2"><Volume2 class="h-4 w-4 text-base-content/50" /><h3 class="text-sm font-medium">Pronunciación (TTS)</h3></div>
            <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-base-100/50 p-3.5">
              <div><p class="text-xs font-medium">Voz en toda la app</p><p class="mt-1 text-[11px] leading-relaxed text-base-content/60">Activa o desactiva los botones de pronunciación.</p></div>
              <button type="button" role="switch" aria-checked={state.settings.ttsEnabled} aria-label="Activar o desactivar la voz" onClick={() => { const enabled = !state.settings.ttsEnabled; if (!enabled) stopSpeech(); progressStore.setSettings({ ttsEnabled: enabled }); }} class={`relative h-6 w-11 shrink-0 rounded-full transition ${state.settings.ttsEnabled ? "bg-accent" : "bg-base-300"}`}>
                <span class={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${state.settings.ttsEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              {[0.75, 1, 1.25].map((rate) => {
                const active = state.settings.ttsRate === rate;
                return <button key={rate} type="button" onClick={() => progressStore.setSettings({ ttsRate: rate })} class={`rounded-full px-3.5 py-2 font-mono text-xs font-medium transition ${active ? "bg-base-content text-base-100" : "bg-base-100/50 text-base-content/45 hover:bg-base-100 hover:text-base-content/70"}`}>{rate}x</button>;
              })}
              {state.settings.ttsEnabled ? (
                <button type="button" data-speak="The server is running. Pull the latest changes before you push." class="speak-btn ml-auto flex items-center gap-1.5 rounded-full bg-base-100/60 px-3.5 py-2 text-xs font-medium text-base-content/50 transition hover:bg-base-100 hover:text-base-content/75"><Volume2 class="h-3.5 w-3.5" />Probar voz</button>
              ) : (
                <span class="ml-auto flex items-center gap-1.5 rounded-full bg-base-100/40 px-3.5 py-2 text-xs text-base-content/55"><Volume2 class="h-3.5 w-3.5" />Voz desactivada</span>
              )}
            </div>

            <div class="mt-4 rounded-xl bg-base-100/50 p-3.5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="flex min-w-0 items-start gap-3">
                  <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent"><Sparkles class="h-4 w-4" /></span>
                  <div class="min-w-0">
                    <p class="text-xs font-medium">Voz HQ (Kokoro)</p>
                    <p class="mt-1 text-[11px] leading-relaxed text-base-content/55">Modelo neural local. Descarga única (~90 MB), funciona offline tras caché.</p>
                  </div>
                </div>
                <span class={`rounded-full px-2.5 py-1 font-mono text-[9px] ${kokoro.state === "ready" ? "bg-success/15 text-success" : kokoro.state === "loading" ? "bg-accent/15 text-accent" : kokoro.state === "error" ? "bg-error/15 text-error" : kokoroIsCached() ? "bg-accent/10 text-accent" : "bg-base-100/70 text-base-content/45"}`}>
                  {kokoro.state === "ready" ? "Lista" : kokoro.state === "loading" ? (kokoroIsCached() ? "Cargando caché" : "Descargando") : kokoro.state === "error" ? "Error" : kokoroIsCached() ? "En caché" : "No descargada"}
                </span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                {([{ value: "system" as const, label: "Sistema", desc: "Voz del navegador/dispositivo" }, { value: "kokoro" as const, label: "HQ Kokoro", desc: "Más natural para aprender" }]).map((opt) => {
                  const active = (state.settings.ttsEngine ?? "system") === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => { progressStore.setSettings({ ttsEngine: opt.value }); if (opt.value === "kokoro" && kokoro.state === "idle") void loadKokoro(); }} class={`rounded-xl p-3 text-left transition ${active ? "bg-base-100" : "bg-base-100/40 hover:bg-base-100/70"}`}>
                      <div class="flex items-center justify-between gap-2"><span class="text-[11px] font-medium">{opt.label}</span><span class={`flex h-4 w-4 items-center justify-center rounded-full ${active ? "bg-accent text-accent-content" : "bg-base-300"}`}>{active && <Check class="h-2.5 w-2.5" />}</span></div>
                      <p class="mt-1 text-[10px] leading-relaxed text-base-content/40">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {(state.settings.ttsEngine === "kokoro" || kokoro.state !== "idle") && (
                <div class="mt-3 rounded-xl bg-base-100/60 p-3">
                  <div class="flex flex-wrap items-center justify-between gap-2"><p class="text-[11px] text-base-content/60">{kokoro.message}</p>{kokoro.state === "loading" && <span class="flex items-center gap-1.5 font-mono text-[10px] text-accent"><Loader2 class="h-3 w-3 animate-spin" /> {kokoro.progress}%</span>}</div>
                  {kokoro.state === "loading" && <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-base-content/[0.08]"><div class="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${Math.max(2, kokoro.progress)}%` }} /></div>}
                  {kokoro.state === "error" && kokoro.error && <p class="mt-1.5 text-[10px] leading-relaxed text-error/80">{kokoro.error}</p>}
                  <div class="mt-2 flex flex-wrap gap-2">
                    {(kokoro.state === "idle" || kokoro.state === "error") && <button type="button" onClick={() => void loadKokoro()} class="flex items-center gap-1.5 rounded-full bg-base-content px-3 py-1.5 text-[10px] font-medium text-base-100"><Download class="h-3 w-3" />{kokoro.state === "error" ? "Reintentar" : kokoroIsCached() ? "Cargar voz HQ (caché)" : "Descargar voz HQ"}</button>}
                    {kokoro.state === "ready" && state.settings.ttsEngine !== "kokoro" && <button type="button" onClick={() => progressStore.setSettings({ ttsEngine: "kokoro" })} class="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-[10px] font-medium text-accent"><Check class="h-3 w-3" /> Usar voz HQ</button>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div class="rounded-2xl bg-base-100/45 p-4">
            <div class="flex items-center gap-2"><Bell class="h-4 w-4 text-base-content/50" /><h3 class="text-sm font-medium">Recordatorios de racha</h3></div>
            <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-base-100/50 p-3.5">
              <div><p class="text-xs font-medium">Recordatorio diario</p><p class="mt-1 text-[11px] leading-relaxed text-base-content/60">Aviso a la hora que elijas para no perder tu racha.</p></div>
              <button type="button" role="switch" aria-checked={state.settings.reminders.enabled} aria-label="Activar o desactivar recordatorios" onClick={() => progressStore.setSettings({ reminders: { ...state.settings.reminders, enabled: !state.settings.reminders.enabled } })} class={`relative h-6 w-11 shrink-0 rounded-full transition ${state.settings.reminders.enabled ? "bg-accent" : "bg-base-300"}`}>
                <span class={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${state.settings.reminders.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-base-100/50 p-3.5">
              <label class="space-y-1.5"><span class="text-[11px] font-medium text-base-content/45">Hora del aviso</span><input type="time" value={state.settings.reminders.time} disabled={!state.settings.reminders.enabled} onInput={(event) => progressStore.setSettings({ reminders: { ...state.settings.reminders, time: (event.target as HTMLInputElement).value || "20:00" } })} class="h-10 w-36 rounded-xl bg-base-100 px-3 text-sm text-base-content disabled:opacity-50" /></label>
              <p class="flex-1 text-[11px] leading-relaxed text-base-content/45">{state.settings.reminders.enabled ? "En Android/app se programa notificación local diaria. En web verás un recordatorio dentro de la app." : "Actívalo para mantener el hábito."}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="data" title="Datos" description="Exportar/importar progreso y zona de riesgo." icon={Download} open={open.data} onToggle={() => toggle("data")}>
        <div class="space-y-4">
          <div class="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={exportProgress} class="flex items-center gap-3 rounded-2xl bg-base-100/50 p-3.5 text-left transition hover:bg-base-100">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-base-100/70 text-base-content/50"><Download class="h-4 w-4" /></span>
              <span><span class="block text-xs font-medium">Exportar progreso</span><span class="mt-0.5 block text-[10px] text-base-content/35">Descarga un JSON de respaldo</span></span>
            </button>
            <label class="flex cursor-pointer items-center gap-3 rounded-2xl bg-base-100/50 p-3.5 text-left transition hover:bg-base-100">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-base-100/70 text-base-content/50"><Upload class="h-4 w-4" /></span>
              <span><span class="block text-xs font-medium">Importar progreso</span><span class="mt-0.5 block text-[10px] text-base-content/35">Restaura un respaldo exportado</span></span>
              <input type="file" accept="application/json" class="sr-only" onChange={importProgress} />
            </label>
          </div>

          <div class="rounded-2xl bg-error/[0.055] p-4 sm:p-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="text-sm font-medium text-error/90">Zona de riesgo</h3>
                <p class="mt-1 text-[11px] leading-relaxed text-base-content/35">Borra progreso, logros, racha y slang guardado de este navegador.</p>
              </div>
              {confirmReset ? (
                <div class="flex items-center gap-1.5">
                  <button type="button" onClick={() => setConfirmReset(false)} class="btn btn-ghost btn-sm h-9 rounded-xl px-3 text-base-content/50">Cancelar</button>
                  <button type="button" onClick={() => { progressStore.reset(); setConfirmReset(false); }} class="btn btn-error btn-sm h-9 gap-1.5 rounded-xl px-3"><Trash2 class="h-3.5 w-3.5" />Sí, borrar todo</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl bg-error/10 px-3 text-error hover:bg-error/15"><RotateCcw class="h-3.5 w-3.5" />Reiniciar progreso</button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
