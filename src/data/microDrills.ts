import type { ErrorSkill } from '../lib/errorPatterns'

export interface MicroDrill {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

/** Ejercicios relámpago por habilidad, mostrados tras un fallo. */
export const MICRO_DRILLS: Partial<Record<ErrorSkill, MicroDrill[]>> = {
  prepositions: [
    {
      id: 'prep-1',
      prompt: "I'm blocked ___ the API token.",
      options: ['by', 'in', 'at', 'for'],
      answer: 0,
      explanation: "Con 'blocked by' indicas la causa o el agente que te bloquea.",
    },
    {
      id: 'prep-2',
      prompt: 'We depend ___ an external service.',
      options: ['on', 'in', 'with', 'to'],
      answer: 0,
      explanation: "'Depend on' es la combinación fija: depend of no existe.",
    },
  ],
  tenses: [
    {
      id: 'tense-1',
      prompt: 'I ___ the bug yesterday.',
      options: ['fixed', 'have fixed', 'fix', 'am fixing'],
      answer: 0,
      explanation: "'Yesterday' es un momento cerrado: pasado simple, 'fixed'.",
    },
    {
      id: 'tense-2',
      prompt: 'I ___ the tests right now.',
      options: ['am running', 'run', 'ran', 'will run'],
      answer: 0,
      explanation: "'Right now' pide presente continuo: 'am running'.",
    },
  ],
  articles: [
    {
      id: 'art-1',
      prompt: 'I fixed ___ bug we discussed.',
      options: ['the', 'a', 'an', '—'],
      answer: 0,
      explanation: "Hablamos de un bug concreto y conocido: 'the bug'.",
    },
    {
      id: 'art-2',
      prompt: 'We need ___ API key for this test.',
      options: ['an', 'a', 'the', '—'],
      answer: 0,
      explanation: "'API' empieza con sonido vocálico: 'an API key'.",
    },
  ],
  pronouns: [
    {
      id: 'pro-1',
      prompt: 'Maya asked Leo, and ___ fixed the bug.',
      options: ['he', 'she', 'they', 'it'],
      answer: 0,
      explanation: 'Leo es masculino singular: he.',
    },
    {
      id: 'pro-2',
      prompt: 'This is my PR. Can you review ___?',
      options: ['it', 'its', 'them', 'he'],
      answer: 0,
      explanation: "'PR' es singular y neutro: 'review it'.",
    },
  ],
  'word-order': [
    {
      id: 'ord-1',
      prompt: 'Ordena: have / to / the / PR / review',
      options: ['I have to review the PR', 'I have review to the PR', 'I to have review the PR'],
      answer: 0,
      explanation: "'Have to' va junto y el verbo base detrás: 'have to review'.",
    },
    {
      id: 'ord-2',
      prompt: 'Ordena: did / you / what / fix',
      options: ['What did you fix?', 'What you did fix?', 'Did you what fix?'],
      answer: 0,
      explanation: 'En preguntas con did: What + did + sujeto + verbo base.',
    },
  ],
  negation: [
    {
      id: 'neg-1',
      prompt: 'She ___ have to deploy today.',
      options: ["doesn't", "don't", "isn't", 'not'],
      answer: 0,
      explanation: "Tercera persona singular con verbo principal: doesn't have to.",
    },
    {
      id: 'neg-2',
      prompt: "I ___ think it's a good idea.",
      options: ["don't", 'am not', 'not', 'doesn’t'],
      answer: 0,
      explanation: "Con 'think' se niega el verbo principal: I don't think...",
    },
  ],
  questions: [
    {
      id: 'q-1',
      prompt: '___ you clarify the requirement?',
      options: ['Could', 'Do', 'Are', 'Have'],
      answer: 0,
      explanation: "'Could you...?' es la forma educada de pedir algo.",
    },
    {
      id: 'q-2',
      prompt: '___ does the endpoint return?',
      options: ['What', 'Which', 'Where', 'Who'],
      answer: 0,
      explanation: "Preguntas por el valor devuelto: 'What does it return?'",
    },
  ],
  plurals: [
    {
      id: 'pl-1',
      prompt: 'Add more ___ before running the suite.',
      options: ['tests', 'test', 'testes', 'testing'],
      answer: 0,
      explanation: "'More' con sustantivo contable va en plural: tests.",
    },
    {
      id: 'pl-2',
      prompt: 'We have three ___ to review.',
      options: ['pull requests', 'pull request', 'pulls requests', 'pull requestes'],
      answer: 0,
      explanation: 'El plural va en el núcleo: pull requests.',
    },
  ],
  spelling: [
    {
      id: 'sp-1',
      prompt: 'Elige la forma correcta.',
      options: ['deploy', 'deploay', 'deploi', 'deploey'],
      answer: 0,
      explanation: "La palabra correcta es 'deploy'.",
    },
    {
      id: 'sp-2',
      prompt: 'Elige la forma correcta.',
      options: ['environment', 'enviroment', 'envirnment', 'enviromment'],
      answer: 0,
      explanation: "Se escribe 'environment', con la terminación -ment.",
    },
  ],
  vocabulary: [
    {
      id: 'voc-1',
      prompt: "'roll back' significa...",
      options: [
        'revertir un despliegue',
        'acelerar un test',
        'comentar código',
        'apagar el servidor',
      ],
      answer: 0,
      explanation: "'Roll back' vuelve a una versión estable anterior.",
    },
    {
      id: 'voc-2',
      prompt: "'follow up' significa...",
      options: ['dar seguimiento', 'posponer', 'desglosar', 'descartar'],
      answer: 0,
      explanation: "'Follow up with' = dar seguimiento con alguien/algo.",
    },
  ],
  agreement: [
    {
      id: 'agr-1',
      prompt: 'The tests ___ failing in CI.',
      options: ['are', 'is', 'was', 'be'],
      answer: 0,
      explanation: "'Tests' es plural: are failing.",
    },
    {
      id: 'agr-2',
      prompt: 'She ___ to review the PR.',
      options: ['has', 'have', 'is', 'do'],
      answer: 0,
      explanation: 'Tercera persona singular con have to: has to.',
    },
  ],
  general: [
    {
      id: 'gen-1',
      prompt: "Elige la frase más natural: 'I am blocked...'",
      options: [
        'I am blocked by the API token.',
        'I am block by the API token.',
        'I blocking by the API token.',
      ],
      answer: 0,
      explanation: "Voz pasiva con 'am + participio': am blocked.",
    },
  ],
}
