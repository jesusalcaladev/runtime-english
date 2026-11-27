import { Check, Download, Loader2, Pause, Sparkles, Volume2 } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { useKokoroStatus } from '../../hooks/useKokoroStatus'
import { useUiStage } from '../../hooks/useUiStage'
import { tAction } from '../../lib/i18n'
import { progressStore } from '../../lib/progress'
import {
  getPiperStatus,
  getWebVoices,
  kokoroIsCached,
  loadKokoro,
  loadPiper,
  maybeWarmKokoroInBackground,
  previewVoice,
  stopSpeech,
  stopTts,
  subscribePiperStatus,
  warmSpeechEngine,
} from '../../lib/speech'
import { emitToast } from '../../lib/toast'
import { useProgress } from '../../lib/useProgress'

const PREVIEW_TEXT = 'The build is green. Let us review the pull request before we deploy.'
const RATES = [0.6, 0.75, 0.85, 1, 1.1, 1.25, 1.5, 1.75]

export default function TtsStudio() {
  const state = useProgress()
  const stage = useUiStage()
  const kokoro = useKokoroStatus()
  const [voices, setVoices] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [piperStatus, setPiperStatus] = useState(getPiperStatus())
  const selected = state.settings.ttsVoiceName ?? ''
  const pitch = state.settings.ttsPitch ?? 1
  const rate = state.settings.ttsRate ?? 1
  const enabled = state.settings.ttsEnabled !== false

  useEffect(() => {
    let active = true
    void getWebVoices(2000).then((list) => {
      if (!active) return
      const english = list
        .filter((voice) => voice.lang.toLowerCase().startsWith('en'))
        .map((voice) => voice.name)
      setVoices([...new Set(english)].sort())
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => subscribePiperStatus(setPiperStatus), [])

  function setRate(value: number) {
    progressStore.setSettings({ ttsRate: value })
    warmSpeechEngine()
  }

  function setAccent(value: 'en-US' | 'en-GB') {
    progressStore.setSettings({ speechLanguage: value })
    warmSpeechEngine()
  }

  function toggleEnabled() {
    if (enabled) stopSpeech()
    progressStore.setSettings({ ttsEnabled: !enabled })
  }

  async function preview(name = selected) {
    setPreviewing(true)
    try {
      const played = await previewVoice(PREVIEW_TEXT, name || undefined)
      if (!played) {
        emitToast(
          'No se pudo reproducir la muestra. Prueba otro motor en «Pronunciación avanzada».',
          'error',
        )
      }
    } catch {
      emitToast('No se pudo reproducir la muestra de voz.', 'error')
    } finally {
      setPreviewing(false)
    }
  }

  function selectEasyMode() {
    progressStore.setSettings({
      ttsEngine: 'google',
      ttsRate: 1,
      ttsPitch: 1,
      ttsVoiceName: '',
      ttsEnabled: true,
    })
    void preview('')
  }

  return (
    <div class="rounded-2xl bg-base-100/45 p-4">
      <div class="flex items-center gap-2">
        <Volume2 class="h-4 w-4 text-base-content/50" />
        <h3 class="text-sm font-medium">{tAction(stage, 'pronunciation')}</h3>
      </div>

      <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-base-100/50 p-3.5">
        <div>
          <p class="text-xs font-medium">{tAction(stage, 'voiceEverywhere')}</p>
          <p class="mt-1 text-[11px] leading-relaxed text-base-content/60">
            {tAction(stage, 'voiceEverywhereHint')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={tAction(stage, 'toggleVoice')}
          onClick={toggleEnabled}
          class={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-accent' : 'bg-base-300'}`}
        >
          <span
            class={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`}
          />
        </button>
      </div>

      <div class="mt-3 space-y-3 rounded-xl bg-base-100/50 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="flex items-center gap-1.5 text-xs font-medium text-base-content/80">
              <Sparkles class="h-3.5 w-3.5 text-accent" /> {tAction(stage, 'ttsEasyMode')}
            </p>
            <p class="mt-0.5 text-[11px] text-base-content/45">{tAction(stage, 'ttsEasyHint')}</p>
          </div>
          <button
            type="button"
            onClick={selectEasyMode}
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent/12 px-3 text-[11px] font-medium text-accent transition hover:bg-accent/20"
          >
            <Check class="h-3.5 w-3.5" /> {tAction(stage, 'ttsEasyMode')}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-medium text-base-content/55">
            {tAction(stage, 'speed')}
          </span>
          {RATES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRate(value)}
              class={`rounded-full px-2.5 py-1.5 font-mono text-[10px] transition ${Math.abs(rate - value) < 0.01 ? 'bg-base-content text-base-100' : 'bg-base-100/70 text-base-content/45 hover:text-base-content'}`}
            >
              {value}×
            </button>
          ))}
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-medium text-base-content/55">
            {tAction(stage, 'accent')}
          </span>
          {(
            [
              { value: 'en-US', label: 'Americano (en-US)' },
              { value: 'en-GB', label: 'Británico (en-GB)' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={(state.settings.speechLanguage ?? 'en-US') === option.value}
              onClick={() => setAccent(option.value)}
              class={`rounded-full px-2.5 py-1.5 font-mono text-[10px] transition ${(state.settings.speechLanguage ?? 'en-US') === option.value ? 'bg-base-content text-base-100' : 'bg-base-100/70 text-base-content/45 hover:text-base-content'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {voices.length > 0 && (
          <label class="block space-y-1.5">
            <span class="text-[11px] font-medium text-base-content/55">
              {tAction(stage, 'ttsVoice')}
            </span>
            <select
              value={selected}
              onChange={(event) => {
                const name = (event.target as HTMLSelectElement).value
                progressStore.setSettings({ ttsVoiceName: name })
              }}
              class="w-full rounded-xl bg-base-100/70 px-3 py-2 text-[12px] text-base-content outline-none ring-1 ring-base-content/10 focus:ring-accent/40"
            >
              <option value="">Automática (mejor voz en inglés)</option>
              {voices.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label class="block space-y-1.5">
          <span class="flex items-center justify-between text-[11px] font-medium text-base-content/55">
            {tAction(stage, 'ttsPitch')}
            <span class="font-mono text-accent">{pitch.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={pitch}
            onInput={(event) => {
              const value = Number((event.target as HTMLInputElement).value)
              progressStore.setSettings({ ttsPitch: value })
            }}
            class="w-full accent-accent"
          />
        </label>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void preview()}
            disabled={previewing || !enabled}
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100 px-3 text-[11px] text-base-content/65 transition hover:text-base-content disabled:opacity-40"
          >
            <Volume2 class="h-3.5 w-3.5" /> {tAction(stage, 'ttsPreview')}
          </button>
          <button
            type="button"
            onClick={() => void stopTts()}
            class="inline-flex h-8 items-center gap-1.5 rounded-full bg-base-100 px-3 text-[11px] text-base-content/55 transition hover:text-base-content"
          >
            <Pause class="h-3.5 w-3.5" /> {tAction(stage, 'ttsStop')}
          </button>
          <span class="text-[10px] text-base-content/35">{tAction(stage, 'ttsVoiceHint')}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        aria-expanded={showAdvanced}
        class="mt-3 text-[11px] text-base-content/45 hover:text-accent"
      >
        {showAdvanced ? '−' : '+'} {tAction(stage, 'advancedVoice')}
      </button>

      <div class="mt-3 rounded-xl bg-base-100/50 p-3.5">
        {showAdvanced && (
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <Sparkles class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p class="text-xs font-medium">Voz HQ (Kokoro)</p>
                <p class="mt-1 text-[11px] leading-relaxed text-base-content/55">
                  Voz neural local (descarga única, disponible offline tras caché).
                </p>
              </div>
            </div>
            <span
              class={`rounded-full px-2.5 py-1 font-mono text-[9px] ${kokoro.state === 'ready' ? 'bg-success/15 text-success' : kokoro.state === 'loading' ? 'bg-accent/15 text-accent' : kokoro.state === 'error' ? 'bg-error/15 text-error' : kokoroIsCached() ? 'bg-accent/10 text-accent' : 'bg-base-100/70 text-base-content/45'}`}
            >
              {kokoro.state === 'ready'
                ? 'Lista'
                : kokoro.state === 'loading'
                  ? kokoroIsCached()
                    ? 'Cargando caché'
                    : 'Descargando'
                  : kokoro.state === 'error'
                    ? 'Error'
                    : kokoroIsCached()
                      ? 'En caché'
                      : 'No descargada'}
            </span>
          </div>
        )}

        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              { value: 'google' as const, label: 'Google', desc: 'Online gratis, al instante' },
              { value: 'system' as const, label: 'Sistema', desc: 'Voz del dispositivo' },
              { value: 'kokoro' as const, label: 'HQ Kokoro', desc: 'Neural local' },
              { value: 'piper' as const, label: 'Piper', desc: 'Rápida y natural' },
            ] as const
          ).map((option) => {
            const active = (state.settings.ttsEngine ?? 'google') === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  progressStore.setSettings({ ttsEngine: option.value })
                  if (option.value === 'kokoro') {
                    if (kokoro.state === 'idle' || kokoro.state === 'error') void loadKokoro()
                    else maybeWarmKokoroInBackground()
                  }
                  if (option.value === 'piper' && piperStatus.state === 'idle') void loadPiper()
                }}
                class={`rounded-xl p-3 text-left transition ${active ? 'bg-base-100' : 'bg-base-100/40 hover:bg-base-100/70'}`}
              >
                <span class="flex items-center justify-between text-[11px] font-medium">
                  {option.label}
                  <span
                    class={`flex h-4 w-4 items-center justify-center rounded-full ${active ? 'bg-accent text-accent-content' : 'bg-base-300'}`}
                  >
                    {active && <Check class="h-2.5 w-2.5" />}
                  </span>
                </span>
                <p class="mt-1 text-[10px] text-base-content/40">{option.desc}</p>
              </button>
            )
          })}
        </div>

        <p class="mt-2 text-[10px] leading-relaxed text-base-content/45">
          Motor activo:{' '}
          <span class="font-mono text-accent">
            {state.settings.ttsEngine === 'google'
              ? 'Google'
              : state.settings.ttsEngine === 'kokoro'
                ? 'HQ Kokoro'
                : state.settings.ttsEngine === 'piper'
                  ? 'Piper'
                  : 'Sistema'}
          </span>
          . Las líneas siguientes de cada conversación se preparan en segundo plano mientras suena
          la actual.
        </p>

        {showAdvanced && (state.settings.ttsEngine === 'kokoro' || kokoro.state !== 'idle') && (
          <div class="mt-3 rounded-xl bg-base-100/60 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-[11px] text-base-content/60">{kokoro.message}</p>
              {kokoro.state === 'loading' && (
                <span class="flex items-center gap-1.5 font-mono text-[10px] text-accent">
                  <Loader2 class="h-3 w-3 animate-spin" /> {kokoro.progress}%
                </span>
              )}
            </div>
            {kokoro.state === 'loading' && (
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-base-content/[0.08]">
                <div
                  class="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.max(2, kokoro.progress)}%` }}
                />
              </div>
            )}
            {kokoro.state === 'error' && kokoro.error && (
              <p class="mt-1.5 text-[10px] leading-relaxed text-error/80">{kokoro.error}</p>
            )}
            <div class="mt-2 flex flex-wrap gap-2">
              {(kokoro.state === 'idle' || kokoro.state === 'error') && (
                <button
                  type="button"
                  onClick={() => void loadKokoro()}
                  class="flex items-center gap-1.5 rounded-full bg-base-content px-3 py-1.5 text-[10px] font-medium text-base-100"
                >
                  <Download class="h-3 w-3" />
                  {kokoro.state === 'error'
                    ? 'Reintentar'
                    : kokoroIsCached()
                      ? 'Cargar voz HQ (caché)'
                      : 'Descargar voz HQ'}
                </button>
              )}
            </div>
          </div>
        )}

        {showAdvanced && (state.settings.ttsEngine === 'piper' || piperStatus.state !== 'idle') && (
          <div class="mt-3 rounded-xl bg-base-100/60 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-[11px] text-base-content/60">{piperStatus.message}</p>
              {piperStatus.state === 'loading' && (
                <span class="flex items-center gap-1.5 font-mono text-[10px] text-accent">
                  <Loader2 class="h-3 w-3 animate-spin" />
                  {tAction(stage, 'loading')}
                </span>
              )}
            </div>
            {piperStatus.state === 'error' && (
              <button
                type="button"
                onClick={() => void loadPiper()}
                class="mt-2 rounded-full bg-base-content px-3 py-1.5 text-[10px] font-medium text-base-100"
              >
                {tAction(stage, 'retry')}
              </button>
            )}
            <p class="mt-2 text-[10px] leading-relaxed text-base-content/40">
              {tAction(stage, 'piperHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
