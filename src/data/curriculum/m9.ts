import type { Module } from "../../lib/types";

export const m9: Module = {
  id: "m9",
  code: "MOD 09",
  level: "B1-B2",
  title: "Situaciones reales: entrevistas, incidentes y demos",
  shortTitle: "Situaciones Reales",
  description:
    "Práctica contextual para entrevistas, incidentes, RFCs, demos y feedback con ejercicios de escucha, speaking y corrección.",
  sessions: [
    {
      id: "m9-l1",
      slug: "entrevista-tecnica-comportamental",
      title: "Entrevista técnica y comportamental",
      step: "B1 · Paso 9.1",
      cefr: "B1",
      minutes: 12,
      summary:
        "Responde con claridad en entrevistas: estructura tu experiencia, impacto y aprendizaje.",
      objectives: [
        "Explicar tu experiencia con ejemplos concretos (STAR).",
        "Hablar de trade-offs y decisiones técnicas.",
        "Practicar respuestas orales y corrección de errores comunes."
      ],
      pronunciation: "In my previous role, I reduced deployment time by 30% by automating our CI pipeline.",
      blocks: [
        {
          type: "technique",
          name: "Estructura STAR para entrevistas",
          desc: "Situation, Task, Action, Result. Sé específico: qué hiciste, por qué y qué impacto tuvo. En inglés técnico, evita respuestas vagas; usa métricas y verbos claros (implemented, reduced, led, fixed).",
        },
        {
          type: "phrases",
          title: "Frases útiles en entrevistas",
          items: [
            { en: "In my previous role, I was responsible for...", es: "En mi rol anterior, era responsable de..." },
            { en: "The main challenge was..., so I decided to...", es: "El principal reto era..., así que decidí..." },
            { en: "As a result, we reduced latency by 20%.", es: "Como resultado, redujimos la latencia un 20%." },
            { en: "If I had to do it again, I would...", es: "Si tuviera que hacerlo de nuevo, yo..." }
          ],
        },
        {
          type: "vocab",
          title: "Vocabulario de entrevistas",
          items: [
            { en: "trade-off", es: "compensación / equilibrio entre opciones", example: "There was a trade-off between speed and reliability." },
            { en: "ownership", es: "responsabilidad y autonomía", example: "I took ownership of the migration." },
            { en: "impact", es: "impacto / resultado medible", example: "We measured the impact on error rates." },
            { en: "stakeholder", es: "parte interesada", example: "I communicated updates to stakeholders." }
          ],
        },
      ],
      exercises: [
        {
          id: "m9-l1-e1",
          type: "listen",
          prompt: "Dictado: escucha y escribe la frase de entrevista.",
          audioText: "As a result, we reduced latency by twenty percent.",
          answer: "As a result, we reduced latency by 20%.",
          accept: ["As a result we reduced latency by 20 percent", "As a result, we reduced latency by 20 percent."],
          explanation: "Practica comprensión auditiva y números/porcentajes en contexto profesional.",
        },
        {
          id: "m9-l1-e2",
          type: "speak",
          prompt: "Practica tu pronunciación para una respuesta de entrevista.",
          answer: "I took ownership of the migration and coordinated with stakeholders.",
          hint: "Habla claro y a ritmo natural.",
          explanation: "El objetivo es sonar claro y natural; usa 'took ownership' y 'stakeholders' correctamente.",
        },
        {
          id: "m9-l1-e3",
          type: "fix-error",
          prompt: "Corrige el error común en inglés de entrevista.",
          sentence: "I am responsible of the backend service.",
          answer: "I am responsible for the backend service.",
          accept: ["I was responsible for the backend service."],
          explanation: "En inglés se dice 'responsible for', no 'responsible of'.",
        },
        {
          id: "m9-l1-e4",
          type: "fill-blank",
          prompt: "Completa la respuesta con la estructura adecuada.",
          template: "The main challenge was ___, so I ___ a caching layer. As a result, we ___ response time.",
          blanks: ["high latency|slow responses", "implemented|added", "reduced|improved"],
          explanation: "Usa causa, acción y resultado medible: challenge → action → result.",
        }
      ],
    },
    {
      id: "m9-l2",
      slug: "incidentes-rfc-demos-feedback",
      title: "Incidentes, RFCs, demos y feedback",
      step: "B2 · Paso 9.2",
      cefr: "B2",
      minutes: 14,
      summary:
        "Comunícate en situaciones críticas y colaborativas: incidentes, propuestas, demos y feedback.",
      objectives: [
        "Reportar incidentes con estado, impacto y próximos pasos.",
        "Explicar una propuesta/RFC y pedir feedback.",
        "Ordenar un diálogo de demo/incidente y practicar role-play."
      ],
      pronunciation: "We're investigating the issue. The current impact is limited to EU users, and we'll share an update in 15 minutes.",
      blocks: [
        {
          type: "technique",
          name: "Comunicación en incidentes y RFCs",
          desc: "En incidentes: qué pasa, impacto, qué se está haciendo y cuándo habrá próxima actualización. En RFCs: contexto, propuesta, alternativas y trade-offs. En demos y feedback: sé claro, específico y orientado a acciones.",
        },
        {
          type: "phrases",
          title: "Frases para situaciones reales",
          items: [
            { en: "We're investigating the issue and will share an update soon.", es: "Estamos investigando el problema y compartiremos una actualización pronto." },
            { en: "The goal of this RFC is to...", es: "El objetivo de este RFC es..." },
            { en: "Let me walk you through the demo.", es: "Déjame mostrarte la demo paso a paso." },
            { en: "Could you clarify what you mean by...?", es: "¿Podrías aclarar a qué te refieres con...?" }
          ],
        },
        {
          type: "vocab",
          title: "Vocabulario clave",
          items: [
            { en: "root cause", es: "causa raíz", example: "We found the root cause in the cache invalidation." },
            { en: "rollback", es: "revertir a una versión anterior", example: "We decided to roll back the release." },
            { en: "proposal", es: "propuesta (RFC)", example: "This proposal simplifies the API." },
            { en: "actionable feedback", es: "feedback accionable/concreto", example: "Please give actionable feedback on the design." }
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Objetivos de práctica",
          body: "Usa las rutas por objetivo (trabajo diario, entrevistas, inglés técnico) desde Ajustes para priorizar sesiones relevantes; el repaso rápido y el diccionario se adaptan suavemente a tu objetivo.",
        }
      ],
      exercises: [
        {
          id: "m9-l2-e1",
          type: "dialogue-order",
          prompt: "Ordena el diálogo de actualización de incidente.",
          lines: [
            "We detected an increase in 500 errors.",
            "What's the current impact?",
            "It's affecting about 10% of EU users.",
            "We're rolling back now and will update you in 10 minutes."
          ],
          explanation: "Un buen update de incidente comunica detección, impacto y acción/próximo paso.",
        },
        {
          id: "m9-l2-e2",
          type: "listen",
          prompt: "Dictado: escucha el mensaje de demo y escríbelo.",
          audioText: "Let me walk you through the demo. First, I will create a new project.",
          answer: "Let me walk you through the demo. First, I will create a new project.",
          accept: ["Let me walk you through the demo. First I'll create a new project."],
          explanation: "Frases claras y secuenciales son clave al presentar demos.",
        },
        {
          id: "m9-l2-e3",
          type: "roleplay",
          prompt: "Role-play: responde en un incidente en producción.",
          scenario: "Eres backend on-call. Hay errores 500 tras un deploy y te preguntan por el estado.",
          goal: "Explica impacto, acción actual y cuándo darás la próxima actualización.",
          answer: "We're investigating the issue. The impact is limited to some users, we're rolling back the release, and we'll share an update in 15 minutes.",
          accept: [
            "We are investigating the issue. We are rolling back and will share an update in 15 minutes.",
            "We're investigating the issue, rolling back now, and will share an update in 15 minutes."
          ],
          hint: "Incluye: investigating, impact, rollback/action, next update.",
          explanation: "Comunicación de incidentes: estado + impacto + acción + siguiente actualización.",
        },
        {
          id: "m9-l2-e4",
          type: "speak",
          prompt: "Practica cómo pedir feedback claro en una revisión/RFC.",
          answer: "Could you give me actionable feedback on this proposal?",
          hint: "Pide feedback concreto y accionable.",
          explanation: "'Actionable feedback' pide comentarios específicos que puedas aplicar.",
        }
      ],
    },
  ],
};
