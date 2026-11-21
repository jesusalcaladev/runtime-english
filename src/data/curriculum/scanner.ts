import { GOAL_SLUGS } from '../../lib/goals'
import { PLACEMENT_START_SLUG } from '../../lib/placement'
import type { ContentBlock, Exercise, Session } from '../../lib/types'
import { SLANG } from '../slang'
import { ALL_SESSIONS, MODULES } from './index'

export type IssueSeverity = 'error' | 'warning' | 'info'

export interface ScanIssue {
  severity: IssueSeverity
  category: string
  id: string
  message: string
}

export interface ScanReport {
  stats: {
    modules: number
    sessions: number
    blocks: number
    exercises: number
    dialogues: number
    dialogueBranches: number
  }
  issues: ScanIssue[]
}

const SPECIAL = new Set([
  'match',
  'multi-choice',
  'shadow',
  'dialogue-branch',
  'listen',
  'speak',
  'roleplay',
  'fix-error',
  'fill-blank',
  'dialogue-order',
])
const SPEAKING = new Set(['speak', 'listen', 'shadow'])
const STAGE: Record<Exercise['type'], number> = {
  choice: 1,
  match: 1,
  'multi-choice': 1,
  listen: 1,
  'dialogue-order': 1,
  'fill-blank': 1,
  'fix-error': 2,
  'dialogue-branch': 2,
  builder: 2,
  write: 3,
  speak: 3,
  roleplay: 3,
  shadow: 3,
}

function exerciseFingerprint(exercise: Exercise): string {
  const answer = 'answer' in exercise ? exercise.answer : ''
  return `${exercise.prompt.trim().toLowerCase()}|${String(answer).trim().toLowerCase()}`
}

/** Audit of the built-in curriculum: connectivity, metadata and content sanity. */
export function scanCurriculum(): ScanReport {
  const issues: ScanIssue[] = []
  const add = (severity: IssueSeverity, category: string, id: string, message: string) => {
    issues.push({ severity, category, id, message })
  }

  const moduleIds = new Set<string>()
  const sessionIds = new Set<string>()
  const slugs = new Set<string>()
  const exerciseIds = new Set<string>()
  const slangIds = new Set(SLANG.map((entry) => entry.id))
  const usedSlangIds = new Set<string>()
  const fingerprints = new Map<string, string>()
  const prerequisiteRefs: { sessionId: string; referenced: string }[] = []
  const promptCounts = new Map<string, number>()
  const explanationCounts = new Map<string, number>()

  for (const module of MODULES) {
    if (moduleIds.has(module.id)) add('error', 'ids', module.id, 'Duplicate module id')
    moduleIds.add(module.id)
    for (const session of module.sessions) {
      if (sessionIds.has(session.id)) add('error', 'ids', session.id, 'Duplicate session id')
      sessionIds.add(session.id)
      if (slugs.has(session.slug)) add('error', 'ids', session.slug, 'Duplicate slug')
      slugs.add(session.slug)

      if (!session.summary.trim()) add('error', 'metadata', session.id, 'Empty summary')
      if (!session.objectives.length) add('error', 'metadata', session.id, 'No objectives')
      if (!session.blocks.length) add('error', 'metadata', session.id, 'No content blocks')
      if (!session.exercises.length) add('error', 'metadata', session.id, 'No exercises')

      const stepMatch = session.step.match(/(?:Paso|Especial)\s+(\d+)\.(\d+)/i)
      if (!stepMatch) add('error', 'metadata', session.id, `Invalid step: ${session.step}`)
      else if (Number(stepMatch[1]) !== Number(module.id.slice(1))) {
        add('error', 'metadata', session.id, 'Step number does not match module')
      }

      // Connected lessons: every session after the first states where it comes from.
      if (session.id !== 'm1-l0') {
        const prerequisite = session.blocks.find(
          (block) => block.type === 'callout' && block.title === 'Antes de esta lección',
        )
        if (!prerequisite) {
          add('error', 'connectivity', session.id, 'Missing "Antes de esta lección" callout')
        } else if (prerequisite.type === 'callout') {
          for (const referenced of prerequisite.body.match(/m\d+-l\d+/g) ?? []) {
            if (referenced !== session.id)
              prerequisiteRefs.push({ sessionId: session.id, referenced })
          }
        }
      }

      if (!session.id.startsWith(`${module.id}-`)) {
        const label = `${session.step} ${session.title} ${session.summary}`
        if (!/repaso|integrad|checkpoint|micro-repaso/i.test(label)) {
          add(
            'warning',
            'connectivity',
            session.id,
            'Cross-module session is not labelled as integrated',
          )
        }
      }

      if (session.exercises.length > 7) add('error', 'density', session.id, 'More than 7 exercises')
      if (session.blocks.length > 7) add('error', 'density', session.id, 'More than 7 blocks')
      if (!session.exercises.some((exercise) => SPEAKING.has(exercise.type))) {
        add('error', 'density', session.id, 'No speaking/listening/shadow exercise')
      }
      const stages = new Set(session.exercises.map((exercise) => STAGE[exercise.type]))
      for (const stage of [1, 2, 3]) {
        if (!stages.has(stage))
          add('error', 'density', session.id, `Missing learning stage ${stage}`)
      }
      const specialCount = session.exercises.filter((exercise) => SPECIAL.has(exercise.type)).length
      if (specialCount > 4) add('error', 'density', session.id, `${specialCount} special exercises`)

      for (const block of session.blocks) scanBlock(block, session, add, usedSlangIds)
      for (const exercise of session.exercises) {
        if (exerciseIds.has(exercise.id)) add('error', 'ids', exercise.id, 'Duplicate exercise id')
        exerciseIds.add(exercise.id)
        if (!exercise.id.startsWith(`${session.id}-e`)) {
          add('error', 'ids', exercise.id, 'Exercise id does not match session prefix')
        }
        scanExercise(exercise, session.id, add)

        const fingerprint = exerciseFingerprint(exercise)
        const previous = fingerprints.get(fingerprint)
        if (previous && previous !== session.id) {
          add('warning', 'duplicates', exercise.id, `Same prompt/answer as ${previous}`)
        } else {
          fingerprints.set(fingerprint, session.id)
        }
        promptCounts.set(exercise.prompt, (promptCounts.get(exercise.prompt) ?? 0) + 1)
        explanationCounts.set(
          exercise.explanation,
          (explanationCounts.get(exercise.explanation) ?? 0) + 1,
        )
      }
    }
  }

  // The flat navigation order must contain every declared session exactly once.
  if (
    ALL_SESSIONS.length !== MODULES.reduce((total, module) => total + module.sessions.length, 0)
  ) {
    add('error', 'connectivity', 'ALL_SESSIONS', 'Navigation is missing declared sessions')
  }
  for (const [level, slug] of Object.entries(PLACEMENT_START_SLUG)) {
    if (!slugs.has(slug))
      add('error', 'connectivity', level, `Placement start slug missing: ${slug}`)
  }
  for (const slug of GOAL_SLUGS) {
    if (!slugs.has(slug)) add('error', 'connectivity', 'goals', `Goal slug missing: ${slug}`)
  }

  // Prerequisites may point forward in the flat order, so check once all IDs exist.
  for (const { sessionId, referenced } of prerequisiteRefs) {
    if (!sessionIds.has(referenced)) {
      add('error', 'connectivity', sessionId, `Prerequisite ${referenced} does not exist`)
    }
  }

  for (const [id, count] of promptCounts) {
    if (count > 20)
      add('info', 'boilerplate', id.slice(0, 60), `Exercise prompt repeated ${count}x`)
  }
  for (const [text, count] of explanationCounts) {
    if (count > 50) add('info', 'boilerplate', text.slice(0, 60), `Explanation repeated ${count}x`)
  }
  for (const id of slangIds) {
    if (!usedSlangIds.has(id)) add('info', 'slang', id, 'Slang entry not used by any lesson')
  }

  const allBlocks = ALL_SESSIONS.flatMap(({ session }) => session.blocks)
  return {
    stats: {
      modules: MODULES.length,
      sessions: ALL_SESSIONS.length,
      blocks: allBlocks.length,
      exercises: ALL_SESSIONS.reduce((total, { session }) => total + session.exercises.length, 0),
      dialogues: allBlocks.filter((block) => block.type === 'dialogue').length,
      dialogueBranches: ALL_SESSIONS.reduce(
        (total, { session }) =>
          total +
          session.exercises.filter((exercise) => exercise.type === 'dialogue-branch').length,
        0,
      ),
    },
    issues,
  }
}

function scanBlock(
  block: ContentBlock,
  session: Session,
  add: (severity: IssueSeverity, category: string, id: string, message: string) => void,
  usedSlangIds: Set<string>,
): void {
  if (block.type === 'slang') {
    for (const id of block.ids) usedSlangIds.add(id)
    return
  }
  if (block.type !== 'dialogue') return

  const id = session.id
  if (!block.context?.trim() || !block.setting?.trim() || !block.goal?.trim()) {
    add('error', 'dialogue', id, 'Dialogue is missing context, setting or goal')
  }
  if (block.lines.length < 4 || block.lines.length > 8) {
    add('error', 'dialogue', id, `Dialogue has ${block.lines.length} lines (expected 4-8)`)
  }
  const names = new Map<string, string>()
  block.lines.forEach((line, index) => {
    if (names.has(line.speaker) && names.get(line.speaker) !== line.name) {
      add('error', 'dialogue', id, `Inconsistent name for speaker ${line.speaker}`)
    }
    names.set(line.speaker, line.name)
    const next = block.lines[index + 1]
    if (next && next.speaker === line.speaker) {
      add('error', 'dialogue', id, `Dialogue turns do not alternate at line ${index + 1}`)
    }
  })
}

function scanExercise(
  exercise: Exercise,
  sessionId: string,
  add: (severity: IssueSeverity, category: string, id: string, message: string) => void,
): void {
  const id = exercise.id
  if (!exercise.prompt.trim() || !exercise.explanation.trim()) {
    add('error', 'exercise', id, 'Empty prompt or explanation')
  }
  switch (exercise.type) {
    case 'choice':
      if (
        !exercise.options.length ||
        exercise.answer < 0 ||
        exercise.answer >= exercise.options.length
      ) {
        add('error', 'exercise', id, 'Choice answer is out of range')
      }
      if (new Set(exercise.options).size !== exercise.options.length) {
        add('error', 'exercise', id, 'Choice options are duplicated')
      }
      break
    case 'builder':
      if (exercise.words.join(' ') !== exercise.answer) {
        add('error', 'exercise', id, 'Builder words do not match the answer')
      }
      break
    case 'fill-blank': {
      const blanks = (exercise.template.match(/___/g) ?? []).length
      if (blanks !== exercise.blanks.length) add('error', 'exercise', id, 'Blank count mismatch')
      break
    }
    case 'dialogue-order':
      if (!exercise.context?.trim())
        add('error', 'dialogue', id, 'Dialogue-order has no scene context')
      if (exercise.lines.length < 2)
        add('error', 'exercise', id, 'Dialogue-order needs at least 2 lines')
      break
    case 'dialogue-branch':
      if (!exercise.context?.trim())
        add('error', 'dialogue', id, 'Dialogue-branch has no scene context')
      for (const step of exercise.steps) {
        if (step.choices.filter((choice) => choice.correct).length !== 1) {
          add('error', 'exercise', id, 'Dialogue-branch step must have exactly one correct reply')
        }
      }
      break
    case 'listen':
    case 'speak':
    case 'shadow':
    case 'write':
    case 'fix-error':
    case 'roleplay':
      if (!exercise.answer.trim()) add('error', 'exercise', id, 'Empty model answer')
      break
  }
  if ('hint' in exercise && !exercise.hint?.trim()) {
    add('error', 'exercise', id, `Free-text exercise in ${sessionId} has an empty hint`)
  }
}
