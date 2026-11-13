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
            Ready to print. Use a white background for best results.
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

      <div class="certificate-sheet mx-auto w-full max-w-[900px] overflow-hidden rounded-[28px] bg-white p-6 text-neutral-900 shadow-sm ring-1 ring-black/5 print:max-w-none print:rounded-none print:shadow-none print:ring-0 sm:p-10">
        <div class="relative border border-neutral-200 p-6 sm:p-10">
          <div class="absolute inset-x-8 top-0 h-1 bg-neutral-900 sm:inset-x-12" />
          <div class="flex flex-col items-center text-center">
            <p class="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-neutral-500">
              DevEng Core · Certificate of Completion
            </p>
            <h2 class="font-pixel mt-6 text-4xl leading-none tracking-tight text-neutral-950 sm:text-5xl">
              English for Programmers
            </h2>
            <p class="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              This certifies that
            </p>
            <p class="mt-3 text-balance text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {name}
            </p>
            <p class="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
              has successfully completed the DevEng Core program, demonstrating practical
              technical English skills for software development from A1 to B2 level,
              including reading, writing, communication, and modern developer slang.
            </p>

            <div class="mt-8 grid w-full max-w-xl grid-cols-3 gap-3 text-center">
              <div class="rounded-2xl border border-neutral-200 px-3 py-3">
                <p class="font-mono text-lg font-semibold text-neutral-950">{totalSessions}</p>
                <p class="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">Sessions</p>
              </div>
              <div class="rounded-2xl border border-neutral-200 px-3 py-3">
                <p class="font-mono text-lg font-semibold text-neutral-950">{totalExercises}</p>
                <p class="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">Exercises</p>
              </div>
              <div class="rounded-2xl border border-neutral-200 px-3 py-3">
                <p class="font-mono text-lg font-semibold text-neutral-950">A1–B2</p>
                <p class="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">Level</p>
              </div>
            </div>

            <div class="mt-10 flex w-full max-w-2xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
              <div class="text-center sm:text-left">
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Date of completion</p>
                <p class="mt-1 text-sm font-medium text-neutral-900">{completionDate}</p>
              </div>
              <div class="text-center">
                <div class="mx-auto mb-2 h-px w-44 bg-neutral-300" />
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-500">DevEng Core</p>
              </div>
              <div class="text-center sm:text-right">
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Certificate ID</p>
                <p class="mt-1 font-mono text-sm font-medium text-neutral-900">{issueId}</p>
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
