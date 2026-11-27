import {
  ArrowLeft,
  ArrowRight,
  Check,
  Headphones,
  Keyboard,
  Lightbulb,
  Mic,
  RotateCcw,
  Settings,
  Volume2,
  X,
} from 'lucide-preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { openAppSettings } from '../../lib/appSettings'
import { isNativeAndroid } from '../../lib/appUpdate'
import { getLevelStats, isLevelComplete } from '../../lib/certificateLevels'
import { detectErrorSkills } from '../../lib/errorPatterns'
import {
  canCheckExercise,
  getCorrectAnswerText,
  getUserAnswerText,
  isExerciseAnswerCorrect,
  orderExercises,
  shuffleIndices,
} from '../../lib/exercise'
import { getUiStage, t, tAction } from '../../lib/i18n'
import { phraseId, progressStore } from '../../lib/progress'
import {
  ensureMicrophonePermission,
  getSpeechLanguage,
  isMicLevelMeterSupported,
  isSpeechRecognitionSupported,
  pickBestAlternative,
  recognizeOnce,
  releaseMicStream,
  speechMatchScore,
  startMicLevelMeter,
  stopSpeechRecognition,
  type WordDiff,
  wordDiff,
} from '../../lib/speech'
import type { Exercise, Level } from '../../lib/types'
import { useProgress } from '../../lib/useProgress'
import Mascot, { type MascotMood } from '../ui/Mascot'
import DialogueBranchInput from './runner/DialogueBranchInput'
import { ExerciseFeedback } from './runner/ExerciseFeedback'
import { ExerciseFinishedScreen } from './runner/ExerciseFinishedScreen'
import { ExerciseTypeIcon } from './runner/ExerciseTypeIcon'
import MatchInput from './runner/MatchInput'
import MultiChoiceInput from './runner/MultiChoiceInput'
import ShadowInput from './runner/ShadowInput'
import {
  burstConfetti,
  exerciseTypeLabel,
  type NextSession,
  type RunnerStatus,
} from './runner/utils'
import WordDiffView from './runner/WordDiffView'

interface Props {
  sessionId: string
  sessionTitle: string
  exercises: Exercise[]
  next: NextSession | null
  level?: Level
}

function micTimeoutForText(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.min(16_000, Math.max(8_000, 3_500 + words * 1_100))
}

export default function ExerciseRunner({
  sessionId,
  sessionTitle,
  exercises: rawExercises,
  next,
  level,
}: Props) {
  const exercises = useMemo(() => orderExercises(rawExercises), [rawExercises])
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
  const [multiPicked, setMultiPicked] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [dialogueBranchPicked, setDialogueBranchPicked] = useState<number[]>([])
  const [status, setStatus] = useState<RunnerStatus>('idle')
  const [solved, setSolved] = useState<string[]>(initialRun.solved)
  const [finished, setFinished] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<number[]>([])
  const [micState, setMicState] = useState<'idle' | 'listening' | 'done'>('idle')
  const [heardText, setHeardText] = useState('')
  const [heardDiff, setHeardDiff] = useState<WordDiff | null>(null)
  const [liveText, setLiveText] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const [speechWpm, setSpeechWpm] = useState<number | null>(null)
  const micRunRef = useRef(0)
  const runAttemptsRef = useRef(0)
  // Mistakes are local to this run: a retry after a miss is "Hard", but a
  // correct answer in a later review is "Good", not a lifetime penalty.
  const mistakesInRunRef = useRef<Record<string, number>>({})
  const firstAttemptRef = useRef<Record<string, boolean>>({})
  const stopMeterRef = useRef<(() => void) | null>(null)
  const micRetryTimerRef = useRef<number | null>(null)

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
    () => ({
      selected,
      picked,
      text,
      blankValues,
      dialoguePicked,
      heardText,
      multiPicked,
      matchedPairs,
      dialogueBranchPicked,
    }),
    [
      selected,
      picked,
      text,
      blankValues,
      dialoguePicked,
      heardText,
      multiPicked,
      matchedPairs,
      dialogueBranchPicked,
    ],
  )

  const isCorrectAnswer = useMemo(
    () => (exercise ? isExerciseAnswerCorrect(exercise, interaction) : false),
    [exercise, interaction],
  )

  const canCheck = useMemo(
    () => (exercise ? canCheckExercise(exercise, interaction) : false),
    [exercise, interaction],
  )

  const speakScore = useMemo(() => {
    if ((exercise?.type !== 'speak' && exercise?.type !== 'shadow') || !heardText) return null
    return speechMatchScore(exercise.answer, heardText)
  }, [exercise, heardText])

  const listenScore = useMemo(() => {
    if (exercise?.type !== 'listen' || !attempted || !text.trim()) return null
    return speechMatchScore(exercise.answer, text)
  }, [exercise, attempted, text])

  function resetInteraction() {
    setSelected(null)
    setPicked([])
    setText('')
    setBlankValues(exercise?.type === 'fill-blank' ? Array(exercise.blanks.length).fill('') : [])
    setDialoguePicked([])
    setMultiPicked([])
    setMatchedPairs([])
    setDialogueBranchPicked([])
    setStatus('idle')
    setAttempted(false)
    setShowHint(false)
    micRunRef.current += 1
    stopSpeechRecognition()
    stopMicMeter()
    setMicState('idle')
    setHeardText('')
    setHeardDiff(null)
    setLiveText('')
    setMicError(null)
    setSpeechWpm(null)
    if (exercise?.type === 'builder') setShuffledWords(shuffleIndices(exercise.words.length))
    if (exercise?.type === 'dialogue-order')
      setShuffledDialogue(shuffleIndices(exercise.lines.length))
  }

  function clearIncorrectStatus() {
    if (status === 'incorrect') {
      setStatus('idle')
      setAttempted(false)
    }
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
    runAttemptsRef.current = 0
    mistakesInRunRef.current = {}
    firstAttemptRef.current = {}
    resetInteraction()
  }

  function getUserAnswer(): string {
    return exercise ? getUserAnswerText(exercise, interaction) : ''
  }

  function check() {
    if (!exercise || !canCheck) return
    runAttemptsRef.current += 1
    const correct = isCorrectAnswer
    const userAnswer = getUserAnswer()
    const skills = !correct ? detectErrorSkills(exercise, userAnswer, correctAnswerText) : []
    const mistakes = mistakesInRunRef.current[exercise.id] ?? 0
    if (!(exercise.id in firstAttemptRef.current)) firstAttemptRef.current[exercise.id] = correct
    if (!correct) mistakesInRunRef.current[exercise.id] = mistakes + 1
    // Only grade the SRS card when the exercise is resolved. A wrong attempt
    // that will be retried right away records the error/retention data but
    // does not burn an FSRS "Again" grade — retrying really has no penalty
    // beyond the single "Hard" grade once it is finally solved.
    progressStore.recordExercise(exercise, correct, {
      userAnswer,
      correctAnswer: correctAnswerText,
      skills,
      sessionId,
      struggled: correct && mistakes > 0,
      skipSrs: !correct,
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
    if (exercise?.type === 'speak' || exercise?.type === 'shadow') {
      micRunRef.current += 1
      stopSpeechRecognition()
      stopMicMeter()
      setText('')
      setHeardText('')
      setHeardDiff(null)
      setLiveText('')
      setMicState('idle')
      setMicError(null)
      setSpeechWpm(null)
    }
    if (exercise?.type === 'fill-blank') setBlankValues(Array(exercise.blanks.length).fill(''))
    if (exercise?.type === 'dialogue-order') {
      setDialoguePicked([])
      setShuffledDialogue(shuffleIndices(exercise.lines.length))
    }
    if (exercise?.type === 'multi-choice') setMultiPicked([])
    if (exercise?.type === 'match') setMatchedPairs([])
    if (exercise?.type === 'dialogue-branch') setDialogueBranchPicked([])
  }

  function stopMicMeter() {
    stopMeterRef.current?.()
    stopMeterRef.current = null
    setMicLevel(0)
  }

  function shouldRetryMic(error?: string): boolean {
    return Boolean(error && /No se detectó voz|Tiempo de espera/.test(error))
  }

  async function startSpeaking() {
    if (exercise?.type !== 'speak' && exercise?.type !== 'shadow') return
    const run = ++micRunRef.current
    setMicError(null)
    setLiveText('')
    setHeardDiff(null)
    setMicLevel(0)
    setSpeechWpm(null)
    const permitted = await ensureMicrophonePermission()
    if (run !== micRunRef.current) return
    if (!permitted) {
      setMicState('idle')
      setMicError(
        'Activa el permiso de micrófono en la configuración del dispositivo/navegador para practicar con voz.',
      )
      return
    }

    const language = getSpeechLanguage()
    const timeoutMs = micTimeoutForText(exercise.answer)
    const listen = () =>
      recognizeOnce(language, timeoutMs, (partial) => {
        if (run === micRunRef.current) setLiveText(partial)
      })

    setMicState('listening')
    const stopMeter = await startMicLevelMeter((level) => {
      if (run === micRunRef.current) setMicLevel(level)
    })
    if (run !== micRunRef.current) {
      stopMeter()
      return
    }
    stopMeterRef.current = stopMeter

    let res = await listen()
    if (run !== micRunRef.current) return
    if (!res.transcript && shouldRetryMic(res.error)) {
      // A silence/timeout often means the user started late. Give them one
      // guided retry with a visible countdown and a real cancel window.
      stopMicMeter()
      setMicState('idle')
      setLiveText('')
      const ready = await new Promise<boolean>((resolve) => {
        let left = 3
        const tick = () => {
          if (run !== micRunRef.current) return resolve(false)
          setMicError(`No te escuché. Reintentando en ${left}…`)
          if (left <= 0) return resolve(true)
          left -= 1
          micRetryTimerRef.current = window.setTimeout(tick, 650)
        }
        tick()
      })
      micRetryTimerRef.current = null
      if (!ready || run !== micRunRef.current) return
      setMicError(null)
      setMicState('listening')
      const retryMeter = await startMicLevelMeter((level) => {
        if (run === micRunRef.current) setMicLevel(level)
      })
      if (run !== micRunRef.current) {
        retryMeter()
        return
      }
      stopMeterRef.current = retryMeter
      res = await listen()
      if (run !== micRunRef.current) return
    }

    stopMicMeter()
    setMicState('done')
    setLiveText('')
    if (res.transcript) {
      // Pick the candidate that best matches the phrase under practice instead
      // of trusting engine confidence, which is often 0 on mobile browsers.
      const candidates = [exercise.answer, ...(exercise.accept ?? [])]
      const pool = res.alternatives?.length ? res.alternatives : [res.transcript]
      const chosen = pickBestAlternative(candidates, pool)
      // Measure only the time the learner was actually speaking. Including the
      // permission prompt, recognizer startup and trailing silence produced a
      // misleadingly low rate (especially on the first attempt).
      const words = chosen.trim().split(/\s+/).filter(Boolean).length
      const durationMs = res.speechDurationMs
      setSpeechWpm(
        durationMs && durationMs >= 800 ? Math.round((words / durationMs) * 60_000) : null,
      )
      setHeardText(chosen)
      setText(chosen)
      setHeardDiff(wordDiff(exercise.answer, chosen))
      setMicError(null)
    } else {
      setHeardText('')
      setHeardDiff(null)
      setMicError(res.error || 'No se pudo reconocer la voz. Intenta de nuevo.')
    }
  }

  function cancelSpeaking() {
    micRunRef.current += 1
    if (micRetryTimerRef.current !== null) window.clearTimeout(micRetryTimerRef.current)
    micRetryTimerRef.current = null
    stopSpeechRecognition()
    stopMicMeter()
    setMicState('idle')
    setLiveText('')
    setMicError(null)
  }

  // Stop listening when leaving the exercise or the screen, so the mic never stays open.
  useEffect(() => {
    return () => {
      micRunRef.current += 1
      if (micRetryTimerRef.current !== null) window.clearTimeout(micRetryTimerRef.current)
      micRetryTimerRef.current = null
      stopSpeechRecognition()
      stopMicMeter()
      releaseMicStream()
    }
  }, [exercise?.id])

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
      if (event.key === 'h' || event.key === 'H') {
        event.preventDefault()
        setShowHint((value) => !value)
        return
      }
      if (status === 'correct' || !/^[1-9]$/.test(event.key)) return
      const optionIndex = Number(event.key) - 1
      if (exercise?.type === 'choice' && optionIndex < exercise.options.length) {
        event.preventDefault()
        setSelected(optionIndex)
        clearIncorrectStatus()
      }
      if (exercise?.type === 'multi-choice' && optionIndex < exercise.options.length) {
        event.preventDefault()
        setMultiPicked((current) =>
          current.includes(optionIndex)
            ? current.filter((value) => value !== optionIndex)
            : [...current, optionIndex],
        )
        clearIncorrectStatus()
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
    multiPicked,
    clearIncorrectStatus,
  ])

  if (!exercise) return null

  const hint = 'hint' in exercise ? exercise.hint : undefined
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

  // Resumen de aprendizaje al terminar la sesión.
  const baseLevelStats = level ? getLevelStats(level, state) : null
  const levelStats = baseLevelStats
    ? {
        ...baseLevelStats,
        doneSessions: Math.min(
          baseLevelStats.sessions,
          baseLevelStats.doneSessions + (wasComplete ? 0 : 1),
        ),
      }
    : null
  const levelDone = level
    ? isLevelComplete(level, state) ||
      (levelStats !== null &&
        levelStats.sessions > 0 &&
        levelStats.doneSessions >= levelStats.sessions)
    : false
  const sessionErrors = (state.errorEvents ?? []).filter((event) => event.sessionId === sessionId)
  const skillCounts = new Map<string, number>()
  for (const event of sessionErrors) {
    for (const skill of event.skills ?? [])
      skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1)
  }
  const reviewSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill)
  const accuracy =
    runAttemptsRef.current === 0 ? 100 : Math.round((solved.length / runAttemptsRef.current) * 100)
  const firstAttempts = Object.values(firstAttemptRef.current)
  const firstAttemptAccuracy =
    firstAttempts.length === 0
      ? 100
      : Math.round((firstAttempts.filter(Boolean).length / firstAttempts.length) * 100)
  const missedIds = exercises
    .filter((item) => (mistakesInRunRef.current[item.id] ?? 0) > 0)
    .map((item) => item.id)

  function repeatMissed() {
    if (missedIds.length === 0) return
    setSolved((current) => current.filter((id) => !missedIds.includes(id)))
    for (const id of missedIds) {
      mistakesInRunRef.current[id] = 0
      delete firstAttemptRef.current[id]
    }
    runAttemptsRef.current = 0
    setFinished(false)
    const first = exercises.findIndex((item) => missedIds.includes(item.id))
    if (first >= 0) goTo(first)
  }

  if (finished) {
    return (
      <ExerciseFinishedScreen
        stage={stage}
        sessionTitle={sessionTitle}
        next={next}
        wasComplete={wasComplete}
        solvedCount={solved.length}
        total={total}
        accuracy={accuracy}
        firstAttemptAccuracy={firstAttemptAccuracy}
        missedCount={missedIds.length}
        reviewSkills={reviewSkills}
        level={level}
        levelStats={levelStats}
        levelDone={levelDone}
        onRestart={restart}
        onRepeatMissed={repeatMissed}
      />
    )
  }

  const micSupported = isSpeechRecognitionSupported()

  const mascotMood: MascotMood =
    status === 'correct'
      ? 'correct'
      : status === 'incorrect'
        ? 'incorrect'
        : micState === 'listening'
          ? 'listening'
          : 'idle'
  const mascotLines =
    mascotMood === 'correct'
      ? [tAction(stage, 'mascotNice')]
      : mascotMood === 'incorrect'
        ? [tAction(stage, 'mascotOops')]
        : mascotMood === 'listening'
          ? [tAction(stage, 'mascotListen')]
          : [tAction(stage, 'mascotCoach'), tAction(stage, 'mascotCheer')]

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

      <fieldset class="flex flex-wrap items-center gap-1.5">
        <legend class="sr-only">{tAction(stage, 'exercise')}</legend>
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
      </fieldset>

      <div class="surface-card bg-base-200 p-1.5">
        <div class="surface-muted bg-base-100 p-5 sm:p-6">
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
                    <span class="font-medium">Escenario:</span> {exercise.scenario}
                  </p>
                  <p>
                    <span class="font-medium">Objetivo:</span> {exercise.goal}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div class="mt-4 flex items-center rounded-xl bg-base-200/60 px-2.5 py-1.5">
            <Mascot mood={mascotMood} size="sm" lines={mascotLines} />
          </div>

          {hint && (
            <div class="mt-3">
              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                aria-expanded={showHint}
                class="inline-flex items-center gap-1.5 rounded-full bg-warning/[0.08] px-3 py-1.5 text-[11px] font-medium text-warning/90 transition hover:bg-warning/[0.14]"
              >
                <Lightbulb class="h-3.5 w-3.5" />
                {showHint ? tAction(stage, 'hideHint') : tAction(stage, 'showHint')}
              </button>
              {showHint && (
                <p
                  role="status"
                  class="mt-2 rounded-xl bg-warning/[0.07] px-3 py-2 text-[12px] leading-relaxed text-base-content/65"
                >
                  {hint}
                </p>
              )}
            </div>
          )}

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

          {exercise.type === 'multi-choice' && (
            <MultiChoiceInput
              exercise={exercise}
              picked={multiPicked}
              disabled={status === 'correct'}
              showErrors={status === 'incorrect'}
              onPickedChange={setMultiPicked}
              onInteraction={clearIncorrectStatus}
            />
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

          {exercise.type === 'match' && (
            <MatchInput
              key={exercise.id}
              exercise={exercise}
              matchedPairs={matchedPairs}
              disabled={status === 'correct'}
              onMatchedPairsChange={setMatchedPairs}
              onInteraction={clearIncorrectStatus}
            />
          )}

          {exercise.type === 'dialogue-branch' && (
            <DialogueBranchInput
              exercise={exercise}
              picked={dialogueBranchPicked}
              disabled={status === 'correct'}
              showErrors={status === 'incorrect'}
              onPickedChange={setDialogueBranchPicked}
              onInteraction={clearIncorrectStatus}
            />
          )}

          {(exercise.type === 'write' ||
            exercise.type === 'fix-error' ||
            exercise.type === 'roleplay') && (
            <div class="mt-5 space-y-2">
              {exercise.type === 'fix-error' && (
                <div class="rounded-xl bg-warning/10 px-3 py-2 text-sm text-base-content/80">
                  <span class="font-medium">Frase:</span>{' '}
                  <span class="font-mono">{exercise.sentence}</span>
                </div>
              )}
              <textarea
                value={text}
                disabled={status === 'correct'}
                onInput={(event) => setText((event.target as HTMLTextAreaElement).value)}
                rows={exercise.type === 'roleplay' ? 3 : 2}
                placeholder={tAction(stage, 'typeAnswer')}
                aria-label={tAction(stage, 'typeAnswer')}
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
            </div>
          )}

          {exercise.type === 'listen' && (
            <div class="mt-5 space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-speak={exercise.audioText}
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
                aria-label="Escribe lo que escuchaste"
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
              {listenScore !== null && (
                <p class="text-[12px] text-base-content/55">
                  Coincidencia con la frase:{' '}
                  <span
                    class={`font-mono ${listenScore >= 0.72 ? 'text-success' : 'text-warning'}`}
                  >
                    {Math.round(listenScore * 100)}%
                  </span>
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
                      onClick={micState === 'listening' ? cancelSpeaking : startSpeaking}
                      disabled={status === 'correct'}
                      aria-pressed={micState === 'listening'}
                      aria-busy={micState === 'listening'}
                      aria-label={
                        micState === 'listening'
                          ? 'Detener grabación del micrófono'
                          : 'Practicar pronunciación con micrófono'
                      }
                      class={`btn btn-sm h-10 gap-2 rounded-xl ${micState === 'listening' ? 'bg-error/15 text-error' : 'bg-accent/15 text-accent'}`}
                    >
                      <Mic class="h-4 w-4" aria-hidden="true" />{' '}
                      {micState === 'listening' ? 'Detener' : 'Practicar con micrófono'}
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
                  <p class="text-[12px] text-accent/90">
                    <span class="mr-1 inline-flex gap-0.5" aria-hidden="true">
                      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
                      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
                    </span>
                    {liveText ? (
                      <>
                        Escuchando: <span class="font-mono text-base-content/80">{liveText}</span>
                      </>
                    ) : (
                      'Escuchando… habla ahora.'
                    )}
                  </p>
                )}
                {micState === 'listening' && isMicLevelMeterSupported() && (
                  <div class="flex items-center gap-2" aria-hidden="true">
                    <span class="text-[10px] text-base-content/40">Nivel</span>
                    <span class="h-1 flex-1 overflow-hidden rounded-full bg-base-300">
                      <span
                        class="block h-full rounded-full bg-accent transition-[width] duration-75"
                        style={{ width: `${Math.round(micLevel * 100)}%` }}
                      />
                    </span>
                  </div>
                )}
                {heardText && (
                  <p class="text-[12px] text-base-content/60">
                    Detectado: <span class="font-mono text-base-content/80">{heardText}</span>
                  </p>
                )}
                {speakScore !== null && (
                  <p class="text-[12px] text-base-content/55">
                    Coincidencia con la frase:{' '}
                    <span
                      class={`font-mono ${speakScore >= 0.72 ? 'text-success' : 'text-warning'}`}
                    >
                      {Math.round(speakScore * 100)}%
                    </span>
                  </p>
                )}
                {heardDiff && <WordDiffView diff={heardDiff} />}
                {speechWpm !== null && (
                  <p class="text-[12px] text-base-content/55">
                    Ritmo: <span class="font-mono text-accent">{speechWpm} palabras/min</span>
                  </p>
                )}
                {micError && (
                  <p class="text-[12px] text-error/80" role="status">
                    {micError}
                  </p>
                )}
                {micError && (isNativeAndroid() || /denegad|permiso/i.test(micError)) && (
                  <button
                    type="button"
                    onClick={() => void openAppSettings()}
                    class="btn btn-xs h-7 gap-1.5 rounded-lg bg-base-100 px-2.5 text-[11px] text-base-content/70 transition hover:text-base-content"
                  >
                    <Settings class="h-3 w-3" aria-hidden="true" /> Abrir ajustes
                  </button>
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
                onInput={(event) => {
                  setText((event.target as HTMLTextAreaElement).value)
                  setHeardText('')
                  setHeardDiff(null)
                }}
                rows={2}
                placeholder="Escribe o corrige lo reconocido…"
                aria-label="Escribe o corrige lo reconocido"
                class="w-full resize-none rounded-2xl bg-base-200 px-4 py-3.5 font-mono text-sm text-base-content placeholder:text-base-content/25 disabled:opacity-70"
                spellcheck={false}
              />
            </div>
          )}

          {exercise.type === 'shadow' && (
            <ShadowInput
              exercise={exercise}
              disabled={status === 'correct'}
              micSupported={micSupported}
              micState={micState}
              liveText={liveText}
              heardText={heardText}
              score={speakScore}
              diff={heardDiff}
              wpm={speechWpm}
              micError={micError}
              text={text}
              onMicClick={micState === 'listening' ? cancelSpeaking : startSpeaking}
              onText={(value) => {
                setText(value)
                setHeardText('')
                setHeardDiff(null)
              }}
            />
          )}

          {exercise.type === 'fill-blank' && (
            <div class="mt-5 space-y-3">
              <div class="rounded-2xl bg-base-200/70 p-4">
                <p class="mb-3 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
                  Completa {exercise.blanks.length}{' '}
                  {exercise.blanks.length === 1 ? 'espacio' : 'espacios'}
                </p>
                <div class="font-mono text-[15px] leading-8 text-base-content/80">
                  {exercise.template.split('___').map((part: string, i: number, arr: string[]) => (
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
                            aria-label={`Espacio ${i + 1}: completa la frase`}
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
            </div>
          )}

          {exercise.type === 'dialogue-order' && (
            <div class="mt-5 space-y-4">
              {exercise.context ? (
                <p class="rounded-xl bg-base-200/60 px-3 py-2 text-[11px] leading-relaxed text-base-content/60">
                  <span class="mono-label mr-1.5 text-accent/70">Escena</span>
                  {exercise.context}
                </p>
              ) : null}
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
              drillSkill={status === 'incorrect' ? detectedSkills[0] : undefined}
            />
          )}
        </div>

        <div class="sticky bottom-0 z-20 mt-1 flex flex-wrap items-center justify-between gap-2 rounded-b-2xl bg-base-100/95 px-3 py-2.5 backdrop-blur sm:static sm:rounded-none sm:bg-transparent sm:px-4 sm:backdrop-blur-none">
          <p class="text-[10px] text-base-content/30">
            {exercise.type === 'match'
              ? `${matchedPairs.length} / ${exercise.pairs.length} parejas`
              : exercise.type === 'multi-choice'
                ? `${multiPicked.length} seleccionada${multiPicked.length === 1 ? '' : 's'}`
                : exercise.type === 'builder'
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
