import type { Module } from '../../lib/types'

export const m4: Module = {
  id: 'm4',
  code: 'MOD 04',
  level: 'B1-B2',
  title: 'Standups, Reviews e Incidentes',
  shortTitle: 'Standups, Reviews & Incidents',
  description:
    'Tiempos perfectos para updates, reuniones diarias, bloqueos, code reviews, debate de arquitectura y respuesta a incidentes en producción.',
  sessions: [
    {
      id: 'm4-l0',
      slug: 'present-perfect-y-past-perfect',
      title: 'Present perfect y past perfect: experiencia y cronología',
      step: 'B1 · Paso 4.0',
      cefr: 'B1',
      summary:
        'Cierra el pendiente de M2: aprende have/has + participio para resultados que importan ahora y had + participio para situar una acción antes de otra en el pasado.',
      objectives: [
        'Usar have/has + participio para hablar de experiencia o de un resultado presente.',
        'Usar had + participio para indicar que algo ocurrió antes de otra acción pasada.',
        'Diferenciar pasado simple (momento cerrado) de presente perfecto (sin momento cerrado).',
      ],
      pronunciation:
        "I've fixed the bug, but it had already crashed twice before I found the root cause.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Completa M2 (pasado simple con marcadores como 'yesterday' o 'last week') y repasa participios regulares (fixed, deployed, pushed). Esta lección responde al 'lo verás más adelante' del Paso 2.1.",
        },
        {
          type: 'technique',
          name: 'Dos tiempos, dos ideas claras',
          desc: "Presente perfecto = have/has + participio. Conecta el pasado con AHORA: 'I've fixed the bug' (ya está arreglado, y eso importa hoy). No decimos cuándo exactamente. Pasado perfecto = had + participio. Algo pasó ANTES de otra acción pasada: 'The token had expired before the request failed'. Con momento cerrado ('yesterday', 'at 3am') sigue siendo más claro el pasado simple: 'I fixed it yesterday'.",
        },
        {
          type: 'table',
          title: 'Participios que más usarás',
          columns: ['Verbo', 'Pasado simple', 'Participio'],
          rows: [
            ['fix', 'fixed', 'fixed'],
            ['deploy', 'deployed', 'deployed'],
            ['push', 'pushed', 'pushed'],
            ['find', 'found', 'found'],
            ['break', 'broke', 'broken'],
            ['go', 'went', 'gone'],
            ['see', 'saw', 'seen'],
            ['think', 'thought', 'thought'],
          ],
        },
        {
          type: 'phrases',
          title: 'Frases que oirás en equipos',
          items: [
            {
              en: "I've already checked the logs.",
              es: 'Ya revisé los logs (y eso es lo que importa ahora).',
            },
            { en: 'Have you reviewed my PR yet?', es: '¿Ya revisaste mi PR?' },
            {
              en: "I hadn't thought about that edge case.",
              es: 'No había pensado en ese caso límite.',
            },
            {
              en: 'The token had expired before the request failed.',
              es: 'El token había expirado antes de que fallara la petición.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l0-e1',
          type: 'choice',
          prompt: 'Elige la forma correcta de presente perfecto:',
          options: [
            'I have fix the bug.',
            "I've fixed the bug.",
            'I has fixed the bug.',
            "I'm fixed the bug.",
          ],
          answer: 1,
          explanation:
            "Presente perfecto = have + participio. Con 'I' usamos 'have' ('I've = I have') y el participio de 'fix' es 'fixed'.",
        },
        {
          id: 'm4-l0-e2',
          type: 'write',
          prompt: "Escribe en inglés: 'Ya revisé los logs.' (usa presente perfecto)",
          answer: "I've already checked the logs.",
          accept: ['I have already checked the logs.'],
          hint: "Usa 'I've already + participio'.",
          explanation:
            "'I've already checked the logs' usa have + participio para decir que la revisión ya está hecha y sigue siendo relevante.",
        },
        {
          id: 'm4-l0-e3',
          type: 'choice',
          prompt: "Si dices 'ayer', ¿cuál es la forma correcta?",
          options: [
            "I've fixed it yesterday.",
            'I fixed it yesterday.',
            'I have fixed it yesterday.',
            'I fixing it yesterday.',
          ],
          answer: 1,
          explanation:
            "'Yesterday' es un momento cerrado: pide pasado simple ('I fixed it yesterday'), no presente perfecto.",
        },
        {
          id: 'm4-l0-e4',
          type: 'builder',
          prompt: "Construye: 'El token había expirado antes de que fallara la petición.'",
          words: ['The token had expired', 'before', 'the request failed.'],
          answer: 'The token had expired before the request failed.',
          explanation:
            "Pasado perfecto ('had expired') para la acción anterior y pasado simple ('failed') para la acción posterior.",
        },
        {
          id: 'm4-l0-e5',
          type: 'choice',
          prompt:
            "En un review te dicen: 'Nice catch! I hadn't thought about that edge case.' ¿Qué significa 'hadn't thought'?",
          options: [
            'No lo había pensado antes de tu comentario.',
            'No lo estoy pensando ahora.',
            'No lo pensaré mañana.',
            'No lo pensé ayer.',
          ],
          answer: 0,
          explanation:
            "'Hadn't thought' es had not + participio: algo que no había ocurrido antes de otro momento en el pasado (tu comentario).",
        },
        {
          id: 'm4-l0-e6',
          type: 'fill-blank',
          prompt: 'Completa con presente perfecto y pasado perfecto.',
          template:
            'I ___ already ___ the logs, but the token ___ expired before the request failed.',
          blanks: ["have|'ve", 'checked', 'had'],
          hint: "Primero 'have/ve + participio'; luego 'had' para la acción anterior.",
          explanation:
            "Repaso de los dos tiempos nuevos: 'I've already checked...' (resultado ahora) y 'the token had expired...' (antes de otra acción pasada).",
        },
        {
          id: 'm4-l0-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I have fixed the bug that broke the build yesterday.',
          hint: 'Presente perfecto + pasado simple.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm4-l1',
      slug: 'daily-standup',
      title: 'Fórmulas Exactas para Daily Standup',
      step: 'B1 · Paso 4.1',
      cefr: 'B1',
      summary:
        'No traduzcas mentalmente. Usa los bloques estándar de equipos ágiles internacionales.',
      objectives: [
        'Estructurar tu turno en 60 segundos: ayer, hoy, bloqueos.',
        'Pedir ayuda y revisión de código sin rodeos.',
        'Discrepar de forma profesional en una reunión.',
      ],
      pronunciation:
        'I finished the API integration yesterday, and today I am working on the login tests.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Se asume que dominas tiempos básicos de M2 (pasado simple para ayer, presente continuo para ahora) y verbos de trabajo (finish, work on, fix, push, review). Aquí practicarás frases y estructura de standup; el vocabulario nuevo aparece en los ejemplos.',
        },
        {
          type: 'technique',
          name: 'Estructura de 3 puntos (Yesterday / Today / Blockers)',
          desc: "En un daily breve: 1) 'Yesterday I...' (qué terminaste/hiciste). 2) 'Today I'm working on...' (en qué estás ahora). 3) 'I'm blocked by...' o 'No blockers' (estado). Frases cortas y concretas son más claras que explicaciones largas.",
        },
        {
          type: 'phrases',
          title: 'Frases de reunión',
          items: [
            {
              en: "Yesterday I worked on X. Today I'm working on Y. I'm blocked by Z.",
              es: 'Tu estructura base para el daily.',
            },
            {
              en: "I finished the API integration and I'm working on the unit tests.",
              es: 'Reportar progreso concreto.',
            },
            {
              en: "I'm stuck on the CORS error. I need help with the backend headers.",
              es: 'Pedir ayuda con un bloqueo específico.',
            },
            {
              en: 'I just pushed the fix. Can someone review my PR?',
              es: 'Pedir revisión de código.',
            },
            {
              en: 'Sorry, can you repeat that? / Could you explain that differently?',
              es: 'Cuando no entiendes el acento.',
            },
            { en: 'Let me finish my point first.', es: 'Cuando te interrumpen.' },
            { en: 'I agree with you. / That makes sense.', es: 'Mostrar acuerdo.' },
            {
              en: 'I see your point, but I think we should use caching here.',
              es: 'Discrepar con educación.',
            },
            {
              en: 'This is taking longer than expected. I need one more day.',
              es: 'Pedir más tiempo.',
            },
            {
              en: "Let's pair on the payment feature after the standup.",
              es: 'Proponer pair programming.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Marco rápido para tu turno',
          columns: ['Momento', 'Frame'],
          rows: [
            ['Ayer', 'Yesterday, I [finished/worked on]...'],
            ['Hoy', "Today, I'm working on..."],
            ['Bloqueo', "I'm blocked by... / I need help with..."],
            ['Cierre', "No blockers. / I'll follow up after the standup."],
          ],
        },
        {
          type: 'dialogue',
          title: 'Daily standup: tu turno en 60 segundos',
          setting: 'Daily, sala de equipo',
          goal: 'Reportar tu turno de standup en 60 segundos.',
          context:
            'Maya lidera el daily y Leo reporta qué hizo ayer, qué hace hoy y qué bloqueo tiene.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Morning, Leo. What did you work on yesterday?',
              es: 'Buenos días, Leo. ¿En qué trabajaste ayer?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'I finished the API integration and pushed the PR.',
              es: 'Terminé la integración de la API y subí el PR.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Nice. What are you working on today?',
              es: 'Bien. ¿En qué estás trabajando hoy?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "I'm writing the login tests. I'm blocked by the API token, though.",
              es: 'Estoy escribiendo los tests de login. Estoy bloqueado por el token de la API.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Got it. I'll ask Platform to refresh it after the standup.",
              es: 'Entendido. Le pediré a Platform que lo renueve después del daily.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Perfect. No other blockers on my side.',
              es: 'Perfecto. No tengo más bloqueos por mi parte.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l1-e1',
          type: 'choice',
          prompt:
            'Un colega propone una arquitectura con la que no estás de acuerdo, pero quieres sonar profesional:',
          options: [
            'No, your idea is bad',
            'I see your point, but I have a different perspective',
            "You don't know how to code",
            "I don't care about that",
          ],
          answer: 1,
          explanation:
            "'I see your point, but...' valida al compañero antes de presentar tu alternativa técnica.",
        },
        {
          id: 'm4-l1-e2',
          type: 'builder',
          prompt: "Construye: 'Esto está tomando más tiempo de lo esperado.'",
          words: ['This is', 'taking longer', 'than expected.'],
          answer: 'This is taking longer than expected.',
          explanation: 'Frase indispensable para estimaciones y retrasos en sprints.',
        },
        {
          id: 'm4-l1-e3',
          type: 'write',
          prompt:
            "Escribe tu bloqueo en inglés: 'Estoy atascado con el error de CORS y necesito ayuda con los headers.'",
          answer: "I'm stuck on the CORS error and I need help with the headers.",
          accept: [
            'I am stuck on the CORS error and I need help with the headers.',
            "I'm stuck on a CORS error and I need help with the headers.",
          ],
          hint: "Usa 'I'm stuck on...' + 'I need help with...'.",
          explanation: "'Stuck on' es la forma natural de decir 'atascado en' un problema técnico.",
        },
        {
          id: 'm4-l1-e4',
          type: 'write',
          prompt:
            "Escribe en inglés: 'Esto está tomando más tiempo de lo esperado. Necesito un día más.'",
          answer: 'This is taking longer than expected. I need one more day.',
          accept: [
            'This is taking longer than expected, I need one more day.',
            'This is taking longer than expected. I need another day.',
          ],
          hint: "Usa 'taking longer than expected' y 'one more day'.",
          explanation:
            'Es una forma profesional y directa de ajustar una estimación sin excusas vagas.',
        },
        {
          id: 'm4-l1-e5',
          type: 'builder',
          prompt:
            "Construye un update cómodo y claro: 'Ayer terminé la integración. Hoy estoy trabajando en los tests. No tengo bloqueos.'",
          words: [
            'Yesterday I finished the integration.',
            "Today I'm working on the tests.",
            'No blockers on my side.',
          ],
          answer:
            "Yesterday I finished the integration. Today I'm working on the tests. No blockers on my side.",
          explanation:
            'Estructura clásica del daily: ayer, hoy y estado de bloqueos. Frases cortas te ayudan a hablar con confianza.',
        },
        {
          id: 'm4-l1-e6',
          type: 'choice',
          prompt: 'Quieres sonar natural al pedir ayuda en la daily. ¿Qué opción es mejor?',
          options: [
            "I'm stuck on the CORS error. Could someone help me with the headers?",
            'I have problem. Help.',
            'CORS is impossible for me.',
            'Someone must fix my bug now.',
          ],
          answer: 0,
          explanation:
            "Nombrar el bloqueo y pedir ayuda de forma específica ('Could someone help me with...') es claro, educado y muy natural.",
        },
        {
          id: 'm4-l1-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Yesterday I fixed the bug, today I am writing tests and I have no blockers.',
          hint: 'Estructura clásica del daily.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm4-l1-e10',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            {
              en: "Yesterday I worked on X. Today I'm working on Y. I'm blocked by Z.",
              es: 'Tu estructura base para el daily.',
            },
            {
              en: "I finished the API integration and I'm working on the unit tests.",
              es: 'Reportar progreso concreto.',
            },
            {
              en: "I'm stuck on the CORS error. I need help with the backend headers.",
              es: 'Pedir ayuda con un bloqueo específico.',
            },
            {
              en: 'I just pushed the fix. Can someone review my PR?',
              es: 'Pedir revisión de código.',
            },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
        {
          id: 'm4-l1-e11',
          type: 'dialogue-branch',
          prompt: 'Elige la mejor respuesta en el daily.',
          context:
            'Es el daily diario y Maya pregunta a Leo por su trabajo de ayer y sus bloqueos de hoy.',
          steps: [
            {
              speaker: 'Maya',
              line: 'What did you do yesterday?',
              choices: [
                {
                  en: 'I fixed the login bug and wrote tests.',
                  correct: true,
                  feedback: 'Correcto: acción concreta en pasado.',
                },
                {
                  en: 'I am fixing bugs tomorrow.',
                  correct: false,
                  feedback: 'El daily pregunta por ayer, no por mañana.',
                },
                {
                  en: 'Everything is fine.',
                  correct: false,
                  feedback: 'Da poca información útil al equipo.',
                },
              ],
            },
            {
              speaker: 'Maya',
              line: 'Any blockers today?',
              choices: [
                {
                  en: 'Yes, I am blocked by the API token. Can you help?',
                  correct: true,
                  feedback: 'Excelente: bloqueo + petición concreta.',
                },
                {
                  en: 'No, I do not like tests.',
                  correct: false,
                  feedback: 'No responde a la pregunta y suena poco profesional.',
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
      id: 'm4-l2',
      slug: 'code-review-en-ingles',
      title: 'Code Review: cómo comentar sin sonar agresivo',
      step: 'B2 · Paso 4.2',
      cefr: 'B2',
      summary:
        'Nit, blocking, non-blocking, LGTM: el idioma exacto para dar feedback útil y recibirlo sin fricción.',
      objectives: [
        'Separar un comentario bloqueante de una sugerencia opcional.',
        'Suavizar una corrección con estructuras B2.',
        'Aprobar, pedir cambios y re-revisar con las siglas correctas.',
      ],
      pronunciation: 'Non-blocking: could we rename this variable for clarity? LGTM otherwise.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Necesitas vocabulario de Git/PR de M3 (repo, branch, PR, merge, push) y las bases de M1–M2. Aquí aprenderás etiquetas y frases específicas de code review, incluidas las estructuras para sugerir ('Could we...?', 'I'd suggest...'); todo lo usado en ejercicios está en las tablas/frases.",
        },
        {
          type: 'text',
          body: "Un code review útil es claro y respetuoso. Marca tu intención: 'nit' (detalle menor), 'non-blocking' (sugerencia que no bloquea), 'blocking' (debe resolverse antes del merge). Así el autor sabe qué es urgente y qué es opcional.",
        },
        {
          type: 'table',
          title: 'Etiquetas de review',
          columns: ['Etiqueta', 'Significado', 'Ejemplo'],
          rows: [
            ['nit:', 'detalle menor, opcional', 'nit: typo in the comment'],
            [
              'non-blocking:',
              'sugerencia, no bloquea el merge',
              'non-blocking: we could extract this helper',
            ],
            ['blocking:', 'debe resolverse antes de aprobar', 'blocking: this leaks the API key'],
            ['LGTM', 'Looks Good To Me → aprobado', 'LGTM, thanks for the tests!'],
            ['PTAL', 'Please Take Another Look → re-revisa', 'Addressed your comments. PTAL.'],
            [
              'suggestion:',
              'idea opcional, no bloquea',
              'suggestion: consider memoizing this selector',
            ],
          ],
        },
        {
          type: 'phrases',
          title: 'Sugerir sin imponer',
          items: [
            {
              en: 'Could we rename this variable for clarity?',
              es: '¿Podríamos renombrar esta variable para que quede más claro?',
            },
            {
              en: 'What do you think about extracting this into a function?',
              es: '¿Qué te parece extraer esto a una función?',
            },
            {
              en: "I'd suggest adding a test for the empty state.",
              es: 'Sugeriría añadir un test para el estado vacío.',
            },
            {
              en: 'This is a blocking issue because it affects production.',
              es: 'Esto bloquea porque afecta producción.',
            },
            {
              en: 'Non-blocking: we can address this in a follow-up.',
              es: 'No bloqueante: lo vemos en un follow-up.',
            },
            {
              en: "Nice catch! I hadn't thought about that edge case.",
              es: 'Buena observación, no había pensado en ese caso límite.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Code review: signals, impacto y tono',
          setting: 'GitHub, comentarios del PR',
          goal: 'Distinguir un nit de un comentario bloqueante con tono respetuoso.',
          context:
            'Maya revisa el PR de Leo y deja comentarios. Leo pregunta cuál bloquea y cómo solucionarlo.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Reviewer',
              en: 'I left a few comments on your PR. One is a nit, the rest are non-blocking.',
              es: 'Dejé algunos comentarios en tu PR. Uno es un detalle menor, los demás no bloquean.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Author',
              en: 'Thanks. Which one is blocking?',
              es: 'Gracias. ¿Cuál bloquea?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Reviewer',
              en: 'The null check. This might break when the input is null. Could you add a guard?',
              es: 'La comprobación de null. Esto podría romperse cuando la entrada es null. ¿Podrías añadir una guarda?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Author',
              en: "Good catch. I hadn't thought about that edge case. I'll fix it and ping you.",
              es: 'Buena observación. No había pensado en ese caso límite. Lo arreglo y te aviso.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Reviewer',
              en: "Great. LGTM once that's in.",
              es: 'Genial. LGTM cuando esté eso.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'La fórmula de feedback B2',
          body: "Observación + impacto + pregunta. Ejemplo: 'This query runs inside the loop (observación). It will hit the database N times (impacto). Could we batch it? (pregunta)'. Suena senior y no ataca a la persona.",
        },
      ],
      exercises: [
        {
          id: 'm4-l2-e1',
          type: 'choice',
          prompt:
            'Quieres marcar una sugerencia que no debe impedir que el PR se apruebe. ¿Cómo empiezas el comentario?',
          options: ['Blocking:', 'Non-blocking:', 'LGTM:', 'PTAL:'],
          answer: 1,
          explanation:
            "'Non-blocking' indica que es una sugerencia y que el PR puede avanzar sin resolverla.",
        },
        {
          id: 'm4-l2-e2',
          type: 'choice',
          prompt: 'Hay una fuga de una API key en el diff. ¿Qué etiqueta usas?',
          options: [
            'nit: move the key',
            'non-blocking: nice key',
            'blocking: this leaks the API key',
            'LGTM: ship it',
          ],
          answer: 2,
          explanation:
            "'Blocking' señala un problema que debe resolverse antes del merge. Una fuga de credenciales siempre lo es.",
        },
        {
          id: 'm4-l2-e3',
          type: 'builder',
          prompt:
            "Construye la sugerencia: '¿Podríamos renombrar esta variable para mayor claridad?'",
          words: ['Could we', 'rename', 'this variable', 'for clarity?'],
          answer: 'Could we rename this variable for clarity?',
          explanation:
            "'Could we...?' es la forma más natural y educada de sugerir un cambio en un review.",
        },
        {
          id: 'm4-l2-e4',
          type: 'write',
          prompt:
            "Escribe en inglés: 'Apliqué tus comentarios. ¿Puedes revisarlo otra vez? (usa la sigla)'",
          answer: 'I addressed your comments. PTAL.',
          accept: [
            "I've addressed your comments. PTAL.",
            'Addressed your comments. PTAL.',
            'I addressed your comments, PTAL.',
            'I have addressed your comments. PTAL.',
          ],
          hint: "Usa 'I addressed...' o 'I've addressed...' y cierra con 'PTAL'.",
          explanation:
            "'Address comments' significa aplicar los cambios pedidos en un review. 'PTAL' = Please Take Another Look. Puedes decir 'I addressed...' (pasado simple) o 'I've addressed...' (presente perfecto del Paso 4.0, muy común en equipos).",
        },
        {
          id: 'm4-l2-e5',
          type: 'fix-error',
          prompt: 'Haz el comentario de review más claro y profesional.',
          sentence: 'This is wrong. Change it.',
          answer: "This isn't quite right. Could you change it?",
          accept: [
            "This doesn't look right. Could you change it?",
            "I don't think this is correct. Could you update it?",
          ],
          hint: "Mantén la idea de 'wrong/change', pero suavízala con 'not quite' y 'Could you...?'.",
          explanation:
            "Un review útil suaviza la crítica y pide una acción: 'not quite right' + 'Could you change it?'. No hace falta inventar un riesgo técnico.",
        },
        {
          id: 'm4-l2-e6',
          type: 'choice',
          prompt: "¿Qué significa 'LGTM' en un code review?",
          options: [
            'Necesita más trabajo antes de aprobar.',
            'Looks Good To Me: lo apruebas.',
            'Es un error bloqueante.',
            'Hay que borrar el PR.',
          ],
          answer: 1,
          explanation:
            "'LGTM' (Looks Good To Me) indica aprobación del cambio. A veces se añade una condición: 'LGTM once tests pass.'",
        },
        {
          id: 'm4-l2-e7',
          type: 'choice',
          prompt: 'En la conversación, ¿qué comentario era bloqueante?',
          options: ['La comprobación de null', 'Un typo', 'El nombre de una variable'],
          answer: 0,
          explanation:
            "Maya dice 'The null check... Could you add a guard?'. El resto eran non-blocking.",
        },
        {
          id: 'm4-l2-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Could you clarify this comment? I do not understand the suggestion.',
          hint: 'Pregunta educada en un review.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm4-l2-e10',
          type: 'dialogue-branch',
          prompt: 'Elige cómo responder en un code review.',
          context:
            'Leo pide a Maya que revise su PR hoy y después pregunta si la nomenclatura es clara.',
          steps: [
            {
              speaker: 'Leo',
              line: 'Could you review my PR today?',
              choices: [
                {
                  en: 'Sure. I will leave comments before lunch.',
                  correct: true,
                  feedback: 'Aceptas y das un plazo claro.',
                },
                {
                  en: 'No, I am busy forever.',
                  correct: false,
                  feedback: 'Suena poco colaborativo y poco profesional.',
                },
              ],
            },
            {
              speaker: 'Leo',
              line: 'Is the naming clear?',
              choices: [
                {
                  en: 'Mostly. Could you rename this variable?',
                  correct: true,
                  feedback: 'Feedback amable y accionable.',
                },
                {
                  en: 'It is perfect. Do not change anything.',
                  correct: false,
                  feedback: 'No aporta ni señala nada concreto.',
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
      id: 'm4-l3',
      slug: 'incidentes-on-call',
      title: 'Incidentes, on-call y postmortems',
      step: 'B2 · Paso 4.3',
      cefr: 'B2',
      summary:
        'Comunica una caída, coordina la mitigación y escribe un postmortem sin buscar culpables.',
      objectives: [
        'Comunicar un incidente con claridad y urgencia.',
        'Hablar de severidad, blast radius y rollback.',
        'Explicar la causa raíz en un postmortem blameless.',
      ],
      pronunciation:
        "We have a production outage. I'm rolling back the last deploy to reduce the blast radius.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Requiere presente continuo para estado actual ('We're rolling back'), pasado/futuro básico y vocabulario de deploy (M2–M3). Se introducen términos de incidente (outage, degradation, mitigation, root cause, blast radius) en esta lección.",
        },
        {
          type: 'technique',
          name: 'Flujo de comunicación en un incidente',
          desc: "1) Impacto: qué pasa ('We have an outage/degradation'). 2) Mitigación: qué estás haciendo ahora ('We're rolling back / investigating'). 3) Actualizaciones: cuándo volverás a informar. 4) Después: causa raíz y postmortem sin culpas. Claridad y frecuencia > perfección.",
        },
        {
          type: 'phrases',
          title: 'Frases de incidente',
          items: [
            { en: 'We have a production outage.', es: 'Tenemos una caída en producción.' },
            { en: "What's the blast radius?", es: '¿A cuántos usuarios/afecta?' },
            {
              en: "I'm rolling back the last deploy.",
              es: 'Estoy revirtiendo el último despliegue.',
            },
            { en: 'The mitigation is working.', es: 'La mitigación está funcionando.' },
            {
              en: 'The root cause was a bad migration.',
              es: 'La causa raíz fue una migración defectuosa.',
            },
            {
              en: "I'll take the incident and send updates every 15 minutes.",
              es: 'Yo me encargo del incidente y mando actualizaciones cada 15 minutos.',
            },
            {
              en: "Let's write a blameless postmortem.",
              es: 'Escribamos un postmortem sin culpar a nadie.',
            },
            { en: "We're back to normal.", es: 'Volvimos a la normalidad.' },
          ],
        },
        {
          type: 'vocab',
          title: 'Vocabulario de on-call',
          items: [
            {
              en: 'outage',
              es: 'caída o interrupción del servicio',
              example: 'The outage lasted 20 minutes.',
            },
            {
              en: 'degradation',
              es: 'degradación del servicio',
              example: "We're seeing some degradation in latency.",
            },
            {
              en: 'rollback',
              es: 'reversión de un despliegue',
              example: 'The rollback fixed the issue.',
            },
            {
              en: 'root cause',
              es: 'causa raíz',
              example: 'The root cause was a connection leak.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Incidente en producción: impacto, mitigación y causa',
          setting: 'Incidente, canal #on-call de Slack',
          goal: 'Comunicar impacto, mitigación y causa de una caída.',
          context:
            'Hay una caída en producción. Maya coordina la comunicación y Leo investiga y aplica la mitigación.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "We have a production outage. What's the blast radius?",
              es: 'Tenemos una caída en producción. ¿Cuál es el alcance?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "It affects all users in Europe. I'm rolling back the last deploy now.",
              es: 'Afecta a todos los usuarios en Europa. Estoy revirtiendo el último despliegue ahora.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Got it. I'll send an update in 15 minutes. Did the deploy cause it?",
              es: 'Entendido. Mandaré una actualización en 15 minutos. ¿Lo causó el despliegue?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Yes, a bad migration had broken the login table before the rollback.',
              es: 'Sí, una migración defectuosa había roto la tabla de login antes del rollback.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "The mitigation is working. We're back to normal. Let's write a blameless postmortem.",
              es: 'La mitigación está funcionando. Volvimos a la normalidad. Escribamos un postmortem sin culpas.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l3-e1',
          type: 'choice',
          prompt: 'Producción está caída. ¿Cómo lo comunicas de forma profesional?',
          options: [
            'Prod is dead.',
            'We have a production outage.',
            'The website is bad.',
            'Everything is broken forever.',
          ],
          answer: 1,
          explanation: "'We have a production outage' comunica impacto y urgencia sin dramatismo.",
        },
        {
          id: 'm4-l3-e2',
          type: 'choice',
          prompt: 'Un deploy acaba de romper producción. ¿Cuál es la primera mitigación habitual?',
          options: [
            'Write a postmortem',
            'Roll back the deploy',
            'Add more logs',
            'Ask for a new estimate',
          ],
          answer: 1,
          explanation:
            'Primero se reduce el impacto; un rollback devuelve el servicio a la última versión estable.',
        },
        {
          id: 'm4-l3-e3',
          type: 'builder',
          prompt: "Construye: 'Volvamos a la versión anterior.'",
          words: ["Let's", 'roll back', 'to the previous version.'],
          answer: "Let's roll back to the previous version.",
          explanation: "'Let's + verbo base' propone una acción inmediata en equipo.",
        },
        {
          id: 'm4-l3-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'La causa raíz fue una migración defectuosa.'",
          answer: 'The root cause was a bad migration.',
          accept: [
            'The root cause was a faulty migration.',
            'The root cause was an issue with the migration.',
          ],
          hint: "Usa 'The root cause was...'.",
          explanation:
            'Un postmortem útil nombra la causa raíz sin atacar a la persona que hizo el cambio.',
        },
        {
          id: 'm4-l3-e5',
          type: 'dialogue-order',
          prompt: 'Ordena la comunicación básica de un incidente.',
          lines: [
            'We have a production outage.',
            "I'm rolling back the last deploy now.",
            "I'll send an update in 15 minutes.",
          ],
          explanation:
            'Secuencia clara: impacto → mitigación en curso → próxima actualización. Esto da calma y contexto al equipo.',
        },
        {
          id: 'm4-l3-e6',
          type: 'choice',
          prompt: '¿Qué pregunta ayuda a entender el alcance del problema?',
          options: [
            "What's the blast radius?",
            'Who wrote this code?',
            'Can we deploy again?',
            'Is this funny?',
          ],
          answer: 0,
          explanation:
            "'Blast radius' se refiere al alcance/impacto del incidente (qué usuarios, servicios o regiones se ven afectados).",
        },
        {
          id: 'm4-l3-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The service went down at 3am and we rolled back the release.',
          hint: 'Impacto + acción correctiva.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm4-l3-e10',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'We have a production outage.', es: 'Tenemos una caída en producción.' },
            { en: "What's the blast radius?", es: '¿A cuántos usuarios/afecta?' },
            {
              en: "I'm rolling back the last deploy.",
              es: 'Estoy revirtiendo el último despliegue.',
            },
            { en: 'The mitigation is working.', es: 'La mitigación está funcionando.' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
        {
          id: 'm4-l3-e11',
          type: 'dialogue-branch',
          prompt: 'Elige la mejor comunicación durante un incidente.',
          context:
            'Hay una caída en la API y Maya pide a Leo información clara sobre el impacto y la mitigación.',
          steps: [
            {
              speaker: 'Maya',
              line: 'The API is down. What is the impact?',
              choices: [
                {
                  en: 'Users cannot log in; we are investigating.',
                  correct: true,
                  feedback: 'Impacto + acción en curso.',
                  next: 1,
                },
                {
                  en: 'I do not know. Maybe nothing.',
                  correct: false,
                  feedback: 'Un incidente necesita información clara, no dudas.',
                  next: 2,
                },
              ],
            },
            {
              speaker: 'Maya',
              line: 'Be precise: what can you confirm right now?',
              choices: [
                {
                  en: 'Users cannot log in, and we are on it.',
                  correct: true,
                  feedback: 'Ahora sí: impacto concreto y acción.',
                  next: 1,
                },
                {
                  en: 'Maybe something is wrong.',
                  correct: false,
                  feedback: 'Evita “maybe”: da un dato verificable.',
                },
              ],
            },
            {
              speaker: 'Maya',
              line: 'What do we do now?',
              choices: [
                {
                  en: "Let's roll back the last deploy and update the channel.",
                  correct: true,
                  feedback: 'Acción correctiva + comunicación.',
                },
                {
                  en: "Let's wait until tomorrow.",
                  correct: false,
                  feedback: 'En un incidente hay que actuar y comunicar ya.',
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
      id: 'm4-l4',
      slug: 'estimaciones-y-plazos',
      title: 'Estimaciones, plazos y decir que no',
      step: 'B2 · Paso 4.4',
      cefr: 'B2',
      summary:
        'Da estimaciones con supuestos, negocia el alcance y di que no sin cerrar la conversación.',
      objectives: [
        'Dar un rango con supuestos en lugar de una cifra inventada.',
        'Negociar alcance y prioridades ante un plazo ajustado.',
        'Decir que no de forma profesional y constructiva.',
      ],
      pronunciation: 'My estimate is two to three days, assuming the API is stable.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Usarás futuro/will, condicionales simples en contexto ('assuming...', 'if...') y vocabulario de tareas/scope. Las frases clave se enseñan aquí antes de los ejercicios.",
        },
        {
          type: 'technique',
          name: 'Estimar bien: rango + supuesto + opción',
          desc: "Evita una cifra única. Da un rango ('two to three days'), aclara el supuesto ('assuming the API is stable') y ofrece opciones si cambia ('if X slips, we can cut Y'). Esto ayuda a decidir, no solo a esperar.",
        },
        {
          type: 'phrases',
          title: 'Frases para plazos y alcance',
          items: [
            { en: 'My estimate is two to three days.', es: 'Mi estimación es de dos a tres días.' },
            { en: 'That assumes the API is stable.', es: 'Eso asume que la API es estable.' },
            { en: "What's the hard deadline?", es: '¿Cuál es la fecha límite real?' },
            {
              en: 'I can deliver X by Friday, but Y would slip.',
              es: 'Puedo entregar X el viernes, pero Y se retrasaría.',
            },
            { en: 'Can we descope something?', es: '¿Podemos reducir el alcance?' },
            {
              en: "I don't think that's realistic with the current scope.",
              es: 'No creo que sea realista con el alcance actual.',
            },
            { en: "Let's break it down first.", es: 'Primero dividámoslo en partes.' },
            { en: 'Which one is the priority?', es: '¿Cuál es la prioridad?' },
          ],
        },
        {
          type: 'table',
          title: 'Decir que no sin sonar bloqueado',
          columns: ['En vez de', 'Di'],
          rows: [
            ['No, impossible.', "I can't do both by Friday. Which one should I prioritize?"],
            [
              'It will take two days.',
              'It will take two to three days, assuming the API is stable.',
            ],
            ['We need more time.', 'We need one more day, or we can cut the reporting part.'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l4-e1',
          type: 'choice',
          prompt: 'Tu lead pregunta cuánto vas a tardar. ¿Cuál es la respuesta más profesional?',
          options: [
            'Two days.',
            "I don't know yet.",
            'Two to three days, assuming the API is stable.',
            'ASAP.',
          ],
          answer: 2,
          explanation:
            'Un rango con un supuesto permite planificar y deja claro qué podría cambiarlo.',
        },
        {
          id: 'm4-l4-e2',
          type: 'choice',
          prompt: 'No puedes entregar dos tareas el viernes. ¿Qué dices?',
          options: [
            'No.',
            "That's impossible.",
            "I can't do both by Friday. Which one is the priority?",
            'Ask someone else.',
          ],
          answer: 2,
          explanation:
            'Decir que no + ofrecer una decisión mantiene la conversación y protege el foco del equipo.',
        },
        {
          id: 'm4-l4-e3',
          type: 'builder',
          prompt: "Construye: 'Eso asume que la API es estable.'",
          words: ['That', 'assumes', 'the API', 'is stable.'],
          answer: 'That assumes the API is stable.',
          explanation:
            "'Assume' es la palabra clave para hacer explícito de qué depende tu estimación.",
        },
        {
          id: 'm4-l4-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'Necesitamos reducir el alcance para llegar al viernes.'",
          answer: 'We need to reduce the scope to hit Friday.',
          accept: [
            'We need to cut the scope to hit Friday.',
            'We need to reduce scope to hit Friday.',
          ],
          hint: "Usa 'reduce the scope' o 'cut the scope'.",
          explanation:
            "'Hit a deadline' significa llegar a la fecha; 'scope' es el alcance del trabajo.",
        },
        {
          id: 'm4-l4-e5',
          type: 'builder',
          prompt:
            "Construye: 'Mi estimación es de dos a tres días, suponiendo que la API sea estable.'",
          words: ['My estimate is', 'two to three days,', 'assuming the API', 'is stable.'],
          answer: 'My estimate is two to three days, assuming the API is stable.',
          explanation:
            'Estimación profesional: rango + supuesto explícito. Así el equipo entiende de qué depende el plazo.',
        },
        {
          id: 'm4-l4-e6',
          type: 'choice',
          prompt:
            'Quieren añadir otra tarea y el plazo es ajustado. ¿Qué respuesta es más profesional?',
          options: [
            'I can do everything.',
            'If we add that, something else will slip. Which one is the priority?',
            "No, I won't do it.",
            "Maybe, I don't know.",
          ],
          answer: 1,
          explanation:
            'Explicas el impacto (trade-off) y pides priorizar. Es claro, colaborativo y realista.',
        },
        {
          id: 'm4-l4-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I do not have the bandwidth this week, but I can do it on Monday.',
          hint: 'Decir que no con alternativa.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm4-l5',
      slug: 'pedir-ayuda-y-dar-contexto',
      title: 'Pedir ayuda y dar contexto técnico',
      step: 'B1 · Paso 4.5',
      cefr: 'B1',
      summary:
        'Pide ayuda sin sonar perdido: explica qué intentas hacer, qué probaste y qué necesitas exactamente.',
      objectives: [
        'Pedir ayuda con una pregunta clara y accionable.',
        'Dar contexto técnico suficiente: objetivo, intento y resultado.',
        'Agradecer y confirmar el siguiente paso.',
      ],
      pronunciation:
        "I'm trying to fix this bug, but I'm stuck. Could you take a look when you have a minute?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Se basa en vocabulario de errores/debug y frases de petición ('Could you...?', presente continuo/pasado para lo intentado). Esta lección organiza ese conocimiento en una plantilla práctica.",
        },
        {
          type: 'technique',
          name: 'Pedir ayuda útil: contexto + intento + pregunta',
          desc: "Incluye: 1) objetivo ('I'm trying to...'), 2) lo que pasa/error, 3) lo que ya probaste ('I already tried...'), 4) pregunta concreta ('Could you take a look?', 'Any ideas?'). Así evitas idas y vueltas.",
        },
        {
          type: 'phrases',
          title: 'Frases para pedir ayuda',
          items: [
            { en: "I'm stuck on this issue.", es: 'Estoy atascado con este problema.' },
            {
              en: 'Could you take a look when you have a minute?',
              es: '¿Podrías echarle un vistazo cuando tengas un minuto?',
            },
            {
              en: "I'm trying to reproduce the bug, but I can't.",
              es: 'Estoy intentando reproducir el bug, pero no puedo.',
            },
            {
              en: 'I already tried restarting the service.',
              es: 'Ya intenté reiniciar el servicio.',
            },
            { en: 'What am I missing?', es: '¿Qué se me está pasando?' },
            {
              en: 'Any ideas on what could be causing this?',
              es: '¿Alguna idea de qué podría estar causando esto?',
            },
          ],
        },
        {
          type: 'table',
          title: 'De vaga a útil',
          columns: ['Mensaje vago', 'Mensaje útil'],
          rows: [
            [
              "It doesn't work.",
              'The API returns 500 when I send an empty array. I already checked the logs.',
            ],
            [
              'Can you help?',
              "Could you take a look at this PR? I'm not sure about the error handling.",
            ],
            [
              "I don't get it.",
              "I'm trying to understand why the cache is stale. What am I missing?",
            ],
          ],
        },
        {
          type: 'dialogue',
          title: 'Pedir ayuda con contexto (y no perder tiempo)',
          setting: 'Slack, #backend',
          goal: 'Pedir ayuda con contexto concreto y recibir seguimiento.',
          context:
            'Leo tiene un error de CORS solo en staging y pide ayuda a Maya. Maya le pide los datos exactos para avanzar.',
          lines: [
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Quick question about the CORS error. I'm getting it only in staging.",
              es: 'Pregunta rápida sobre el error de CORS. Solo me sale en staging.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'What have you tried so far?',
              es: '¿Qué has probado hasta ahora?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'I already checked the headers and the logs. The preflight request fails.',
              es: 'Ya revisé las cabeceras y los logs. Falla la petición preflight.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Can you share the exact error and the file and line? That usually speeds things up.',
              es: '¿Puedes compartir el error exacto y el archivo y la línea? Eso suele acelerar las cosas.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Sure. It fails in auth.ts at line 42. I'll paste the stack trace here.",
              es: 'Claro. Falla en auth.ts, línea 42. Pegaré el stack trace aquí.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Thanks. Let's pair on it after the standup.",
              es: 'Gracias. Hagamos pair debugging después del daily.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l5-e1',
          type: 'choice',
          prompt: 'Necesitas ayuda con un bug. ¿Cuál mensaje es más útil?',
          options: [
            'Help!!!',
            "It doesn't work.",
            "I'm stuck on a bug: the API returns 500 with an empty array. I already checked the logs. Any ideas?",
            'Fix this.',
          ],
          answer: 2,
          explanation:
            'Un buen pedido de ayuda incluye el problema, lo que ya probaste y una pregunta concreta.',
        },
        {
          id: 'm4-l5-e2',
          type: 'builder',
          prompt: "Construye: '¿Podrías echarle un vistazo cuando tengas un minuto?'",
          words: ['Could you take a look', 'when you have', 'a minute?'],
          answer: 'Could you take a look when you have a minute?',
          explanation: "'Could you take a look...?' es una forma educada y común de pedir ayuda.",
        },
        {
          id: 'm4-l5-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Ya intenté reiniciar el servicio.'",
          answer: 'I already tried restarting the service.',
          accept: [
            "I've already tried restarting the service.",
            'I have already tried restarting the service.',
            'I already tried restarting the service',
          ],
          hint: "Usa 'I already tried...' (pasado simple).",
          explanation:
            "Decir lo que ya probaste evita sugerencias repetidas y muestra contexto. Aquí usamos pasado simple, una forma clara y ya conocida; la alternativa con presente perfecto ('I've already tried...') se explica en el Paso 4.0.",
        },
        {
          id: 'm4-l5-e4',
          type: 'choice',
          prompt: "¿Qué significa 'What am I missing?'",
          options: [
            '¿Qué perdí?',
            '¿Qué se me está pasando / qué no estoy viendo?',
            '¿Qué falta en el calendario?',
            '¿A quién extraño?',
          ],
          answer: 1,
          explanation:
            "'What am I missing?' pide que te señalen lo que no estás considerando en el problema.",
        },
        {
          id: 'm4-l5-e5',
          type: 'write',
          prompt: "Escribe en inglés: 'Estoy intentando reproducir el bug, pero no puedo.'",
          answer: "I'm trying to reproduce the bug, but I can't.",
          accept: [
            "I am trying to reproduce the bug, but I can't.",
            "I'm trying to reproduce the bug, but I cannot.",
          ],
          hint: "Usa 'I'm trying to reproduce the bug...'",
          explanation:
            'Dar contexto de lo que intentas hacer ayuda a que otros entiendan dónde necesitas apoyo.',
        },
        {
          id: 'm4-l5-e6',
          type: 'builder',
          prompt: "Construye: 'Ya intenté reiniciar el servicio, pero sigue fallando.'",
          words: ['I already tried', 'restarting the service,', 'but it still fails.'],
          answer: 'I already tried restarting the service, but it still fails.',
          explanation:
            'Contexto + intento previo + resultado actual: una forma clara y útil de pedir ayuda.',
        },
        {
          id: 'm4-l5-e7',
          type: 'choice',
          prompt: 'En la conversación, ¿dónde falla la petición?',
          options: ['En auth.ts, línea 42', 'En el build', 'En la base de datos'],
          answer: 0,
          explanation: "Leo dice 'It fails in auth.ts at line 42' y comparte el stack trace.",
        },
        {
          id: 'm4-l5-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I am blocked by the API token. Could you help me for five minutes?',
          hint: 'Contexto + petición concreta.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm4-l5-e10',
          type: 'dialogue-branch',
          prompt: 'Elige cómo pedir ayuda con contexto.',
          context:
            'Leo está atascado con un bug y pide unos minutos a Maya para explicarle el contexto.',
          steps: [
            {
              speaker: 'Leo',
              line: 'Do you have a minute? I am stuck.',
              choices: [
                {
                  en: 'Yes, what is blocking you?',
                  correct: true,
                  feedback: 'Muestras disponibilidad y pides el contexto.',
                },
                {
                  en: 'No, I am always busy.',
                  correct: false,
                  feedback: 'Cierra la conversación sin ayudar.',
                },
              ],
            },
            {
              speaker: 'Leo',
              line: 'Thanks, that helps a lot.',
              choices: [
                {
                  en: 'No problem. Let me know if you need more context.',
                  correct: true,
                  feedback: 'Cierras con disponibilidad y contexto.',
                },
                {
                  en: 'Yes, I am always busy.',
                  correct: false,
                  feedback: 'Contradice tu ayuda anterior.',
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
      id: 'm4-l6',
      slug: 'pair-programming-y-debugging-en-vivo',
      title: 'Pair programming y debugging en vivo',
      step: 'B1 · Paso 4.6',
      cefr: 'B1',
      summary: 'Narra lo que piensas, propone hipótesis y colabora en vivo sin perder claridad.',
      objectives: [
        'Explicar tu razonamiento mientras depuras o programas en pareja.',
        'Proponer hipótesis y siguientes pasos con frases simples.',
        'Confirmar entendimiento y pedir feedback durante la sesión.',
      ],
      pronunciation:
        "I suspect the issue is in the cache. Let's check the logs. What do you think?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Requiere frases para proponer ('Let's...', 'What if we...?'), expresar hipótesis ('I suspect...', 'I'm not sure') y vocabulario ya visto (bug, test, log, cache, function). Todo se modela en las frases de esta sesión.",
        },
        {
          type: 'technique',
          name: 'Pensar en voz alta con estructura',
          desc: "En pair/debugging: observa ('I see...'), plantea hipótesis ('I suspect... / I think...'), propone acción ('Let's try/check...') y confirma ('Does that make sense?'). Mantiene a ambos alineados.",
        },
        {
          type: 'phrases',
          title: 'Frases para colaborar en vivo',
          items: [
            { en: "Let's take a look at this together.", es: 'Veámoslo juntos.' },
            {
              en: 'I suspect the issue is in the cache.',
              es: 'Sospecho que el problema está en la caché.',
            },
            { en: 'What if we add a log here?', es: '¿Y si agregamos un log aquí?' },
            { en: 'Let me share my screen.', es: 'Déjame compartir mi pantalla.' },
            {
              en: 'Can you walk me through this function?',
              es: '¿Me explicas esta función paso a paso?',
            },
            { en: "That makes sense. Let's try it.", es: 'Tiene sentido. Probémoslo.' },
            {
              en: "I'm not sure yet, but let's check the tests.",
              es: 'Aún no estoy seguro, pero revisemos los tests.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l6-e1',
          type: 'choice',
          prompt: 'Quieres proponer una idea mientras depuran juntos. ¿Qué suena más natural?',
          options: [
            'Maybe do thing.',
            'What if we add a log here?',
            'You must add log.',
            'Log now.',
          ],
          answer: 1,
          explanation: "'What if we...?' propone una hipótesis o acción de forma colaborativa.",
        },
        {
          id: 'm4-l6-e2',
          type: 'builder',
          prompt: "Construye: 'Sospecho que el problema está en la caché.'",
          words: ['I suspect', 'the issue', 'is in', 'the cache.'],
          answer: 'I suspect the issue is in the cache.',
          explanation: "'I suspect...' expresa una hipótesis sin afirmarla como hecho.",
        },
        {
          id: 'm4-l6-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Me explicas esta función paso a paso?'",
          answer: 'Can you walk me through this function?',
          accept: [
            'Could you walk me through this function?',
            'Can you walk me through this function',
          ],
          hint: "Usa 'walk me through...'.",
          explanation:
            "'Walk someone through' es pedir una explicación paso a paso, muy común en pair programming.",
        },
        {
          id: 'm4-l6-e4',
          type: 'choice',
          prompt: 'Quieres mostrar que estás de acuerdo y avanzar. ¿Qué dices?',
          options: ['No.', "That makes sense. Let's try it.", "I don't know.", 'Whatever.'],
          answer: 1,
          explanation:
            "Validar la idea ('That makes sense') y proponer el siguiente paso ('Let's try it') mantiene el flujo.",
        },
        {
          id: 'm4-l6-e5',
          type: 'listen',
          prompt: 'Escucha y escribe la propuesta de debugging en pareja.',
          audioText: 'What if we add a log here?',
          answer: 'What if we add a log here?',
          accept: ['What if we add a log here'],
          hint: "Empieza con 'What if we...'",
          explanation:
            "'What if we...?' es una forma colaborativa de proponer una hipótesis o experimento rápido.",
        },
        {
          id: 'm4-l6-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Déjame compartir mi pantalla.'",
          answer: 'Let me share my screen.',
          accept: ['Let me share my screen'],
          hint: "Usa 'Let me share...'",
          explanation:
            'Frase práctica y común en pair programming o llamadas para mostrar el problema en vivo.',
        },
      ],
    },
    {
      id: 'm4-l7',
      slug: 'practica-daily-ayuda-y-pair',
      title: 'Práctica: daily, ayuda y colaboración',
      step: 'B1 · Paso 4.7 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar comunicación diaria: updates, pedir ayuda con contexto y colaborar en vivo.',
      objectives: [
        'Dar un update breve (ayer/hoy/bloqueo) con frases ya conocidas.',
        'Pedir ayuda de forma clara con contexto e intentos previos.',
        'Usar frases simples para pair programming y debugging.',
      ],
      pronunciation:
        "Yesterday I fixed the bug. Today I'm working on tests. I'm stuck, so could you take a look?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa y combina lo visto en m4-l1 (daily/standup), m4-l5 (pedir ayuda y contexto) y m4-l6 (pair programming). Esta práctica usa solo estructuras y chunks ya enseñados en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Tres marcos útiles',
          desc: "Daily: 'Yesterday..., Today..., I'm blocked by / No blockers.' Ayuda: objetivo + problema + 'I already tried...' + pregunta. Pair: 'I suspect...', 'What if we...?', 'Can you walk me through...?'",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: "Yesterday I finished the integration. Today I'm working on the tests.",
              es: 'Ayer terminé la integración. Hoy estoy trabajando en los tests.',
            },
            {
              en: "I'm stuck on this issue. Could you take a look?",
              es: 'Estoy atascado con este problema. ¿Podrías echarle un vistazo?',
            },
            {
              en: 'I already tried restarting the service.',
              es: 'Ya intenté reiniciar el servicio.',
            },
            { en: 'What if we add a log here?', es: '¿Y si agregamos un log aquí?' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l7-e1',
          type: 'builder',
          prompt:
            "Construye un update corto: 'Ayer terminé la integración. Hoy estoy trabajando en los tests.'",
          words: ['Yesterday I finished', 'the integration.', "Today I'm working on", 'the tests.'],
          answer: "Yesterday I finished the integration. Today I'm working on the tests.",
          explanation: 'Estructura clara de daily: qué hiciste ayer y qué haces hoy.',
        },
        {
          id: 'm4-l7-e2',
          type: 'write',
          prompt:
            "Escríbelo en inglés: 'Estoy atascado con este problema. ¿Podrías echarle un vistazo?'",
          answer: "I'm stuck on this issue. Could you take a look?",
          accept: [
            'I am stuck on this issue. Could you take a look?',
            "I'm stuck on this issue. Could you take a look when you have a minute?",
          ],
          hint: "Usa 'I'm stuck on...' y 'Could you take a look?'",
          explanation:
            'Pedir ayuda con problema claro y petición concreta es directo y profesional.',
        },
        {
          id: 'm4-l7-e3',
          type: 'choice',
          prompt: 'Quieres proponer una hipótesis en pair programming. ¿Qué opción es mejor?',
          options: ['What if we add a log here?', 'Add log now.', 'Log maybe.', 'You add log.'],
          answer: 0,
          explanation: "'What if we...?' propone una idea de forma colaborativa.",
        },
        {
          id: 'm4-l7-e4',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Ya intenté reiniciar el servicio.'",
          answer: 'I already tried restarting the service.',
          accept: [
            "I've already tried restarting the service.",
            'I have already tried restarting the service.',
          ],
          hint: "Usa 'I already tried...'",
          explanation:
            'Compartir lo que ya probaste da contexto útil al pedir ayuda. La variante con presente perfecto ("I\'ve already tried...") se explica en el Paso 4.0.',
        },
        {
          id: 'm4-l7-e5',
          type: 'builder',
          prompt: "Construye: 'Sospecho que el problema está en la caché.'",
          words: ['I suspect', 'the issue', 'is in', 'the cache.'],
          answer: 'I suspect the issue is in the cache.',
          explanation: "'I suspect...' expresa una hipótesis mientras depuran juntos.",
        },
        {
          id: 'm4-l7-e6',
          type: 'choice',
          prompt: 'En tu daily no tienes impedimentos. ¿Qué dices?',
          options: [
            'No blockers on my side.',
            'I have many blockers.',
            'Blocker yes.',
            'Maybe blocked.',
          ],
          answer: 0,
          explanation: 'Es una forma clara y natural de cerrar tu update cuando no hay bloqueos.',
        },
        {
          id: 'm4-l7-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I will take the frontend task and Maya will review the PR.',
          hint: 'Dos compromisos con will.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm4-l8',
      slug: 'practica-reviews-incidentes-y-plazos',
      title: 'Práctica: code reviews, incidentes y plazos',
      step: 'B1-B2 · Paso 4.8 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar m4-l2, m4-l3 y m4-l4: feedback en reviews, comunicación en incidentes y manejo de plazos.',
      objectives: [
        'Dar sugerencias y comentarios de code review de forma clara y profesional.',
        'Comunicar estado y acciones durante un incidente.',
        'Hablar de estimaciones, prioridades y alcance con frases ya vistas.',
      ],
      pronunciation:
        "Could we rename this variable for clarity? I'm rolling back the last deploy. My estimate is two to three days.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m4-l2 (code review), m4-l3 (incidentes, on-call y postmortems) y m4-l4 (estimaciones, plazos y decir que no). Esta práctica usa solo chunks y estructuras ya enseñados en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Tres contextos, lenguaje claro',
          desc: "Reviews: sugerencias y prioridad ('Could we...?', 'blocking/non-blocking'). Incidentes: estado y acción ('We have a production outage', 'I'm rolling back...', 'We're back to normal'). Plazos: estimación y alcance ('My estimate is...', 'Can we descope something?', 'What's the hard deadline?').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: 'Could we rename this variable for clarity?',
              es: '¿Podríamos renombrar esta variable para mayor claridad?',
            },
            {
              en: "I'm rolling back the last deploy.",
              es: 'Estoy revirtiendo el último despliegue.',
            },
            { en: 'My estimate is two to three days.', es: 'Mi estimación es de dos a tres días.' },
            { en: "What's the hard deadline?", es: '¿Cuál es la fecha límite estricta?' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm4-l8-e1',
          type: 'choice',
          prompt:
            'Quieres sugerir un cambio de nombre en un code review de forma amable. ¿Qué dices?',
          options: [
            'Rename this now.',
            'Could we rename this variable for clarity?',
            'Bad name.',
            'This is wrong.',
          ],
          answer: 1,
          explanation:
            "'Could we...?' propone el cambio de forma colaborativa y profesional (m4-l2).",
        },
        {
          id: 'm4-l8-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Estoy revirtiendo el último despliegue.'",
          answer: "I'm rolling back the last deploy.",
          accept: ['I am rolling back the last deploy.'],
          hint: "Usa presente continuo: 'I'm rolling back...'",
          explanation: 'En un incidente, comunicar la acción en curso es clave (m4-l3).',
        },
        {
          id: 'm4-l8-e3',
          type: 'builder',
          prompt: "Construye: 'Mi estimación es de dos a tres días.'",
          words: ['My estimate', 'is two', 'to three days.'],
          answer: 'My estimate is two to three days.',
          explanation: 'Dar una estimación clara ayuda a alinear expectativas (m4-l4).',
        },
        {
          id: 'm4-l8-e4',
          type: 'choice',
          prompt: 'El servicio ya se recuperó después de un incidente. ¿Qué dices?',
          options: [
            "We're back to normal.",
            'We have a production outage.',
            'The root cause is unknown forever.',
            "I'm investigating now.",
          ],
          answer: 0,
          explanation:
            "'We're back to normal' comunica que el servicio se ha estabilizado (m4-l3).",
        },
        {
          id: 'm4-l8-e5',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Cuál es la fecha límite estricta?'",
          answer: "What's the hard deadline?",
          accept: ['What is the hard deadline?'],
          hint: "Usa 'What's the... deadline?' y 'hard' (no negociable).",
          explanation: 'Aclara si hay una fecha límite no negociable para priorizar (m4-l4).',
        },
        {
          id: 'm4-l8-e6',
          type: 'builder',
          prompt: "Construye: 'Esto es un problema bloqueante porque afecta a producción.'",
          words: ['This is a blocking issue', 'because it affects', 'production.'],
          answer: 'This is a blocking issue because it affects production.',
          explanation:
            'En un review, explicar por qué algo es bloqueante ayuda a priorizarlo (m4-l2).',
        },
        {
          id: 'm4-l8-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'We missed the deadline because the deploy broke production.',
          hint: 'Causa y efecto.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
  ],
}
