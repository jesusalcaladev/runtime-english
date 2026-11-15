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
      summary:
        "Vibe coding, AI slop, workslop, meat proxy: el vocabulario con el que los equipos hablan hoy de la IA.",
      objectives: [
        "Entender los términos de IA que ya se usan en Slack y en PRs.",
        "Distinguir cuándo un término es profesional y cuándo es un meme.",
        "Usar el slang sin sonar ofensivo en el trabajo."
      ],
      pronunciation:
        "Don't be a meat proxy. Read the diff before you paste it.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Este módulo es de comprensión cultural/slang (registro informal). Requiere base de lectura en inglés técnico; no necesitas usar estos términos en contextos formales, pero sí reconocerlos. Presta atención a las advertencias de uso.",
        },
        {
          type: "text",
          body: "El slang técnico/IA cambia rápido. Aquí aprenderás a reconocer términos comunes (y cuándo evitarlos). Prioriza entender significado, registro y riesgo de sonar ofensivo o poco profesional.",
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
            "sycophancy"
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Regla de oro con el slang",
          body: "Entender el slang es obligatorio; usarlo depende del contexto. 'Meat proxy' o 'clanker' pueden sonar como insulto: úsalos para describir un patrón, nunca para señalar a una persona en público.",
        }
      ],
      exercises: [
        {
          id: "m7-l1-e1",
          type: "choice",
          prompt:
            "Un compañero pega en Slack una respuesta enorme de la IA sin leerla ni validarla. ¿Cómo describes ese patrón?",
          options: [
            "He is a meat proxy",
            "He is fixing a bug",
            "He is writing tests",
            "He is reviewing the code"
          ],
          answer: 0,
          explanation:
            "'Meat proxy' describe a quien reenvía output de IA sin leerlo, entenderlo ni validarlo. Es un término informal (úsalo con cuidado y sin atacar a personas).",
        },
        {
          id: "m7-l1-e2",
          type: "choice",
          prompt:
            "¿Qué término describe un entregable de IA que se ve pulido pero obliga a otros a rehacerlo?",
          options: ["AI slop / workslop", "A rollback", "A hotfix", "A code review"],
          answer: 0,
          explanation:
            "'AI slop' o 'workslop' se usa para trabajo generado con IA que parece correcto pero es poco útil y crea trabajo extra. (En esta lección ves ambos términos en el vocabulario.)",
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
            "That PR is pure AI slop, nobody reviewed the tests."
          ],
          explanation:
            "'Pure' funciona como intensificador. 'Review' se usa tanto para code review como para revisar tests.",
        },
        {
          id: "m7-l1-e5",
          type: "choice",
          prompt: "¿En qué contexto es más apropiado usar términos como 'AI slop' o 'meat proxy'?",
          options: [
            "En un reporte formal para un cliente externo.",
            "En un chat interno informal, describiendo un patrón (no atacando a una persona).",
            "En documentación oficial del producto.",
            "En cualquier correo sin importar la audiencia.",
          ],
          answer: 1,
          explanation:
            "Son términos informales y pueden sonar despectivos. Úsalos con cuidado en contextos de confianza y enfocados en el trabajo, no en la persona.",
        },
        {
          id: "m7-l1-e6",
          type: "write",
          prompt: "Escribe en inglés: 'No seas un meat proxy. Lee el diff.'",
          answer: "Don't be a meat proxy. Read the diff.",
          accept: ["Do not be a meat proxy. Read the diff."],
          hint: "Usa imperativos: 'Don't be...' y 'Read...'",
          explanation:
            "Repaso del chunk visto en la lección: instrucción directa para revisar antes de compartir output de IA.",
        }
      ],
    },
    {
      id: "m7-l2",
      slug: "internet-slang-2026",
      title: "Internet slang: entiende memes y calls",
      step: "B2 · Especial 7.2",
      cefr: "B2",
      summary:
        "Cooked, aura farming, glazing, yapping, delulu, lock in: el inglés informal que se cuela en equipos remotos.",
      objectives: [
        "Entender el slang que aparece en memes, chats y reuniones informales.",
        "Reconocer qué términos son solo para conversación casual.",
        "Responder con naturalidad sin sonar forzado."
      ],
      pronunciation:
        "Less yapping, more code. Sprint ends Friday — lock in.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Cómo estudiar esta lección",
          body: "Objetivo principal: reconocer el significado y el registro (casual/meme). Úsalo solo en contextos informales de confianza. Si dudas, elige inglés neutro.",
        },
        {
          type: "text",
          body: "Estos términos aparecen en chats y cultura online. No hace falta usarlos todos: enfócate en entenderlos y en saber cuándo suenan fuera de lugar en un entorno profesional.",
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
            "brainrot"
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "¿Cuándo usarlo?",
          body: "En un canal de equipo con confianza: 'cooked', 'lock in', 'let him cook'. En una daily formal o con un cliente: mejor inglés neutro. '6-7' y 'brainrot' son memes: solo para entenderlos.",
        }
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
        {
          id: "m7-l2-e5",
          type: "builder",
          prompt: "Construye: 'Concéntrate. El sprint termina el viernes.'",
          words: ["Lock in.", "The sprint", "ends", "Friday."],
          answer: "Lock in. The sprint ends Friday.",
          explanation:
            "'Lock in' es una forma informal de decir 'concéntrate/enfócate' (término visto en esta lección).",
        },
        {
          id: "m7-l2-e6",
          type: "choice",
          prompt: "Alguien exagera mucho una situación menor. ¿Qué término encaja mejor en slang informal?",
          options: ["Delulu", "Lock in", "Let him cook", "Cooked"],
          answer: 0,
          explanation:
            "'Delulu' (de 'delusional') se usa de forma informal para alguien poco realista. Úsalo con cuidado y solo en contexto casual.",
        }
      ],
    },
    {
      id: "m7-l3",
      slug: "slang-reuniones",
      title: "Slang de reuniones: prioridades y tiempo",
      step: "B2 · Especial 7.3",
      cefr: "B2",
      summary:
        "Entiende y usa el vocabulario real de reuniones: circle back, take it offline, bandwidth y blockers.",
      objectives: [
        "Pedir aparcar un tema sin cortar la conversación.",
        "Expresar falta de tiempo o capacidad sin sonar evasivo.",
        "Distinguir jerga profesional de relleno de reunión."
      ],
      pronunciation:
        "Let's take this offline and circle back after the standup. I don't have the bandwidth today.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Útil conocer dinámica básica de reuniones (M4–M5). Aquí verás jerga común de reuniones; aprende significado, intención y cuándo es mejor usar una alternativa neutra.",
        },
        {
          type: "technique",
          name: "Jerga de reuniones: útil si aclara la acción",
          desc: "'Take it offline' = tratarlo fuera de la reunión; 'circle back' = retomarlo luego; 'bandwidth' = capacidad/tiempo. Úsalas para avanzar, no para evadir. Si el contexto es formal o externo, prefiere frases neutras.",
        },
        {
          type: "vocab",
          title: "Vocabulario de reunión",
          items: [
            { en: "circle back", es: "retomar un tema más tarde", example: "Let's circle back after the standup." },
            { en: "take it offline", es: "hablarlo fuera de la reunión", example: "Let's take this offline." },
            { en: "bandwidth", es: "tiempo o capacidad disponible", example: "I don't have the bandwidth this week." },
            { en: "heads-up", es: "aviso previo", example: "Thanks for the heads-up." },
            { en: "blocker", es: "algo que impide avanzar", example: "The API access is my only blocker." },
            { en: "align", es: "ponerse de acuerdo", example: "Let's align on the scope." },
            { en: "action item", es: "tarea acordada", example: "I'll add it as an action item." },
            { en: "parking lot", es: "temas aparcados para después", example: "Put it in the parking lot." }
          ],
        },
        {
          type: "phrases",
          title: "Frases para destrabar la reunión",
          items: [
            { en: "Let's take this offline.", es: "Hablemos de esto fuera de la reunión." },
            { en: "Can we circle back after the standup?", es: "¿Podemos retomarlo después del standup?" },
            { en: "I don't have the bandwidth this week.", es: "No tengo capacidad esta semana." },
            { en: "Thanks for the heads-up.", es: "Gracias por el aviso." },
            { en: "What's the blocker?", es: "¿Qué te está bloqueando?" },
            { en: "Let's align on the next step.", es: "Pongámonos de acuerdo en el siguiente paso." },
            { en: "I'll own that action item.", es: "Yo me encargo de esa tarea." },
            { en: "Let's put that in the parking lot.", es: "Aparquemos ese tema para luego." }
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Registro y claridad",
          body: "Estas frases son jerga profesional y suenan naturales en reuniones. Úsalas con un propósito claro (aparcar, retomar, pedir capacidad). Si hablas con alguien externo o no técnico, prefiere formas neutras como 'Can we discuss this later?' o 'I don't have time this week.'",
        }
      ],
      exercises: [
        {
          id: "m7-l3-e1",
          type: "choice",
          prompt: "Un tema largo desvía la reunión. ¿Qué dices para aparcarlo?",
          options: [
            "Let's take it offline.",
            "Let's yap about it.",
            "That's cooked.",
            "Ship it."
          ],
          answer: 0,
          explanation:
            "'Take it offline' saca el tema de la reunión para tratarlo después con las personas implicadas.",
        },
        {
          id: "m7-l3-e2",
          type: "choice",
          prompt: "'I don't have the bandwidth this week.' ¿Qué significa?",
          options: [
            "No tengo internet esta semana.",
            "No tengo tiempo o capacidad esta semana.",
            "No tengo reuniones esta semana.",
            "No tengo feedback esta semana."
          ],
          answer: 1,
          explanation:
            "En contexto de trabajo, 'bandwidth' es la capacidad disponible para asumir más trabajo.",
        },
        {
          id: "m7-l3-e3",
          type: "builder",
          prompt: "Construye: 'Retomémoslo después del standup.'",
          words: ["Let's", "circle back", "after the standup."],
          answer: "Let's circle back after the standup.",
          explanation:
            "'Circle back' es retomar un tema en otro momento, no necesariamente hoy.",
        },
        {
          id: "m7-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Gracias por el aviso.'",
          answer: "Thanks for the heads-up.",
          accept: ["Thanks for the heads up.", "Thank you for the heads-up."],
          hint: "Usa 'heads-up'.",
          explanation:
            "'Heads-up' es un aviso previo, normalmente informal pero profesional.",
        },
        {
          id: "m7-l3-e5",
          type: "choice",
          prompt: "Quieren ponerse de acuerdo sobre el alcance antes de empezar. ¿Qué dices?",
          options: [
            "Let's align on the scope.",
            "Let's take the scope offline.",
            "We are cooked on scope.",
            "Ship the scope."
          ],
          answer: 0,
          explanation:
            "'Align on the scope' significa ponerse de acuerdo sobre el alcance (vocabulario de esta lección).",
        },
        {
          id: "m7-l3-e6",
          type: "builder",
          prompt: "Construye: 'Yo me encargo de esa tarea.'",
          words: ["I'll own", "that", "action item."],
          answer: "I'll own that action item.",
          explanation:
            "'Own that action item' expresa responsabilidad clara sobre una tarea acordada en la reunión.",
        }
      ],
    },
    {
      id: "m7-l4",
      slug: "slang-reviews-codigo",
      title: "Slang de reviews y código",
      step: "B2 · Especial 7.4",
      cefr: "B2",
      summary:
        "Lee comentarios de review sin malinterpretarlos: LGTM, nit, bikeshedding, tech debt y ship it.",
      objectives: [
        "Distinguir un bloqueo real de un detalle menor en un review.",
        "Nombrar deuda técnica y discusiones triviales con precisión.",
        "Responder a un review con el tono adecuado."
      ],
      pronunciation:
        "LGTM with one nit. Ship it, and we'll pay down the tech debt next sprint.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Requiere conocer code reviews y PRs (M4–M5). Esta lección refuerza términos informales comunes en reviews (LGTM, nit, bikeshedding, ship it, tech debt) y cómo interpretarlos.",
        },
        {
          type: "technique",
          name: "Interpretar señales en un review",
          desc: "Distingue intención: 'nit' = menor/no bloqueante, 'blocking' = debe resolverse, 'LGTM' = aprobado. 'Bikeshedding' señala discusión sobre detalles triviales. Aclara la intención para evitar malentendidos.",
        },
        {
          type: "vocab",
          title: "Vocabulario de review",
          items: [
            { en: "LGTM", es: "looks good to me: aprobado", example: "LGTM, nice work." },
            { en: "nit", es: "detalle menor o nitpick", example: "Nit: rename this variable." },
            { en: "bikeshedding", es: "discutir detalles triviales", example: "This is bikeshedding; the real issue is the schema." },
            { en: "tech debt", es: "deuda técnica", example: "We need to pay down the tech debt." },
            { en: "ship it", es: "adelante, publícalo", example: "Tests pass, ship it." },
            { en: "rubber duck", es: "explicar el problema a un pato para pensar", example: "I rubber-ducked the bug and found it." },
            { en: "spaghetti code", es: "código enredado y difícil de seguir", example: "That module is spaghetti code." },
            { en: "workslop", es: "trabajo con apariencia de calidad pero poco valor", example: "The dashboard is pure workslop." }
          ],
        },
        {
          type: "phrases",
          title: "Frases para responder a un review",
          items: [
            { en: "LGTM with one nit.", es: "Aprobado, con un detalle menor." },
            { en: "I'll fix the nit before merging.", es: "Arreglaré el detalle antes de mergear." },
            { en: "Can we avoid bikeshedding this?", es: "¿Podemos evitar discutir este detalle trivial?" },
            { en: "This can wait; it's tech debt.", es: "Esto puede esperar; es deuda técnica." },
            { en: "Tests pass. Ship it.", es: "Los tests pasan. Adelante." },
            { en: "Good catch, thanks.", es: "Buen hallazgo, gracias." }
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Tono en reviews",
          body: "Marca la intención: 'nit' para algo menor, 'blocking' solo si impide mergear. Reconoce lo bueno ('Good catch, thanks') y evita etiquetas vagas. Así el feedback es claro, nativo y fácil de actuar.",
        }
      ],
      exercises: [
        {
          id: "m7-l4-e1",
          type: "choice",
          prompt: "Un review dice 'LGTM with one nit'. ¿Qué significa?",
          options: [
            "Hay un error grave que bloquea el merge.",
            "Está aprobado, con un detalle menor.",
            "No se puede mergear todavía.",
            "Falta documentación obligatoria."
          ],
          answer: 1,
          explanation:
            "'LGTM' aprueba el cambio; 'nit' señala un detalle pequeño que no debería bloquear el merge.",
        },
        {
          id: "m7-l4-e2",
          type: "choice",
          prompt: "'This is bikeshedding.' ¿Qué está criticando?",
          options: [
            "Discutir detalles triviales mientras lo importante espera.",
            "Un bug relacionado con bicicletas.",
            "Un problema de rendimiento.",
            "La falta de tests unitarios."
          ],
          answer: 0,
          explanation:
            "'Bikeshedding' es perder tiempo en detalles menores en lugar de decidir lo importante.",
        },
        {
          id: "m7-l4-e3",
          type: "builder",
          prompt: "Construye: 'Adelante. Podemos pagar la deuda técnica después.'",
          words: ["Ship it.", "We can", "pay down the tech debt", "later."],
          answer: "Ship it. We can pay down the tech debt later.",
          explanation:
            "'Ship it' autoriza publicar; 'pay down the tech debt' es reducir deuda técnica de forma gradual.",
        },
        {
          id: "m7-l4-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Necesitamos pagar la deuda técnica antes de añadir más funciones.'",
          answer: "We need to pay down the tech debt before adding more features.",
          accept: [
            "We need to pay off the tech debt before adding more features.",
            "We need to reduce the tech debt before adding more features."
          ],
          hint: "Usa 'pay down the tech debt'.",
          explanation:
            "'Pay down debt' se usa tanto para dinero como para deuda técnica: reducirla de forma progresiva.",
        },
        {
          id: "m7-l4-e5",
          type: "choice",
          prompt: "Alguien comenta 'nit: rename this variable' en tu PR. ¿Qué implica normalmente?",
          options: [
            "Debes rehacer todo el PR.",
            "Es un detalle menor, normalmente no bloqueante.",
            "El PR será rechazado.",
            "Hay un fallo de seguridad crítico.",
          ],
          answer: 1,
          explanation:
            "'Nit' señala un detalle menor (estilo/claridad). A menos que se indique lo contrario, no suele bloquear el merge.",
        },
        {
          id: "m7-l4-e6",
          type: "write",
          prompt: "Escribe en inglés: 'Buen hallazgo, gracias.'",
          answer: "Good catch, thanks.",
          accept: ["Good catch, thanks", "Good catch. Thanks."],
          hint: "Frase corta y común en reviews.",
          explanation:
            "Respuesta educada y natural para reconocer un comentario útil en un review.",
        }
      ],
    },
    {
      id: "m7-l6",
      slug: "repaso-slang-uso-y-registro",
      title: "Repaso: slang, uso y registro",
      step: "B2 · Especial 7.5 · Práctica guiada",
      cefr: "B2",
      summary:
        "Sesión corta para separar y reforzar el módulo de slang: significado, intención y cuándo usar o evitar cada término.",
      objectives: [
        "Reconocer significado de términos vistos en m7-l1 a m7-l4.",
        "Elegir alternativas claras y profesionales cuando el contexto lo pide.",
        "Recordar que el registro importa (informal vs. formal)."
      ],
      pronunciation:
        "LGTM with one nit. Let's circle back later. Don't be a meat proxy.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Repasa m7-l1 a m7-l4. Esta práctica usa solo términos y ejemplos ya vistos en esas lecciones (IA, reuniones, reviews e internet slang). Objetivo: reconocer y elegir registro adecuado.",
        },
        {
          type: "technique",
          name: "Entender primero, usar después",
          desc: "Identifica significado y tono. En contextos formales o con personas externas, prefiere inglés neutro. En chats internos de confianza, algunos términos pueden ser naturales si no atacan a nadie.",
        },
        {
          type: "phrases",
          title: "Repaso rápido",
          items: [
            { en: "AI slop / workslop", es: "output de IA pulido pero poco útil." },
            { en: "Let's circle back.", es: "Retomemos esto luego (reuniones)." },
            { en: "LGTM with one nit.", es: "Aprobado con un detalle menor (review)." },
            { en: "Let him cook.", es: "Déjalo trabajar/confía en el proceso (informal)." }
          ],
        }
      ],
      exercises: [
        {
          id: "m7-l6-e1",
          type: "choice",
          prompt: "En un review, alguien aprueba con un detalle menor. ¿Qué expresión encaja?",
          options: ["LGTM with one nit.", "We are cooked.", "Take it offline.", "AI slop."],
          answer: 0,
          explanation:
            "'LGTM with one nit' indica aprobación con un comentario menor (visto en m7-l4).",
        },
        {
          id: "m7-l6-e2",
          type: "choice",
          prompt: "En una reunión, un tema se desvía y quieres tratarlo después. ¿Qué dices?",
          options: ["Let's take it offline.", "Ship it.", "Let him cook.", "Good catch."],
          answer: 0,
          explanation:
            "'Take it offline' sirve para aparcar el tema y tratarlo fuera de la reunión (m7-l3).",
        },
        {
          id: "m7-l6-e3",
          type: "builder",
          prompt: "Construye: 'Aprobado, con un detalle menor.'",
          words: ["LGTM", "with one", "nit."],
          answer: "LGTM with one nit.",
          explanation:
            "Chunk común en code reviews para aprobar sin bloquear por un detalle pequeño.",
        },
        {
          id: "m7-l6-e4",
          type: "choice",
          prompt: "¿Qué opción es más adecuada en un reporte formal para un cliente?",
          options: [
            "This deliverable needs revision because some parts are not useful.",
            "This is pure AI slop.",
            "This is cooked.",
            "No cap, this is bad."
          ],
          answer: 0,
          explanation:
            "En contextos formales es mejor usar inglés neutro y específico en lugar de slang.",
        },
        {
          id: "m7-l6-e5",
          type: "write",
          prompt: "Escribe en inglés: 'Retomémoslo después del standup.'",
          answer: "Let's circle back after the standup.",
          accept: ["Lets circle back after the standup."],
          hint: "Usa 'circle back'.",
          explanation:
            "Frase de reunión ya vista para proponer retomar un tema más tarde.",
        },
        {
          id: "m7-l6-e6",
          type: "choice",
          prompt: "Un compañero reenvía respuestas de IA sin revisarlas. ¿Cómo describes el patrón (con cuidado, sin atacar)?",
          options: [
            "Acting as a meat proxy.",
            "Doing a code review.",
            "Fixing the bug.",
            "Writing tests."
          ],
          answer: 0,
          explanation:
            "'Meat proxy' describe el patrón de reenviar output sin leer/validar (m7-l1). Úsalo con cuidado y en contexto apropiado.",
        }
      ],
    }
  ],
};
