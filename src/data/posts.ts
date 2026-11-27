import type { Exercise, Level } from '../lib/types'

/**
 * Micro-posts ("posts" estilo X / tweet corto) para aprender, integrados en
 * "Aprende por tu cuenta". Contenido estático, offline, versionado; sin red
 * social ni API externa. `check` es un ejercicio YA soportado (no tipo nuevo)
 * que reusa `ExerciseRunner`, progreso/FSRS y perfil de habilidades.
 */
export type MicroPostKind = 'tip' | 'chunk' | 'real'

export interface MicroPost {
  id: string
  kind: MicroPostKind
  /** Título corto opcional. */
  title?: string
  /** Texto en inglés (ejemplo o post real curado). */
  en: string
  /** Traducción / explicación en español. */
  es: string
  /** Chunks a resaltar dentro de `en`. */
  highlights?: string[]
  /** Nota breve: por qué importa. */
  note?: string
  level: Level
  tags: string[]
  /** Origen si es contenido real curado (con atribución + enlace). */
  source?: { name: string; url?: string; attribution?: string }
  /** Micro-ejercicio opcional, con tipos ya existentes. */
  check?: Exercise
}

export const MICRO_POSTS: MicroPost[] = [
  {
    id: 'post-staging-vs-prod',
    kind: 'tip',
    title: 'Staging ≠ production',
    en: "It works on my machine, but it's broken on staging.",
    es: 'Funciona en mi máquina, pero está roto en staging.',
    highlights: ['works on my machine', 'broken on staging'],
    note: 'Separa entornos en tu vocabulario; evita decir "works for me".',
    level: 'A1-A2',
    tags: ['entornos', 'debugging'],
    check: {
      id: 'post-staging-vs-prod-check',
      type: 'fill-blank',
      prompt: 'Completa: "It works on my machine, but it\'s broken on ___."',
      template: "It works on my machine, but it's broken on ___.",
      blanks: ['staging'],
      explanation: '"staging" es el entorno de pre-producción.',
    },
  },
  {
    id: 'post-pr-review',
    kind: 'chunk',
    title: 'Code review amable',
    en: 'Nitpick: rename `x` to `userId`. Optional, but clearer.',
    es: 'Detalle menor: renombra `x` a `userId`. Opcional, pero más claro.',
    highlights: ['Nitpick', 'Optional, but clearer'],
    note: "'nitpick' = detalle menor; no bloquea el merge.",
    level: 'B1-B2',
    tags: ['code review', 'comunicación'],
    check: {
      id: 'post-pr-review-check',
      type: 'choice',
      prompt: "¿Qué significa 'nitpick' en una review?",
      options: ['un bug crítico', 'un detalle menor', 'un bloqueo', 'un test roto'],
      answer: 1,
      explanation: "'nitpick' es un comentario menor, no bloquea.",
    },
  },
  {
    id: 'post-standup',
    kind: 'tip',
    title: 'Standup en 30 segundos',
    en: "Yesterday I finished X. Today I will do Y. I'm blocked by Z.",
    es: 'Ayer terminé X. Hoy haré Y. Estoy bloqueado por Z.',
    highlights: ['Yesterday', 'Today', 'blocked by'],
    note: 'Estructura clásica de standup: ayer / hoy / bloqueo.',
    level: 'A1-A2',
    tags: ['standup', 'daily'],
    check: {
      id: 'post-standup-check',
      type: 'builder',
      prompt: 'Ordena la frase del standup.',
      words: ['by', 'Z', 'blocked', 'I', 'am'],
      answer: 'I am blocked by Z',
      explanation: "'I am blocked by Z' anuncia el bloqueo.",
    },
  },
  {
    id: 'post-real-dev-tweet',
    kind: 'real',
    title: 'Post real (curado)',
    en: 'Just merged. Shipping to production. If it breaks, we revert.',
    es: 'Acabo de mergear. Saliendo a producción. Si se rompe, revertimos.',
    highlights: ['merged', 'shipping', 'revert'],
    note: 'Inglés auténtico de devs; aprende el chunk "if it breaks, we revert".',
    level: 'B1-B2',
    tags: ['deploy', 'auténtico'],
    source: { name: 'Curado para RuntimeEnglish', attribution: 'Estilo de posts de devs en X' },
    check: {
      id: 'post-real-dev-tweet-check',
      type: 'speak',
      prompt: 'Di en voz alta el post.',
      answer: 'Just merged. Shipping to production. If it breaks, we revert.',
      explanation: 'Ritmo natural; chunks cortos.',
    },
  },
  {
    id: 'post-typo-vs-bug',
    kind: 'tip',
    title: 'Typo no es bug',
    en: "It's a typo, not a bug. One character.",
    es: 'Es una errata, no un bug. Un solo carácter.',
    highlights: ['typo', 'bug'],
    note: "'typo' = errata de escritura; 'bug' = fallo de lógica.",
    level: 'A1-A2',
    tags: ['vocabulario', 'debugging'],
  },
  {
    id: 'post-async',
    kind: 'chunk',
    title: 'Async sin bloquear',
    en: "I'll take a look async and follow up.",
    es: 'Lo reviso en asíncrono y te sigo.',
    highlights: ['take a look async', 'follow up'],
    note: "'async' reduce presión de reuniones; 'follow up' cierra el bucle.",
    level: 'B1-B2',
    tags: ['async', 'comunicación'],
    check: {
      id: 'post-async-check',
      type: 'match',
      prompt: 'Empareja.',
      pairs: [
        { en: 'take a look async', es: 'revisar en asíncrono' },
        { en: 'follow up', es: 'dar seguimiento' },
      ],
      explanation: 'Chunks de comunicación async.',
    },
  },
]

/** Ejercicios embebidos en posts, para integrar progreso/habilidades. */
export const MICRO_POST_CHECKS: Exercise[] = MICRO_POSTS.flatMap((post) =>
  post.check ? [post.check] : [],
)
