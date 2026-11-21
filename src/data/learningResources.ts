import {
  cues as algorithmCues,
  durationSeconds as algorithmDuration,
} from './videoTranscripts/algorithm'
import {
  cues as apisCues,
  durationSeconds as apisDuration,
} from './videoTranscripts/apis-explained'
import { cues as cicdCues, durationSeconds as cicdDuration } from './videoTranscripts/cicd'
import {
  cues as communicateCues,
  durationSeconds as communicateDuration,
} from './videoTranscripts/communicate'
import {
  cues as confidenceCues,
  durationSeconds as confidenceDuration,
} from './videoTranscripts/confidence'
import {
  cues as cybersecurityCues,
  durationSeconds as cybersecurityDuration,
} from './videoTranscripts/cybersecurity'
import {
  cues as devCommunicationCues,
  durationSeconds as devCommunicationDuration,
} from './videoTranscripts/dev-communication'
import {
  cues as devSpeakingCues,
  durationSeconds as devSpeakingDuration,
} from './videoTranscripts/dev-speaking'
import {
  cues as devVocabularyCues,
  durationSeconds as devVocabularyDuration,
} from './videoTranscripts/dev-vocabulary'
import { cues as emailCues, durationSeconds as emailDuration } from './videoTranscripts/email'
import {
  cues as gitCues,
  durationSeconds as gitDuration,
} from './videoTranscripts/git-fundamentals'
import {
  cues as internetCues,
  durationSeconds as internetDuration,
} from './videoTranscripts/internet'
import {
  cues as introduceCues,
  durationSeconds as introduceDuration,
} from './videoTranscripts/introduce'
import {
  cues as languageCues,
  durationSeconds as languageDuration,
} from './videoTranscripts/language'
import {
  cues as laughterCues,
  durationSeconds as laughterDuration,
} from './videoTranscripts/laughter'
import {
  cues as promptEngineeringCues,
  durationSeconds as promptEngineeringDuration,
} from './videoTranscripts/prompt-engineering'
import {
  cues as promptThinkingCues,
  durationSeconds as promptThinkingDuration,
} from './videoTranscripts/prompt-thinking'
import { cues as sleepCues, durationSeconds as sleepDuration } from './videoTranscripts/sleep'
import { cues as socialCues, durationSeconds as socialDuration } from './videoTranscripts/social'
import {
  cues as standupCues,
  durationSeconds as standupDuration,
} from './videoTranscripts/standup-meeting'
import {
  cues as techInterviewCues,
  durationSeconds as techInterviewDuration,
} from './videoTranscripts/tech-interview'
import { cues as testingCues, durationSeconds as testingDuration } from './videoTranscripts/testing'
import { cues as timeCues, durationSeconds as timeDuration } from './videoTranscripts/time'
import {
  cues as treasureCues,
  durationSeconds as treasureDuration,
} from './videoTranscripts/treasure'
import { cues as urbanCues, durationSeconds as urbanDuration } from './videoTranscripts/urban'
import { cues as webCues, durationSeconds as webDuration } from './videoTranscripts/www'

/** Recursos externos curados para practicar por cuenta propia. */
export interface LearningResource {
  id: string
  name: string
  url: string
  kind: 'youtube' | 'web'
  level: 'A1-A2' | 'B1-B2' | 'C1-C2' | 'Todos'
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
  /** Tiempo exacto de cada palabra, relativo a `start` (ms → s). */
  words?: { t: number; d: number }[]
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
  {
    id: 'google-engineering-practices',
    name: 'Google Engineering Practices',
    url: 'https://google.github.io/eng-practices/',
    kind: 'web',
    level: 'C1-C2',
    focus: ['Code review', 'Escritura técnica'],
    description:
      'La guía oficial de revisiones de código: ejemplos de comentarios precisos y debates técnicos de alto nivel.',
    tip: 'Lee una sección y reescribe tres comentarios con un tono constructivo en tu diccionario.',
  },
  {
    id: 'stripe-engineering',
    name: 'Stripe Engineering Blog',
    url: 'https://stripe.com/blog/engineering',
    kind: 'web',
    level: 'C1-C2',
    focus: ['Arquitectura', 'Escritura ejecutiva'],
    description:
      'Artículos largos sobre sistemas, fiabilidad y decisiones de diseño con un registro profesional excelente.',
    tip: 'Subraya cinco frases de conclusión y usa su estructura en tus propios RFCs.',
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
  {
    id: 'splash-social-media',
    title: 'How to Make a Splash in Social Media',
    channel: 'TED · Alexis Ohanian',
    youtubeId: 'tPgQsv2KPwc',
    level: 'B1-B2',
    topic: 'Speaking · Internet y comunidad',
    description:
      'El cofundador de Reddit cuenta cómo una broma se convirtió en una campaña real de Greenpeace. Ideal para vocabulario de internet y comunicación online.',
    segment: 'Subtítulos hasta 4:21 · video 5:37',
    durationSeconds: socialDuration,
    cues: socialCues,
    questions: [
      {
        id: 'social-q1',
        prompt: '¿Qué sitio web cofundó el ponente con unos amigos?',
        options: ['Reddit', 'Facebook', 'Fark', 'Boing Boing'],
        answer: 0,
        explanation: "'Started a website in 2005 with a few friends, called Reddit.com.'",
      },
      {
        id: 'social-q2',
        prompt: '¿Cómo se llamaba la ballena jorobada?',
        options: ['Mister Splashy Pants', 'Mister Whale', 'Greenpeace', 'The Great Secret'],
        answer: 0,
        explanation: 'La comunidad votó el nombre “Mister Splashy Pants” con un 78 % de los votos.',
      },
      {
        id: 'social-q3',
        prompt: 'Según el final, ¿qué hay que aceptar para triunfar online?',
        options: [
          'Perder el control y no tomarse uno tan en serio.',
          'Publicar solo desde la dirección de la empresa.',
          'Evitar que la gente comente.',
          'Pagar por llegar a más gente.',
        ],
        answer: 0,
        explanation: "Dice: 'If you want to succeed you've got to be OK to lose control.'",
      },
    ],
  },
  {
    id: 'secrets-language-learning',
    title: 'The Secrets of Learning a New Language',
    channel: 'TED · Lýdia Machová',
    youtubeId: 'o_XVt5rdpFY',
    level: 'B1-B2',
    topic: 'Learning · Cómo aprender inglés',
    description:
      'Una políglota revela cómo aprende un idioma nuevo cada dos años. Muy útil para tomar ideas y aplicarlas a tu inglés.',
    segment: 'Video completo · 0:00 – 10:46',
    durationSeconds: languageDuration,
    cues: languageCues,
    questions: [
      {
        id: 'language-q1',
        prompt: '¿Qué tienen en común todos los políglotas según la ponente?',
        options: [
          'Disfrutan del proceso de aprendizaje.',
          'Estudian listas de palabras todos los días.',
          'Son genios con una memoria especial.',
          'Solo aprenden con libros de texto.',
        ],
        answer: 0,
        explanation:
          "'The one thing we all have in common is that we simply found ways to enjoy the language-learning process.'",
      },
      {
        id: 'language-q2',
        prompt: '¿Qué hizo para aprender alemán?',
        options: [
          'Ver su serie favorita, Friends, en alemán cada día.',
          'Leer Harry Potter en alemán una sola vez.',
          'Memorizar 200 palabras diarias.',
          'Viajar a Alemania durante un mes.',
        ],
        answer: 0,
        explanation:
          "Decidió ver 'Friends' en alemán y siguió cada día hasta que el diálogo empezó a tener sentido.",
      },
      {
        id: 'language-q3',
        prompt: '¿Qué recomienda si te da pudor hablar con nativos al principio?',
        options: [
          'Usar el método de hablar en solitario (self-talk).',
          'Dejar de estudiar hasta sentirte listo.',
          'Aprender solo grammar charts.',
          'Evitar escuchar podcasts.',
        ],
        answer: 0,
        explanation:
          "'If you're a more introverted person... you can apply the method of self-talk.'",
      },
    ],
  },
  {
    id: 'science-of-laughter',
    title: 'The Science of Laughter',
    channel: 'TED-Ed · Sasha Winkler',
    youtubeId: 'Xu-QfE_1ksk',
    level: 'A1-A2',
    topic: 'Listening · Ciencia y curiosidad',
    description:
      'Un video corto y claro sobre por qué reímos: los músculos, el cerebro y la risa como señal social. Narración lenta, ideal para practicar listening.',
    segment: 'Video completo · 0:00 – 5:31',
    durationSeconds: laughterDuration,
    cues: laughterCues,
    questions: [
      {
        id: 'laughter-q1',
        prompt: '¿Qué músculos se contraen cuando te ríes?',
        options: ['Los abdominales', 'Los de los ojos', 'Los de las manos', 'Los de la espalda'],
        answer: 0,
        explanation: "'When you laugh, your abdominal muscles contract rapidly.'",
      },
      {
        id: 'laughter-q2',
        prompt: 'Según el video, ¿por qué es contagiosa la risa?',
        options: [
          'Porque invita a compartir el estado emocional de alguien.',
          'Porque todos tenemos el mismo sentido del humor.',
          'Porque es un reflejo de la respiración solamente.',
          'Porque los bebés la inventaron.',
        ],
        answer: 0,
        explanation: "'It’s like an invitation to share in someone’s emotional state.'",
      },
      {
        id: 'laughter-q3',
        prompt: '¿Qué ocurre en el cerebro cuando reímos?',
        options: [
          'Libera endorfinas y baja el cortisol.',
          'Deja de producir endorfinas.',
          'Aumenta el cortisol.',
          'Se apaga la memoria.',
        ],
        answer: 0,
        explanation:
          "'Our brains release feel-good neurotransmitters, like endorphins, and decrease levels of stress hormones like cortisol.'",
      },
    ],
  },
  {
    id: 'boost-your-confidence',
    title: '3 Tips to Boost Your Confidence',
    channel: 'TED-Ed',
    youtubeId: 'l_NYrWqUR40',
    level: 'A1-A2',
    topic: 'Speaking · Confianza al hablar',
    description:
      'Tres ideas sencillas para ganar confianza: cambiar la mentalidad, practicar el fracaso y hablarte a ti mismo. Narración clara y vocabulario útil.',
    segment: 'Video completo · 0:00 – 4:17',
    durationSeconds: confidenceDuration,
    cues: confidenceCues,
    questions: [
      {
        id: 'confidence-q1',
        prompt: '¿Cómo se define la confianza en el video?',
        options: [
          'Autoestima más optimismo sobre tus propias habilidades.',
          'No sentir nunca miedo.',
          'Ganar siempre a la primera.',
          'Hablar más alto que los demás.',
        ],
        answer: 0,
        explanation: 'Combina “self-esteem” con el optimismo de sentirte capaz.',
      },
      {
        id: 'confidence-q2',
        prompt: '¿Qué es un “growth mindset”?',
        options: [
          'Creer que las habilidades se pueden desarrollar como un músculo.',
          'Creer que las habilidades se fijan al nacer.',
          'Evitar los desafíos difíciles.',
          'Estudiar solo la noche antes.',
        ],
        answer: 0,
        explanation:
          "'If you have a growth mindset and think your abilities can improve, a challenge is an opportunity to learn and grow.'",
      },
      {
        id: 'confidence-q3',
        prompt: '¿Qué consejo da sobre los errores?',
        options: [
          'Aceptarlos, tratarte bien y seguir intentándolo.',
          'Evitarlos a toda costa.',
          'Olvidarlos sin aprender nada.',
          'Culpar a los demás.',
        ],
        answer: 0,
        explanation: "'Accept that you'll make mistakes, and be kind to yourself when you do.'",
      },
    ],
  },
  {
    id: 'hidden-network-internet',
    title: 'The Hidden Network That Makes the Internet Possible',
    channel: 'TED-Ed · Sajan Saini',
    youtubeId: 'er3v4PVNQqE',
    level: 'B1-B2',
    topic: 'Tech · Redes e internet',
    description:
      'Cómo la fibra óptica mueve tus datos a la velocidad de la luz. Vocabulario técnico muy útil si trabajas con software.',
    segment: 'Video completo · 0:00 – 5:19',
    durationSeconds: internetDuration,
    cues: internetCues,
    questions: [
      {
        id: 'internet-q1',
        prompt: '¿Qué récord lograron los investigadores en 2012?',
        options: [
          'Transmitir 1 petabit de datos por un cable en un segundo.',
          'Crear el primer cable de cobre.',
          'Inventar la fibra óptica.',
          'Conectar dos ciudades con radio.',
        ],
        answer: 0,
        explanation: "'Transmitting 1 petabit of data over a fifty-kilometer cable, in a second.'",
      },
      {
        id: 'internet-q2',
        prompt: '¿Qué transportan los cables de fibra óptica?',
        options: ['Pulsos de luz', 'Electrones', 'Ondas de radio', 'Aire a presión'],
        answer: 0,
        explanation: "'These strands carry pulses of light, representing digital data.'",
      },
      {
        id: 'internet-q3',
        prompt: '¿Qué fenómeno mantiene la luz dentro del cristal?',
        options: [
          'Reflexión interna total.',
          'Gravedad.',
          'Evaporación.',
          'Resistencia eléctrica.',
        ],
        answer: 0,
        explanation: "'The trick lies in a phenomenon known as total internal reflection.'",
      },
    ],
  },
  {
    id: 'world-wide-web',
    title: 'What Is the World Wide Web?',
    channel: 'TED-Ed · Twila Camp',
    youtubeId: 'J8hzJxb0rpc',
    level: 'A1-A2',
    topic: 'Tech · Cómo funciona la web',
    description:
      'Una explicación corta y clara de la diferencia entre Internet y la Web, con analogías muy visuales. Ideal para listening A1-A2.',
    segment: 'Video completo · 0:00 – 3:55',
    durationSeconds: webDuration,
    cues: webCues,
    questions: [
      {
        id: 'www-q1',
        prompt: 'Según el video, ¿son Internet y la World Wide Web lo mismo?',
        options: [
          'No: la Web es un servicio que usa Internet.',
          'Sí: son dos nombres para lo mismo.',
          'Internet es un tipo de website.',
          'La Web sustituyó a Internet.',
        ],
        answer: 0,
        explanation: "'The World Wide Web is not the Internet.'",
      },
      {
        id: 'www-q2',
        prompt: '¿Qué es un web server?',
        options: [
          'Una computadora conectada que guarda y comparte información.',
          'Un cable de fibra óptica.',
          'El nombre de un dominio.',
          'Una persona que escribe websites.',
        ],
        answer: 0,
        explanation:
          "'A computer always connected to the Internet, specifically designed to store information and share it.'",
      },
      {
        id: 'www-q3',
        prompt: '¿Para qué sirve la dirección de un website?',
        options: [
          'Para encontrar el sitio, como una dirección real.',
          'Para hacer más rápido el cable.',
          'Para ocultar la información.',
          'Para crear un servidor.',
        ],
        answer: 0,
        explanation: "'A website address lets you get where you want to go.'",
      },
    ],
  },
  {
    id: 'what-is-an-algorithm',
    title: "What's an Algorithm?",
    channel: 'TED-Ed · David J. Malan',
    youtubeId: '6hfOvs8pY1k',
    level: 'B1-B2',
    topic: 'Tech · Pensamiento computacional',
    description:
      'El profesor David Malan explica los algoritmos con ejemplos sencillos. Excelente para vocabulario de programación en contexto.',
    segment: 'Video completo · 0:00 – 4:57',
    durationSeconds: algorithmDuration,
    cues: algorithmCues,
    questions: [
      {
        id: 'algorithm-q1',
        prompt: '¿Qué es un algoritmo?',
        options: [
          'Un conjunto de instrucciones paso a paso para resolver un problema.',
          'Un lenguaje de programación.',
          'Una computadora muy rápida.',
          'Un tipo de dato.',
        ],
        answer: 0,
        explanation:
          "'An algorithm is a set of instructions for solving some problem, step-by-step.'",
      },
      {
        id: 'algorithm-q2',
        prompt: '¿Qué es el pseudocódigo?',
        options: [
          'Sintaxis parecida al inglés que se asemeja a un lenguaje de programación.',
          'Código que solo entienden las máquinas.',
          'Un error de programación.',
          'Un nombre para una variable.',
        ],
        answer: 0,
        explanation: "'English-like syntax that resembles a programming language.'",
      },
      {
        id: 'algorithm-q3',
        prompt: '¿Qué es un loop (bucle)?',
        options: [
          'Una secuencia de pasos que se repite.',
          'Una instrucción que se ejecuta una sola vez.',
          'Una forma de guardar datos.',
          'Un tipo de pantalla.',
        ],
        answer: 0,
        explanation: "'A sequence of steps that will repeat some number of times.'",
      },
    ],
  },
  {
    id: 'introduce-yourself',
    title: 'How to Introduce Yourself',
    channel: 'TEDx · Kevin Bahler',
    youtubeId: 'V1xt7zgnuK0',
    level: 'B1-B2',
    topic: 'Speaking · Presentarte con autenticidad',
    description:
      'Una charla muy humana sobre por qué dejamos de decir quiénes somos al presentarnos. Útil para reuniones, entrevistas y networking.',
    segment: 'Video completo · 0:00 – 10:32',
    durationSeconds: introduceDuration,
    cues: introduceCues,
    questions: [
      {
        id: 'introduce-q1',
        prompt: '¿Cómo se presentaba Kevin cuando era pequeño?',
        options: [
          'Diciendo lo que le gustaba: su color, su gato, sus hobbies.',
          'Solo con su puesto de trabajo.',
          'Con datos de su universidad.',
          'Evitando hablar de sí mismo.',
        ],
        answer: 0,
        explanation: "'Hi! My name is Kevin, and my favorite color is green.'",
      },
      {
        id: 'introduce-q2',
        prompt: '¿Qué cambió al hacerse mayor?',
        options: [
          'Empezó a elegir presentaciones “seguras” y a ocultar partes de sí.',
          'Dejó de hablar en público para siempre.',
          'Se inventó un nuevo nombre.',
          'Se mudó a otro país.',
        ],
        answer: 0,
        explanation: "'I just told people the parts of me they expected to hear.'",
      },
      {
        id: 'introduce-q3',
        prompt: '¿Cómo termina su presentación final?',
        options: [
          '“My name is Kevin Bahler, and I love it when people are truly happy.”',
          '“My name is Kevin and I am a grant writer.”',
          '“Hi, I like watching The Simpsons.”',
          '“I do the martial art Aikido.”',
        ],
        answer: 0,
        explanation: 'Cierra con una frase sobre lo que le importa, no con su cargo.',
      },
    ],
  },
  {
    id: 'all-nighter-brain',
    title: 'What Staying Up All Night Does to Your Brain',
    channel: 'TED-Ed · Anna Rothschild',
    youtubeId: 'idrbwnWLJ7w',
    level: 'A1-A2',
    topic: 'Listening · Ciencia y hábitos',
    description:
      'Qué pasa en el cerebro cuando no duermes antes de un examen. Narración clara y vocabulario cotidiano para practicar escucha.',
    segment: 'Video completo · 0:00 – 5:37',
    durationSeconds: sleepDuration,
    cues: sleepCues,
    questions: [
      {
        id: 'sleep-q1',
        prompt: '¿Qué significa “pull an all-nighter”?',
        options: [
          'Pasar toda la noche despierto estudiando.',
          'Dormir ocho horas.',
          'Tomar café por la mañana.',
          'Hacer un examen corto.',
        ],
        answer: 0,
        explanation: "'You decide to pull an all-nighter.' = no dormir en toda la noche.",
      },
      {
        id: 'sleep-q2',
        prompt: '¿Qué hormona prepara el cuerpo para dormir?',
        options: ['Melatonina', 'Cafeína', 'Adenosina', 'GABA'],
        answer: 0,
        explanation: "'It alerts your pineal gland to start producing melatonin.'",
      },
      {
        id: 'sleep-q3',
        prompt: '¿Qué dice sobre los estudiantes con horarios regulares de sueño?',
        options: [
          'Suelen tener un promedio (GPA) más alto.',
          'Duermen menos que los demás.',
          'Nunca necesitan café.',
          'Obtienen peores notas.',
        ],
        answer: 0,
        explanation:
          "'College students who keep regular sleep hours have, on average, a higher GPA.'",
      },
    ],
  },
  {
    id: 'time-management-machines',
    title: 'How to Manage Your Time More Effectively (According to Machines)',
    channel: 'TED · Brian Christian',
    youtubeId: 'iDbdXTMnOmE',
    level: 'B1-B2',
    topic: 'Productividad · Atención y descanso',
    description:
      'Qué nos enseña el error de una sonda de la NASA sobre la procrastinación, las prioridades y la necesidad de parar.',
    segment: 'Video completo · 0:00 – 5:10',
    durationSeconds: timeDuration,
    cues: timeCues,
    questions: [
      {
        id: 'time-q1',
        prompt: '¿Qué le pasó a la sonda Pathfinder en Marte?',
        options: [
          'Dejó de transmitir porque se ocupaba en tareas poco importantes.',
          'Se quedó sin batería por la noche.',
          'Perdió contacto por una tormenta.',
          'Terminó su misión y volvió a la Tierra.',
        ],
        answer: 0,
        explanation: "'Keeping itself fully occupied but failing to do its most important work.'",
      },
      {
        id: 'time-q2',
        prompt: '¿Qué era el fallo del planificador (scheduler)?',
        options: [
          'No asignaba bien el tiempo entre tareas.',
          'Tenía un problema de memoria física.',
          'No recibía las órdenes de la Tierra.',
          'Era demasiado rápido para la CPU.',
        ],
        answer: 0,
        explanation: "'There was a bug in its scheduler.'",
      },
      {
        id: 'time-q3',
        prompt: '¿Qué nos sugiere el video para recuperar la atención?',
        options: [
          'Adoptar una approach parecida a la de la sonda: bajar a un estado de bajo consumo.',
          'Trabajar el doble de horas.',
          'Apagar completamente el cerebro.',
          'Delegar todas las tareas a una máquina.',
        ],
        answer: 0,
        explanation: "'Might allow us users to reclaim our own attention.'",
      },
    ],
  },
  {
    id: 'communicate-clearly',
    title: 'How to Communicate Clearly',
    channel: 'TED-Ed',
    youtubeId: 'btWlBHE0pe4',
    level: 'B1-B2',
    topic: 'Speaking · Hablar en público',
    description:
      'Cómo encontrar la idea principal de tu mensaje (throughline) y estructurar una charla que se entienda de verdad.',
    segment: 'Video completo · 0:00 – 7:11',
    durationSeconds: communicateDuration,
    cues: communicateCues,
    questions: [
      {
        id: 'communicate-q1',
        prompt: '¿Qué es una “throughline”?',
        options: [
          'La idea principal que recorre toda una charla.',
          'Un tipo de diapositiva.',
          'El tono de voz del ponente.',
          'La duración máxima del video.',
        ],
        answer: 0,
        explanation: "'The throughline of a talk is the main idea.'",
      },
      {
        id: 'communicate-q2',
        prompt: '¿Cuándo conviene dejar clara la throughline?',
        options: [
          'Desde el principio.',
          'Solo al final.',
          'Nunca, para generar misterio.',
          'Solo en presentaciones largas.',
        ],
        answer: 0,
        explanation: "'A talk where the throughline is made clear from the start.'",
      },
      {
        id: 'communicate-q3',
        prompt: '¿Cuánto contenido recomienda cubrir?',
        options: [
          'Solo lo que puedas explorar en profundidad en el tiempo disponible.',
          'Todo lo que sepas del tema.',
          'El máximo número de datos posible.',
          'Solo una frase.',
        ],
        answer: 0,
        explanation: "'Only cover as much as you have time to really explore in depth.'",
      },
    ],
  },
  {
    id: 'importance-of-emails',
    title: 'The Importance of Emails',
    channel: 'TED-Ed · Guy Katz',
    youtubeId: 'SMnjShkHCug',
    level: 'A1-A2',
    topic: 'Writing · Correos profesionales',
    description:
      'Una analogía muy visual (un sándwich) para escribir correos claros y profesionales. Ideal para A1-A2.',
    segment: 'Video completo · 0:00 – 2:32',
    durationSeconds: emailDuration,
    cues: emailCues,
    questions: [
      {
        id: 'email-q1',
        prompt: '¿Con qué compara escribir un buen correo?',
        options: [
          'Con hacer un sándwich',
          'Con cocinar una paella',
          'Con escribir un tuit',
          'Con una llamada',
        ],
        answer: 0,
        explanation: "'Writing an email is the equivalent of making a sandwich for your teacher.'",
      },
      {
        id: 'email-q2',
        prompt: '¿Qué partes necesita un buen correo según el video?',
        options: [
          'Tono, asunto, saludo, cuerpo y firma.',
          'Solo el asunto y el cuerpo.',
          'Emojis y una foto.',
          'Muchos párrafos sin estructura.',
        ],
        answer: 0,
        explanation: "'A proper tone, subject, greeting, body, signature...'",
      },
      {
        id: 'email-q3',
        prompt: '¿Qué consejo da para sonar profesional?',
        options: [
          'Evitar la agresividad y no enviar correos como si fueran mensajes.',
          'Escribir siempre en mayúsculas.',
          'Enviar varios correos seguidos.',
          'Usar el tono de un chat con amigos.',
        ],
        answer: 0,
        explanation: "'Nobody wants to receive a threatening email.'",
      },
    ],
  },
  {
    id: 'git-fundamentals',
    title: 'How Git Works: Explained in 4 Minutes',
    channel: 'ByteByteGo',
    youtubeId: 'e9lnsKot_SQ',
    level: 'B1-B2',
    topic: 'Git · Flujo de trabajo',
    description:
      'Las cuatro zonas de Git y el recorrido de tus cambios: clone, add, commit, push y pull. Ideal para fijar el vocabulario de Git en contexto.',
    segment: 'Video completo · 0:00 – 4:18',
    durationSeconds: gitDuration,
    cues: gitCues,
    questions: [
      {
        id: 'git-q1',
        prompt: 'Según el video, ¿cuántas ubicaciones principales tiene el código en Git?',
        options: [
          'Dos: local y remota.',
          'Tres: working directory, staging area y remota.',
          'Cuatro: working directory, staging area, repositorio local y repositorio remoto.',
          'Cinco: working, staging, local, remota y RAM.',
        ],
        answer: 2,
        explanation:
          "El video dice: 'There are four main locations where your code lives in Git': working directory, staging area, local repository y remote repository.",
      },
      {
        id: 'git-q2',
        prompt: '¿Qué comando guarda la instantánea del staging area en el repositorio local?',
        options: ['git add', 'git commit', 'git push', 'git clone'],
        answer: 1,
        explanation:
          "'git add' prepara los cambios en el staging area; 'git commit' los guarda en el repositorio local y 'git push' los envía al remoto.",
      },
      {
        id: 'git-q3',
        prompt: '¿Qué comando combina git fetch y git merge?',
        options: ['git pull', 'git branch', 'git switch', 'git checkout'],
        answer: 0,
        explanation:
          "El video explica que 'git pull' trae los cambios del remoto y los integra: fetch + merge.",
      },
    ],
  },
  {
    id: 'apis-explained',
    title: 'APIs Explained in 6 Minutes!',
    channel: 'ByteByteGo',
    youtubeId: 'hltLrjabkiY',
    level: 'B1-B2',
    topic: 'APIs · Conceptos técnicos',
    description:
      'Tipos de API, métodos HTTP, autenticación, documentación y buenas prácticas de diseño con subtítulos reales y chunks resaltados.',
    segment: 'Video completo · 0:00 – 6:41',
    durationSeconds: apisDuration,
    cues: apisCues,
    questions: [
      {
        id: 'apis-q1',
        prompt: '¿Qué significa la sigla API?',
        options: [
          'Application Programming Interface',
          'Automated Program Interface',
          'Advanced Protocol Integration',
          'Application Process Interaction',
        ],
        answer: 0,
        explanation: 'El video define API como Application Programming Interface.',
      },
      {
        id: 'apis-q2',
        prompt: '¿Qué método HTTP se usa para recuperar (retrieve) recursos?',
        options: ['Post', 'Get', 'Put', 'Delete'],
        answer: 1,
        explanation:
          "El video resume: 'Post crea, Get recupera recursos, Put actualiza y Delete elimina'.",
      },
      {
        id: 'apis-q3',
        prompt: 'Según el video, ¿para qué sirve el rate limiting?',
        options: [
          'Para proteger la API contra abuso.',
          'Para acelerar la compilación del cliente.',
          'Para firmar los tokens de acceso.',
          'Para crear ramas nuevas.',
        ],
        answer: 0,
        explanation: "El video habla de 'applying rate limiting to protect against abuse'.",
      },
    ],
  },
  {
    id: 'cicd-basics',
    title: 'CI/CD In 5 Minutes | Crash Course System Design',
    channel: 'ByteByteGo',
    youtubeId: '42UP1fxi2SY',
    level: 'B1-B2',
    topic: 'DevOps · CI/CD',
    description:
      'Qué significa integración y entrega continua, qué herramientas se usan y por qué el despliegue continuo no sirve para todos los sistemas.',
    segment: 'Video completo · 0:08 – 5:46',
    durationSeconds: cicdDuration,
    cues: cicdCues,
    questions: [
      {
        id: 'cicd-q1',
        prompt: '¿Qué significa CI en CI/CD?',
        options: [
          'Continuous Integration',
          'Continuous Inspection',
          'Code Integration',
          'Continuous Improvement',
        ],
        answer: 0,
        explanation:
          'CI es Continuous Integration: integrar cambios en el repositorio compartido pronto y a menudo.',
      },
      {
        id: 'cicd-q2',
        prompt: '¿Qué práctica separa desplegar el código de activar una funcionalidad?',
        options: ['Feature flags', 'Canary deployment', 'Rollbacks', 'Unit tests'],
        answer: 0,
        explanation:
          "El video dice que se usan 'feature flags' para separar el despliegue del código de la activación de las funcionalidades.",
      },
      {
        id: 'cicd-q3',
        prompt: 'En el video, ¿qué es el “blast radius”?',
        options: [
          'El alcance del impacto si algo falla.',
          'El tamaño del repositorio.',
          'La velocidad del pipeline.',
          'El número de tests unitarios.',
        ],
        answer: 0,
        explanation:
          'El despliegue canary limita el blast radius: prueba con pocos usuarios para reducir el impacto de un error.',
      },
    ],
  },
  {
    id: 'standup-meeting',
    title: 'English for Developers: Real Daily Stand-up Meeting',
    channel: 'EnglishNotNull',
    youtubeId: 'MsxcpZr1LpM',
    level: 'A1-A2',
    topic: 'Speaking · Daily stand-up',
    description:
      'Una reunión diaria real de desarrollo: reportar bloqueos, pedir aclaraciones y dar seguimiento con frases naturales de trabajo.',
    segment: 'Video completo · 0:01 – 7:31',
    durationSeconds: standupDuration,
    cues: standupCues,
    questions: [
      {
        id: 'standup-q1',
        prompt: '¿Qué problema tiene el feature de password reset?',
        options: [
          'A veces no envía el correo de reset.',
          'Siempre falla el login.',
          'El token caduca demasiado rápido.',
          'La base de datos está caída.',
        ],
        answer: 0,
        explanation:
          "'Sometimes it doesn't send the reset email' y promete 'I'll debug it and update you later.'",
      },
      {
        id: 'standup-q2',
        prompt: '¿Dónde dice Mark que estaba la información del schema actualizado?',
        options: ['En el chat del equipo / Slack', 'En un email', 'En la wiki', 'En el PR'],
        answer: 0,
        explanation:
          "'Mark mentioned something about that in the team chat this morning. Did you check Slack?'",
      },
      {
        id: 'standup-q3',
        prompt: '¿Qué encuentra QA en el flujo de actualización de perfil?',
        options: [
          'Casos límite y un bug intermitente con las fotos.',
          'Que el build no compila.',
          'Que no hay tests automatizados.',
          'Que la API está deprecated.',
        ],
        answer: 0,
        explanation:
          "'We've uncovered a few edge cases' y 'an intermittent bug where profile pictures sometimes don't update immediately.'",
      },
    ],
  },
  {
    id: 'dev-vocabulary',
    title: '20 English Words Every SOFTWARE DEVELOPER Should Know',
    channel: 'English For Tech Professionals',
    youtubeId: 'fooBj0nkdak',
    level: 'A1-A2',
    topic: 'Vocabulario · Términos dev',
    description:
      'Veinte palabras técnicas con explicación y ejemplo: algorithm, bug, deploy, deadline, tech debt, stakeholder y más.',
    segment: 'Video completo · 0:00 – 12:28',
    durationSeconds: devVocabularyDuration,
    cues: devVocabularyCues,
    questions: [
      {
        id: 'devvocab-q1',
        prompt: 'Según el video, ¿qué significa “to deploy”?',
        options: [
          'Publicar o liberar una actualización.',
          'Corregir un bug.',
          'Escribir tests.',
          'Renombrar una variable.',
        ],
        answer: 0,
        explanation:
          "'To deploy means to release' una nueva versión, por ejemplo un update en viernes.",
      },
      {
        id: 'devvocab-q2',
        prompt: '¿Qué palabra significa “el tiempo límite para completar una tarea”?',
        options: ['deadline', 'milestone', 'backlog', 'sprint'],
        answer: 0,
        explanation:
          "El video define deadline como 'the time by which you need' terminar la tarea.",
      },
      {
        id: 'devvocab-q3',
        prompt: '¿Qué es un stakeholder?',
        options: [
          'Cualquier persona con interés o influencia en el proyecto.',
          'Solo los inversores de la empresa.',
          'Un tipo de test automático.',
          'El servidor de producción.',
        ],
        answer: 0,
        explanation:
          "El video aclara que un stakeholder puede ser el equipo, un inversor o los usuarios: 'anyone' afectado por el proyecto.",
      },
    ],
  },
  {
    id: 'dev-speaking',
    title: 'Six Steps to a Better Spoken English for Developers',
    channel: 'Yegor Bugayenko',
    youtubeId: '6de0RNdIIFk',
    level: 'B1-B2',
    topic: 'Learning · Inglés para desarrolladores',
    description:
      'Un desarrollador no nativo cuenta cómo dejó de traducir desde su idioma y empezó a pensar directamente en inglés. Muy útil para perder el miedo a hablar.',
    segment: 'Video completo · 0:00 – 12:09',
    durationSeconds: devSpeakingDuration,
    cues: devSpeakingCues,
    questions: [
      {
        id: 'devspeaking-q1',
        prompt: '¿Qué error cometía el ponente de joven al hablar inglés?',
        options: [
          'Traducía desde su idioma natal en lugar de pensar en inglés.',
          'No conocía suficiente vocabulario técnico.',
          'Hablaba demasiado rápido en las reuniones.',
          'Evitaba leer libros técnicos.',
        ],
        answer: 0,
        explanation:
          "Dice que intentaba formar frases en inglés como lo haría en ruso: 'Translating a Russian thinking into English thinking and it shouldn't work that way.'",
      },
      {
        id: 'devspeaking-q2',
        prompt: 'Según su primera recomendación, ¿qué libros lee siempre en inglés?',
        options: [
          'Libros técnicos (OOP, desarrollo, diseño, DevOps).',
          'Novelas clásicas.',
          'Poesía y ficción contemporánea.',
          'Solo documentación oficial.',
        ],
        answer: 0,
        explanation:
          "'I read technical books only in English': la tecnología le resulta más fácil que la ficción.",
      },
      {
        id: 'devspeaking-q3',
        prompt: '¿Qué recomienda hacer cuando olvidas una palabra como “lamp”?',
        options: [
          'Explicar su significado con otras palabras.',
          'Cambiar de idioma a mitad de frase.',
          'Callarse y esperar a que alguien lo diga.',
          'Usar un traductor en voz alta.',
        ],
        answer: 0,
        explanation:
          "'You can really use the language if you can explain the meaning of any word using other words.'",
      },
    ],
  },
  {
    id: 'dev-communication',
    title: 'How to Communicate as a Software Developer',
    channel: 'Peter Elbaum',
    youtubeId: 'lOvEOlCcMBI',
    level: 'B1-B2',
    topic: 'Speaking · Comunicación en equipos dev',
    description:
      'Comunicación proactiva, feedback constructivo en PRs y cuándo usar Slack o una llamada. Inglés profesional directamente aplicable al día a día.',
    segment: 'Video completo · 0:00 – 5:27',
    durationSeconds: devCommunicationDuration,
    cues: devCommunicationCues,
    questions: [
      {
        id: 'devcom-q1',
        prompt: 'Según el video, ¿qué separa a los ingenieros senior de los demás?',
        options: [
          'La comunicación.',
          'El conocimiento de algoritmos.',
          'La velocidad al teclear.',
          'El número de certificaciones.',
        ],
        answer: 0,
        explanation:
          "'Communication is one of the things that separates senior engineers from everybody else.'",
      },
      {
        id: 'devcom-q2',
        prompt: '¿Cómo recomienda dar feedback en un pull request en vez de decir “this is wrong”?',
        options: [
          'Con preguntas y frases indirectas, p. ej. “is there a way to make this more DRY?”',
          'Con comentarios en mayúsculas para que se vean.',
          'Sin comentarios: aprobar directamente.',
          'Asignando el PR a otra persona.',
        ],
        answer: 0,
        explanation:
          'El video defiende criticar de forma indirecta: preguntas y frases como “it seems like… does that seem to be the case to you?”',
      },
      {
        id: 'devcom-q3',
        prompt: '¿Para qué dice que es mejor la comunicación en vivo (Zoom o presencial)?',
        options: [
          'Para programar en pareja y explicar temas complejos con matices y tono.',
          'Para enviar enlaces largos.',
          'Para evitar hablar con el equipo.',
          'Para escribir documentación.',
        ],
        answer: 0,
        explanation:
          'Slack/email es mejor “para todo lo demás”; las llamadas se reservan para trabajo en pareja y matices difíciles de escribir.',
      },
    ],
  },
  {
    id: 'tech-interview',
    title: 'How to Ace Your Technical Interview: Effective Communication',
    channel: 'Coding With Zhia',
    youtubeId: 'id7d0HeLT5g',
    level: 'B1-B2',
    topic: 'Speaking · Entrevistas técnicas',
    description:
      'Cómo comunicarte durante una entrevista técnica: preguntas de aclaración, cómo salir de un bloqueo y cómo hablar de trade-offs con naturalidad.',
    segment: 'Video completo · 0:00 – 7:54',
    durationSeconds: techInterviewDuration,
    cues: techInterviewCues,
    questions: [
      {
        id: 'techint-q1',
        prompt: '¿Qué debería hacer un buen candidato antes de empezar a programar?',
        options: [
          'Hacer preguntas de aclaración en vez de asumir.',
          'Escribir la solución completa en papel.',
          'Pedir el salario.',
          'Cambiar de lenguaje de programación.',
        ],
        answer: 0,
        explanation:
          'El video recomienda hacer clarifying questions sobre edge cases, scope, use case y requisitos de rendimiento.',
      },
      {
        id: 'techint-q2',
        prompt: '¿Cuál de estos NO aparece en su checklist de aclaración?',
        options: [
          'El salario.',
          'Los edge cases.',
          'El alcance (scope).',
          'Los requisitos de rendimiento.',
        ],
        answer: 0,
        explanation:
          'Aparecen edge cases, scope, use case, extensiones futuras, tests y rendimiento; el salario no.',
      },
      {
        id: 'techint-q3',
        prompt: 'Si te quedas atascado, ¿qué quiere ver el entrevistador?',
        options: [
          'Que pidas pistas: “I’m kind of stuck here, can you give me some hints?”',
          'Que te quedes en silencio.',
          'Que inventes una respuesta.',
          'Que termines la entrevista.',
        ],
        answer: 0,
        explanation:
          'Pedir ayuda muestra que serías un buen compañero de equipo: “I’m stuck on here, what are some ways you suggest...?”',
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Learn Better Prompt Engineering in 7 Minutes',
    channel: 'AWS Developers',
    youtubeId: '-Hjw0_PMyfQ',
    level: 'B1-B2',
    topic: 'AI · Prompt engineering',
    description:
      'Cómo escribir prompts precisos: rol, contexto, restricciones, formato de salida y parámetros como temperature. Vocabulario esencial para trabajar con IA.',
    segment: 'Video completo · 0:00 – 7:17',
    durationSeconds: promptEngineeringDuration,
    cues: promptEngineeringCues,
    questions: [
      {
        id: 'prompteng-q1',
        prompt: '¿Cómo define el video el prompt engineering?',
        options: [
          'Aprender a hacer las preguntas correctas a la IA.',
          'Escribir código en lugar de prompts.',
          'Entrenar un modelo desde cero.',
          'Traducir textos al inglés.',
        ],
        answer: 0,
        explanation:
          "'Just like with people, how you ask matters': el arte de formular la petición.",
      },
      {
        id: 'prompteng-q2',
        prompt: '¿Qué añade el prompt mejorado del ejemplo?',
        options: [
          'Rol, contexto, áreas concretas, límite de palabras y formato.',
          'Solo más adjetivos.',
          'Una traducción al latín.',
          'El código completo de la aplicación.',
        ],
        answer: 0,
        explanation:
          'El prompt eficaz da contexto, define áreas, pone un límite (“Limit your response to 300 words”) y pide bullet points.',
      },
      {
        id: 'prompteng-q3',
        prompt: 'Según el video, ¿qué consigue un temperature bajo?',
        options: [
          'Respuestas más deterministas.',
          'Respuestas más creativas.',
          'Respuestas más largas siempre.',
          'Cambiar el idioma de salida.',
        ],
        answer: 0,
        explanation:
          "'Temperature is a value between zero and one': valores altos dan creatividad; bajos, determinismo.",
      },
    ],
  },
  {
    id: 'prompt-thinking',
    title: 'Prompt Engineering Explained in 5 Minutes',
    channel: 'KnowledgeCatch',
    youtubeId: 'sVRV5gKMNhg',
    level: 'B1-B2',
    topic: 'AI · Cómo pensar con prompts',
    description:
      'Animación clara sobre cómo planificar un prompt: contexto, ejemplos, rol y razonamiento paso a paso (chain of thought).',
    segment: 'Video completo · 0:00 – 5:01',
    durationSeconds: promptThinkingDuration,
    cues: promptThinkingCues,
    questions: [
      {
        id: 'promptthink-q1',
        prompt: '¿A qué compara el video la ingeniería de prompts?',
        options: [
          'A planificar, como dirigir una película donde las palabras son los ángulos de cámara.',
          'A escribir un correo informal.',
          'A resolver ecuaciones sin contexto.',
          'A memorizar definiciones.',
        ],
        answer: 0,
        explanation: 'La analogía es la dirección de cine: cada palabra encuadra la respuesta.',
      },
      {
        id: 'promptthink-q2',
        prompt: '¿Qué es el “zero prompting”?',
        options: [
          'Pedir algo sin ejemplos y con contexto limitado.',
          'Pedir mil ejemplos distintos.',
          'Usar un prompt en blanco.',
          'Pedir respuesta solo en español.',
        ],
        answer: 0,
        explanation: "'This is zero prompting. No examples, limited context.'",
      },
      {
        id: 'promptthink-q3',
        prompt: '¿Qué técnica recomienda para pedir razonamiento paso a paso?',
        options: [
          'Chain of thought (“think step by step”).',
          'Zero shot.',
          'Temperature alta.',
          'Repetir la pregunta tres veces.',
        ],
        answer: 0,
        explanation:
          "'Chain of thought, request step-by-step': pedir al modelo que explique cada paso mejora el resultado.",
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Every Level of Cybersecurity Explained in 5 Minutes',
    channel: 'The ByteWise',
    youtubeId: 'xl99-B_bi1o',
    level: 'B1-B2',
    topic: 'Security · Ciberseguridad',
    description:
      'Los seis niveles de ciberseguridad con su vocabulario: phishing, ransomware, 2FA, SIEM, zero trust, CISSP y zero-day researchers.',
    segment: 'Video completo · 0:00 – 5:58',
    durationSeconds: cybersecurityDuration,
    cues: cybersecurityCues,
    questions: [
      {
        id: 'cyber-q1',
        prompt: 'En el nivel 1, ¿con qué términos se familiariza el principiante?',
        options: [
          'Phishing, ransomware, VPN y autenticación de dos factores (2FA).',
          'Zero-day, SIEM y red team.',
          'CISSP y OSCP.',
          'Kubernetes y Terraform.',
        ],
        answer: 0,
        explanation:
          "El nivel inicial se introduce 'with terms like phishing, ransomware...' y conceptos básicos de protección.",
      },
      {
        id: 'cyber-q2',
        prompt: '¿Qué certificación se presenta como “el estándar de oro” en el nivel 5?',
        options: ['CISSP.', 'Security+.', 'CompTIA Network+.', 'AWS Certified Cloud Practitioner.'],
        answer: 0,
        explanation: 'El video sitúa CISSP entre las certificaciones élite (“find the CISSP”).',
      },
      {
        id: 'cyber-q3',
        prompt: '¿Qué dice del nivel 6?',
        options: [
          'No hay certificación: son investigadores de élite (zero-day, red team).',
          'Es el nivel para principiantes.',
          'Solo requiere un curso online.',
          'Es igual que el nivel 5.',
        ],
        answer: 0,
        explanation:
          "El nivel 6 no tiene certificación: son 'red teamers, zero-day researchers' que crean las herramientas.",
      },
    ],
  },
  {
    id: 'testing',
    title: 'Unit and Integration Testing Compared | Tech in 5 Minutes',
    channel: 'Jelvix',
    youtubeId: 'pf6Zhm-PDfQ',
    level: 'B1-B2',
    topic: 'Testing · Calidad de software',
    description:
      'Diferencias entre tests unitarios y de integración, con enfoques top-down y bottom-up y el orden en que se ejecutan.',
    segment: 'Video completo · 0:00 – 5:19',
    durationSeconds: testingDuration,
    cues: testingCues,
    questions: [
      {
        id: 'testing-q1',
        prompt: '¿Qué es un unit test según el video?',
        options: [
          'Probar una parte de la app en aislamiento, normalmente una clase o función.',
          'Probar todos los módulos juntos.',
          'Probar solo la interfaz de usuario.',
          'Probar el servidor en producción.',
        ],
        answer: 0,
        explanation:
          "'Unit testing is concentrated on one part' de la aplicación: una clase o función.",
      },
      {
        id: 'testing-q2',
        prompt: '¿Cuál de estos NO se menciona como enfoque de integration testing?',
        options: ['Waterfall.', 'Big bang.', 'Top-down.', 'Bottom-up.'],
        answer: 0,
        explanation: 'El video cita big bang, top-down y bottom-up; waterfall no aparece.',
      },
      {
        id: 'testing-q3',
        prompt: '¿En qué orden se ejecutan según el video?',
        options: [
          'Unit al desarrollar el fragmento; integration después de unit y antes de system.',
          'Integration antes que unit.',
          'System, luego integration y por último unit.',
          'Solo integration tests.',
        ],
        answer: 0,
        explanation:
          'Primero se prueba la unidad, después se integran los módulos y finalmente llega el system testing.',
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
