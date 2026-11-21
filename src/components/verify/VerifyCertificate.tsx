import { Check, Copy, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import {
  type CertificateRecord,
  certificateShareUrl,
  displayCertificateLevel,
  verifyCertificate,
} from '../../lib/certificates'
import { isSupabaseConfigured } from '../../lib/supabase'
import { emitToast } from '../../lib/toast'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; cert: CertificateRecord }

function getIdFromUrl(): string {
  try {
    const p = new URLSearchParams(window.location.search)
    return (p.get('id') || '').trim()
  } catch {
    return ''
  }
}

export default function VerifyCertificate() {
  const [id, setId] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const initial = getIdFromUrl()
    if (initial) {
      setId(initial.toUpperCase())
      void runVerify(initial)
    }
  }, [])

  async function runVerify(value?: string) {
    const code = (value ?? id).trim().toUpperCase()
    if (!code) {
      setState({ status: 'invalid', message: 'Ingresa un ID de certificado.' })
      return
    }
    if (!isSupabaseConfigured() && !import.meta.env.PUBLIC_CERTIFICATE_VERIFY_URL) {
      setState({
        status: 'invalid',
        message: 'La verificación no está configurada todavía en este entorno.',
      })
      return
    }
    setState({ status: 'loading' })
    const res = await verifyCertificate(code)
    if (res.ok && res.certificate) {
      setState({ status: 'valid', cert: res.certificate })
    } else if (res.error === 'not_found') {
      setState({
        status: 'invalid',
        message: 'No se encontró un certificado válido con ese ID en el registro.',
      })
    } else if (res.error === 'not_configured') {
      setState({
        status: 'invalid',
        message: 'La verificación no está configurada (faltan claves/endpoints).',
      })
    } else {
      setState({
        status: 'invalid',
        message: `No se pudo verificar el certificado en este momento. ${res.error || ''}`.trim(),
      })
    }
  }

  const shareUrl = id.trim() ? certificateShareUrl(id) : ''

  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      emitToast('Enlace copiado.', 'success')
    } catch {
      emitToast('No se pudo copiar el enlace.', 'error')
    }
  }

  return (
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="rounded-3xl bg-base-200 p-6 sm:p-8">
        <p class="mono-label">RuntimeEnglish / Verify</p>
        <h1 class="font-pixel mt-2 text-[2.1rem] tracking-tight">Verificar certificado</h1>
        <p class="mt-2 text-sm leading-7 text-base-content/60">
          Comprueba la validez de un certificado oficial de RuntimeEnglish mediante su{' '}
          <span class="font-medium text-base-content/80">Certificate ID</span>.
        </p>

        <form
          class="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            void runVerify()
          }}
        >
          <input
            value={id}
            onInput={(e) => setId((e.currentTarget as HTMLInputElement).value.toUpperCase())}
            placeholder="Ej. EE3DEL"
            class="input input-bordered h-11 flex-1 rounded-xl font-mono tracking-wider"
            aria-label="Certificate ID"
          />
          <button
            type="submit"
            class="btn btn-primary h-11 rounded-xl px-5"
            disabled={state.status === 'loading'}
          >
            {state.status === 'loading' ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        {shareUrl && (
          <div class="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-base-100/50 p-2.5">
            <span class="min-w-0 flex-1 truncate font-mono text-[10px] text-base-content/55">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={() => void copyLink()}
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
              <ExternalLink class="h-3 w-3" /> Abrir
            </a>
          </div>
        )}
      </div>

      {state.status === 'valid' && (
        <div class="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 sm:p-8">
          <div class="flex items-center gap-2 text-emerald-400">
            <ShieldCheck class="h-4 w-4" />
            <p class="text-xs font-semibold uppercase tracking-[0.2em]">Certificado verificado</p>
          </div>
          <h2 class="mt-3 text-2xl font-bold tracking-tight text-base-content">
            {state.cert.name}
          </h2>
          <p class="mt-1 text-sm text-base-content/70">
            English for Programmers · Technical English for Developers
          </p>
          <dl class="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt class="text-[10px] uppercase tracking-[0.18em] text-base-content/45">
                Certificate ID
              </dt>
              <dd class="mt-1 font-mono font-semibold">{state.cert.id}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-[0.18em] text-base-content/45">
                Issued on
              </dt>
              <dd class="mt-1 font-medium">
                {new Date(state.cert.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-[0.18em] text-base-content/45">
                Program / Nivel
              </dt>
              <dd class="mt-1 font-medium">
                {state.cert.program} · {displayCertificateLevel(state.cert.level)} ·{' '}
                {state.cert.status || 'valid'}
              </dd>
            </div>
          </dl>
          {state.cert.user_id && (
            <p class="mt-4 text-[11px] text-emerald-300/80">
              Este certificado está vinculado a una cuenta verificada en RuntimeEnglish.
            </p>
          )}
          <p class="mt-2 text-[11px] text-base-content/50">
            Resultado obtenido del registro verificable de RuntimeEnglish.
          </p>
        </div>
      )}

      {state.status === 'invalid' && (
        <div class="rounded-3xl border border-base-content/10 bg-base-200 p-6 sm:p-8">
          <div class="flex items-center gap-2 text-base-content/60">
            <ShieldAlert class="h-4 w-4" />
            <p class="text-xs font-semibold uppercase tracking-[0.2em]">No verificado</p>
          </div>
          <p class="mt-2 text-sm leading-7 text-base-content/70">{state.message}</p>
        </div>
      )}
    </div>
  )
}
