import type { Module } from '../../lib/types'

export const m9: Module = {
  id: 'm9',
  code: 'MOD 09',
  level: 'B1-B2',
  title: 'Situaciones reales: entrevistas, incidentes y demos',
  shortTitle: 'Situaciones Reales',
  description:
    'Práctica contextual para entrevistas, incidentes, RFCs, demos y feedback con ejercicios de escucha, speaking y corrección.',
  sessions: [
    {
      id: 'm9-l1',
      slug: 'entrevista-tecnica-comportamental',
      title: 'Entrevista técnica y comportamental',
      step: 'B1 · Paso 9.1',
      cefr: 'B1',
      summary:
        'Responde con claridad en entrevistas: estructura tu experiencia, impacto y aprendizaje.',
      objectives: [
        'Explicar tu experiencia con ejemplos concretos (STAR).',
        'Hablar de trade-offs y decisiones técnicas.',
        'Practicar respuestas orales y corrección de errores comunes.',
      ],
      pronunciation:
        'In my previous role, I reduced deployment time by 30% by automating our CI pipeline.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere pasado simple, vocabulario de logros y capacidad de explicar impacto. Esta lección practica STAR y frases de entrevista; escucha/speaking/corrección usan estructuras presentadas aquí.',
        },
        {
          type: 'technique',
          name: 'Estructura STAR (entrevistas)',
          desc: 'Situation (contexto), Task (tu rol/objetivo), Action (lo que hiciste), Result (impacto, idealmente medible). Sé específico y usa verbos claros (implemented, reduced, led, fixed).',
        },
        {
          type: 'phrases',
          title: 'Frases útiles en entrevistas',
          items: [
            {
              en: 'In my previous role, I was responsible for...',
              es: 'En mi rol anterior, era responsable de...',
            },
            {
              en: 'The main challenge was..., so I decided to...',
              es: 'El principal reto era..., así que decidí...',
            },
            {
              en: 'As a result, we reduced latency by 20%.',
              es: 'Como resultado, redujimos la latencia un 20%.',
            },
            {
              en: 'If I could do it again, I would...',
              es: 'Si pudiera hacerlo de nuevo, lo haría...',
            },
          ],
        },
        {
          type: 'vocab',
          title: 'Vocabulario de entrevistas (nuevo o clave aquí)',
          items: [
            {
              en: 'trade-off',
              es: 'compensación / equilibrio entre opciones',
              example: 'There was a trade-off between speed and reliability.',
            },
            {
              en: 'ownership',
              es: 'responsabilidad y autonomía',
              example: 'I took ownership of the migration.',
            },
            {
              en: 'impact',
              es: 'impacto / resultado medible',
              example: 'We measured the impact on error rates.',
            },
            {
              en: 'stakeholder',
              es: 'parte interesada',
              example: 'I communicated updates to stakeholders.',
            },
            {
              en: 'challenge',
              es: 'reto/desafío',
              example: 'The main challenge was high latency.',
            },
            {
              en: 'responsible for',
              es: 'responsable de',
              example: 'I was responsible for the backend service.',
            },
            {
              en: 'as a result',
              es: 'como resultado',
              example: 'As a result, we reduced latency by 20%.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Contestar con impacto (STAR)',
          setting: 'Entrevista técnica, videollamada',
          goal: 'Responder una pregunta de comportamiento con estructura STAR.',
          context:
            'Una entrevistadora pregunta por un reto anterior y el candidato responde con situación, acción, resultado y trade-off.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Interviewer',
              en: 'Tell me about a challenge you faced in your previous role.',
              es: 'Cuéntame un reto que enfrentaste en tu rol anterior.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Candidate',
              en: 'In my previous role, I was responsible for the backend service. Latency was high.',
              es: 'En mi rol anterior era responsable del servicio backend. La latencia era alta.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Interviewer',
              en: 'What did you do, and what was the result?',
              es: '¿Qué hiciste y cuál fue el resultado?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Candidate',
              en: 'I took ownership of the migration and added caching. As a result, we reduced latency by 20%.',
              es: 'Me hice responsable de la migración y añadí caché. Como resultado, redujimos la latencia un 20%.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Interviewer',
              en: 'Was there a trade-off?',
              es: '¿Hubo algún trade-off?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Candidate',
              en: 'Yes, between speed and reliability. I coordinated with stakeholders before deciding.',
              es: 'Sí, entre velocidad y fiabilidad. Coordiné con las partes interesadas antes de decidir.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm9-l1-e1',
          type: 'listen',
          prompt: 'Dictado: escucha y escribe la frase de entrevista.',
          audioText: 'As a result, we reduced latency by twenty percent.',
          answer: 'As a result, we reduced latency by 20%.',
          accept: [
            'As a result we reduced latency by 20 percent',
            'As a result, we reduced latency by 20 percent.',
          ],
          hint: "Empieza con 'As a result,' y escribe el porcentaje con número: '20%'.",
          explanation:
            'Practica comprensión auditiva y números/porcentajes en contexto profesional.',
        },
        {
          id: 'm9-l1-e2',
          type: 'speak',
          prompt: 'Practica tu pronunciación para una respuesta de entrevista.',
          answer: 'I took ownership of the migration and coordinated with stakeholders.',
          hint: 'Habla claro y a ritmo natural.',
          explanation:
            "El objetivo es sonar claro y natural; usa 'took ownership' y 'stakeholders' correctamente.",
        },
        {
          id: 'm9-l1-e3',
          type: 'fix-error',
          prompt: 'Corrige el error común en inglés de entrevista.',
          sentence: 'I am responsible of the backend service.',
          answer: 'I am responsible for the backend service.',
          accept: [
            'I was responsible for the backend service.',
            "I'm responsible for the backend service.",
          ],
          explanation: "En inglés se dice 'responsible for', no 'responsible of'.",
        },
        {
          id: 'm9-l1-e5',
          type: 'choice',
          prompt: 'En una entrevista, ¿qué respuesta suena más concreta y profesional?',
          options: [
            'I did some backend stuff.',
            'I worked on performance, I think.',
            'I reduced API latency by 30% by adding caching and optimizing queries.',
            'I am good at coding.',
          ],
          answer: 2,
          explanation:
            "Las respuestas fuertes incluyen acción y resultado medible ('reduced API latency by 30%...').",
        },
        {
          id: 'm9-l1-e6',
          type: 'builder',
          prompt: "Construye: 'Me hice responsable de la migración.'",
          words: ['I took', 'ownership', 'of the', 'migration.'],
          answer: 'I took ownership of the migration.',
          explanation:
            "'Take ownership' es una frase clave en entrevistas para mostrar responsabilidad y autonomía (vocabulario de esta lección).",
        },
        {
          id: 'm9-l1-e7',
          type: 'choice',
          prompt: 'Según la entrevista, ¿cuál fue el reto principal y qué hizo Leo?',
          options: [
            'Latencia alta; se hizo responsable de la migración y añadió caché.',
            'Pocos tests; reescribió el frontend.',
            'Un incidente; hizo un rollback.',
            'Falta de documentación; escribió las docs.',
          ],
          answer: 0,
          explanation:
            "Leo dice 'Latency was high' y 'I took ownership of the migration and added caching'.",
        },
        {
          id: 'm9-l1-e10',
          type: 'dialogue-branch',
          prompt: 'Elige la mejor respuesta en una entrevista técnica.',
          context:
            'En una entrevista técnica, la entrevistadora pregunta por un bug difícil y qué aprendió de él.',
          steps: [
            {
              speaker: 'Interviewer',
              line: 'Tell me about a hard bug you fixed.',
              choices: [
                {
                  en: 'I tracked down a race condition and rolled back the deploy.',
                  correct: true,
                  feedback: 'Acción concreta + resultado.',
                },
                {
                  en: 'I do not remember any bugs.',
                  correct: false,
                  feedback: 'No aporta experiencia relevante.',
                },
              ],
            },
            {
              speaker: 'Interviewer',
              line: 'And what did you learn from it?',
              choices: [
                {
                  en: 'I added a regression test and documented the trade-off.',
                  correct: true,
                  feedback: 'Aprendizaje concreto y acción posterior.',
                },
                {
                  en: 'Nothing. It was not my bug.',
                  correct: false,
                  feedback: 'No muestra reflexión ni responsabilidad.',
                },
              ],
            },
          ],
          explanation:
            'En una conversación real importa sonar claro, concreto y respetuoso con el turno del otro.',
        },
      ],
    },
    {
      id: 'm9-l2',
      slug: 'incidentes-rfc-demos-feedback',
      title: 'Incidentes, RFCs, demos y feedback',
      step: 'B2 · Paso 9.2',
      cefr: 'B2',
      summary:
        'Comunícate en situaciones críticas y colaborativas: incidentes, propuestas, demos y feedback.',
      objectives: [
        'Reportar incidentes con estado, impacto y próximos pasos.',
        'Explicar una propuesta/RFC y pedir feedback.',
        'Ordenar un diálogo de demo/incidente y practicar role-play.',
      ],
      pronunciation:
        "We're investigating the issue. The current impact is limited to EU users, and we'll share an update in 15 minutes.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Integra comunicación de incidentes (M4), propuestas/demos/feedback (M5–M6) y conectores. Los ejercicios combinan listening, orden de diálogo, roleplay y speaking con el vocabulario de esta sesión.',
        },
        {
          type: 'technique',
          name: 'Comunicar en situaciones críticas y colaborativas',
          desc: 'Incidente: estado + impacto + acción + próxima actualización. RFC/propuesta: contexto + propuesta + alternativas/trade-offs. Demo/feedback: pasos claros y comentarios accionables.',
        },
        {
          type: 'phrases',
          title: 'Frases para situaciones reales',
          items: [
            {
              en: "We're investigating the issue and will share an update soon.",
              es: 'Estamos investigando el problema y compartiremos una actualización pronto.',
            },
            { en: 'The goal of this RFC is to...', es: 'El objetivo de este RFC es...' },
            {
              en: 'Let me walk you through the demo.',
              es: 'Déjame mostrarte la demo paso a paso.',
            },
            {
              en: 'Could you clarify what you mean by...?',
              es: '¿Podrías aclarar a qué te refieres con...?',
            },
          ],
        },
        {
          type: 'vocab',
          title: 'Vocabulario clave',
          items: [
            {
              en: 'root cause',
              es: 'causa raíz',
              example: 'We found the root cause in the cache invalidation.',
            },
            {
              en: 'rollback',
              es: 'revertir a una versión anterior',
              example: 'We decided to roll back the release.',
            },
            { en: 'proposal', es: 'propuesta (RFC)', example: 'This proposal simplifies the API.' },
            {
              en: 'actionable feedback',
              es: 'feedback accionable/concreto',
              example: 'Please give actionable feedback on the design.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Aclarar el plan de respaldo tras el incidente',
          setting: 'Slack, #on-call (tras el incidente)',
          goal: 'Aclarar el plan de respaldo y acordar la demo de la solución.',
          context:
            'Tras un incidente, Maya actualiza a Leo sobre la mitigación y revisan juntos el RFC, el plan de respaldo y la demo de la solución.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Quick update: we're investigating the 500s. The impact is limited to EU users.",
              es: 'Actualización rápida: estamos investigando los 500. El impacto se limita a usuarios de la UE.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Did we find the root cause?',
              es: '¿Encontramos la causa raíz?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Yes, cache invalidation. We decided to roll back the release and will update you in 15 minutes.',
              es: 'Sí, invalidación de caché. Decidimos revertir el despliegue y os actualizamos en 15 minutos.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Got it. While that runs, could you give me actionable feedback on my RFC for the fix?',
              es: 'Entendido. Mientras tanto, ¿podrías darme feedback accionable sobre mi RFC para la solución?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Sure. The goal is clear, but we still need to agree on a fallback plan. Let me walk you through the demo first.',
              es: 'Claro. El objetivo está claro, pero todavía debemos acordar un plan de respaldo. Déjame mostrarte primero la demo paso a paso.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Thanks. Before that, could you clarify what you mean by the fallback plan?',
              es: 'Gracias. Antes, ¿podrías aclarar a qué te refieres con el plan de respaldo?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm9-l2-e2',
          type: 'listen',
          prompt: 'Dictado: escucha el mensaje de demo y escríbelo.',
          audioText: 'Let me walk you through the demo. First, I will create a new project.',
          answer: 'Let me walk you through the demo. First, I will create a new project.',
          accept: ["Let me walk you through the demo. First I'll create a new project."],
          hint: "Dos frases: 'Let me walk you through...' y 'First, I will/I'll...'.",
          explanation: 'Frases claras y secuenciales son clave al presentar demos.',
        },
        {
          id: 'm9-l2-e4',
          type: 'speak',
          prompt: 'Practica cómo pedir feedback claro en una revisión/RFC.',
          answer: 'Could you give me actionable feedback on this proposal?',
          hint: 'Pide feedback concreto y accionable.',
          explanation: "'Actionable feedback' pide comentarios específicos que puedas aplicar.",
        },
        {
          id: 'm9-l2-e5',
          type: 'write',
          prompt: 'Escribe un update breve de incidente: impacto + acción + próxima actualización.',
          answer:
            "The issue affects some EU users. We're rolling back now and will share an update in 15 minutes.",
          accept: [
            'The issue affects some EU users. We are rolling back now and will share an update in 15 minutes.',
            "The issue impacts some EU users. We're rolling back and will share an update in 15 minutes.",
          ],
          hint: 'Incluye impacto, acción actual y cuándo habrá próxima actualización.',
          explanation:
            'Un buen update de incidente comunica alcance/impacto, qué se está haciendo ahora y cuándo volverás a informar.',
        },
        {
          id: 'm9-l2-e6',
          type: 'choice',
          prompt:
            'En una propuesta/RFC, quieres explicar el objetivo con claridad. ¿Qué frase encaja mejor?',
          options: [
            'The goal of this RFC is to simplify the deployment process.',
            'RFC goal deploy maybe.',
            'We do deploy thing.',
            'This RFC is deploy.',
          ],
          answer: 0,
          explanation: "Abre la propuesta con un objetivo claro: 'The goal of this RFC is to...'",
        },
        {
          id: 'm9-l2-e11',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'State the impact, the action we took, and the next update.',
          hint: 'Tres partes: impacto, acción y siguiente actualización.',
          explanation:
            'Repetir esta estructura en voz alta la deja lista para usarla en el próximo incidente.',
        },
        {
          id: 'm9-l2-e12',
          type: 'fix-error',
          prompt: 'Corrige el error en el reporte del incidente.',
          sentence: 'We roll back the release and we update the channel yesterday.',
          answer: 'We rolled back the release and updated the channel yesterday.',
          hint: "'Yesterday' pide pasado simple y evita repetir 'we'.",
          explanation:
            'En un reporte de incidente, las acciones pasadas van en pasado simple: rolled back / updated.',
        },
      ],
    },
  ],
}
