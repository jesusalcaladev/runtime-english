import {
  Award,
  BookOpen,
  BookText,
  Check,
  ChevronRight,
  Dumbbell,
  LayoutGrid,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Trophy,
  X,
} from "lucide-preact";
import type { NavModule } from "../../data/curriculum";
import { useSidebarNav } from "../../hooks/useSidebarNav";
import { getUiStage, t, tAction } from "../../lib/i18n";
import { route } from "../../lib/routes";
import { useProgress } from "../../lib/useProgress";

interface Props {
  modules: NavModule[];
}

export default function SidebarNav({ modules }: Props) {
  const state = useProgress();
  const stage = getUiStage(state);
  const { open, setOpen, path } = useSidebarNav();

  const allSessions = modules.flatMap((module) => module.sessions);
  const totalSessions = allSessions.length;
  const totalExercises = allSessions.reduce((sum, session) => sum + session.exerciseCount, 0);
  const doneSessions = allSessions.filter((session) => state.completedSessions[session.id]).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  const courseComplete = doneSessions >= totalSessions && doneExercises >= totalExercises;
  let devMode = false;
  try {
    devMode =
      typeof window !== "undefined" &&
      (window.localStorage.getItem("runtimeenglish_dev") === "1" ||
        window.localStorage.getItem("deveng_dev") === "1");
  } catch {}
  const canOpenCertificate = courseComplete || devMode;

  const workspaceLinks = [
    { href: "/", label: t(stage, "roadmap"), icon: LayoutGrid, group: "main" as const },
    { href: "/practice", label: stage === "en" ? "Practice" : "Práctica", icon: Dumbbell, group: "main" as const },
    { href: "/dictionary", label: stage === "en" ? "Dictionary" : "Diccionario", icon: BookText, group: "main" as const },
    { href: "/my-lessons", label: stage === "en" ? "My lessons" : "Mis lecciones", icon: BookOpen, group: "main" as const },
    { href: "/search", label: stage === "en" ? "Search" : "Buscar", icon: Search, group: "tools" as const },
    { href: "/slang", label: t(stage, "slang"), icon: MessageSquare, group: "tools" as const },
    { href: "/achievements", label: t(stage, "achievements"), icon: Trophy, group: "progress" as const },
    { href: "/settings", label: t(stage, "settings"), icon: Settings, group: "progress" as const },
  ];

  const renderLink = (href: string, label: string, Icon: typeof LayoutGrid) => {
    const routedHref = route(href);
    const active = href === "/" ? path === routedHref : path.startsWith(routedHref);
    return (
      <a
        href={routedHref}
        onClick={() => setOpen(false)}
        class={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${
          active
            ? "bg-base-300 font-medium text-base-content"
            : "text-base-content/60 hover:bg-base-300/55 hover:text-base-content"
        }`}
      >
        <Icon class={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-base-content/40"}`} />
        <span class="truncate">{label}</span>
        {active && <ChevronRight class="ml-auto h-3.5 w-3.5 text-base-content/30" />}
      </a>
    );
  };

  const grouped = {
    "A1-A2": modules.filter((module) => module.level === "A1-A2"),
    "B1-B2": modules.filter((module) => module.level === "B1-B2"),
  };

  return (
    <>
      <div
        class={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        aria-label={stage === "en" ? "Main navigation" : "Navegación principal"}
        class={`fixed bottom-0 left-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex w-[286px] flex-col bg-base-100 pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-200 print:hidden lg:sticky lg:top-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:h-[calc(100vh-3.5rem-env(safe-area-inset-top,0px))] lg:translate-x-0 lg:bg-transparent ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div class="flex items-center justify-between px-4 py-3 lg:hidden">
          <div class="flex items-center gap-2">
            <span class="font-pixel-square text-base">RuntimeEnglish</span>
            <span class="font-mono text-[9px] tracking-normal text-base-content/35">
              Core
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              document.getElementById("mobile-menu-btn")?.focus();
            }}
            class="flex h-9 w-9 items-center justify-center rounded-full text-base-content/50 transition hover:bg-base-300"
            aria-label={tAction(stage, "closeMenu")}
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex-1 space-y-8 overflow-y-auto px-3 pb-4 pt-5">
          <div class="space-y-5">
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/55">{t(stage, "workspace")}</p>
              {workspaceLinks.filter((l) => l.group === "main").map((link) => renderLink(link.href, link.label, link.icon))}
            </div>
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/45">{stage === "en" ? "Tools" : "Herramientas"}</p>
              {workspaceLinks.filter((l) => l.group === "tools").map((link) => renderLink(link.href, link.label, link.icon))}
            </div>
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/45">{stage === "en" ? "Progress" : "Progreso"}</p>
              {workspaceLinks.filter((l) => l.group === "progress").map((link) => renderLink(link.href, link.label, link.icon))}
              {canOpenCertificate ? (
                renderLink("/certificate", stage === "en" ? "Certificate" : "Certificado", Award)
              ) : (
                <span
                  aria-disabled="true"
                  class="flex cursor-not-allowed items-center gap-2.5 rounded-xl bg-base-300/45 px-3 py-2 text-[13px] text-base-content/25 opacity-70"
                >
                  <Award class="h-4 w-4 shrink-0 text-base-content/20" />
                  <span class="truncate">{stage === "en" ? "Certificate" : "Certificado"}</span>
                </span>
              )}
            </div>
          </div>

          {(["A1-A2", "B1-B2"] as const).map((level) => (
            <div class="space-y-4">
              <p class="mono-label px-3 text-base-content/55">
                {t(stage, level === "A1-A2" ? "a1" : "b1")}
              </p>
              {grouped[level].map((module) => {
                const done = module.sessions.filter(
                  (session) => state.completedSessions[session.id],
                ).length;
                const pct = Math.round((done / Math.max(module.sessions.length, 1)) * 100);
                return (
                  <div key={module.id} class="space-y-2">
                    <div class="flex items-center justify-between gap-2 px-3">
                      <div class="flex min-w-0 items-center gap-2">
                        <span class="truncate text-[11px] font-semibold text-base-content/65">
                          {module.shortTitle}
                        </span>
                        {module.featured && (
                          <Sparkles class="h-2.5 w-2.5 shrink-0 text-accent" aria-label={tAction(stage, "featured")} />
                        )}
                      </div>
                      <span class="shrink-0 font-mono text-[9px] text-base-content/30">
                        {done}/{module.sessions.length}
                      </span>
                    </div>
                    <div class="h-0.5 w-full overflow-hidden rounded-full bg-base-content/[0.06]">
                      <div
                        class="h-full rounded-full bg-accent/70 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div class="space-y-1.5">
                      {module.sessions.map((session) => {
                        const complete = Boolean(state.completedSessions[session.id]);
                        const href = route(`/session/${session.slug}`);
                        const active = path === href;
                        return (
                          <a
                            key={session.id}
                            href={href}
                            onClick={() => setOpen(false)}
                            class={`group flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-[12px] leading-snug transition ${
                              active
                                ? "bg-base-300 font-medium text-base-content"
                                : "text-base-content/50 hover:bg-base-300/45 hover:text-base-content/80"
                            }`}
                          >
                            <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                              {complete ? (
                                <span class="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent">
                                  <Check class="h-2.5 w-2.5" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <span
                                  class={`h-1.5 w-1.5 rounded-full ${
                                    active ? "bg-base-content/50" : "bg-base-content/20"
                                  }`}
                                />
                              )}
                            </span>
                            <span class="line-clamp-2">{session.title}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
