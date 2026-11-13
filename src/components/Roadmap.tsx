import { Check, ChevronRight, Play, Sparkles } from "lucide-preact";
import type { NavModule } from "../data/curriculum";
import { getUiStage, t, tAction } from "../lib/i18n";
import { useProgress } from "../lib/useProgress";

interface Props {
  modules: NavModule[];
  nextSessionId: string;
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
  stage: ReturnType<typeof getUiStage>;
}) {
  const done = module.sessions.filter((session) => completedSessions[session.id]).length;
  const modulePct = Math.round((done / Math.max(module.sessions.length, 1)) * 100);

  return (
    <article className={`rounded-3xl p-3 ${module.featured ? "bg-accent/[0.055]" : "bg-base-200"}`}>
      <div className="flex items-start justify-between gap-3 px-2 pb-3 pt-1.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-base-100/60 px-1.5 py-0.5 font-mono text-[9px] text-base-content/40">
              {module.code}
            </span>
            {module.featured && (
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
                <Sparkles className="h-2.5 w-2.5" /> {tAction(stage, "special")}
              </span>
            )}
          </div>
          <h4 className="mt-2 text-[13px] font-medium leading-snug">{module.shortTitle}</h4>
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-base-content/35">
            {module.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-base-100/60 px-2 py-1 font-mono text-[9px] text-base-content/40">
          {done}/{module.sessions.length}
        </span>
      </div>

      <div className="mx-2 h-0.5 overflow-hidden rounded-full bg-base-content/[0.05]">
        <div
          className="h-full rounded-full bg-accent/70 transition-all duration-500"
          style={{ width: `${modulePct}%` }}
        />
      </div>

      <div className="mt-3 space-y-1.5">
        {module.sessions.map((session, index) => {
          const complete = Boolean(completedSessions[session.id]);
          const isNext = session.id === nextSessionId && !complete;
          return (
            <a
              key={session.id}
              href={`/session/${session.slug}`}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                isNext
                  ? "bg-accent/[0.08] hover:bg-accent/[0.12]"
                  : "bg-base-100/55 hover:bg-base-100"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px] ${
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
                  index + 1
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block truncate text-[12px] font-medium text-base-content/75 group-hover:text-base-content">
                    {session.title}
                  </span>
                  {isNext && (
                    <span className="shrink-0 rounded-full bg-accent/10 px-1.5 py-0.5 text-[8px] font-medium text-accent">
                      {tAction(stage, "next")}
                    </span>
                  )}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[9px] text-base-content/30">
                  <span className="font-mono">{session.cefr}</span>
                  <span>{session.minutes} {tAction(stage, "minutes")}</span>
                  <span>{session.exerciseCount} {stage === "es" ? "ej." : "ex."}</span>
                  {complete && <span className="text-accent">{tAction(stage, "completed")}</span>}
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-base-content/15 transition group-hover:translate-x-0.5 group-hover:text-base-content/40" />
            </a>
          );
        })}
      </div>
    </article>
  );
}

export default function Roadmap({ modules, nextSessionId }: Props) {
  const state = useProgress();
  const stage = getUiStage(state);
  const a1Modules = modules.filter((module) => module.level === "A1-A2");
  const b1Modules = modules.filter((module) => module.level === "B1-B2");
  const totalSessions = modules.reduce((total, module) => total + module.sessions.length, 0);

  const groups = [
    {
      id: "a1",
      title: tAction(stage, "foundations"),
      level: "A1–A2",
      modules: a1Modules,
    },
    {
      id: "b1",
      title: tAction(stage, "production"),
      level: "B1–B2",
      modules: b1Modules,
    },
  ] as const;

  return (
    <section className="mt-12 space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label">{tAction(stage, "progress")} / {tAction(stage, "route")}</p>
          <h2 className="font-pixel mt-2 text-[1.7rem] leading-tight tracking-tight">
            {t(stage, "yourRoadmap")}
          </h2>
        </div>
        <span className="font-mono text-[10px] text-base-content/30">
          {modules.length} {tAction(stage, "modules")} · {totalSessions} {tAction(stage, "sessions")}
        </span>
      </div>

      {groups.map((group) => {
        const sessions = group.modules.flatMap((module) => module.sessions);
        const done = sessions.filter((session) => state.completedSessions[session.id]).length;
        return (
          <div key={group.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-pixel text-[1.3rem] leading-none tracking-tight">
                  {group.title}
                </h3>
                <span className="text-[10px] text-base-content/35">
                  {group.level} · {group.modules.length} {tAction(stage, "modules")} · {sessions.length} {tAction(stage, "sessions")}
                </span>
              </div>
              <span className="font-mono text-[9px] text-base-content/30">
                {done}/{sessions.length} {tAction(stage, "completedSessions")}
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
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
    </section>
  );
}
