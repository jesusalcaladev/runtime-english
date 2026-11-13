import type { Module } from "../../lib/types";

export const m7: Module = {
  id: "m7",
  code: "MOD 07",
  level: "B1-B2",
  title: "Slang & Cultura 2026",
  shortTitle: "Slang 2026 · lo último",
  description:
    "El inglés que no aparece en los libros: IA, memes y jerga de equipo actualizada a noviembre de 2026.",
  featured: true,
  sessions: [
    {
      id: "m7-l1",
      slug: "ai-slang-2026",
      title: "El slang de IA que define 2026",
      step: "B2 · Especial 7.1",
      cefr: "B2",
      minutes: 12,
      summary:
        "Vibe coding, AI slop, workslop, meat proxy: el vocabulario con el que los equipos hablan hoy de la IA.",
      objectives: [
        "Entender los términos de IA que ya se usan en Slack y en PRs.",
        "Distinguir cuándo un término es profesional y cuándo es un meme.",
        "Usar el slang sin sonar ofensivo en el trabajo.",
      ],
      pronunciation:
        "Don't be a meat proxy. Read the diff before you paste it.",
      blocks: [
        {
          type: "text",
          body: "En 2026, la conversación técnica cambió de '¿usas IA?' a '¿cómo controlas lo que produce?'. Estas palabras nacieron de esa tensión y ya aparecen en ofertas de trabajo, PRs y canales de Slack.",
        },
        {
          type: "slang",
          title: "De la IA al equipo",
          ids: [
            "vibe-coding",
            "ai-slop",
            "workslop",
            "slop-grenade",
            "meat-proxy",
            "agentic-engineering",
            "vibe-engineering",
            "context-engineering",
            "context-rot",
            "prompt-debt",
            "hallucination",
            "sycophancy",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Regla de oro con el slang",
          body: "Entender el slang es obligatorio; usarlo depende del contexto. 'Meat proxy' o 'clanker' pueden sonar como insulto: úsalos para describir un patrón, nunca para señalar a una persona en público.",
        },
      ],
      exercises: [
        {
          id: "m7-l1-e1",
          type: "choice",
          prompt:
            "Un compañero pega en Slack una respuesta enorme de la IA sin leerla ni validarla. ¿Cómo describes ese patrón?",
          options: [
            "He is a meat proxy",
            "He is a canary release",
            "He is rubber ducking",
            "He is shipping it",
          ],
          answer: 0,
          explanation:
            "'Meat proxy' describe a quien reenvía output de IA sin leerlo, entenderlo ni validarlo. No es un cumplido.",
        },
        {
          id: "m7-l1-e2",
          type: "choice",
          prompt:
            "¿Qué término describe un entregable de IA que se ve pulido pero obliga a otros a rehacerlo?",
          options: ["Blast radius", "Workslop", "Context window", "Canary"],
          answer: 1,
          explanation:
            "'Workslop' es trabajo con apariencia profesional pero hueco, que genera trabajo extra a quien lo recibe.",
        },
        {
          id: "m7-l1-e3",
          type: "builder",
          prompt: "Construye: 'No seas un meat proxy. Lee el diff antes de pegarlo.'",
          words: ["Don't be", "a meat proxy.", "Read the diff", "before you paste it."],
          answer: "Don't be a meat proxy. Read the diff before you paste it.",
          explanation:
            "El imperativo se usa para dar una instrucción directa: 'Don't be...' + 'Read...'.",
        },
        {
          id: "m7-l1-e4",
          type: "write",
          prompt: "Traduce al inglés: 'Ese PR es puro AI slop; nadie revisó los tests.'",
          answer: "That PR is pure AI slop; nobody reviewed the tests.",
          accept: [
            "That PR is pure AI slop. Nobody reviewed the tests.",
            "That PR is pure AI slop, nobody reviewed the tests.",
          ],
          explanation:
            "'Pure' funciona como intensificador. 'Review' se usa tanto para code review como para revisar tests.",
        },
      ],
    },
    {
      id: "m7-l2",
      slug: "internet-slang-2026",
      title: "Internet slang: entiende memes y calls",
      step: "B2 · Especial 7.2",
      cefr: "B2",
      minutes: 10,
      summary:
        "Cooked, aura farming, glazing, yapping, delulu, lock in: el inglés informal que se cuela en equipos remotos.",
      objectives: [
        "Entender el slang que aparece en memes, chats y reuniones informales.",
        "Reconocer qué términos son solo para conversación casual.",
        "Responder con naturalidad sin sonar forzado.",
      ],
      pronunciation:
        "Less yapping, more code. Sprint ends Friday — lock in.",
      blocks: [
        {
          type: "text",
          body: "El slang cambia cada temporada. No necesitas producirlo todo, pero sí reconocerlo al instante para no perderte en un canal de equipo, un meme o una call relajada. Estos términos están vivos en noviembre de 2026.",
        },
        {
          type: "slang",
          title: "El deck esencial",
          ids: [
            "cooked",
            "aura-farming",
            "glazing",
            "yapping",
            "delulu",
            "lock-in",
            "crash-out",
            "let-him-cook",
            "mid",
            "touch-grass",
            "6-7",
            "no-cap",
            "w",
            "brainrot",
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "¿Cuándo usarlo?",
          body: "En un canal de equipo con confianza: 'cooked', 'lock in', 'let him cook'. En una daily formal o con un cliente: mejor inglés neutro. '6-7' y 'brainrot' son memes: solo para entenderlos.",
        },
      ],
      exercises: [
        {
          id: "m7-l2-e1",
          type: "choice",
          prompt:
            "Prod está caído, la base de datos corrupta y el cliente llamando. ¿Cuál es la forma más natural de decir 'estamos perdidos'?",
          options: ["We are cooked", "We are glazing", "We are mid", "We are on-call"],
          answer: 0,
          explanation:
            "'Cooked' significa perdido, agotado o en un problema grave. Muy usado en equipos tech.",
        },
        {
          id: "m7-l2-e2",
          type: "choice",
          prompt:
            "En la daily, alguien habla cinco minutos sin decir nada útil. ¿Qué está haciendo?",
          options: ["Aura farming", "Yapping", "Glazing", "Rubber ducking"],
          answer: 1,
          explanation:
            "'Yapping' es hablar demasiado sin sustancia. 'Aura farming' es actuar para parecer genial; 'glazing' es elogiar en exceso.",
        },
        {
          id: "m7-l2-e3",
          type: "builder",
          prompt: "Construye: 'Menos yapping, más código. El sprint termina el viernes: concéntrate.'",
          words: ["Less yapping,", "more code.", "Sprint ends Friday —", "lock in."],
          answer: "Less yapping, more code. Sprint ends Friday — lock in.",
          explanation:
            "'Lock in' es el imperativo informal para concentrarse al máximo.",
        },
        {
          id: "m7-l2-e4",
          type: "choice",
          prompt:
            "Tu junior está refactorizando auth y va bien. ¿Qué frase le dice 'déjalo trabajar, va a hacer algo bueno'?",
          options: ["Touch grass", "Let him cook", "Take the L", "No cap"],
          answer: 1,
          explanation:
            "'Let him cook' = déjalo trabajar, confía en el proceso. Se usa también con 'her/them'.",
        },
      ],
    },
  ],
};
