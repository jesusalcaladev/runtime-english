import {
  cues as treasureCues,
  durationSeconds as treasureDuration,
} from './videoTranscripts/treasure'
import { cues as urbanCues, durationSeconds as urbanDuration } from './videoTranscripts/urban'

/** Recursos externos curados para practicar por cuenta propia. */
export interface LearningResource {
  id: string
  name: string
  url: string
  kind: 'youtube' | 'web'
  level: 'A1-A2' | 'B1-B2' | 'Todos'
  focus: string[]
  description: string
  tip: string
}

/** Un bloque de la transcripción adaptada de un video. */
export interface VideoCue {
  /** Segundo de inicio dentro del video de YouTube. */
  start: number
  /** Segundo de fin (debe ser mayor que `start`). */
  end: number
  en: string
  es?: string
  /** Palabras o chunks que se resaltan dentro de `en`. */
  highlight?: string[]
}

export interface VideoLesson {
  id: string
  title: string
  channel: string
  youtubeId: string
  level: 'A1-A2' | 'B1-B2'
  topic: string
  description: string
  /** Rango del video que cubre la transcripción. */
  segment: string
  /** Duración total del video en segundos. */
  durationSeconds: number
  cues: VideoCue[]
  /** Preguntas de comprensión sobre el contenido del video. */
  questions: {
    id: string
    prompt: string
    options: string[]
    answer: number
    explanation: string
  }[]
}

export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'bbc-learning',
    name: 'BBC Learning English',
    url: 'https://www.bbc.co.uk/learningenglish',
    kind: 'web',
    level: 'A1-A2',
    focus: ['Listening', 'Vocabulario', 'Gramática'],
    description:
      'Cursos cortos y series como 6 Minute English: audio, transcripción y ejercicios en el mismo sitio.',
    tip: 'Escucha un episodio 3 veces: sin subtítulos, con subtítulos y repitiendo en voz alta.',
  },
  {
    id: 'bbc-youtube',
    name: 'BBC Learning English (YouTube)',
    url: 'https://www.youtube.com/@bbclearningenglish',
    kind: 'youtube',
    level: 'A1-A2',
    focus: ['Listening', 'Pronunciación'],
    description: 'El canal oficial con episodios diarios cortos y subtítulos en inglés.',
    tip: 'Empieza por “6 Minute English” y apunta 3 expresiones nuevas por episodio.',
  },
  {
    id: 'voa-learning',
    name: 'VOA Learning English',
    url: 'https://learningenglish.voanews.com',
    kind: 'web',
    level: 'A1-A2',
    focus: ['Listening', 'Lectura'],
    description:
      'Noticias en inglés lento, con transcripción y vocabulario. Ideal para ganar fluidez.',
    tip: 'Lee el texto antes de escuchar: reconocerás las palabras y entenderás más rápido.',
  },
  {
    id: 'voa-youtube',
    name: 'VOA Learning English (YouTube)',
    url: 'https://www.youtube.com/@VOALearningEnglish',
    kind: 'youtube',
    level: 'A1-A2',
    focus: ['Listening', 'Noticias'],
    description: 'Noticias sencillas con video y subtítulos; muy bueno para el hábito diario.',
    tip: 'Pon 0.75× de velocidad la primera vez y 1× la segunda.',
  },
  {
    id: 'mr-duncan',
    name: 'Learn English with Mr. Duncan',
    url: 'https://www.youtube.com/@MrDuncanEnglish',
    kind: 'youtube',
    level: 'A1-A2',
    focus: ['Gramática', 'Speaking'],
    description:
      'Explicaciones claras y ejemplos cotidianos, con ejercicios al final de cada vídeo.',
    tip: 'Pausa antes de que dé la respuesta y dila tú en voz alta.',
  },
  {
    id: 'english-lucy',
    name: 'English with Lucy',
    url: 'https://www.youtube.com/@EnglishwithLucy',
    kind: 'youtube',
    level: 'B1-B2',
    focus: ['Vocabulario', 'Business English'],
    description: 'Inglés británico, frases naturales y lecciones de inglés para el trabajo.',
    tip: 'Copia las frases a tu diccionario de RuntimeEnglish con Guardar.',
  },
  {
    id: 'rachel-english',
    name: 'Rachel’s English',
    url: 'https://rachelsenglish.com',
    kind: 'web',
    level: 'Todos',
    focus: ['Pronunciación', 'Listening'],
    description: 'Pronunciación americana con videos cortos y ejercicios de boca y ritmo.',
    tip: 'Repite una sola frase 10 veces despacio antes de subir la velocidad.',
  },
  {
    id: 'ted',
    name: 'TED Talks',
    url: 'https://www.youtube.com/@TED',
    kind: 'youtube',
    level: 'B1-B2',
    focus: ['Listening', 'Speaking'],
    description:
      'Charlas reales con subtítulos: la mejor forma de oír inglés profesional y natural.',
    tip: 'Activa los subtítulos en inglés, nunca en español, y guarda las frases útiles.',
  },
  {
    id: 'youglish',
    name: 'YouGlish',
    url: 'https://youglish.com',
    kind: 'web',
    level: 'Todos',
    focus: ['Pronunciación', 'Vocabulario'],
    description:
      'Busca una palabra o phrasal verb y escucha cientos de ejemplos reales con subtítulos.',
    tip: 'Busca “roll back” o “follow up” y compara cómo suenan en reuniones técnicas.',
  },
  {
    id: 'cambridge-dict',
    name: 'Cambridge Dictionary',
    url: 'https://dictionary.cambridge.org',
    kind: 'web',
    level: 'Todos',
    focus: ['Vocabulario', 'Pronunciación'],
    description: 'Definiciones sencillas, ejemplos reales y audio en británico y americano.',
    tip: 'Busca la palabra en inglés, no traduzcas: cambia el hábito en una semana.',
  },
  {
    id: 'anki',
    name: 'AnkiWeb',
    url: 'https://apps.ankiweb.net',
    kind: 'web',
    level: 'Todos',
    focus: ['Vocabulario', 'Repaso'],
    description: 'Repetición espaciada: repasa justo cuando estás a punto de olvidar una frase.',
    tip: 'Pasa tus frases guardadas aquí a tarjetas y repasa 5 minutos al día.',
  },
  {
    id: 'elllo',
    name: 'ELLLO',
    url: 'https://www.elllo.org',
    kind: 'web',
    level: 'A1-A2',
    focus: ['Listening'],
    description: 'Cientos de conversaciones cortas de hablantes reales con transcripción y quiz.',
    tip: 'Elige un nivel, escucha una conversación y repite la última frase de cada hablante.',
  },
]

/**
 * Subtítulos originales de YouTube con sus marcas de tiempo reales.
 * El texto `en` y los tiempos vienen de los captions del video; `es` y
 * `highlight` son apoyos pedagógicos añadidos para el estudio.
 */
export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'speak-so-people-listen',
    title: 'How to Speak So That People Want to Listen',
    channel: 'TED · Julian Treasure',
    youtubeId: 'eIho2S0ZahI',
    level: 'B1-B2',
    topic: 'Speaking · Comunicación',
    description:
      'Una charla breve sobre cómo sonar claro y seguro. Sigue los subtítulos originales y repite en voz alta los chunks resaltados.',
    segment: 'Video completo · 0:00 – 9:58',
    durationSeconds: treasureDuration,
    cues: treasureCues,
    questions: [
      {
        id: 'treasure-q1',
        prompt: 'Según el video, ¿cuál es el primer “pecado capital” de la palabra?',
        options: ['Gossip', 'Exaggeration', 'Dogmatism', 'Excuses'],
        answer: 0,
        explanation: 'El ponente empieza por “gossip”: hablar mal de alguien que no está presente.',
      },
      {
        id: 'treasure-q2',
        prompt: '¿Qué problema tiene quejarse, según el video?',
        options: [
          'Es una forma de miseria contagiosa.',
          'Ayuda a resolver incidentes.',
          'Es el mejor modo de pedir ayuda.',
          'Mejora la pronunciación.',
        ],
        answer: 0,
        explanation: "Dice que quejarse es 'viral misery': no esparce luz ni ligereza.",
      },
      {
        id: 'treasure-q3',
        prompt: '¿Qué recomienda hacer con la voz?',
        options: [
          'Bajar el ritmo y hacer pausas.',
          'Hablar siempre más alto.',
          'Evitar escuchar a los demás.',
          'Usar slang constantemente.',
        ],
        answer: 0,
        explanation: 'El consejo es bajar el ritmo: una pausa da tiempo a pensar.',
      },
    ],
  },
  {
    id: 'master-procrastinator',
    title: 'Inside the Mind of a Master Procrastinator',
    channel: 'TED · Tim Urban',
    youtubeId: 'arj7oStGLkU',
    level: 'B1-B2',
    topic: 'Listening · Charlas reales',
    description:
      'Una charla divertida para entrenar el oído con inglés hablado a ritmo real y vocabulario cotidiano.',
    segment: 'Video completo · 0:00 – 14:04',
    durationSeconds: urbanDuration,
    cues: urbanCues,
    questions: [
      {
        id: 'urban-q1',
        prompt: '¿Qué estaba haciendo Tim en la universidad?',
        options: [
          'Estudiando ciencias políticas y escribiendo muchos trabajos.',
          'Trabajando como profesor.',
          'Escribiendo un libro de 90 páginas cada semana.',
        ],
        answer: 0,
        explanation:
          "Dice: 'I was a government major, which means I had to write a lot of papers.'",
      },
      {
        id: 'urban-q2',
        prompt: '¿Qué pasó con su tesis de 90 páginas?',
        options: [
          'La escribió en 72 horas, con dos noches en vela.',
          'La entregó un mes tarde.',
          'Nunca la terminó.',
        ],
        answer: 0,
        explanation: "'I wrote 90 pages over 72 hours, pulling not one but two all-nighters.'",
      },
      {
        id: 'urban-q3',
        prompt: '¿Cómo termina la historia que cuenta en el video?',
        options: [
          'Reconoce que fue una tesis muy mala.',
          'Gana un premio por la tesis.',
          'La universidad le pide otra tesis.',
        ],
        answer: 0,
        explanation: "Al final admite: 'It was a very, very bad thesis.'",
      },
    ],
  },
]

/** Índice del tramo activo. Devuelve -1 si aún no empieza la transcripción. */
export function getActiveCueIndex(cues: VideoCue[], time: number): number {
  for (let i = cues.length - 1; i >= 0; i -= 1) {
    if (time >= cues[i].start) return i
  }
  return -1
}
