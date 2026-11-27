import {
  Award,
  Check,
  Cloud,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import {
  CERTIFICATE_LEVELS,
  getCertificateLevelInfo,
  getLevelSessions,
  getLevelStats,
  isLevelComplete,
  isLevelUnlocked,
  levelCertificateId,
} from '../../lib/certificateLevels'
import { certificateQrSvg } from '../../lib/certificateQr'
import { certificateShareUrl, issueCertificate, verifyCertificate } from '../../lib/certificates'
import { getUiStage, tAction } from '../../lib/i18n'
import { type CertificateState, progressStore } from '../../lib/progress'
import { route } from '../../lib/routes'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { emitToast } from '../../lib/toast'
import type { Level } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'

interface Props {
  initialLevel?: Level
  /** Ignorados: se mantienen por compatibilidad con la página anterior. */
  totalSessions?: number
  totalExercises?: number
}

type Theme = 'pearl' | 'white' | 'dark'

function shortId(seed: number): string {
  return seed.toString(36).toUpperCase().slice(-6).padStart(6, '0')
}

function levelFromUrl(): Level {
  try {
    if (typeof window === 'undefined') return 'A1-A2'
    const value = new URLSearchParams(window.location.search).get('level')?.toUpperCase()
    if (value === 'A1-A2' || value === 'B1-B2' || value === 'C1-C2') return value
  } catch {}
  return 'A1-A2'
}

const certStyles = `
  .font-mono-tech { font-family: 'JetBrains Mono', monospace; }
  .certificate-sheet, .certificate-sheet[data-theme="pearl"] {
    --bg-paper: #F9F8F6; --text-primary: #111111; --text-secondary: #4A4A4A; --text-muted: #737373;
    --border-outer: #D4D2CD; --border-inner: #1A1A1A; --seal-stroke: #1A1A1A; --paper-noise-opacity: 0.035;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-paper); color: var(--text-primary);
    width: 100%; max-width: 1056px; position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05);
    overflow: hidden;
  }
  /* En móvil la hoja crece con su contenido: una proporción fija recortaba el pie. */
  @media (min-width: 640px) {
    .certificate-sheet { aspect-ratio: 1.414 / 1; }
  }
  .certificate-sheet[data-theme="white"] { --bg-paper:#FFFFFF; --text-primary:#0A0A0A; --text-secondary:#404040; --text-muted:#737373; --border-outer:#E5E5E5; --border-inner:#171717; --seal-stroke:#171717; --paper-noise-opacity:0.015; }
  .certificate-sheet[data-theme="dark"] { --bg-paper:#121212; --text-primary:#F5F5F4; --text-secondary:#A8A29E; --text-muted:#78716C; --border-outer:#292524; --border-inner:#57534E; --seal-stroke:#D6D3D1; --paper-noise-opacity:0.04; }
  /* Mismo acento neutral en todos los niveles: cambia solo el matiz. */
  .certificate-sheet[data-level="A1-A2"] { --level-accent: #4B5563; }
  .certificate-sheet[data-level="B1-B2"] { --level-accent: #6B5F52; }
  .certificate-sheet[data-level="C1-C2"] { --level-accent: #56606B; }
  .level-inline { color: var(--level-accent); }
  .paper-texture { position:absolute; inset:0; pointer-events:none; opacity:var(--paper-noise-opacity); background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); z-index:1; }
  .frame-outer { position:absolute; inset:22px; border:1px solid var(--border-outer); pointer-events:none; z-index:2; }
  .frame-inner { position:absolute; inset:28px; border:1px solid var(--border-inner); pointer-events:none; z-index:2; }
  .corner-tick { position:absolute; width:8px; height:8px; border-color:var(--border-inner); z-index:3; }
  .text-primary-theme { color: var(--text-primary) !important; }
  .text-secondary-theme { color: var(--text-secondary) !important; }
  .text-muted-theme { color: var(--text-muted) !important; }
  .divider-line { background-color: var(--border-outer); }
  .seal-svg { stroke: var(--seal-stroke); }
  /* 48 px es el mínimo verificado con jsQR a 1x: más pequeño deja de leerse. */
  .qr-corner { width: 48px; height: 48px; flex: none; background:#fff; box-shadow:0 0 0 1px var(--border-outer); }
  .qr-corner svg { display:block; width:100%; height:100%; }
  @media print {
    .qr-corner { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    @page { size: landscape; margin: 0; }
    body { background:none !important; padding:0 !important; margin:0 !important; display:block !important; }
    .no-print { display:none !important; }
    .studio-wrapper { padding:0 !important; min-height:auto !important; display:block !important; }
    .certificate-sheet { width:100vw !important; height:100vh !important; max-width:none !important; box-shadow:none !important; border-radius:0 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
`

export default function CertificateView({ initialLevel }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const [level, setLevel] = useState<Level>(() => initialLevel ?? levelFromUrl())
  const [theme, setTheme] = useState<Theme>('pearl')
  const [issuing, setIssuing] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [autoIssuedLevels, setAutoIssuedLevels] = useState<Set<Level>>(() => new Set())

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return
    supabase.auth.getSession().then(({ data }) => setAuthed(Boolean(data.session?.user)))
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(Boolean(session?.user)),
    )
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const sync = () => setLevel(levelFromUrl())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  function selectLevel(next: Level) {
    setLevel(next)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('level', next)
      history.replaceState(null, '', url.toString())
    } catch {}
  }

  const info = getCertificateLevelInfo(level)
  const stats = getLevelStats(level, state)
  let devMode = false
  try {
    devMode =
      typeof window !== 'undefined' &&
      (window.localStorage.getItem('runtimeenglish_dev') === '1' ||
        window.localStorage.getItem('deveng_dev') === '1' ||
        new URLSearchParams(window.location.search).get('dev') === '1')
  } catch {}
  const unlocked = devMode || isLevelUnlocked(level, state)
  const levelComplete = isLevelComplete(level, state)
  const complete = devMode || (unlocked && levelComplete)

  const name = (state.settings.name || '').trim() || 'Developer'
  const levelSessions = getLevelSessions(level)
  const levelSessionIds = new Set(levelSessions.map((entry) => entry.session.id))
  const levelExerciseIds = new Set(
    levelSessions.flatMap((entry) => entry.session.exercises.map((exercise) => exercise.id)),
  )
  const completionTimestamp = Math.max(
    0,
    ...Object.entries(state.completedSessions)
      .filter(([id]) => levelSessionIds.has(id))
      .map(([, ts]) => ts),
    ...Object.entries(state.completedExercises)
      .filter(([id]) => levelExerciseIds.has(id))
      .map(([, ts]) => ts),
  )
  const completionDate = new Date(completionTimestamp || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const derivedBaseId = shortId(completionTimestamp || state.startedAt || Date.now())
  const cert = state.certificates?.[level] ?? (level === 'A1-A2' ? state.certificate : null)
  const issueId = cert?.id || levelCertificateId(derivedBaseId, level)
  const issuedAtIso = cert?.issuedAt || new Date(completionTimestamp || Date.now()).toISOString()
  const displayDate = cert?.completionDate || completionDate
  const shareUrl = useMemo(() => certificateShareUrl(issueId), [issueId])
  const qrSvg = useMemo(() => certificateQrSvg(shareUrl), [shareUrl])
  const issueEndpointConfigured = Boolean(import.meta.env.PUBLIC_CERTIFICATE_ISSUE_URL)
  const verifyAvailable =
    isSupabaseConfigured() || Boolean(import.meta.env.PUBLIC_CERTIFICATE_VERIFY_URL)

  function buildCertificateRecord(overrides: Partial<CertificateState> = {}): CertificateState {
    return {
      id: issueId,
      name,
      issuedAt: issuedAtIso,
      completionDate: displayDate,
      level,
      status: cert?.status ?? 'local',
      issuedBy: cert?.issuedBy ?? 'local',
      userId: cert?.userId ?? null,
      shareUrl,
      lastError: cert?.lastError ?? null,
      lastVerifiedAt: cert?.lastVerifiedAt ?? null,
      ...overrides,
    }
  }

  async function ensureLocalCertificate() {
    if (!complete) return
    progressStore.setLevelCertificate(level, buildCertificateRecord())
  }

  async function doIssue(auto = false) {
    if (!complete) return
    await ensureLocalCertificate()
    if (!issueEndpointConfigured) {
      progressStore.setLevelCertificate(
        level,
        buildCertificateRecord({ status: 'local', issuedBy: 'local' }),
      )
      return
    }

    setIssuing(true)
    const res = await issueCertificate({
      id: issueId,
      name,
      issued_at: issuedAtIso,
      completion_date: displayDate,
      level,
    })
    setIssuing(false)

    if (res.ok) {
      progressStore.setLevelCertificate(
        level,
        buildCertificateRecord({
          status: 'issued',
          issuedBy: 'server',
          lastError: null,
        }),
      )
      if (!auto) {
        emitToast(
          authed
            ? `Certificado ${level} emitido y vinculado a tu cuenta.`
            : `Certificado ${level} emitido en el registro verificable.`,
          'success',
        )
      }
      return
    }

    progressStore.setLevelCertificate(
      level,
      buildCertificateRecord({
        status: cert?.status === 'issued' || cert?.status === 'verified' ? cert.status : 'pending',
        issuedBy: cert?.issuedBy ?? 'local',
        lastError: res.error || 'No se pudo emitir en servidor.',
      }),
    )
    if (!auto) emitToast(`No se pudo emitir en servidor: ${res.error || 'error'}`, 'error')
  }

  async function doVerify() {
    setVerifying(true)
    const res = await verifyCertificate(issueId)
    setVerifying(false)

    if (res.ok && res.certificate) {
      progressStore.setLevelCertificate(
        level,
        buildCertificateRecord({
          name: res.certificate.name || name,
          issuedAt: res.certificate.issued_at || issuedAtIso,
          status: 'verified',
          issuedBy: 'server',
          lastVerifiedAt: new Date().toISOString(),
          lastError: null,
        }),
      )
      emitToast('Certificado verificado correctamente en el registro.', 'success')
      return
    }

    if (!autoIssuedLevels.has(level)) await ensureLocalCertificate()
    if (cert?.status === 'issued' || cert?.status === 'verified') {
      progressStore.setLevelCertificate(
        level,
        buildCertificateRecord({
          status: 'issued',
          lastError: res.error || 'No verificado aún',
        }),
      )
    }

    emitToast(
      res.error === 'not_found'
        ? 'Aún no aparece en el registro verificable. Intenta emitirlo.'
        : `Verificación no disponible: ${res.error || 'error'}`,
      res.error === 'not_found' ? 'info' : 'error',
    )
  }

  useEffect(() => {
    if (!complete || autoIssuedLevels.has(level)) return
    setAutoIssuedLevels((prev) => new Set(prev).add(level))
    void (async () => {
      await ensureLocalCertificate()
      await doIssue(true)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, level, issueId, name, issuedAtIso, displayDate, autoIssuedLevels])

  const levelTabs = (
    <div class="no-print surface-muted mx-auto mb-4 inline-flex w-full max-w-[1056px] flex-wrap items-center gap-1 bg-base-200 p-1">
      {CERTIFICATE_LEVELS.map((entry) => {
        const selected = level === entry.level
        return (
          <button
            key={entry.level}
            type="button"
            onClick={() => selectLevel(entry.level)}
            class={`pill transition ${
              selected
                ? 'bg-base-content text-base-100'
                : 'text-base-content/50 hover:bg-base-100 hover:text-base-content/80'
            }`}
          >
            {entry.label}
          </button>
        )
      })}
    </div>
  )

  if (!complete) {
    const title = stage === 'en' ? 'Certificate locked' : 'Certificado bloqueado'
    const body = unlocked
      ? stage === 'en'
        ? 'Finish every session and exercise in this level to unlock its certificate.'
        : 'Completa todas las sesiones y ejercicios de este nivel para desbloquear su certificado.'
      : tAction(stage, 'certificateLockedLevel')
    return (
      <div class="w-full">
        {levelTabs}
        <div class="mx-auto max-w-2xl rounded-3xl bg-base-200 p-6 text-center sm:p-10">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/50">
            <Award class="h-7 w-7" />
          </div>
          <h1 class="font-pixel mt-5 text-[2.1rem] tracking-tight">{title}</h1>
          <p class="mt-3 text-sm leading-7 text-base-content/60">{body}</p>
          <p class="mt-4 font-mono text-[11px] text-base-content/45">
            {stats.doneSessions}/{stats.sessions} {stage === 'en' ? 'sessions' : 'sesiones'} ·{' '}
            {stats.doneExercises}/{stats.exercises} {stage === 'en' ? 'exercises' : 'ejercicios'}
          </p>
          <a href={route('/')} class="btn btn-primary mt-6 h-10 rounded-xl px-5">
            {stage === 'en' ? 'Continue learning' : 'Seguir aprendiendo'}
          </a>
        </div>
      </div>
    )
  }

  const status = cert?.status || 'local'
  const statusLabel =
    status === 'verified'
      ? 'Verificado en registro'
      : status === 'issued'
        ? 'Emitido en servidor'
        : status === 'pending'
          ? 'Emisión pendiente'
          : status === 'error'
            ? 'Error de emisión'
            : 'Certificado local'
  const statusTone =
    status === 'verified' || status === 'issued'
      ? 'text-success bg-success/10'
      : status === 'pending'
        ? 'text-warning bg-warning/10'
        : status === 'error'
          ? 'text-error bg-error/10'
          : 'text-base-content/60 bg-base-100/70'

  const btn = (t: Theme, label: string) => (
    <button
      type="button"
      onClick={() => setTheme(t)}
      class={`rounded-full px-3.5 py-2 text-xs font-medium transition ${theme === t ? 'bg-base-content text-base-100' : 'bg-base-100/50 text-base-content/45 hover:bg-base-100 hover:text-base-content/70'}`}
    >
      {label}
    </button>
  )

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      emitToast('Enlace de verificación copiado.', 'success')
    } catch {
      emitToast('No se pudo copiar el enlace.', 'error')
    }
  }

  return (
    <div class="w-full">
      <style>{certStyles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {levelTabs}

      <div class="no-print mx-auto mb-4 w-full max-w-[1056px] space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5">
            {btn('pearl', 'Papel marfil')}
            {btn('white', 'Blanco puro')}
            {btn('dark', 'Edición oscura')}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            class="btn btn-primary btn-sm h-9 gap-2 rounded-xl px-4 font-semibold"
          >
            <span>Imprimir / PDF</span>
          </button>
        </div>

        <div class="rounded-2xl bg-base-200/80 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusTone}`}
                >
                  <ShieldCheck class="h-3 w-3" /> {statusLabel}
                </span>
                {authed && (
                  <span class="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[10px] text-accent">
                    <Cloud class="h-3 w-3" /> Vinculado a tu cuenta
                  </span>
                )}
              </div>
              {cert?.lastError && (
                <p class="mt-1 text-[10px] text-error/80">Último aviso: {cert.lastError}</p>
              )}
              {cert?.lastVerifiedAt && (
                <p class="mt-1 text-[10px] text-success/80">
                  Última verificación: {new Date(cert.lastVerifiedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div class="flex flex-wrap gap-2">
              {issueEndpointConfigured && (
                <button
                  type="button"
                  disabled={issuing}
                  onClick={() => void doIssue(false)}
                  class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium hover:bg-base-100/80 disabled:opacity-50"
                >
                  {issuing ? (
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw class="h-3.5 w-3.5" />
                  )}{' '}
                  Emitir/actualizar registro
                </button>
              )}
              <button
                type="button"
                disabled={verifying || !verifyAvailable}
                onClick={() => void doVerify()}
                class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium hover:bg-base-100/80 disabled:opacity-50"
              >
                {verifying ? (
                  <Loader2 class="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck class="h-3.5 w-3.5" />
                )}{' '}
                Verificar
              </button>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-base-100/50 p-2.5">
            <span class="min-w-0 flex-1 truncate font-mono text-[10px] text-base-content/55">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={() => void copyShare()}
              class="flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1.5 text-[10px] font-medium hover:bg-base-300"
            >
              {copied ? <Check class="h-3 w-3" /> : <Copy class="h-3 w-3" />}{' '}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              class="flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1.5 text-[10px] font-medium hover:bg-base-300"
            >
              <ExternalLink class="h-3 w-3" /> Abrir verificación
            </a>
          </div>
        </div>
      </div>

      <div class="studio-wrapper w-full flex items-center justify-center">
        <main
          id="certificate"
          data-theme={theme}
          data-level={level}
          class="certificate-sheet rounded-sm flex flex-col justify-between px-10 py-12 sm:px-20 sm:py-16 select-none"
        >
          <div class="paper-texture"></div>
          <div class="frame-outer"></div>
          <div class="frame-inner"></div>
          <div class="corner-tick top-[28px] left-[28px] border-t-2 border-l-2"></div>
          <div class="corner-tick top-[28px] right-[28px] border-t-2 border-r-2"></div>
          <div class="corner-tick bottom-[28px] left-[28px] border-b-2 border-l-2"></div>
          <div class="corner-tick bottom-[28px] right-[28px] border-b-2 border-r-2"></div>

          <header class="relative z-10 flex flex-col items-center text-center pt-1 sm:pt-2">
            <div class="flex items-center gap-2.5 mb-4 sm:mb-5">
              <span class="text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-secondary-theme">
                RUNTIMEENGLISH
              </span>
            </div>
          </header>

          <section class="relative z-10 flex flex-col items-center text-center my-auto py-4">
            <p class="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-secondary-theme mb-3 sm:mb-4">
              CERTIFICATE OF COMPLETION
            </p>
            <h1 class="font-mono-tech text-2xl sm:text-4xl md:text-[42px] font-medium tracking-tight text-primary-theme leading-tight">
              <span class="text-muted-theme font-normal opacity-60 mr-1 sm:mr-2">[</span>English for
              Programmers{' '}
              <span class="level-inline ml-1.5 sm:ml-2 align-middle text-[0.6em] sm:text-[0.65em] font-semibold tracking-[0.16em]">
                · {info.label}
              </span>
              <span class="text-muted-theme font-normal opacity-60 ml-1 sm:ml-2">]</span>
            </h1>
            <div
              class="w-12 h-[1px] divider-line my-5 sm:my-7"
              style={{ backgroundColor: 'var(--level-accent)' }}
            ></div>
            <p class="text-xs sm:text-sm font-normal text-secondary-theme mb-1.5 sm:mb-2">
              Awarded to
            </p>
            <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-primary-theme mb-2.5 sm:mb-3">
              {name}
            </h2>
            <p class="text-xs sm:text-sm font-medium tracking-wide text-secondary-theme">
              Technical English for Developers
            </p>
          </section>

          <footer class="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 items-end pt-2 sm:pt-4 pb-1 sm:pb-2 px-2 sm:px-6">
            <div class="text-left">
              <p class="text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-theme mb-1">
                ISSUED ON
              </p>
              <p class="text-xs sm:text-sm font-medium text-primary-theme">{displayDate}</p>
            </div>
            <div class="hidden sm:flex flex-col items-center justify-center">
              <div class="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-1.5">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  class="w-full h-full seal-svg"
                  stroke-width="1.2"
                >
                  <title>RuntimeEnglish</title>
                  <circle cx="32" cy="32" r="28" stroke-dasharray="2 2" opacity="0.6" />
                  <circle cx="32" cy="32" r="23" />
                  <polyline
                    points="26 26 20 32 26 38"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="38 26 44 32 38 38"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line x1="34" y1="24" x2="30" y2="40" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <span class="font-mono-tech text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-muted-theme">
                {status === 'verified' ? 'VERIFIED' : status === 'issued' ? 'REGISTERED' : 'ISSUED'}
              </span>
            </div>
            <div class="flex items-end justify-end gap-2 sm:gap-3">
              <div class="min-w-0 text-right">
                <p class="text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-theme mb-1">
                  <span class="sm:hidden">ID</span>
                  <span class="hidden sm:inline">CERTIFICATE ID</span>
                </p>
                <p class="font-mono-tech text-[10px] sm:text-sm font-semibold tracking-normal sm:tracking-wider whitespace-nowrap text-primary-theme">
                  {issueId}
                </p>
              </div>
              <div
                class="qr-corner"
                role="img"
                aria-label={`QR para verificar el certificado ${issueId}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
