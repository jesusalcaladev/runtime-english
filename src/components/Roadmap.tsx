import { Check, ChevronRight, Clock, Flag, Layers, Play, Sparkles } from "lucide-preact";
import type { NavModule, NavSession } from "../data/curriculum";
import { getUiStage, tAction } from "../lib/i18n";
import { useProgress } from "../lib/useProgress";

interface Props {
  modules: NavModule[];
  nextSessionId: string;
}

type Stage = ReturnType<typeof getUiStage>;

function SessionRow({
  session,
  index,
  nextSessionId,
  completedSessions,
  stage,
}: {
  session: NavSession;
  index: number;
  nextSessionId: string;
  completedSessions: Record<string, number>;
  stage: Stage;
}) {
  const complete = Boolean(completedSessions[session.id]);
  const isNext = session.id === nextSessionId && !complete;

  return (
    <a
      href={`/session/${session.slug}`}
      className={`group flex min-h-[76px] items-center gap-3 rounded-2xl px-3.5 py-3 transition ${
        isNext
          ? "bg-accent/[0.095] hover:bg-accent/[0.14]"
          : complete
            ? "bg-base-100/35 hover:bg-base-100/60"
            : "bg-base-100/55 hover:bg-base-100"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] ${
          complete
            ? "bg-accent/15 text-accent"
            : isNext
              ? "bg-accent/15 text-accent"
              : "bg-base-100/70 text-base-content/30"
        }`}
      >
        {complete ? (
          <Check className="h-3 w-3" strokeWidth={2.5} />
        ) : isNext ? (
          <Play className="h-2.5 w-2.5 fill-current" />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`block truncate text-[12px] font-medium ${
              complete
                ? "text-base-content/45"
                : isNext
                  ? "text-base-content"
                  : "text-base-content/75 group-hover:text-base-content"
            }`}
          >
            {session.title}
          </span>
          {isNext && (
            <span className="shrink-0 rounded-full bg-accent/10 px-1.5 py-0.5 text-[8px] font-medium text-accent">
              {tAction(stage, "continueHere")}
            </span>
          )}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] text-base-content/30">
          <span className="font-mono">{session.cefr}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {session.minutes} {tAction(stage, "minutes")}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-2.5 w-2.5" />
            {session.exerciseCount} {stage === "es" ? "ej." : "ex."}
          </span>
        </span>
      </span>

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-base-content/15 transition group-hover:translate-x-0.5 group-hover:text-base-content/45" />
    </a>
  );
}

function ModuleCard({
  module,
  nextSessionId,
  completedSessions,
  stage,
}: {
  module: NavModule;
  nextSessionId: string;
  completedSessions: Record<string, number>;
  stage: Stage;
}) {
  const done = module.sessions.filter((session) => completedSessions[session.id]).length;
  const modulePct = Math.round((done / Math.max(module.sessions.length, 1)) * 100);

  return (
    <article
      className={`rounded-3xl p-4 sm:p-5 ${
        module.featured ? "bg-accent/[0.055]" : "bg-base-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-100/60 font-mono text-[9px] text-base-content/40">
            {module.code.replace("MOD ", "")}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[13px] font-medium leading-snug">{module.shortTitle}</h4>
              {module.featured && (
                <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
                  <Sparkles className="h-2.5 w-2.5" /> {tAction(stage, "special")}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-base-content/35">
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
          <span className="rounded-full bg-base-100/60 px-2.5 py-1 font-mono text-[9px] text-base-content/45">
            {done}/{module.sessions.length}
          </span>
          <span className="text-[9px] text-base-content/25">{modulePct}%</span>
        </div>
      </div>

      <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-base-content/[0.06]">
        <div
          className="h-full rounded-full bg-accent/70 transition-all duration-500"
          style={{ width: `${modulePct}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {module.sessions.map((session, index) => (
          <SessionRow
            key={session.id}
            session={session}
            index={index}
            nextSessionId={nextSessionId}
            completedSessions={completedSessions}
            stage={stage}
          />
        ))}
      </div>
    </article>
  );
}

export default function Roadmap({ modules, nextSessionId }: Props) {
  const state = useProgress();
  const stage = getUiStage(state);
  const totalSessions = modules.reduce((total, module) => total + module.sessions.length, 0);
  const totalExercises = modules.reduce(
    (total, module) =>
      total + module.sessions.reduce((sum, session) => sum + session.exerciseCount, 0),
    0,
  );
  const doneSessions = modules
    .flatMap((module) => module.sessions)
    .filter((session) => state.completedSessions[session.id]).length;
  const overallPct = Math.round((doneSessions / Math.max(totalSessions, 1)) * 100);

  const groups = [
    {
      id: "a1",
      index: "01",
      title: tAction(stage, "foundations"),
      level: "A1–A2",
      body: tAction(stage, "stageA1Body"),
      outcome: tAction(stage, "stageA1Outcome"),
      modules: modules.filter((module) => module.level === "A1-A2"),
    },
    {
      id: "b1",
      index: "02",
      title: tAction(stage, "production"),
      level: "B1–B2",
      body: tAction(stage, "stageB1Body"),
      outcome: tAction(stage, "stageB1Outcome"),
      modules: modules.filter((module) => module.level === "B1-B2"),
    },
  ] as const;

  return (
    <section id="roadmap" className="mt-14 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="mono-label">
            {tAction(stage, "progress")} / {tAction(stage, "route")}
          </p>
          <h2 className="font-pixel mt-2 text-[1.8rem] leading-tight tracking-tight sm:text-[2.05rem]">
            {tAction(stage, "pathTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-[13px] leading-6 text-base-content/45">
            {tAction(stage, "pathBody")}
          </p>
        </div>

        <div className="rounded-2xl bg-base-200 px-4 py-3">
          <p className="font-mono text-[1.15rem] font-medium leading-none tracking-tight">
            {doneSessions}
            <span className="text-[11px] font-normal text-base-content/30"> / {totalSessions}</span>
          </p>
          <p className="mt-1.5 text-[9px] text-base-content/35">{tAction(stage, "pathDone")}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="w-8 text-right font-mono text-[10px] text-base-content/30">
          {overallPct}%
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-base-content/25">
        <span>
          {modules.length} {tAction(stage, "modules")}
        </span>
        <span>·</span>
        <span>
          {totalSessions} {tAction(stage, "sessions")}
        </span>
        <span>·</span>
        <span>
          {totalExercises} {tAction(stage, "exercises")}
        </span>
      </div>

      <div className="mt-12 space-y-14">
        {groups.map((group) => {
          const sessions = group.modules.flatMap((module) => module.sessions);
          const done = sessions.filter((session) => state.completedSessions[session.id]).length;
          const exercises = sessions.reduce((total, session) => total + session.exerciseCount, 0);
          const pct = Math.round((done / Math.max(sessions.length, 1)) * 100);

          return (
            <div key={group.id}>
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-base-200 font-pixel text-[1.05rem] leading-none text-base-content/60">
                  {group.index}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <h3 className="font-pixel text-[1.35rem] leading-none tracking-tight">
                      {group.title}
                    </h3>
                    <span className="rounded-full bg-base-200 px-2.5 py-1 font-mono text-[9px] text-base-content/40">
                      {group.level}
                    </span>
                    <span className="text-[10px] text-base-content/30">
                      {sessions.length} {tAction(stage, "sessions")} · {exercises}{" "}
                      {tAction(stage, "exercises")}
                    </span>
                  </div>
                  <p className="mt-2.5 max-w-2xl text-[12px] leading-6 text-base-content/45">
                    {group.body}
                  </p>
                </div>

                <span className="hidden shrink-0 font-mono text-[10px] text-base-content/30 sm:block">
                  {done}/{sessions.length}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 sm:pl-15">
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-base-content/[0.06]">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[9px] text-base-content/25">
                  {pct}%
                </span>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-accent/[0.045] px-3.5 py-3 sm:ml-15">
                <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />
                <p className="text-[10px] leading-relaxed text-base-content/40">
                  {group.outcome}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {group.modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    nextSessionId={nextSessionId}
                    completedSessions={state.completedSessions}
                    stage={stage}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
