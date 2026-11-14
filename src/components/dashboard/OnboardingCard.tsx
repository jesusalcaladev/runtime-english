import { useMemo, useState } from "preact/hooks";
import { ArrowRight, Check, ClipboardCheck, Sparkles, Target } from "lucide-preact";
import type { LearningGoal } from "../../lib/goals";
import { progressStore, type DiagnosticResult } from "../../lib/progress";
import { recommendPlan, toStudyPlan } from "../../lib/studyPlan";

type Step = 1 | 2 | 3 | 4;

const DIAG_QUESTIONS: { q: string; options: string[]; points: number[] }[] = [
  {
    q: "Cuando lees un mensaje técnico en inglés (issue, PR o error), ¿cuánto entiendes?",
    options: [
      "Muy poco, necesito traducir casi todo",
      "Lo básico (palabras clave y la idea general)",
      "La mayor parte, aunque me faltan detalles",
      "Casi todo con fluidez, incluso matices",
    ],
    points: [0, 1, 2, 3],
  },
  {
    q: "¿Puedes escribir un mensaje claro en inglés (status, comentario en PR o pedir ayuda)?",
    options: [
      "Me cuesta formar frases simples",
      "Puedo escribir frases básicas con ayuda",
      "Sí, mensajes claros aunque con algunos errores",
      "Sí, con buen detalle y tono adecuado",
    ],
    points: [0, 1, 2, 3],
  },
  {
    q: "En una reunión o daily en inglés, ¿cómo te sientes?",
    options: [
      "No podría participar",
      "Entiendo/ digo cosas muy simples",
      "Puedo seguir y participar con algo de esfuerzo",
      "Participo con soltura y explico temas técnicos",
    ],
    points: [0, 1, 2, 3],
  },
  {
    q: "¿Qué tan cómodo estás con vocabulario técnico (deploy, rollback, trade-off, outage)?",
    options: [
      "Casi no lo conozco",
      "Conozco términos básicos",
      "Uso varios términos en contexto",
      "Lo uso con precisión en discusiones técnicas",
    ],
    points: [0, 1, 2, 3],
  },
];

function levelFromScore(score: number): "A1" | "A2" | "B1" | "B2" {
  if (score <= 25) return "A1";
  if (score <= 50) return "A2";
  if (score <= 75) return "B1";
  return "B2";
}

const GOALS: { id: LearningGoal; label: string; desc: string }[] = [
  { id: "daily", label: "Trabajo diario", desc: "Slack, PRs y reuniones" },
  { id: "interviews", label: "Entrevistas", desc: "Explicar experiencia y diseño" },
  { id: "work", label: "Inglés técnico", desc: "Docs, bugs e incidentes" },
  { id: "all", label: "Ruta completa", desc: "Ruta equilibrada A1–B2" },
];

export default function OnboardingCard() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<number[]>(Array(DIAG_QUESTIONS.length).fill(-1));
  const [goal, setGoal] = useState<LearningGoal>("all");

  const diagScore = useMemo(() => {
    const max = DIAG_QUESTIONS.length * 3;
    const got = answers.reduce((s, a, i) => (a >= 0 ? s + DIAG_QUESTIONS[i].points[a] : s), 0);
    return Math.round((got / max) * 100);
  }, [answers]);
  const diagLevel = levelFromScore(diagScore);
  const diagnostic: DiagnosticResult = { level: diagLevel, score: diagScore, completedAt: Date.now() };
  const planRec = useMemo(() => recommendPlan(goal, diagnostic), [goal, diagScore]);

  const diagComplete = answers.every((a) => a >= 0);

  function finish() {
    progressStore.setSettings({
      name: name.trim(),
      goal,
      onboarded: true,
      diagnostic,
      plan: toStudyPlan(planRec),
      planIntroDismissed: false,
    } as any);
  }

  return (
    <section class="mb-6 overflow-hidden rounded-[28px] bg-accent/[0.07] p-5 sm:p-7 animate-fade-up">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl">
          <p class="mono-label flex items-center gap-2 text-accent/90">
            <Sparkles class="h-3.5 w-3.5" /> Bienvenido a RuntimeEnglish
          </p>
          <h2 class="font-pixel mt-3 text-[1.7rem] tracking-tight sm:text-[2.1rem]">Onboarding guiado</h2>
          <p class="mt-2 text-sm leading-6 text-base-content/55">
            Diagnóstico rápido, objetivo claro y plan diario personalizado para que empieces con foco. Puedes ajustar todo luego en Ajustes.
          </p>
        </div>
        <div class="flex items-center gap-1.5 rounded-full bg-base-100/70 px-3 py-1.5 text-[11px] font-medium text-base-content/60">
          Paso {step} de 4
        </div>
      </div>

      {step === 1 && (
        <div class="mt-5 space-y-4">
          <label class="flex w-full max-w-sm flex-col gap-1.5">
            <span class="text-[11px] font-medium text-base-content/55">Tu nombre (opcional)</span>
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
              placeholder="Ej. Jesús"
              class="h-11 w-full rounded-xl bg-base-100 px-4 text-sm outline-none placeholder:text-base-content/25"
            />
          </label>
          <div class="flex justify-end">
            <button type="button" onClick={() => setStep(2)} class="btn btn-primary h-10 gap-2 rounded-xl px-4">
              Continuar <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div class="mt-5 space-y-4">
          <div class="flex items-center gap-2">
            <ClipboardCheck class="h-4 w-4 text-accent" />
            <p class="text-sm font-medium">Diagnóstico de nivel rápido</p>
          </div>
          <div class="space-y-3">
            {DIAG_QUESTIONS.map((item, qi) => (
              <div key={qi} class="rounded-2xl bg-base-100/70 p-4">
                <p class="text-[13px] font-medium leading-relaxed text-base-content/80">{qi + 1}. {item.q}</p>
                <div class="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {item.options.map((opt, oi) => {
                    const active = answers[qi] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((prev) => { const n = [...prev]; n[qi] = oi; return n; })}
                        class={`rounded-xl px-3 py-2.5 text-left text-[12px] leading-relaxed transition ${active ? "bg-base-content text-base-100" : "bg-base-100 text-base-content/65 hover:bg-base-200"}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {diagComplete && (
            <div class="rounded-2xl bg-accent/10 px-4 py-3 text-sm">
              Nivel estimado: <span class="font-mono font-semibold text-accent">{diagLevel}</span> <span class="text-base-content/50">({diagScore}% de preparación inicial)</span>
            </div>
          )}
          <div class="flex justify-between gap-2">
            <button type="button" onClick={() => setStep(1)} class="btn btn-ghost h-10 rounded-xl px-4">Atrás</button>
            <button type="button" disabled={!diagComplete} onClick={() => setStep(3)} class="btn btn-primary h-10 gap-2 rounded-xl px-4 disabled:opacity-40">
              Continuar <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div class="mt-5 space-y-4">
          <div class="flex items-center gap-2">
            <Target class="h-4 w-4 text-accent" />
            <p class="text-sm font-medium">Tu objetivo principal</p>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                class={`rounded-xl px-4 py-3 text-left transition ${goal === g.id ? "bg-base-content text-base-100" : "bg-base-100/80 text-base-content/70 hover:bg-base-100"}`}
              >
                <p class="text-sm font-medium">{g.label}</p>
                <p class={`mt-0.5 text-[11px] ${goal === g.id ? "text-base-100/70" : "text-base-content/40"}`}>{g.desc}</p>
              </button>
            ))}
          </div>
          <div class="flex justify-between gap-2">
            <button type="button" onClick={() => setStep(2)} class="btn btn-ghost h-10 rounded-xl px-4">Atrás</button>
            <button type="button" onClick={() => setStep(4)} class="btn btn-primary h-10 gap-2 rounded-xl px-4">
              Ver mi plan <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div class="mt-5 space-y-4">
          <p class="text-sm font-medium">Tu plan personalizado</p>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl bg-base-100/80 p-4">
              <p class="text-[10px] font-medium text-base-content/45">Nivel inicial</p>
              <p class="mt-1 font-mono text-lg font-semibold text-accent">{planRec.level}</p>
            </div>
            <div class="rounded-2xl bg-base-100/80 p-4">
              <p class="text-[10px] font-medium text-base-content/45">Meta diaria</p>
              <p class="mt-1 font-mono text-lg font-semibold">{planRec.dailyMinutes} min</p>
              <p class="text-[11px] text-base-content/45">{planRec.dailyExercises} ejercicios/día</p>
            </div>
            <div class="rounded-2xl bg-base-100/80 p-4">
              <p class="text-[10px] font-medium text-base-content/45">Meta semanal</p>
              <p class="mt-1 font-mono text-lg font-semibold">{planRec.weeklySessions} sesiones</p>
              <p class="text-[11px] text-base-content/45">{planRec.weeklyExercises} ejercicios/semana</p>
            </div>
            <div class="rounded-2xl bg-base-100/80 p-4">
              <p class="text-[10px] font-medium text-base-content/45">Meta mensual</p>
              <p class="mt-1 font-mono text-lg font-semibold">{planRec.monthlySessions} sesiones</p>
              <p class="text-[11px] text-base-content/45">{planRec.monthlyExercises} ejercicios/mes</p>
            </div>
          </div>
          <p class="text-[12px] leading-relaxed text-base-content/55">
            {planRec.summary}. Enfocado en <span class="font-medium text-base-content/75">{GOALS.find(g=>g.id===goal)?.label}</span>. El plan se adapta a tu objetivo y se mide con tu progreso real (compatible con el repaso espaciado y tu ruta actual).
          </p>
          <div class="flex justify-between gap-2">
            <button type="button" onClick={() => setStep(3)} class="btn btn-ghost h-10 rounded-xl px-4">Atrás</button>
            <button type="button" onClick={finish} class="btn btn-primary h-11 gap-2 rounded-xl px-5">
              <Check class="h-4 w-4" /> Empezar con mi plan
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
