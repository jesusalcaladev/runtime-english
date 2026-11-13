import { useState } from "preact/hooks";
import {
  Check,
  Download,
  Info,
  Languages,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
  User,
  Volume2,
} from "lucide-preact";
import { getLanguageStatus } from "../lib/i18n";
import { progressStore, type ProgressSettings } from "../lib/progress";
import { emitToast } from "../lib/toast";
import { useProgress } from "../lib/useProgress";

const IMMERSION_OPTIONS: {
  value: ProgressSettings["immersion"];
  label: string;
  description: string;
}[] = [
  {
    value: "auto",
    label: "Automático",
    description:
      "Mixta al 28 de preparación e inglés al 58, con 55% de precisión y de A1-A2.",
  },
  {
    value: "es",
    label: "Español",
    description: "Navegación y botones siempre en español.",
  },
  {
    value: "mixed",
    label: "Mixto",
    description: "Etiquetas bilingües: español · English.",
  },
  {
    value: "en",
    label: "English",
    description: "Interfaz en inglés. El contenido sigue bilingüe.",
  },
];

const STAGE_LABEL = {
  es: "Español",
  mixed: "Mixto",
  en: "English",
};

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <div class="flex items-center gap-2.5">
      <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-base-100/70 text-base-content/50">
        <Icon class="h-4 w-4" />
      </span>
      <div>
        <h2 class="text-sm font-medium">{title}</h2>
        <p class="mt-0.5 text-[11px] text-base-content/35">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const state = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const language = getLanguageStatus(state);
  const stage = language.stage;
  const completedSessions = Object.keys(state.completedSessions).length;
  const completedExercises = Object.keys(state.completedExercises).length;
  const nextStageLabel =
    language.autoStage === "es"
      ? "Etiquetas bilingües"
      : language.autoStage === "mixed"
        ? "Interfaz en inglés"
        : "Inglés desbloqueado";

  function exportProgress() {
    const blob = new Blob([JSON.stringify(progressStore.getState(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deveng-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    emitToast("Progreso exportado como JSON.", "success");
  }

  async function importProgress(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!progressStore.importProgress(raw)) throw new Error("invalid");
      emitToast("Progreso importado. Recargando…", "success");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      emitToast("El archivo no es un progreso válido de DevEng.", "error");
      input.value = "";
    }
  }

  return (
    <div class="space-y-3">
      <section class="rounded-3xl bg-base-200 p-5 sm:p-6">
        <SectionTitle
          icon={User}
          title="Perfil"
          description="Solo se guarda en este navegador."
        />
        <div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label class="space-y-1.5">
            <span class="text-[11px] font-medium text-base-content/45">Tu nombre</span>
            <input
              type="text"
              value={state.settings.name}
              onInput={(event) =>
                progressStore.setSettings({
                  name: (event.target as HTMLInputElement).value.slice(0, 40),
                })
              }
              placeholder="Developer"
              class="h-10 w-full rounded-xl bg-base-100 px-3.5 text-sm text-base-content placeholder:text-base-content/25"
            />
          </label>
          <div class="grid grid-cols-3 gap-1.5">
            {[
              { label: "Sesiones", value: completedSessions },
              { label: "Ejercicios", value: completedExercises },
              { label: "XP", value: state.xp },
            ].map((stat) => (
              <div key={stat.label} class="rounded-xl bg-base-100/60 px-3 py-2 text-center">
                <p class="font-mono text-sm font-medium">{stat.value}</p>
                <p class="mt-0.5 text-[8px] tracking-wide text-base-content/30">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section class="rounded-3xl bg-base-200 p-5 sm:p-6">
        <SectionTitle icon={Sun} title="Apariencia" description="Tema claro u oscuro." />
        <div class="mt-5 grid grid-cols-2 gap-2 sm:max-w-md">
          {[
            { value: "light" as const, label: "Claro", icon: Sun, preview: "bg-[#ffffff]" },
            { value: "dark" as const, label: "Oscuro", icon: Moon, preview: "bg-[#101010]" },
          ].map((option) => {
            const active = state.settings.theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => progressStore.setTheme(option.value)}
                class={`rounded-2xl p-2 text-left transition ${
                  active ? "bg-base-100" : "bg-base-100/40 hover:bg-base-100/70"
                }`}
              >
                <span
                  class={`flex h-14 items-end overflow-hidden rounded-xl ${option.preview} p-2`}
                >
                  <span
                    class={`h-1.5 w-2/3 rounded-full ${
                      option.value === "dark" ? "bg-white/20" : "bg-black/10"
                    }`}
                  />
                </span>
                <span class="mt-2 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-medium">
                  <option.icon class="h-3.5 w-3.5 text-base-content/40" />
                  {option.label}
                  {active && <Check class="ml-auto h-3.5 w-3.5 text-accent" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section class="rounded-3xl bg-base-200 p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <SectionTitle
            icon={Languages}
            title="Inmersión progresiva"
            description="Cambia según tu progreso."
          />
          <span class="rounded-full bg-base-100/60 px-2.5 py-1 font-mono text-[9px] text-base-content/35">
            Ahora · {STAGE_LABEL[stage]}
          </span>
        </div>

        <div class="mt-5 rounded-2xl bg-base-100/40 p-4">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p class="text-[10px] text-base-content/35">Preparación para inglés</p>
              <p class="mt-1 font-mono text-[1.6rem] font-medium leading-none tracking-tight">
                {language.score}
                <span class="text-sm font-normal text-base-content/30"> / 100</span>
              </p>
            </div>
            <span class="rounded-full bg-base-100/70 px-2.5 py-1 font-mono text-[9px] text-base-content/40">
              {language.nextTarget === null
                ? "Inglés desbloqueado"
                : `${nextStageLabel} · ${language.nextTarget}`}
            </span>
          </div>

          <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-content/[0.07]">
            <div
              class="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(100, language.score)}%` }}
            />
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "A1–A2", value: `${language.a1Pct}%` },
              { label: "Precisión", value: `${language.accuracyPct}%` },
              { label: "Ejercicios", value: `${language.exercisePct}%` },
              { label: "B1–B2", value: `${language.b1Pct}%` },
            ].map((metric) => (
              <div key={metric.label} class="rounded-xl bg-base-100/55 px-2.5 py-2">
                <p class="font-mono text-[11px] font-medium">{metric.value}</p>
                <p class="mt-0.5 text-[8px] text-base-content/30">{metric.label}</p>
              </div>
            ))}
          </div>

          <p class="mt-3 text-[10px] leading-relaxed text-base-content/40">{language.reason}</p>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          {IMMERSION_OPTIONS.map((option) => {
            const active = state.settings.immersion === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => progressStore.setSettings({ immersion: option.value })}
                class={`rounded-2xl p-3.5 text-left transition ${
                  active ? "bg-base-100" : "bg-base-100/40 hover:bg-base-100/70"
                }`}
              >
                <div class="flex items-center justify-between gap-2">
                  <span
                    class={`text-xs font-medium ${
                      active ? "text-base-content" : "text-base-content/60"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span
                    class={`flex h-4 w-4 items-center justify-center rounded-full ${
                      active ? "bg-accent text-accent-content" : "bg-base-300"
                    }`}
                  >
                    {active && <Check class="h-2.5 w-2.5" />}
                  </span>
                </div>
                <p class="mt-1.5 text-[10px] leading-relaxed text-base-content/35">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <p class="mt-3 flex items-start gap-1.5 rounded-xl bg-base-100/45 px-3 py-2.5 text-[10px] leading-relaxed text-base-content/35">
          <Info class="mt-0.5 h-3 w-3 shrink-0" />
          El contenido técnico no se traduce: las explicaciones de A1-A2 están en español y las de
          B1-B2 en inglés, para que la dificultad suba contigo.
        </p>
      </section>

      <section class="rounded-3xl bg-base-200 p-5 sm:p-6">
        <SectionTitle
          icon={Volume2}
          title="Pronunciación"
          description="Velocidad de la voz en inglés."
        />
        <div class="mt-5 flex flex-wrap gap-1.5">
          {[0.75, 1, 1.25].map((rate) => {
            const active = state.settings.ttsRate === rate;
            return (
              <button
                key={rate}
                type="button"
                onClick={() => progressStore.setSettings({ ttsRate: rate })}
                class={`rounded-full px-3.5 py-2 font-mono text-xs font-medium transition ${
                  active
                    ? "bg-base-content text-base-100"
                    : "bg-base-100/50 text-base-content/45 hover:bg-base-100 hover:text-base-content/70"
                }`}
              >
                {rate}x
              </button>
            );
          })}
          <button
            type="button"
            data-speak="The server is running. Pull the latest changes before you push."
            class="speak-btn ml-auto flex items-center gap-1.5 rounded-full bg-base-100/60 px-3.5 py-2 text-xs font-medium text-base-content/50 transition hover:bg-base-100 hover:text-base-content/75"
          >
            <Volume2 class="h-3.5 w-3.5" />
            Probar voz
          </button>
        </div>
      </section>

      <section class="rounded-3xl bg-base-200 p-5 sm:p-6">
        <SectionTitle
          icon={Download}
          title="Datos y progreso"
          description="Tu progreso vive en este navegador."
        />
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={exportProgress}
            class="flex items-center gap-3 rounded-2xl bg-base-100/50 p-3.5 text-left transition hover:bg-base-100"
          >
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-base-100/70 text-base-content/50">
              <Download class="h-4 w-4" />
            </span>
            <span>
              <span class="block text-xs font-medium">Exportar progreso</span>
              <span class="mt-0.5 block text-[10px] text-base-content/35">
                Descarga un JSON de respaldo
              </span>
            </span>
          </button>

          <label class="flex cursor-pointer items-center gap-3 rounded-2xl bg-base-100/50 p-3.5 text-left transition hover:bg-base-100">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-base-100/70 text-base-content/50">
              <Upload class="h-4 w-4" />
            </span>
            <span>
              <span class="block text-xs font-medium">Importar progreso</span>
              <span class="mt-0.5 block text-[10px] text-base-content/35">
                Restaura un respaldo exportado
              </span>
            </span>
            <input type="file" accept="application/json" class="sr-only" onChange={importProgress} />
          </label>
        </div>
      </section>

      <section class="rounded-3xl bg-error/[0.055] p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-medium text-error/90">Zona de riesgo</h2>
            <p class="mt-1 text-[11px] leading-relaxed text-base-content/35">
              Borra progreso, logros, racha y slang guardado de este navegador.
            </p>
          </div>
          {confirmReset ? (
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                class="btn btn-ghost btn-sm h-9 rounded-xl px-3 text-base-content/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  progressStore.reset();
                  setConfirmReset(false);
                }}
                class="btn btn-error btn-sm h-9 gap-1.5 rounded-xl px-3"
              >
                <Trash2 class="h-3.5 w-3.5" />
                Sí, borrar todo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl bg-error/10 px-3 text-error hover:bg-error/15"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              Reiniciar progreso
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
