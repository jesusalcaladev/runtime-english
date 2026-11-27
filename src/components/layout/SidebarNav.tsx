import {
  Award,
  BookOpen,
  BookText,
  ChevronRight,
  CirclePlay,
  Dumbbell,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  Trophy,
  X,
} from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { useSidebarNav } from '../../hooks/useSidebarNav'
import { CERTIFICATE_LEVELS, getLevelStats, isLevelComplete } from '../../lib/certificateLevels'
import { getUiStage, t, tAction } from '../../lib/i18n'
import { route } from '../../lib/routes'
import { useProgress } from '../../lib/useProgress'

export default function SidebarNav() {
  const state = useProgress()
  const stage = getUiStage(state)
  const { open, setOpen, path, search } = useSidebarNav()

  const workspaceLinks = [
    { href: '/', label: t(stage, 'roadmap'), icon: LayoutGrid, group: 'main' as const },
    {
      href: '/practice',
      label: stage === 'en' ? 'Practice' : 'Práctica',
      icon: Dumbbell,
      group: 'main' as const,
    },
    {
      href: '/learn',
      label: stage === 'en' ? 'Learn on your own' : 'Aprende por tu cuenta',
      icon: CirclePlay,
      group: 'main' as const,
    },
    {
      href: '/dictionary',
      label: stage === 'en' ? 'Dictionary' : 'Diccionario',
      icon: BookText,
      group: 'main' as const,
    },
    {
      href: '/my-lessons',
      label: stage === 'en' ? 'My lessons' : 'Mis lecciones',
      icon: BookOpen,
      group: 'main' as const,
    },
    {
      href: '/placement',
      label: stage === 'en' ? 'Level test' : 'Test de nivel',
      icon: Sparkles,
      group: 'tools' as const,
    },
    { href: '/slang', label: t(stage, 'slang'), icon: MessageSquare, group: 'tools' as const },
    {
      href: '/certificate',
      label: stage === 'en' ? 'Certificate' : 'Certificado',
      icon: Award,
      group: 'progress' as const,
    },
    {
      href: '/achievements',
      label: t(stage, 'achievements'),
      icon: Trophy,
      group: 'progress' as const,
    },
    { href: '/settings', label: t(stage, 'settings'), icon: Settings, group: 'progress' as const },
  ]

  const renderLink = (href: string, label: string, Icon: typeof LayoutGrid) => {
    const routedHref = route(href)
    const active = href === '/' ? path === routedHref : path.startsWith(routedHref)
    return (
      <a
        href={routedHref}
        onClick={() => setOpen(false)}
        aria-current={active ? 'page' : undefined}
        class={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${
          active
            ? 'bg-base-300 font-medium text-base-content'
            : 'text-base-content/60 hover:bg-base-300/55 hover:text-base-content'
        }`}
      >
        <Icon class={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-base-content/40'}`} />
        <span class="truncate">{label}</span>
        {active && <ChevronRight class="ml-auto h-3.5 w-3.5 text-base-content/30" />}
      </a>
    )
  }

  const onDashboard = path === '/' || path === '/index.html'
  const [levelParam, setLevelParam] = useState<string | null>(() =>
    new URLSearchParams(search).get('level'),
  )
  const fallbackLevel =
    CERTIFICATE_LEVELS.find(
      (entry) => entry.state === 'active' && !isLevelComplete(entry.level, state),
    )?.level ?? null
  const activeLevel = levelParam ?? fallbackLevel

  useEffect(() => {
    setLevelParam(new URLSearchParams(search).get('level'))
  }, [search])

  function selectLevel(level: string) {
    setOpen(false)
    history.replaceState(null, '', route(`/?level=${level}`))
    setLevelParam(level)
    window.dispatchEvent(new CustomEvent('runtimeenglish:select-level', { detail: level }))
  }

  return (
    <>
      <div
        class={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        aria-label={stage === 'en' ? 'Main navigation' : 'Navegación principal'}
        class={`fixed bottom-0 left-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex w-[264px] flex-col bg-base-100 pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-200 print:hidden lg:sticky lg:top-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:h-[calc(100vh-3.5rem-env(safe-area-inset-top,0px))] lg:translate-x-0 lg:bg-transparent ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div class="flex items-center justify-end px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              document.getElementById('mobile-menu-btn')?.focus()
            }}
            class="flex h-9 w-9 items-center justify-center rounded-full text-base-content/50 transition hover:bg-base-300"
            aria-label={tAction(stage, 'closeMenu')}
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex-1 space-y-7 overflow-y-auto px-3 pb-4 pt-5">
          <div class="space-y-5">
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/55">{t(stage, 'workspace')}</p>
              {workspaceLinks
                .filter((link) => link.group === 'main')
                .map((link) => renderLink(link.href, link.label, link.icon))}
            </div>
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/45">
                {stage === 'en' ? 'Tools' : 'Herramientas'}
              </p>
              {workspaceLinks
                .filter((link) => link.group === 'tools')
                .map((link) => renderLink(link.href, link.label, link.icon))}
            </div>
            <div class="space-y-1">
              <p class="mono-label px-3 pb-2 text-base-content/45">{t(stage, 'progress')}</p>
              {workspaceLinks
                .filter((link) => link.group === 'progress')
                .map((link) => renderLink(link.href, link.label, link.icon))}
            </div>
          </div>

          <div class="space-y-1">
            <p class="mono-label px-3 pb-2 text-base-content/55">{t(stage, 'level')}</p>
            {CERTIFICATE_LEVELS.map((info) => {
              const active = onDashboard && activeLevel === info.level
              const stats = getLevelStats(info.level, state)
              const pct =
                stats.sessions === 0 ? 0 : Math.round((stats.doneSessions / stats.sessions) * 100)
              return (
                <a
                  key={info.level}
                  href={route(`/?level=${info.level}`)}
                  onClick={(event) => {
                    if (onDashboard) {
                      event.preventDefault()
                      selectLevel(info.level)
                    }
                  }}
                  aria-current={active ? 'page' : undefined}
                  class={`flex items-center justify-between rounded-xl px-3 py-2 text-[13px] transition ${
                    active
                      ? 'bg-base-300 font-medium text-base-content'
                      : 'text-base-content/60 hover:bg-base-300/55 hover:text-base-content'
                  }`}
                >
                  <span class="flex items-center gap-2.5 truncate">
                    <Award
                      class={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-base-content/40'}`}
                    />
                    {info.label}
                  </span>
                  <span class="font-mono text-[9px] text-base-content/30">{pct}%</span>
                </a>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
