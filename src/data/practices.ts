import type { Exercise, Level } from '../lib/types'

/**
 * Prácticas extra integradas en "Aprende por tu cuenta".
 *
 * No son sesiones de currículo ni tipos de ejercicio nuevos: reusan los
 * `Exercise` ya soportados por `ExerciseRunner`, el mismo progreso/FSRS y el
 * perfil de habilidades. Sin contenido de ritmo/prosodia musical.
 */
export interface PracticePack {
  id: string
  title: string
  /** Una línea, sin ruido. */
  description: string
  level: Level
  /** Pequeño: 3-4 ejercicios. */
  exercises: Exercise[]
}

export const PRACTICE_PACKS: PracticePack[] = [
  {
    id: 'preposiciones-tecnicas',
    title: 'Preposiciones en inglés técnico',
    description: 'Fíjate en las combinaciones fijas que más se repiten en código y reuniones.',
    level: 'A1-A2',
    exercises: [
      {
        id: 'pack-prep-1',
        type: 'fill-blank',
        prompt: 'Completa con la preposición correcta.',
        template: 'We are blocked ___ the API token.',
        blanks: ['by'],
        explanation: "'blocked by' indica la causa o el agente que bloquea.",
      },
      {
        id: 'pack-prep-2',
        type: 'choice',
        prompt: "Elige la preposición correcta: 'We depend ___ an external service.'",
        options: ['on', 'in', 'with', 'to'],
        answer: 0,
        explanation: "'depend on' es la combinación fija; 'depend of' no existe.",
      },
      {
        id: 'pack-prep-3',
        type: 'fix-error',
        prompt: 'Corrige la preposición.',
        sentence: 'I am good in React.',
        answer: 'I am good at React.',
        explanation: "'good at' para habilidades; 'good in' para contextos o idiomas.",
      },
      {
        id: 'pack-prep-4',
        type: 'match',
        prompt: 'Empareja el chunk con su significado.',
        pairs: [
          { en: 'work on', es: 'trabajar en' },
          { en: 'depend on', es: 'depender de' },
          { en: 'blocked by', es: 'bloqueado por' },
          { en: 'good at', es: 'bueno en' },
        ],
        explanation: 'Chunks fijos que conviene memorizar como bloque.',
      },
    ],
  },
  {
    id: 'conectores-claridad',
    title: 'Conectores y claridad',
    description: 'Enlaza ideas sin ambigüedad en standups, PRs y correos.',
    level: 'B1-B2',
    exercises: [
      {
        id: 'pack-conn-1',
        type: 'choice',
        prompt: "Elige el conector: 'The build failed; ___, we can retry after the fix.'",
        options: ['however', 'therefore', 'for example', 'meanwhile'],
        answer: 1,
        explanation: "'therefore' marca consecuencia; 'however' marcaría contraste.",
      },
      {
        id: 'pack-conn-2',
        type: 'builder',
        prompt: 'Ordena la frase.',
        words: ['on', 'the', 'other', 'hand', 'it', 'is', 'a', 'simple', 'fix'],
        answer: 'On the other hand it is a simple fix',
        explanation: "'on the other hand' introduce el contraste.",
      },
      {
        id: 'pack-conn-3',
        type: 'fix-error',
        prompt: 'Corrige el conector.',
        sentence: 'The tests pass, however we still need a review.',
        answer: 'The tests pass; however, we still need a review.',
        explanation: "'however' como contraste entre oraciones va tras ';' y con comas.",
      },
    ],
  },
  {
    id: 'modo-imperativo-instrucciones',
    title: 'Instrucciones claras (imperativo)',
    description: 'Da pasos accionables en docs, tickets y code review.',
    level: 'A1-A2',
    exercises: [
      {
        id: 'pack-imp-1',
        type: 'choice',
        prompt: "Elige la forma imperativa: '___ the tests before merging.'",
        options: ['Run', 'Runs', 'Running', 'To run'],
        answer: 0,
        explanation: 'El imperativo usa la forma base del verbo.',
      },
      {
        id: 'pack-imp-2',
        type: 'match',
        prompt: 'Empareja instrucción con su traducción.',
        pairs: [
          { en: 'Rename the variable.', es: 'Renombra la variable.' },
          { en: 'Add a test.', es: 'Añade un test.' },
          { en: 'Remove the unused import.', es: 'Elimina el import sin usar.' },
        ],
        explanation: 'Verbo base + objeto.',
      },
      {
        id: 'pack-imp-3',
        type: 'speak',
        prompt: 'Di en voz alta esta instrucción clara.',
        answer: 'Run the tests before merging.',
        explanation: 'Ritmo natural, verbo base al principio.',
      },
    ],
  },
  {
    id: 'falsos-amigos-dev',
    title: 'Falsos amigos en desarrollo',
    description: 'Palabras que suenan igual pero no significan lo mismo.',
    level: 'B1-B2',
    exercises: [
      {
        id: 'pack-fa-1',
        type: 'choice',
        prompt: "¿Qué significa 'eventually'?",
        options: ['inmediatamente', 'finalmente / tarde o temprano', 'nunca', 'a veces'],
        answer: 1,
        explanation: "'eventually' = tarde o temprano; no es 'actualmente'.",
      },
      {
        id: 'pack-fa-2',
        type: 'choice',
        prompt: "¿Qué significa 'actually'?",
        options: ['actualmente', 'en realidad', 'a la vez', 'después'],
        answer: 1,
        explanation: "'actually' = en realidad; no es 'actualmente' (use 'currently').",
      },
      {
        id: 'pack-fa-3',
        type: 'fix-error',
        prompt: 'Corrige el uso.',
        sentence: 'Actually we are using Postgres currently.',
        answer: 'Currently we are using Postgres.',
        explanation: "'currently' = actualmente; 'actually' = en realidad.",
      },
    ],
  },
]

/** Todos los ejercicios de práctica extra, para integrar progreso/habilidades. */
export const PRACTICE_PACK_EXERCISES: Exercise[] = PRACTICE_PACKS.flatMap((pack) => pack.exercises)
