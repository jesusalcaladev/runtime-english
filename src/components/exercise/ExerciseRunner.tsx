import {
  ArrowLeft,
  ArrowRight,
  Check,
  Headphones,
  Keyboard,
  Lightbulb,
  Mic,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { detectErrorSkills } from '../../lib/errorPatterns'
import {
  canCheckExercise,
  getCorrectAnswerText,
  getUserAnswerText,
  isExerciseAnswerCorrect,
  shuffleIndices,
} from '../../lib/exercise'
import { getUiStage, t, tAction } from '../../lib/i18n'
import { phraseId, progressStore } from '../../lib/progress'
import {
  ensureMicrophonePermission,
  isSpeechRecognitionSupported,
  recognizeOnce,
} from '../../lib/speech'
import type { Exercise } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'
import { ExerciseFeedback } from './runner/ExerciseFeedback'
import { ExerciseFinishedScreen } from './runner/ExerciseFinishedScreen'
import { ExerciseTypeIcon } from './runner/ExerciseTypeIcon'
import {
  burstConfetti,
  exerciseTypeLabel,
  type NextSession,
  type RunnerStatus,
} from './runner/utils'

interface Props {
  sessionId: string
  sessionTitle: string
  exercises: Exercise[]
  next: NextSession | null
}

export default function ExerciseRunner({ sessionId, sessionTitle, exercises, next }: Props) {
  const state = useProgress()
  const stage = getUiStage(state)
  const initialRun = useRef(
    (() => {
      const snapshot = progressStore.getState()
      const wasComplete = Boolean(snapshot.completedSessions[sessionId])
      const solvedIds = wasComplete
        ? []
        : exercises.filter((item) => snapshot.completedExercises[item.id]).map((item) => item.id)
      const firstPending = exercises.findIndex((item) => !snapshot.completedExercises[item.id])
      return {
        wasComplete,
        solved: solvedIds,
        index: wasComplete || firstPending < 0 ? 0 : firstPending,
      }
    })(),
  ).current
  const wasComplete = initialRun.wasComplete
  const [index, setIndex] = useState(initialRun.index)
  const [selected, setSelected] = useState<number | null>(null)
  const [picked, setPicked] = useState<number[]>([])
  const [text, setText] = useState('')
  const [blankValues, setBlankValues] = useState<string[]>([])
  const [dialoguePicked, setDialoguePicked] = useState<number[]>([])
  const [shuffledDialogue, setShuffledDialogue] = useState<number[]>([])
  const [status, setStatus] = useState<RunnerStatus>('idle')
  const [solved, setSolved] = useState<string[]>(initialRun.solved)
  const [finished, setFinished] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<number[]>([])
  const [micState, setMicState] = useState<'idle' | 'listening' | 'done'>('idle')
  const [heardText, setHeardText] = useState('')
  const [micError, setMicError] = useState<string | null>(null)

  const exercise = exercises[index]
  const total = exercises.length
  const progress = Math.round((solved.length / Math.max(total, 1)) * 100)

  useEffect(() => {
    if (exercise?.type === 'builder') setShuffledWords(shuffleIndices(exercise.words.length))
    else setShuffledWords([])
    if (exercise?.type === 'dialogue-order')
      setShuffledDialogue(shuffleIndices(exercise.lines.length))
    else setShuffledDialogue([])
    if (exercise?.type === 'fill-blank') setBlankValues(Array(exercise.blanks.length).fill(''))
    else setBlankValues([])
  }, [exercise?.id, exercise?.type])

  const interaction = useMemo(
    () => ({ selected, picked, text, blankValues, dialoguePicked, heardText }),
    [selected, picked, text, blankValues, dialoguePicked, heardText],
  )

  const isCorrectAnswer = useMemo(
    () => (exercise ? isExerciseAnswerCorrect(exercise, interaction) : false),
    [exercise, interaction],
  )

  const canCheck = useMemo(
    () => (exercise ? canCheckExercise(exercise, interaction) : false),
    [exercise, interaction],
  )

  function resetInteraction() {
    setSelected(null)
    setPicked([])
    setText('')
    setBlankValues(exercise?.type === 'fill-blank' ? Array(exercise.blanks.length).fill('') : [])
    setDialoguePicked([])
    setStatus('idle')
    setAttempted(false)
    setMicState('idle')
    setHeardText('')
    setMicError(null)
    if (exercise?.type === 'builder') setShuffledWords(shuffleIndices(exercise.words.length))
    if (exercise?.type === 'dialogue-order')
      setShuffledDialogue(shuffleIndices(exercise.lines.length))
  }

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= total) return
    setIndex(nextIndex)
    resetInteraction()
  }

  function restart() {
    setIndex(0)
    setSolved([])
    setFinished(false)
    resetInteraction()
  }

  function getUserAnswer(): string {
    return exercise ? getUserAnswerText(exercise, interaction) : ''
  }

  function check() {
    if (!exercise || !canCheck) return
    const correct = isCorrectAnswer
    const userAnswer = getUserAnswer()
    const skills = !correct ? detectErrorSkills(exercise, userAnswer, correctAnswerText) : []
    progressStore.recordExercise(exercise, correct, {
      userAnswer,
      correctAnswer: correctAnswerText,
      skills,
      sessionId,
    })
    setAttempted(true)
    if (correct) {
      setStatus('correct')
      setSolved((current) => (current.includes(exercise.id) ? current : [...current, exercise.id]))
      burstConfetti()
    } else {
      setStatus('incorrect')
    }
  }

  function advance() {
    if (!exercise) return
    const solvedNow = new Set([...solved, exercise.id])
    if (solvedNow.size < total) {
      const nextUnsolved = exercises.findIndex(
        (item, itemIndex) => itemIndex !== index && !solvedNow.has(item.id),
      )
      if (nextUnsolved >= 0) goTo(nextUnsolved)
      return
    }
    progressStore.completeSession(sessionId)
    setFinished(true)
  }

  function retry() {
    setStatus('idle')
    setAttempted(false)
    if (exercise?.type === 'choice') setSelected(null)
    if (exercise?.type === 'builder') {
      setPicked([])
      setShuffledWords(shuffleIndices(exercise.words.length))
    }
    if (
      exercise?.type === 'write' ||
      exercise?.type === 'listen' ||
      exercise?.type === 'fix-error' ||
      exercise?.type === 'roleplay'
    )
      setText('')
    if (exercise?.type === 'speak') {
      setText('')
      setHeardText('')
      setMicState('idle')
      setMicError(null)
    }
    if (exercise?.type === 'fill-blank') setBlankValues(Array(exercise.blanks.length).fill(''))
    if (exercise?.type === 'dialogue-order') {
      setDialoguePicked([])
      setShuffledDialogue(shuffleIndices(exercise.lines.length))
    }
  }

  async function startSpeaking() {
    if (exercise?.type !== 'speak') return
    setMicError(null)
    const permitted = await ensureMicrophonePermission()
    if (!permitted) {
      setMicState('idle')
      setMicError(
        'Activa el permiso de micrófono en la configuración del dispositivo/navegador para practicar con voz.',
      )
      return
    }
    setMicState('listening')
    const res = await recognizeOnce('en-US', 9000)
    setMicState('done')
    if (res.transcript) {
      setHeardText(res.transcript)
      setText(res.transcript)
      setMicError(null)
    } else {
      setHeardText('')
      setMicError(res.error || 'No se pudo reconocer la voz. Intenta de nuevo.')
    }
  }

  useEffect(() => {
    const onRestart = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail
      if (detail?.sessionId === sessionId) restart()
    }
    window.addEventListener('runtimeenglish:restart-session', onRestart)
    return () => window.removeEventListener('runtimeenglish:restart-session', onRestart)
  }, [sessionId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || finished) return
      const target = event.target
      if (
        target instanceof Element &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      )
        return
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        goTo(index - 1)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (status === 'correct') advance()
        else if (index < total - 1) goTo(index + 1)
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (status === 'correct') advance()
        else if (canCheck) check()
        return
      }
      if (exercise?.type === 'choice' && status !== 'correct' && /^[1-9]$/.test(event.key)) {
        const optionIndex = Number(event.key) - 1
        if (optionIndex < exercise.options.length) {
          event.preventDefault()
          setSelected(optionIndex)
          if (status === 'incorrect') {
            setStatus('idle')
            setAttempted(false)
          }
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    exercise,
    index,
    status,
    finished,
    canCheck,
    isCorrectAnswer,
    solved,
    selected,
    picked,
    text,
    blankValues,
    dialoguePicked,
  ])

  if (!exercise) return null

  const correctAnswerText = getCorrectAnswerText(exercise)

  const phraseKey = phraseId(correctAnswerText)
  const phraseEntry = state.phrasebook?.[phraseKey]
  const showPhraseHint = Boolean(
    attempted &&
      phraseEntry &&
      (phraseEntry.notes || phraseEntry.userExample || phraseEntry.tags?.length),
  )
  const detectedSkills =
    attempted && status === 'incorrect'
      ? detectErrorSkills(exercise, getUserAnswer(), correctAnswerText)
      : []

  if (finished) {
    return (
      <ExerciseFinishedScreen
        stage={stage}
        sessionTitle={sessionTitle}
        next={next}
        wasComplete={wasComplete}
        solvedCount={solved.length}
        total={total}
        onRestart={restart}
      />
    )
  }

  const micSupported = isSpeechRecognitionSupported()

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mono-label">{tAction(stage, 'exercise')}</span>
          <span class="font-mono text-[11px] font-medium text-base-content/65">
            {index + 1} / {total}
          </span>
          {state.completedExercises[exercise.id] && (
            <span class="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium text-accent">
              <Check class="h-2.5 w-2.5" /> {tAction(stage, 'alreadySolved')}
            </span>
          )}
        </div>
        <div class="flex items-center gap-1">
          <span class="mr-1 hidden items-center gap-1.5 text-[9px] text-base-content/30 sm:flex">
            <Keyboard class="h-3 w-3" />
            {t(stage, 'shortcuts')}: ← → · Enter · 1–4
          </span>
          <button
            type="button"
            onClick={restart}
            class="flex h-7 w-7 items-center justify-center rounded-full text-base-content/30 transition hover:bg-base-200 hover:text-base-content/60"
            aria-label={tAction(stage, 'restartSession')}
            title={tAction(stage, 'restartSession')}
          >
            <RotateCcw class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-base-content/[0.07]">
          <div
            class="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span class="w-8 text-right font-mono text-[10px] tabular-nums text-base-content/35">
          {progress}%
        </span>
      </div>

      <div
        role="group"
        class="flex flex-wrap items-center gap-1.5"
        aria-label={tAction(stage, 'exercise')}
      >
        {exercises.map((item, itemIndex) => {
          const isSolved = solved.includes(item.id)
          const isCurrent = itemIndex === index
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(itemIndex)}
              class={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] transition ${isCurrent ? 'bg-base-content text-base-100' : isSolved ? 'bg-accent/15 text-accent hover:bg-accent/25' : 'bg-base-200 text-base-content/35 hover:bg-base-300 hover:text-base-content/60'}`}
              aria-label={`${tAction(stage, 'exercise')} ${itemIndex + 1}${isSolved ? ` (${tAction(stage, 'completed')})` : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isSolved && !isCurrent ? <Check class="h-3 w-3" /> : itemIndex + 1}
            </button>
          )
        })}
      </div>

      <div class="rounded-[26px] bg-base-200 p-1.5">
        <div class="rounded-[20px] bg-base-100 p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content/50">
              <ExerciseTypeIcon type={exercise.type} />
            </span>
            <div class="space-y-1.5 pt-0.5">
              <p class="text-[11px] font-medium tracking-normal text-base-content/55">
                {exerciseTypeLabel(exercise, stage)}
              </p>
              <h3 class="text-balance text-[15px] font-medium leading-relaxed text-base-content/85 sm:text-base">
                {exercise.prompt}
              </h3>
              {exercise.type === 'roleplay' && (
                <div class="mt-2 rounded-xl bg-base-200/70 p-3 text-[13px] text-base-content/70 space-y-1">
                  <p>
                    <span class="font-medium">Escenario:</span> {(exercise as any).scenario}
                  </p>
                  <p>
                    <span class="font-medium">Objetivo:</span> {(exercise as any).goal}
                  </p>
                </div>
              )}
            </div>
          </div>

          {exercise.type === 'choice' && (
            <div class="mt-5 space-y-1.5">
              {exercise.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex
                const isRight = status === 'correct' && optionIndex === exercise.answer
                const isWrong = status === 'incorrect' && isSelected
                return (
                  <div
                    key={option}
                    class={`flex items-center gap-1 rounded-xl transition ${isRight ? 'bg-accent/[0.09]' : isWrong ? 'bg-error/[0.08]' : isSelected ? 'bg-base-200' : 'hover:bg-base-200/60'}`}
                  >
                    <button
                      type="button"
                      disabled={status === 'correct'}
                      onClick={() => {
                        setSelected(optionIndex)
                        if (status === 'incorrect') {
                          setStatus('idle')
                          setAttempted(false)
                        }
                      }}
                      class="flex flex-1 items-center gap-3 px-3 py-3 text-left text-sm disabled:cursor-default"
                    >
                      <span
                        class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition ${isRight ? 'bg-accent text-accent-content' : isWrong ? 'bg-error text-error-content' : isSelected ? 'bg-base-content text-base-100' : 'bg-base-200 text-base-content/35'}`}
                      >
                        {isRight ? (
                          <Check class="h-3 w-3" />
                        ) : isWrong ? (
                          <X class="h-3 w-3" />
                        ) : (
                          String.fromCharCode(65 + optionIndex)
                        )}
                      </span>
                      <span
                        class={`flex-1 font-mono text-[13px] sm:text-sm ${status === 'correct' && !isRight ? 'text-base-content/35' : 'text-base-content/85'}`}
                      >
                        {option}
                      </span>
                    </button>
                    <button
                      type="button"
                      data-speak={option}
                      class="mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-content/25 transition hover:bg-base-100 hover:text-base-content/70 hover:scale-[1.03] active:scale-95"
                      aria-label={`Escuchar opción ${String.fromCharCode(65 + optionIndex)}: ${option}`}
                      title="Escuchar opción"
                    >
                      <Volume2 class="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {exercise.type === 'builder' && (
            <div class="mt-5 space-y-4">
              <div class="min-h-[64px] rounded-2xl bg-base-200/70 p-3">
                {picked.length === 0 ? (
                  <p class="px-1 py-2 text-xs text-base-content/30">{tAction(stage, 'tapWords')}</p>
                ) : (
                  <div class="flex flex-wrap gap-1.5">
                    {picked.map((wordIndex, position) => (
                      <button
                        key={`${wordIndex}-${position}`}
                        type="button"
                        disabled={status === 'correct'}
                        onClick={() =>
                          setPicked((current) =>
                            current.filter((_, indexValue) => indexValue !== position),
                          )
                        }
                        class="rounded-lg bg-base-content px-2.5 py-1.5 text-xs font-medium text-base-100 shadow-sm transition hover:opacity-90 disabled:opacity-70"
                      >
                        {exercise.words[wordIndex]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div class="flex flex-wrap gap-1.5">
                {(shuffledWords.length ? shuffledWords : exercise.words.map((_, i) => i)).map(
                  (wordIndex) => {
                    const word = exercise.words[wordIndex]
                    const used = picked.includes(wordIndex)
                    return (
                      <button
                        key={`${word}-${wordIndex}`}
                        type="button"
                        disabled={used || status === 'correct'}
                        onClick={() => setPicked((current) => [...current, wordIndex])}
                        class={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${used ? 'bg-base-content/20 text-base-content/35 ring-1 ring-base-content/10' : 'bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content'}`}
                      >
                        {word}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          )}

          {(exercise.type === 'write' ||
            exercise.type === 'fix-error' ||
            exercise.type === 'roleplay') && (
            <div class="mt-5 space-y-2">
              {exercise.type === 'fix-error' && (
                <div class="rounded-xl bg-warning/10 px-3 py-2 text-sm text-base-content/80">
                  <span class="font-medium">Frase:</span>{' '}
                  <span class="font-mono">{(exercise as any).sentence}</span>
                </div>
              )}
              <textarea
                value={text}
                disabled={status === 'correct'}
                onInput={(event) => setText((event.target as HTMLTextAreaElement).value)}
                rows={exercise.type === 'roleplay' ? 3 : 2}
                placeholder={tAction(stage, 'typeAnswer')}
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
              {(exercise as any).hint && (
                <p class="hidden items-center gap-1.5 px-1 text-[12px] text-base-content/55 sm:flex">
                  <Lightbulb class="h-3 w-3 text-warning/70" />
                  {(exercise as any).hint}
                </p>
              )}
            </div>
          )}

          {exercise.type === 'listen' && (
            <div class="mt-5 space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-speak={(exercise as any).audioText}
                  class="btn btn-sm h-10 cursor-pointer gap-2 rounded-xl bg-accent/10 pr-4 text-accent transition hover:bg-accent/20 hover:brightness-105 active:scale-[0.99]"
                  aria-label="Escuchar audio del ejercicio"
                >
                  <Headphones class="h-4 w-4" aria-hidden="true" /> Escuchar audio
                </button>
                <span class="hidden text-[11px] text-base-content/40 sm:inline">
                  Pulsa para oír la frase. Puedes repetirla o cancelar reproduciendo otra.
                </span>
              </div>
              <textarea
                value={text}
                disabled={status === 'correct'}
                onInput={(event) => setText((event.target as HTMLTextAreaElement).value)}
                rows={2}
                placeholder="Escribe lo que escuchaste…"
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
              {(exercise as any).hint && (
                <p class="hidden items-center gap-1.5 px-1 text-[12px] text-base-content/55 sm:flex">
                  <Lightbulb class="h-3 w-3 text-warning/70" />
                  {(exercise as any).hint}
                </p>
              )}
            </div>
          )}

          {exercise.type === 'speak' && (
            <div class="mt-5 space-y-3">
              <div class="rounded-2xl bg-base-200/70 p-4">
                <p class="text-[11px] font-medium text-base-content/45">Di en inglés:</p>
                <p class="mt-1 font-mono text-[15px] text-base-content/85">{exercise.answer}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-speak={exercise.answer}
                    class="btn btn-sm h-10 cursor-pointer gap-2 rounded-xl bg-base-100 transition hover:bg-base-200 active:scale-[0.99]"
                    aria-label={`Escuchar modelo: ${exercise.answer}`}
                  >
                    <Volume2 class="h-4 w-4" aria-hidden="true" /> Escuchar modelo
                  </button>
                  {micSupported ? (
                    <button
                      type="button"
                      onClick={startSpeaking}
                      disabled={micState === 'listening' || status === 'correct'}
                      aria-pressed={micState === 'listening'}
                      aria-busy={micState === 'listening'}
                      aria-label={
                        micState === 'listening'
                          ? 'Escuchando respuesta por micrófono'
                          : 'Practicar pronunciación con micrófono'
                      }
                      class={`btn btn-sm h-10 gap-2 rounded-xl ${micState === 'listening' ? 'bg-error/15 text-error' : 'bg-accent/15 text-accent'}`}
                    >
                      <Mic class="h-4 w-4" aria-hidden="true" />{' '}
                      {micState === 'listening' ? 'Escuchando…' : 'Practicar con micrófono'}
                    </button>
                  ) : (
                    <span class="hidden self-center text-[11px] text-base-content/40 sm:inline">
                      Reconocimiento de voz no disponible en este navegador.
                    </span>
                  )}
                </div>
              </div>
              <div aria-live="polite" class="space-y-1">
                {micState === 'listening' && (
                  <p class="text-[12px] text-accent/90">Escuchando… habla ahora.</p>
                )}
                {heardText && (
                  <p class="text-[12px] text-base-content/60">
                    Detectado: <span class="font-mono text-base-content/80">{heardText}</span>
                  </p>
                )}
                {micError && (
                  <p class="text-[12px] text-error/80" role="status">
                    {micError}
                  </p>
                )}
                {!micSupported && (
                  <p class="hidden text-[12px] text-base-content/45 sm:block">
                    Tu navegador no soporta reconocimiento de voz. Puedes escribir tu respuesta o
                    usar un navegador compatible (Chrome/Edge) en HTTPS/localhost.
                  </p>
                )}
              </div>
              <textarea
                value={text}
                disabled={status === 'correct'}
                onInput={(event) => setText((event.target as HTMLTextAreaElement).value)}
                rows={2}
                placeholder="O escribe lo que dirías…"
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
              {(exercise as any).hint && (
                <p class="hidden items-center gap-1.5 px-1 text-[12px] text-base-content/55 sm:flex">
                  <Lightbulb class="h-3 w-3 text-warning/70" />
                  {(exercise as any).hint}
                </p>
              )}
            </div>
          )}

          {exercise.type === 'fill-blank' && (
            <div class="mt-5 space-y-3">
              <div class="rounded-2xl bg-base-200/70 p-4">
                <p class="mb-3 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
                  Completa {exercise.blanks.length}{' '}
                  {exercise.blanks.length === 1 ? 'espacio' : 'espacios'}
                </p>
                <div class="font-mono text-[15px] leading-8 text-base-content/80">
                  {(exercise as any).template
                    .split('___')
                    .map((part: string, i: number, arr: string[]) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span class="mx-1 inline-flex items-center gap-1 align-middle">
                            <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/15 px-1 text-[10px] font-semibold text-accent">
                              {i + 1}
                            </span>
                            <input
                              type="text"
                              value={blankValues[i] || ''}
                              disabled={status === 'correct'}
                              placeholder={`Espacio ${i + 1}`}
                              autoComplete="off"
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellcheck={false}
                              size={Math.max(8, Math.min(22, (blankValues[i]?.length || 0) + 2))}
                              onInput={(e) => {
                                const v = (e.target as HTMLInputElement).value
                                setBlankValues((prev) => {
                                  const n = [...prev]
                                  n[i] = v
                                  return n
                                })
                              }}
                              class={`inline-block rounded-xl border bg-base-100 px-3 py-1.5 text-center font-mono text-sm text-base-content outline-none transition placeholder:text-base-content/25 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 ${
                                status === 'incorrect' && attempted
                                  ? 'border-error/30'
                                  : 'border-base-content/10'
                              } disabled:opacity-70`}
                            />
                          </span>
                        )}
                      </span>
                    ))}
                </div>
                {exercise.blanks.length > 1 && (
                  <div class="mt-3 flex flex-wrap gap-2">
                    {exercise.blanks.map((_, i) => (
                      <span
                        key={i}
                        class={`rounded-lg px-2.5 py-1 text-[11px] ${
                          (blankValues[i] || '').trim()
                            ? 'bg-accent/10 text-accent'
                            : 'bg-base-100/70 text-base-content/40'
                        }`}
                      >
                        {i + 1}. {(blankValues[i] || '').trim() ? blankValues[i] : 'pendiente'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {(exercise as any).hint && (
                <p class="flex items-center gap-1.5 px-1 text-[12px] text-base-content/55">
                  <Lightbulb class="h-3 w-3 text-warning/70" />
                  {(exercise as any).hint}
                </p>
              )}
            </div>
          )}

          {exercise.type === 'dialogue-order' && (
            <div class="mt-5 space-y-4">
              <div class="min-h-[64px] rounded-2xl bg-base-200/70 p-3 space-y-1.5">
                {dialoguePicked.length === 0 ? (
                  <p class="px-1 py-2 text-xs text-base-content/30">
                    Toca las líneas en el orden correcto.
                  </p>
                ) : (
                  dialoguePicked.map((lineIndex, position) => (
                    <button
                      key={`${lineIndex}-${position}`}
                      type="button"
                      disabled={status === 'correct'}
                      onClick={() =>
                        setDialoguePicked((cur) => cur.filter((_, idx) => idx !== position))
                      }
                      class="block w-full rounded-lg bg-base-content px-3 py-2 text-left text-xs font-medium text-base-100 hover:opacity-90 disabled:opacity-70"
                    >
                      {position + 1}. {exercise.lines[lineIndex]}
                    </button>
                  ))
                )}
              </div>
              <div class="space-y-1.5">
                {(shuffledDialogue.length ? shuffledDialogue : exercise.lines.map((_, i) => i)).map(
                  (lineIndex) => {
                    const used = dialoguePicked.includes(lineIndex)
                    return (
                      <button
                        key={lineIndex}
                        type="button"
                        disabled={used || status === 'correct'}
                        onClick={() => setDialoguePicked((cur) => [...cur, lineIndex])}
                        class={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${used ? 'bg-base-content/20 text-base-content/35 ring-1 ring-base-content/10' : 'bg-base-200 text-base-content/75 hover:bg-base-300'}`}
                      >
                        {exercise.lines[lineIndex]}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          )}

          {attempted && (
            <ExerciseFeedback
              stage={stage}
              status={status}
              correctAnswerText={correctAnswerText}
              explanation={exercise.explanation}
              detectedSkills={detectedSkills}
              showPhraseHint={showPhraseHint}
              phraseEntry={phraseEntry}
            />
          )}
        </div>

        <div class="mt-1 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <p class="text-[10px] text-base-content/30">
            {exercise.type === 'builder'
              ? stage === 'es'
                ? `${picked.length} palabra${picked.length === 1 ? '' : 's'} seleccionada${picked.length === 1 ? '' : 's'}`
                : `${picked.length} ${tAction(stage, 'wordsSelected')}`
              : tAction(stage, 'noPenalty')}
          </p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl px-2.5 text-base-content/45 disabled:opacity-30"
              aria-label={tAction(stage, 'previous')}
            >
              <ArrowLeft class="h-3.5 w-3.5" />
              <span class="hidden sm:inline">{tAction(stage, 'previous')}</span>
            </button>
            {status === 'incorrect' && (
              <button
                type="button"
                onClick={retry}
                class="btn btn-ghost btn-sm h-9 gap-1.5 rounded-xl px-3 text-base-content/55"
              >
                <RotateCcw class="h-3.5 w-3.5" />
                {tAction(stage, 'retry')}
              </button>
            )}
            {status === 'correct' ? (
              <button
                type="button"
                onClick={advance}
                class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-4"
              >
                {tAction(stage, solved.length >= total ? 'seeResult' : 'next')}
                <ArrowRight class="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={check}
                disabled={!canCheck}
                class="btn btn-primary btn-sm h-9 gap-1.5 rounded-xl px-4 disabled:opacity-30"
              >
                {tAction(stage, 'check')}
                <Check class="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
