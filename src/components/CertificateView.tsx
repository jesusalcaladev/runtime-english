import { Award, Printer } from "lucide-preact";
import { useProgress } from "../lib/useProgress";

interface Props {
  totalSessions: number;
  totalExercises: number;
}

export default function CertificateView({ totalSessions, totalExercises }: Props) {
  const state = useProgress();
  const doneSessions = Object.keys(state.completedSessions).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  let devMode = false;
  try {
    devMode = typeof window !== "undefined" && window.localStorage.getItem("deveng_dev") === "1";
  } catch {}
  const complete = devMode || (doneSessions >= totalSessions && doneExercises >= totalExercises);

  const name = (state.settings.name || "").trim() || "Developer";
  const completionTimestamp = Math.max(
    0,
    ...Object.values(state.completedSessions),
    ...Object.values(state.completedExercises),
  );
  const completionDate = new Date(completionTimestamp || Date.now()).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const issueId = `DEVC-${String(completionTimestamp || state.startedAt).slice(-6)}`;

  if (!complete) {
    return (
      <div class="mx-auto max-w-2xl rounded-3xl bg-base-200 p-6 text-center sm:p-10">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/50">
          <Award class="h-7 w-7" />
        </div>
        <h1 class="font-pixel mt-5 text-3xl tracking-tight">Certificate locked</h1>
        <p class="mt-3 text-sm leading-7 text-base-content/60">
          Complete all sessions and exercises to unlock your certificate.
        </p>
        <p class="mt-4 font-mono text-[11px] text-base-content/45">
          {doneSessions}/{totalSessions} sessions · {doneExercises}/{totalExercises} exercises
        </p>
        <a href="/" class="btn btn-primary mt-6 h-10 rounded-xl px-5">
          Continue learning
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p class="mono-label">Completion / Certificate</p>
          <h1 class="font-pixel mt-2 text-2xl tracking-tight sm:text-3xl">Your certificate</h1>
          <p class="mt-1 text-sm text-base-content/55">
            Clean, print-ready certificate. Save it as PDF from the print dialog.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          class="btn btn-primary h-10 gap-2 rounded-xl px-4"
        >
          <Printer class="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>

      <div class="certificate-sheet mx-auto w-full max-w-[920px] overflow-hidden rounded-[32px] bg-white text-neutral-900 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        <div class="relative px-8 py-10 sm:px-14 sm:py-14">
          <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neutral-900/[0.03]" />
          <div class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-neutral-900/[0.025]" />

          <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
              DevEng Core
            </p>

            <div class="mt-8 inline-flex items-center rounded-full bg-neutral-900 px-5 py-2 text-white">
              <span class="font-mono text-sm font-semibold tracking-[0.22em] sm:text-base">A1–B2</span>
              <span class="mx-2 text-white/35">·</span>
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 sm:text-[11px]">
                English Level Achieved
              </span>
            </div>

            <p class="mt-8 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              Certificate of Completion
            </p>
            <h2 class="font-pixel mt-3 text-4xl leading-[0.95] tracking-tight text-neutral-950 sm:text-6xl">
              English for Programmers
            </h2>

            <p class="mt-10 text-sm text-neutral-500">Awarded to</p>
            <p class="mt-2 text-balance text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              {name}
            </p>

            <p class="mt-6 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
              Completed the DevEng Core program in technical English for developers.
            </p>

            <div class="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
              <div>
                <p class="font-mono text-xl font-semibold text-neutral-950">{totalSessions}</p>
                <p class="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Sessions</p>
              </div>
              <div class="h-8 w-px bg-neutral-200/80" aria-hidden="true" />
              <div>
                <p class="font-mono text-xl font-semibold text-neutral-950">{totalExercises}</p>
                <p class="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Exercises</p>
              </div>
              <div class="h-8 w-px bg-neutral-200/80" aria-hidden="true" />
              <div>
                <p class="font-mono text-xl font-semibold text-neutral-950">{completionDate}</p>
                <p class="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Completed</p>
              </div>
            </div>

            <div class="mt-12 flex w-full items-end justify-between gap-4 text-left">
              <div>
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Program</p>
                <p class="mt-1 text-sm font-medium text-neutral-800">DevEng Core · Technical English</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Certificate ID</p>
                <p class="mt-1 font-mono text-sm font-medium text-neutral-800">{issueId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-[11px] text-base-content/40 print:hidden">
        Tip: in the print dialog, choose “Save as PDF” to keep a digital copy.
      </p>
    </div>
  );
}
