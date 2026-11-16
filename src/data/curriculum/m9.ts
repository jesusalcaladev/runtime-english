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
          context:
            'Una entrevistadora pregunta por un reto y el candidato responde con estructura STAR.',
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
              en: 'I took ownership of the migration and added caching. As a result, we reduced latency by 30%.',
              es: 'Me hice responsable de la migración y añadí caché. Como resultado, redujimos la latencia un 30%.',
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
          id: 'm9-l1-e4',
          type: 'fill-blank',
          prompt:
            'Completa la respuesta con la estructura adecuada (STAR: reto → acción → resultado).',
          template:
            'The main challenge was ___, so I ___ a caching layer. As a result, we ___ response time.',
          blanks: ['high latency|slow responses', 'implemented|added', 'reduced|improved'],
          explanation: 'Usa causa, acción y resultado medible: challenge → action → result.',
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
          id: 'm9-l1-e8',
          type: 'choice',
          prompt: '¿Cuál fue el resultado medible y el trade-off que mencionó Leo?',
          options: [
            'Redujeron la latencia un 30%; hubo un trade-off entre velocidad y fiabilidad.',
            'Redujeron costes un 10%; no hubo trade-off.',
            'Aumentaron la latencia; el trade-off fue con el equipo.',
            'No hubo ningún resultado medible.',
          ],
          answer: 0,
          explanation:
            "Dice 'As a result, we reduced latency by 30%' y 'between speed and reliability' (además de 'I coordinated with stakeholders').",
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
          title: 'Del incidente al RFC y la demo',
          context:
            'Maya y Leo pasan de un update de incidente al feedback sobre un RFC y una demo.',
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
              en: 'Got it. Could you give me actionable feedback on my RFC for the fix?',
              es: 'Entendido. ¿Podrías darme feedback accionable sobre mi RFC para la solución?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Sure. The goal of this RFC is clear, but let me walk you through the demo first.',
              es: 'Claro. El objetivo del RFC es claro, pero déjame mostrarte primero la demo paso a paso.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Thanks. Could you clarify what you mean by the fallback plan?',
              es: 'Gracias. ¿Podrías aclarar a qué te refieres con el plan de respaldo?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm9-l2-e1',
          type: 'dialogue-order',
          prompt: 'Ordena el diálogo de actualización de incidente.',
          lines: [
            'We detected an increase in 500 errors.',
            "What's the current impact?",
            "It's affecting about 10% of EU users.",
            "We're rolling back now and will update you in 10 minutes.",
          ],
          explanation:
            'Un buen update de incidente comunica detección, impacto y acción/próximo paso.',
        },
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
          id: 'm9-l2-e3',
          type: 'roleplay',
          prompt: 'Role-play: responde en un incidente en producción.',
          scenario:
            'Eres backend on-call. Hay errores 500 tras un deploy y te preguntan por el estado.',
          goal: 'Explica impacto, acción actual y cuándo darás la próxima actualización.',
          answer:
            "We're investigating the issue. The impact is limited to some users, we're rolling back the release, and we'll share an update in 15 minutes.",
          accept: [
            'We are investigating the issue. We are rolling back and will share an update in 15 minutes.',
            "We're investigating the issue, rolling back now, and will share an update in 15 minutes.",
          ],
          hint: 'Incluye: investigating, impact, rollback/action, next update.',
          explanation:
            'Comunicación de incidentes: estado + impacto + acción + siguiente actualización.',
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
          id: 'm9-l2-e7',
          type: 'choice',
          prompt: 'En el diálogo, ¿cuál fue la causa raíz del incidente y qué acción tomaron?',
          options: [
            'La invalidación de caché; revertieron el despliegue.',
            'Un error de sintaxis; reiniciaron el servidor.',
            'Falta de tests; desplegaron de nuevo.',
            'Un problema de base de datos; escalaron al equipo.',
          ],
          answer: 0,
          explanation: "Maya dice 'Yes, cache invalidation. We decided to roll back the release'.",
        },
        {
          id: 'm9-l2-e8',
          type: 'choice',
          prompt: '¿Qué le pidió Leo a Maya sobre su RFC y la demo?',
          options: [
            'Feedback accionable sobre el RFC y que le mostrara la demo paso a paso.',
            'Que aprobara el RFC sin cambios.',
            'Que cancelara la demo.',
            'Que escribiera el RFC por él.',
          ],
          answer: 0,
          explanation:
            "Leo pregunta 'Could you give me actionable feedback on my RFC for the fix?' y Maya responde 'let me walk you through the demo first'.",
        },
      ],
    },
    {
      id: 'm9-l3',
      slug: 'practica-comunicacion-senior',
      title: 'Práctica: comunicación senior (entrevista, RFC y demos)',
      step: 'B2 · Paso 9.3 · Práctica guiada',
      cefr: 'B2',
      summary:
        'Sesión corta para separar y reforzar m9-l1 y m9-l2: impacto en entrevistas, comunicación de incidentes, RFCs y demos.',
      objectives: [
        'Expresar responsabilidad e impacto con estructuras ya vistas.',
        'Comunicar estado en incidentes y objetivos de propuestas.',
        'Guiar una demo y pedir aclaraciones con claridad.',
      ],
      pronunciation:
        'In my previous role, I was responsible for the API. The goal of this RFC is to simplify deployment. Let me walk you through the demo.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m9-l1 (entrevista técnica y comportamental) y m9-l2 (incidentes, RFCs, demos y feedback). Esta práctica usa solo frases y estructuras ya enseñadas en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Mensaje claro según el contexto',
          desc: "Entrevista: responsabilidad + reto/acción + resultado ('I was responsible for...', 'As a result...'). Incidente/RFC: estado u objetivo ('We're investigating...', 'The goal of this RFC is to...'). Demo: guía ('Let me walk you through...').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: 'In my previous role, I was responsible for...',
              es: 'En mi puesto anterior, fui responsable de...',
            },
            {
              en: 'As a result, we reduced latency by 20%.',
              es: 'Como resultado, redujimos la latencia un 20%.',
            },
            {
              en: "We're investigating the issue and will share an update soon.",
              es: 'Estamos investigando el problema y compartiremos una actualización pronto.',
            },
            { en: 'Let me walk you through the demo.', es: 'Déjame guiarte por la demo.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm9-l3-e1',
          type: 'choice',
          prompt:
            'En una entrevista quieres mostrar tu responsabilidad en el puesto anterior. ¿Qué opción encaja?',
          options: [
            'In my previous role, I was responsible for the payments service.',
            'I responsible previous role payments.',
            'My role previous was responsible maybe.',
            'Payments was my previous.',
          ],
          answer: 0,
          explanation: 'Frase modelo para hablar de responsabilidad en experiencia previa (m9-l1).',
        },
        {
          id: 'm9-l3-e2',
          type: 'builder',
          prompt: "Construye: 'Como resultado, redujimos la latencia un 20%.'",
          words: ['As a result,', 'we reduced latency', 'by 20%.'],
          answer: 'As a result, we reduced latency by 20%.',
          explanation:
            'Expresar impacto con resultado concreto es clave en entrevistas y comunicación senior.',
        },
        {
          id: 'm9-l3-e3',
          type: 'write',
          prompt:
            "Escríbelo en inglés: 'Estamos investigando el problema y compartiremos una actualización pronto.'",
          answer: "We're investigating the issue and will share an update soon.",
          accept: ['We are investigating the issue and will share an update soon.'],
          hint: "Usa 'We're investigating...' y 'will share an update soon'.",
          explanation: 'Mensaje claro de estado durante un incidente (m9-l2).',
        },
        {
          id: 'm9-l3-e4',
          type: 'choice',
          prompt: 'Vas a presentar una demo. ¿Qué dices para guiar a la audiencia?',
          options: [
            'Let me walk you through the demo.',
            'Demo is here now.',
            'You see demo.',
            'I show thing demo.',
          ],
          answer: 0,
          explanation:
            "'Let me walk you through...' es una forma natural de guiar una demo (m9-l2).",
        },
        {
          id: 'm9-l3-e5',
          type: 'builder',
          prompt: "Construye: 'El objetivo de este RFC es simplificar el despliegue.'",
          words: ['The goal of this RFC', 'is to simplify', 'deployment.'],
          answer: 'The goal of this RFC is to simplify deployment.',
          explanation: 'Abrir un RFC con el objetivo hace la propuesta clara desde el inicio.',
        },
        {
          id: 'm9-l3-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Podrías aclarar qué quieres decir con eso?'",
          answer: 'Could you clarify what you mean by that?',
          accept: ['Could you clarify what you mean by that'],
          hint: "Usa 'Could you clarify what you mean by...?'",
          explanation:
            'Pedir aclaración de forma precisa y educada es útil en discusiones técnicas y feedback.',
        },
      ],
    },
  ],
}
