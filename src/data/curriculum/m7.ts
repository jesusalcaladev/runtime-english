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
    {
      id: "m7-l3",
      slug: "slang-reuniones",
      title: "Slang de reuniones: prioridades y tiempo",
      step: "B2 · Especial 7.3",
      cefr: "B2",
      minutes: 10,
      summary:
        "Entiende y usa el vocabulario real de reuniones: circle back, take it offline, bandwidth y blockers.",
      objectives: [
        "Pedir aparcar un tema sin cortar la conversación.",
        "Expresar falta de tiempo o capacidad sin sonar evasivo.",
        "Distinguir jerga profesional de relleno de reunión.",
      ],
      pronunciation:
        "Let's take this offline and circle back after the standup. I don't have the bandwidth today.",
      blocks: [
        {
          type: "technique",
          name: "Jerga que ahorra tiempo",
          desc: "Estas expresiones funcionan cuando destraban una reunión: 'take it offline' saca un tema largo del grupo, 'circle back' fija un momento para retomarlo y 'blocker' nombra lo que impide avanzar. Úsalas para decidir, no para evitar responsabilidades.",
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
            { en: "parking lot", es: "temas aparcados para después", example: "Put it in the parking lot." },
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
            { en: "Let's put that in the parking lot.", es: "Aparquemos ese tema para luego." },
          ],
        },
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
            "Ship it.",
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
            "No tengo feedback esta semana.",
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
      ],
    },
    {
      id: "m7-l4",
      slug: "slang-reviews-codigo",
      title: "Slang de reviews y código",
      step: "B2 · Especial 7.4",
      cefr: "B2",
      minutes: 10,
      summary:
        "Lee comentarios de review sin malinterpretarlos: LGTM, nit, bikeshedding, tech debt y ship it.",
      objectives: [
        "Distinguir un bloqueo real de un detalle menor en un review.",
        "Nombrar deuda técnica y discusiones triviales con precisión.",
        "Responder a un review con el tono adecuado.",
      ],
      pronunciation:
        "LGTM with one nit. Ship it, and we'll pay down the tech debt next sprint.",
      blocks: [
        {
          type: "technique",
          name: "No todo comentario es un bloqueo",
          desc: "En un review, 'LGTM' significa aprobado; 'nit' es un detalle menor y no debería bloquear el merge; 'bikeshedding' es discutir lo trivial mientras lo importante espera. Saber esta diferencia evita que un review de cinco minutos se convierta en una tarde.",
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
            { en: "workslop", es: "trabajo con apariencia de calidad pero poco valor", example: "The dashboard is pure workslop." },
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
            { en: "Good catch, thanks.", es: "Buen hallazgo, gracias." },
          ],
        },
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
            "Falta documentación obligatoria.",
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
            "La falta de tests unitarios.",
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
            "We need to reduce the tech debt before adding more features.",
          ],
          hint: "Usa 'pay down the tech debt'.",
          explanation:
            "'Pay down debt' se usa tanto para dinero como para deuda técnica: reducirla de forma progresiva.",
        },
      ],
    },
    {
      id: "m7-l5",
      slug: "repaso-final-practica-extra",
      title: "Repaso final: práctica extra",
      step: "Extra · Repaso completo",
      cefr: "B1",
      minutes: 25,
      summary:
        "Una sesión larga e intuitiva para repasar todo: cómo dirías esto, escríbelo, arma frases y elige la mejor opción.",
      objectives: [
        "Repasar vocabulario y frases clave de todo el curso en situaciones reales.",
        "Practicar cómo decir y escribir ideas comunes de trabajo técnico.",
        "Ganar fluidez combinando verbos, tiempos, conectores y comunicación profesional.",
      ],
      pronunciation:
        "I mean, the build failed, but I fixed it. Actually, we should add a test before we merge.",
      blocks: [
        {
          type: "technique",
          name: "Cómo usar este repaso",
          desc: "Piensa primero en la idea en español y luego elige la forma más simple y clara en inglés. Si dudas, usa estructuras cortas: sujeto + verbo + complemento. No busques sonar complejo; busca sonar claro. Repite en voz alta las frases correctas para ganar ritmo.",
        },
        {
          type: "callout",
          tone: "tip",
          title: "Fórmula rápida para responder bien",
          body: "1) Di el contexto: 'I mean...' / 'Actually...' / 'Basically...'. 2) Di el hecho: qué pasa o qué hiciste. 3) Di el siguiente paso: 'I will fix it', 'Can you review it?', 'We should test it'.",
        },
        {
          type: "phrases",
          title: "Frases útiles para repasar",
          items: [
            { en: "How would you say this in English?", es: "¿Cómo dirías esto en inglés?" },
            { en: "Could you clarify what you mean?", es: "¿Podrías aclarar a qué te refieres?" },
            { en: "I fixed the bug and pushed the changes.", es: "Arreglé el bug y subí los cambios." },
            { en: "The build failed, but I'm looking into it.", es: "El build falló, pero lo estoy revisando." },
            { en: "I mean, it's not a blocker.", es: "O sea, no es un bloqueador." },
            { en: "Actually, the issue is in the frontend.", es: "En realidad, el problema está en el frontend." },
            { en: "Can you review this PR when you have a minute?", es: "¿Puedes revisar este PR cuando tengas un minuto?" },
            { en: "Do you have an ETA for the fix?", es: "¿Tienes una estimación para el arreglo?" },
          ],
        },
        {
          type: "table",
          title: "Repaso rápido: idea → inglés",
          columns: ["Quieres decir...", "Puedes decir..."],
          rows: [
            ["Estoy trabajando en esto", "I'm working on it."],
            ["Ya lo arreglé", "I fixed it."],
            ["El deploy falló", "The deployment failed."],
            ["¿Puedes revisarlo?", "Can you review it?"],
            ["En realidad es otro problema", "Actually, it's a different issue."],
            ["Básicamente falta un test", "Basically, we're missing a test."],
          ],
        },
        {
          type: "vocab",
          title: "Palabras y conectores clave",
          items: [
            { en: "fix / fixed", es: "arreglar / arreglé", example: "I fixed the bug." },
            { en: "deploy / deployment", es: "desplegar / despliegue", example: "The deployment failed." },
            { en: "review", es: "revisar / revisión", example: "Can you review my PR?" },
            { en: "merge", es: "fusionar cambios", example: "Let's merge it after the review." },
            { en: "I mean", es: "o sea / quiero decir", example: "I mean, we need more time." },
            { en: "actually", es: "en realidad / de hecho", example: "Actually, it works now." },
          ],
        },
      ],
      exercises: [
        {
          id: "m7-l5-e1",
          type: "choice",
          prompt: "¿Cómo dirías: 'Estoy trabajando en el bug ahora'?",
          options: [
            "I work on the bug now.",
            "I'm working on the bug now.",
            "I worked on the bug now.",
            "I am work on the bug now.",
          ],
          answer: 1,
          explanation:
            "Para algo que estás haciendo en este momento, usa presente continuo: 'I'm working on...'.",
        },
        {
          id: "m7-l5-e2",
          type: "write",
          prompt: "Escríbelo en inglés: 'Arreglé el bug ayer.'",
          answer: "I fixed the bug yesterday.",
          accept: ["I fixed the bug yesterday"],
          hint: "Pasado simple de 'fix' = 'fixed'.",
          explanation:
            "Acción terminada en el pasado: 'I fixed the bug yesterday.'",
        },
        {
          id: "m7-l5-e3",
          type: "choice",
          prompt: "¿Cómo dirías con claridad: '¿Puedes aclarar a qué te refieres?'",
          options: [
            "Can you clarify what you mean?",
            "You clarify what you mean?",
            "Can you clarifying what you mean?",
            "Do you can clarify what you mean?",
          ],
          answer: 0,
          explanation:
            "Pregunta educada y natural: 'Can you clarify what you mean?'.",
        },
        {
          id: "m7-l5-e4",
          type: "write",
          prompt: "Escríbelo en inglés: 'El despliegue falló, pero ya lo estoy revisando.'",
          answer: "The deployment failed, but I'm looking into it.",
          accept: [
            "The deployment failed, but I am looking into it.",
            "The deploy failed, but I'm looking into it.",
            "The deploy failed, but I am looking into it.",
          ],
          hint: "Usa 'failed' y 'I'm looking into it'.",
          explanation:
            "Combinas pasado simple (lo que pasó) con presente continuo (lo que haces ahora): 'failed, but I'm looking into it'.",
        },
        {
          id: "m7-l5-e5",
          type: "builder",
          prompt: "Construye: '¿Puedes revisar este PR cuando tengas un minuto?'",
          words: ["Can you review", "this PR", "when you have", "a minute?"],
          answer: "Can you review this PR when you have a minute?",
          explanation:
            "Petición amable y común en trabajo asíncrono: 'when you have a minute'.",
        },
        {
          id: "m7-l5-e6",
          type: "choice",
          prompt: "Quieres corregir algo que dijiste antes. ¿Cuál suena más natural?",
          options: [
            "Actually, the issue is in the frontend.",
            "Currently, the issue is in the frontend.",
            "Yesterday, the issue is in the frontend.",
            "Maybe actually currently frontend.",
          ],
          answer: 0,
          explanation:
            "'Actually' corrige o aclara: 'en realidad, el problema está en el frontend'.",
        },
        {
          id: "m7-l5-e7",
          type: "write",
          prompt: "Escríbelo en inglés: 'O sea, no es un bloqueador, pero deberíamos arreglarlo pronto.'",
          answer: "I mean, it's not a blocker, but we should fix it soon.",
          accept: [
            "I mean, it is not a blocker, but we should fix it soon.",
          ],
          hint: "Empieza con 'I mean,'.",
          explanation:
            "'I mean' reformula o suaviza la idea; 'we should fix it soon' propone el siguiente paso.",
        },
        {
          id: "m7-l5-e8",
          type: "builder",
          prompt: "Construye: 'Básicamente, necesitamos limpiar la caché.'",
          words: ["Basically,", "we need", "to clear", "the cache."],
          answer: "Basically, we need to clear the cache.",
          explanation:
            "'Basically' resume la idea principal de forma simple.",
        },
        {
          id: "m7-l5-e9",
          type: "choice",
          prompt: "En un daily, ¿cuál opción es clara y profesional?",
          options: [
            "Yesterday I fixed the login bug. Today I'm working on tests. I'm blocked by API access.",
            "Bug fixed. Tests. Blocked.",
            "I do things and maybe blocked.",
            "Yesterday today blocked yes.",
          ],
          answer: 0,
          explanation:
            "Una buena actualización dice qué hiciste, qué harás y si tienes un bloqueo, con frases completas y claras.",
        },
        {
          id: "m7-l5-e10",
          type: "write",
          prompt: "Escríbelo en inglés: '¿Tienes una estimación para el arreglo?'",
          answer: "Do you have an ETA for the fix?",
          accept: [
            "Do you have an ETA for the fix",
            "Do you have an ETA on the fix?",
          ],
          hint: "Usa 'ETA for the fix'.",
          explanation:
            "'ETA' (estimated time of arrival/time) es muy común para pedir una estimación de tiempo.",
        },
        {
          id: "m7-l5-e11",
          type: "choice",
          prompt: "¿Cómo dirías: 'Hice push de los cambios y abrí un PR'?",
          options: [
            "I pushed the changes and opened a PR.",
            "I push the changes and open a PR yesterday.",
            "I pushing the changes and opened a PR.",
            "I have push the changes and opened a PR.",
          ],
          answer: 0,
          explanation:
            "Dos acciones completadas en pasado: 'pushed' y 'opened'.",
        },
        {
          id: "m7-l5-e12",
          type: "write",
          prompt: "Escríbelo en inglés: 'Nunca subas secretos al repositorio.'",
          answer: "Never commit secrets to the repository.",
          accept: [
            "Never commit secrets to the repo.",
            "Never push secrets to the repository.",
            "Never push secrets to the repo.",
          ],
          hint: "Imperativo negativo: 'Never commit...'.",
          explanation:
            "Regla de seguridad básica expresada con imperativo: 'Never commit secrets...'.",
        },
        {
          id: "m7-l5-e13",
          type: "builder",
          prompt: "Construye: 'Los tests pasan. Adelante, podemos hacer merge.'",
          words: ["The tests pass.", "Ship it,", "we can merge."],
          answer: "The tests pass. Ship it, we can merge.",
          explanation:
            "Repaso de revisión: confirmar que los tests pasan y dar luz verde para mergear.",
        },
        {
          id: "m7-l5-e14",
          type: "write",
          prompt: "Escríbelo en inglés: 'En otras palabras, el servicio no responde.'",
          answer: "In other words, the service is not responding.",
          accept: [
            "In other words, the service isn't responding.",
            "In other words, the service is down.",
          ],
          hint: "Empieza con 'In other words,'.",
          explanation:
            "'In other words' reformula la idea para que sea más clara.",
        },
        {
          id: "m7-l5-e15",
          type: "choice",
          prompt: "¿Cómo dirías: 'Podemos volver a este tema después del standup'?",
          options: [
            "We can circle back after the standup.",
            "We can circle after the standup back.",
            "We can back circle after the standup.",
            "We can standup circle after.",
          ],
          answer: 0,
          explanation:
            "'Circle back' significa retomar un tema más tarde: frase muy común en equipos.",
        },
        {
          id: "m7-l5-e16",
          type: "write",
          prompt: "Escríbelo en inglés: 'Para ser honesto, creo que deberíamos agregar más tests.'",
          answer: "To be honest, I think we should add more tests.",
          accept: [
            "To be honest, I think we should add more tests",
            "Honestly, I think we should add more tests.",
          ],
          hint: "Empieza con 'To be honest,'.",
          explanation:
            "'To be honest' introduce una opinión directa de forma natural; 'we should add more tests' da una recomendación clara.",
        },
      ],
    },
  ],
};
