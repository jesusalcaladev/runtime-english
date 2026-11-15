import type { Module } from "../../lib/types";

export const m4: Module = {
  id: "m4",
  code: "MOD 04",
  level: "B1-B2",
  title: "Standups, Reviews e Incidentes",
  shortTitle: "Standups, Reviews & Incidents",
  description:
    "Reuniones diarias, bloqueos, code reviews, debate de arquitectura y respuesta a incidentes en producción.",
  sessions: [
    {
      id: "m4-l1",
      slug: "daily-standup",
      title: "Fórmulas Exactas para Daily Standup",
      step: "B1 · Paso 4.1",
      cefr: "B1",
      summary:
        "No traduzcas mentalmente. Usa los bloques estándar de equipos ágiles internacionales.",
      objectives: [
        "Estructurar tu turno en 60 segundos: ayer, hoy, bloqueos.",
        "Pedir ayuda y revisión de código sin rodeos.",
        "Discrepar de forma profesional en una reunión.",
      ],
      pronunciation:
        "I finished the API integration yesterday, and today I am working on the login tests.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Se asume que dominas tiempos básicos de M2 (pasado simple para ayer, presente continuo para ahora) y verbos de trabajo (finish, work on, fix, push, review). Aquí practicarás frases y estructura de standup; el vocabulario nuevo aparece en los ejemplos.",
        },
        {
          type: "technique",
          name: "Estructura de 3 puntos (Yesterday / Today / Blockers)",
          desc: "En un daily breve: 1) 'Yesterday I...' (qué terminaste/hiciste). 2) 'Today I'm working on...' (en qué estás ahora). 3) 'I'm blocked by...' o 'No blockers' (estado). Frases cortas y concretas son más claras que explicaciones largas.",
        },
        {
          type: "phrases",
          title: "Frases de reunión",
          items: [
            { en: "Yesterday I worked on X. Today I'm working on Y. I'm blocked by Z.", es: "Tu estructura base para el daily." },
            { en: "I finished the API integration and I'm working on the unit tests.", es: "Reportar progreso concreto." },
            { en: "I'm stuck on the CORS error. I need help with the backend headers.", es: "Pedir ayuda con un bloqueo específico." },
            { en: "I just pushed the fix. Can someone review my PR?", es: "Pedir revisión de código." },
            { en: "Sorry, can you repeat that? / Could you explain that differently?", es: "Cuando no entiendes el acento." },
            { en: "Let me finish my point first.", es: "Cuando te interrumpen." },
            { en: "I agree with you. / That makes sense.", es: "Mostrar acuerdo." },
            { en: "I see your point, but I think we should use caching here.", es: "Discrepar con educación." },
            { en: "This is taking longer than expected. I need one more day.", es: "Pedir más tiempo." },
            { en: "Let's pair on the payment feature after the standup.", es: "Proponer pair programming." },
          ],
        },
        {
          type: "table",
          title: "Marco rápido para tu turno",
          columns: ["Momento", "Frame"],
          rows: [
            ["Ayer", "Yesterday, I [finished/worked on]..."],
            ["Hoy", "Today, I'm working on..."],
            ["Bloqueo", "I'm blocked by... / I need help with..."],
            ["Cierre", "No blockers. / I'll follow up after the standup."],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Flujo nativo y claro",
          body: "Habla en frases cortas y concretas: qué hiciste, qué harás y qué te bloquea. Si no hay bloqueo, dilo explícitamente: 'No blockers on my side.' Suena natural, profesional y ahorra tiempo al equipo.",
        },
      ],
      exercises: [
        {
          id: "m4-l1-e1",
          type: "choice",
          prompt:
            "Un colega propone una arquitectura con la que no estás de acuerdo, pero quieres sonar profesional:",
          options: [
            "No, your idea is bad",
            "I see your point, but I have a different perspective",
            "You don't know how to code",
            "I don't care about that",
          ],
          answer: 1,
          explanation:
            "'I see your point, but...' valida al compañero antes de presentar tu alternativa técnica.",
        },
        {
          id: "m4-l1-e2",
          type: "builder",
          prompt: "Construye: 'Esto está tomando más tiempo de lo esperado.'",
          words: ["This is", "taking longer", "than expected."],
          answer: "This is taking longer than expected.",
          explanation:
            "Frase indispensable para estimaciones y retrasos en sprints.",
        },
        {
          id: "m4-l1-e3",
          type: "write",
          prompt:
            "Escribe tu bloqueo en inglés: 'Estoy atascado con el error de CORS y necesito ayuda con los headers.'",
          answer:
            "I'm stuck on the CORS error and I need help with the headers.",
          accept: [
            "I am stuck on the CORS error and I need help with the headers.",
            "I'm stuck on a CORS error and I need help with the headers.",
          ],
          hint: "Usa 'I'm stuck on...' + 'I need help with...'.",
          explanation:
            "'Stuck on' es la forma natural de decir 'atascado en' un problema técnico.",
        },
        {
          id: "m4-l1-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Esto está tomando más tiempo de lo esperado. Necesito un día más.'",
          answer: "This is taking longer than expected. I need one more day.",
          accept: [
            "This is taking longer than expected, I need one more day.",
            "This is taking longer than expected. I need another day.",
          ],
          hint: "Usa 'taking longer than expected' y 'one more day'.",
          explanation:
            "Es una forma profesional y directa de ajustar una estimación sin excusas vagas.",
        },
        {
          id: "m4-l1-e5",
          type: "builder",
          prompt: "Construye un update cómodo y claro: 'Ayer terminé la integración. Hoy estoy trabajando en los tests. No tengo bloqueos.'",
          words: ["Yesterday I finished the integration.", "Today I'm working on the tests.", "No blockers on my side."],
          answer: "Yesterday I finished the integration. Today I'm working on the tests. No blockers on my side.",
          explanation:
            "Estructura clásica del daily: ayer, hoy y estado de bloqueos. Frases cortas te ayudan a hablar con confianza.",
        },
        {
          id: "m4-l1-e6",
          type: "choice",
          prompt: "Quieres sonar natural al pedir ayuda en la daily. ¿Qué opción es mejor?",
          options: [
            "I'm stuck on the CORS error. Could someone help me with the headers?",
            "I have problem. Help.",
            "CORS is impossible for me.",
            "Someone must fix my bug now.",
          ],
          answer: 0,
          explanation:
            "Nombrar el bloqueo y pedir ayuda de forma específica ('Could someone help me with...') es claro, educado y muy natural.",
        },
      ],
    },
    {
      id: "m4-l2",
      slug: "code-review-en-ingles",
      title: "Code Review: cómo comentar sin sonar agresivo",
      step: "B2 · Paso 4.2",
      cefr: "B2",
      summary:
        "Nit, blocking, non-blocking, LGTM: el idioma exacto para dar feedback útil y recibirlo sin fricción.",
      objectives: [
        "Separar un comentario bloqueante de una sugerencia opcional.",
        "Suavizar una corrección con estructuras B2.",
        "Aprobar, pedir cambios y re-revisar con las siglas correctas.",
      ],
      pronunciation:
        "Non-blocking: could we rename this variable for clarity? LGTM otherwise.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Necesitas vocabulario de Git/PR (M3, M5) y estructuras para sugerir ('Could we...?', 'I'd suggest...'). Esta lección enseña etiquetas y frases específicas de code review; todo lo usado en ejercicios está en las tablas/frases.",
        },
        {
          type: "text",
          body: "Un code review útil es claro y respetuoso. Marca tu intención: 'nit' (detalle menor), 'non-blocking' (sugerencia que no bloquea), 'blocking' (debe resolverse antes del merge). Así el autor sabe qué es urgente y qué es opcional.",
        },
        {
          type: "table",
          title: "Etiquetas de review",
          columns: ["Etiqueta", "Significado", "Ejemplo"],
          rows: [
            ["nit:", "detalle menor, opcional", "nit: typo in the comment"],
            ["non-blocking:", "sugerencia, no bloquea el merge", "non-blocking: we could extract this helper"],
            ["blocking:", "debe resolverse antes de aprobar", "blocking: this leaks the API key"],
            ["LGTM", "Looks Good To Me → aprobado", "LGTM, thanks for the tests!"],
            ["PTAL", "Please Take Another Look → re-revisa", "Addressed your comments. PTAL."],
            ["suggestion:", "idea opcional, no bloquea", "suggestion: consider memoizing this selector"],
          ],
        },
        {
          type: "phrases",
          title: "Sugerir sin imponer",
          items: [
            { en: "Could we rename this variable for clarity?", es: "¿Podríamos renombrar esta variable para que quede más claro?" },
            { en: "What do you think about extracting this into a function?", es: "¿Qué te parece extraer esto a una función?" },
            { en: "I'd suggest adding a test for the empty state.", es: "Sugeriría añadir un test para el estado vacío." },
            { en: "This is a blocking issue because it affects production.", es: "Esto bloquea porque afecta producción." },
            { en: "Non-blocking: we can address this in a follow-up.", es: "No bloqueante: lo vemos en un follow-up." },
            { en: "Nice catch! I hadn't thought about that edge case.", es: "Buena observación, no había pensado en ese caso límite." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "La fórmula de feedback B2",
          body: "Observación + impacto + pregunta. Ejemplo: 'This query runs inside the loop (observación). It will hit the database N times (impacto). Could we batch it? (pregunta)'. Suena senior y no ataca a la persona.",
        },
      ],
      exercises: [
        {
          id: "m4-l2-e1",
          type: "choice",
          prompt:
            "Quieres marcar una sugerencia que no debe impedir que el PR se apruebe. ¿Cómo empiezas el comentario?",
          options: ["Blocking:", "Non-blocking:", "LGTM:", "PTAL:"],
          answer: 1,
          explanation:
            "'Non-blocking' indica que es una sugerencia y que el PR puede avanzar sin resolverla.",
        },
        {
          id: "m4-l2-e2",
          type: "choice",
          prompt:
            "Hay una fuga de una API key en el diff. ¿Qué etiqueta usas?",
          options: [
            "nit: move the key",
            "non-blocking: nice key",
            "blocking: this leaks the API key",
            "LGTM: ship it",
          ],
          answer: 2,
          explanation:
            "'Blocking' señala un problema que debe resolverse antes del merge. Una fuga de credenciales siempre lo es.",
        },
        {
          id: "m4-l2-e3",
          type: "builder",
          prompt: "Construye la sugerencia: '¿Podríamos renombrar esta variable para mayor claridad?'",
          words: ["Could we", "rename", "this variable", "for clarity?"],
          answer: "Could we rename this variable for clarity?",
          explanation:
            "'Could we...?' es la forma más natural y educada de sugerir un cambio en un review.",
        },
        {
          id: "m4-l2-e4",
          type: "write",
          prompt:
            "Escribe en inglés: 'Apliqué tus comentarios. ¿Puedes revisarlo otra vez? (usa la sigla)'",
          answer: "I addressed your comments. PTAL.",
          accept: [
            "I've addressed your comments. PTAL.",
            "Addressed your comments. PTAL.",
            "I addressed your comments, PTAL.",
          ],
          explanation:
            "'Address comments' significa aplicar los cambios pedidos en un review. 'PTAL' = Please Take Another Look.",
        },
        {
          id: "m4-l2-e5",
          type: "fix-error",
          prompt: "Haz el comentario de review más claro y profesional.",
          sentence: "This is wrong. Change it.",
          answer: "This might break when the input is null. Could you add a check?",
          accept: [
            "This could break when the input is null. Could we add a check?",
            "This might break with null input. Could you add a check?",
          ],
          hint: "Incluye impacto/riesgo y una sugerencia concreta ('Could you...?').",
          explanation:
            "Feedback útil: señala el problema o riesgo y propone una acción concreta, en lugar de solo decir que está mal.",
        },
        {
          id: "m4-l2-e6",
          type: "choice",
          prompt: "¿Qué significa 'LGTM' en un code review?",
          options: [
            "Necesita más trabajo antes de aprobar.",
            "Looks Good To Me: lo apruebas.",
            "Es un error bloqueante.",
            "Hay que borrar el PR.",
          ],
          answer: 1,
          explanation:
            "'LGTM' (Looks Good To Me) indica aprobación del cambio. A veces se añade una condición: 'LGTM once tests pass.'",
        },
      ],
    },
    {
      id: "m4-l3",
      slug: "incidentes-on-call",
      title: "Incidentes, on-call y postmortems",
      step: "B2 · Paso 4.3",
      cefr: "B2",
      summary:
        "Comunica una caída, coordina la mitigación y escribe un postmortem sin buscar culpables.",
      objectives: [
        "Comunicar un incidente con claridad y urgencia.",
        "Hablar de severidad, blast radius y rollback.",
        "Explicar la causa raíz en un postmortem blameless.",
      ],
      pronunciation:
        "We have a production outage. I'm rolling back the last deploy to reduce the blast radius.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Requiere presente continuo para estado actual ('We're rolling back'), pasado/futuro básico y vocabulario de deploy (M2–M3). Se introducen términos de incidente (outage, degradation, mitigation, root cause, blast radius) en esta lección.",
        },
        {
          type: "technique",
          name: "Flujo de comunicación en un incidente",
          desc: "1) Impacto: qué pasa ('We have an outage/degradation'). 2) Mitigación: qué estás haciendo ahora ('We're rolling back / investigating'). 3) Actualizaciones: cuándo volverás a informar. 4) Después: causa raíz y postmortem sin culpas. Claridad y frecuencia > perfección.",
        },
        {
          type: "phrases",
          title: "Frases de incidente",
          items: [
            { en: "We have a production outage.", es: "Tenemos una caída en producción." },
            { en: "What's the blast radius?", es: "¿A cuántos usuarios/afecta?" },
            { en: "I'm rolling back the last deploy.", es: "Estoy revirtiendo el último despliegue." },
            { en: "The mitigation is working.", es: "La mitigación está funcionando." },
            { en: "The root cause was a bad migration.", es: "La causa raíz fue una migración defectuosa." },
            { en: "I'll take the incident and send updates every 15 minutes.", es: "Yo me encargo del incidente y mando actualizaciones cada 15 minutos." },
            { en: "Let's write a blameless postmortem.", es: "Escribamos un postmortem sin culpar a nadie." },
            { en: "We're back to normal.", es: "Volvimos a la normalidad." },
          ],
        },
        {
          type: "vocab",
          title: "Vocabulario de on-call",
          items: [
            { en: "outage", es: "caída o interrupción del servicio", example: "The outage lasted 20 minutes." },
            { en: "degradation", es: "degradación del servicio", example: "We're seeing some degradation in latency." },
            { en: "rollback", es: "reversión de un despliegue", example: "The rollback fixed the issue." },
            { en: "root cause", es: "causa raíz", example: "The root cause was a connection leak." },
          ],
        },
      ],
      exercises: [
        {
          id: "m4-l3-e1",
          type: "choice",
          prompt: "Producción está caída. ¿Cómo lo comunicas de forma profesional?",
          options: [
            "Prod is dead.",
            "We have a production outage.",
            "The website is bad.",
            "Everything is broken forever.",
          ],
          answer: 1,
          explanation:
            "'We have a production outage' comunica impacto y urgencia sin dramatismo.",
        },
        {
          id: "m4-l3-e2",
          type: "choice",
          prompt: "Un deploy acaba de romper producción. ¿Cuál es la primera mitigación habitual?",
          options: ["Write a postmortem", "Roll back the deploy", "Add more logs", "Ask for a new estimate"],
          answer: 1,
          explanation:
            "Primero se reduce el impacto; un rollback devuelve el servicio a la última versión estable.",
        },
        {
          id: "m4-l3-e3",
          type: "builder",
          prompt: "Construye: 'Volvamos a la versión anterior.'",
          words: ["Let's", "roll back", "to the previous version."],
          answer: "Let's roll back to the previous version.",
          explanation:
            "'Let's + verbo base' propone una acción inmediata en equipo.",
        },
        {
          id: "m4-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'La causa raíz fue una migración defectuosa.'",
          answer: "The root cause was a bad migration.",
          accept: [
            "The root cause was a faulty migration.",
            "The root cause was an issue with the migration.",
          ],
          hint: "Usa 'The root cause was...'.",
          explanation:
            "Un postmortem útil nombra la causa raíz sin atacar a la persona que hizo el cambio.",
        },
        {
          id: "m4-l3-e5",
          type: "dialogue-order",
          prompt: "Ordena la comunicación básica de un incidente.",
          lines: [
            "We have a production outage.",
            "I'm rolling back the last deploy now.",
            "I'll send an update in 15 minutes.",
          ],
          explanation:
            "Secuencia clara: impacto → mitigación en curso → próxima actualización. Esto da calma y contexto al equipo.",
        },
        {
          id: "m4-l3-e6",
          type: "choice",
          prompt: "¿Qué pregunta ayuda a entender el alcance del problema?",
          options: [
            "What's the blast radius?",
            "Who wrote this code?",
            "Can we deploy again?",
            "Is this funny?",
          ],
          answer: 0,
          explanation:
            "'Blast radius' se refiere al alcance/impacto del incidente (qué usuarios, servicios o regiones se ven afectados).",
        },
      ],
    },
    {
      id: "m4-l4",
      slug: "estimaciones-y-plazos",
      title: "Estimaciones, plazos y decir que no",
      step: "B2 · Paso 4.4",
      cefr: "B2",
      summary:
        "Da estimaciones con supuestos, negocia el alcance y di que no sin cerrar la conversación.",
      objectives: [
        "Dar un rango con supuestos en lugar de una cifra inventada.",
        "Negociar alcance y prioridades ante un plazo ajustado.",
        "Decir que no de forma profesional y constructiva.",
      ],
      pronunciation:
        "My estimate is two to three days, assuming the API is stable.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Usarás futuro/will, condicionales simples en contexto ('assuming...', 'if...') y vocabulario de tareas/scope. Las frases clave se enseñan aquí antes de los ejercicios.",
        },
        {
          type: "technique",
          name: "Estimar bien: rango + supuesto + opción",
          desc: "Evita una cifra única. Da un rango ('two to three days'), aclara el supuesto ('assuming the API is stable') y ofrece opciones si cambia ('if X slips, we can cut Y'). Esto ayuda a decidir, no solo a esperar.",
        },
        {
          type: "phrases",
          title: "Frases para plazos y alcance",
          items: [
            { en: "My estimate is two to three days.", es: "Mi estimación es de dos a tres días." },
            { en: "That assumes the API is stable.", es: "Eso asume que la API es estable." },
            { en: "What's the hard deadline?", es: "¿Cuál es la fecha límite real?" },
            { en: "I can deliver X by Friday, but Y would slip.", es: "Puedo entregar X el viernes, pero Y se retrasaría." },
            { en: "Can we descope something?", es: "¿Podemos reducir el alcance?" },
            { en: "I don't think that's realistic with the current scope.", es: "No creo que sea realista con el alcance actual." },
            { en: "Let's break it down first.", es: "Primero dividámoslo en partes." },
            { en: "Which one is the priority?", es: "¿Cuál es la prioridad?" },
          ],
        },
        {
          type: "table",
          title: "Decir que no sin sonar bloqueado",
          columns: ["En vez de", "Di"],
          rows: [
            ["No, impossible.", "I can't do both by Friday. Which one should I prioritize?"],
            ["It will take two days.", "It will take two to three days, assuming the API is stable."],
            ["We need more time.", "We need one more day, or we can cut the reporting part."],
          ],
        },
      ],
      exercises: [
        {
          id: "m4-l4-e1",
          type: "choice",
          prompt: "Tu lead pregunta cuánto vas a tardar. ¿Cuál es la respuesta más profesional?",
          options: ["Two days.", "I don't know yet.", "Two to three days, assuming the API is stable.", "ASAP."],
          answer: 2,
          explanation:
            "Un rango con un supuesto permite planificar y deja claro qué podría cambiarlo.",
        },
        {
          id: "m4-l4-e2",
          type: "choice",
          prompt: "No puedes entregar dos tareas el viernes. ¿Qué dices?",
          options: [
            "No.",
            "That's impossible.",
            "I can't do both by Friday. Which one is the priority?",
            "Ask someone else.",
          ],
          answer: 2,
          explanation:
            "Decir que no + ofrecer una decisión mantiene la conversación y protege el foco del equipo.",
        },
        {
          id: "m4-l4-e3",
          type: "builder",
          prompt: "Construye: 'Eso asume que la API es estable.'",
          words: ["That", "assumes", "the API", "is stable."],
          answer: "That assumes the API is stable.",
          explanation:
            "'Assume' es la palabra clave para hacer explícito de qué depende tu estimación.",
        },
        {
          id: "m4-l4-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Necesitamos reducir el alcance para llegar al viernes.'",
          answer: "We need to reduce the scope to hit Friday.",
          accept: [
            "We need to cut the scope to hit Friday.",
            "We need to reduce scope to hit Friday.",
          ],
          hint: "Usa 'reduce the scope' o 'cut the scope'.",
          explanation:
            "'Hit a deadline' significa llegar a la fecha; 'scope' es el alcance del trabajo.",
        },
        {
          id: "m4-l4-e5",
          type: "builder",
          prompt: "Construye: 'Mi estimación es de dos a tres días, suponiendo que la API sea estable.'",
          words: ["My estimate is", "two to three days,", "assuming the API", "is stable."],
          answer: "My estimate is two to three days, assuming the API is stable.",
          explanation:
            "Estimación profesional: rango + supuesto explícito. Así el equipo entiende de qué depende el plazo.",
        },
        {
          id: "m4-l4-e6",
          type: "choice",
          prompt: "Quieren añadir otra tarea y el plazo es ajustado. ¿Qué respuesta es más profesional?",
          options: [
            "I can do everything.",
            "If we add that, something else will slip. Which one is the priority?",
            "No, I won't do it.",
            "Maybe, I don't know.",
          ],
          answer: 1,
          explanation:
            "Explicas el impacto (trade-off) y pides priorizar. Es claro, colaborativo y realista.",
        },
      ],
    },
    {
      id: "m4-l5",
      slug: "pedir-ayuda-y-dar-contexto",
      title: "Pedir ayuda y dar contexto técnico",
      step: "B1 · Paso 4.5",
      cefr: "B1",
      summary:
        "Pide ayuda sin sonar perdido: explica qué intentas hacer, qué probaste y qué necesitas exactamente.",
      objectives: [
        "Pedir ayuda con una pregunta clara y accionable.",
        "Dar contexto técnico suficiente: objetivo, intento y resultado.",
        "Agradecer y confirmar el siguiente paso.",
      ],
      pronunciation:
        "I'm trying to fix this bug, but I'm stuck. Could you take a look when you have a minute?",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Se basa en vocabulario de errores/debug y frases de petición ('Could you...?', presente continuo/pasado para lo intentado). Esta lección organiza ese conocimiento en una plantilla práctica.",
        },
        {
          type: "technique",
          name: "Pedir ayuda útil: contexto + intento + pregunta",
          desc: "Incluye: 1) objetivo ('I'm trying to...'), 2) lo que pasa/error, 3) lo que ya probaste ('I already tried...'), 4) pregunta concreta ('Could you take a look?', 'Any ideas?'). Así evitas idas y vueltas.",
        },
        {
          type: "phrases",
          title: "Frases para pedir ayuda",
          items: [
            { en: "I'm stuck on this issue.", es: "Estoy atascado con este problema." },
            { en: "Could you take a look when you have a minute?", es: "¿Podrías echarle un vistazo cuando tengas un minuto?" },
            { en: "I'm trying to reproduce the bug, but I can't.", es: "Estoy intentando reproducir el bug, pero no puedo." },
            { en: "I already tried restarting the service.", es: "Ya intenté reiniciar el servicio." },
            { en: "What am I missing?", es: "¿Qué se me está pasando?" },
            { en: "Any ideas on what could be causing this?", es: "¿Alguna idea de qué podría estar causando esto?" },
          ],
        },
        {
          type: "table",
          title: "De vaga a útil",
          columns: ["Mensaje vago", "Mensaje útil"],
          rows: [
            ["It doesn't work.", "The API returns 500 when I send an empty array. I already checked the logs."],
            ["Can you help?", "Could you take a look at this PR? I'm not sure about the error handling."],
            ["I don't get it.", "I'm trying to understand why the cache is stale. What am I missing?"],
          ],
        },
      ],
      exercises: [
        {
          id: "m4-l5-e1",
          type: "choice",
          prompt: "Necesitas ayuda con un bug. ¿Cuál mensaje es más útil?",
          options: [
            "Help!!!",
            "It doesn't work.",
            "I'm stuck on a bug: the API returns 500 with an empty array. I already checked the logs. Any ideas?",
            "Fix this.",
          ],
          answer: 2,
          explanation:
            "Un buen pedido de ayuda incluye el problema, lo que ya probaste y una pregunta concreta.",
        },
        {
          id: "m4-l5-e2",
          type: "builder",
          prompt: "Construye: '¿Podrías echarle un vistazo cuando tengas un minuto?'",
          words: ["Could you take a look", "when you have", "a minute?"],
          answer: "Could you take a look when you have a minute?",
          explanation:
            "'Could you take a look...?' es una forma educada y común de pedir ayuda.",
        },
        {
          id: "m4-l5-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'Ya intenté reiniciar el servicio.'",
          answer: "I already tried restarting the service.",
          accept: [
            "I've already tried restarting the service.",
            "I have already tried restarting the service.",
            "I already tried restarting the service",
          ],
          hint: "Usa 'I already tried...' (pasado simple).",
          explanation:
            "Decir lo que ya probaste evita sugerencias repetidas y muestra contexto. Aquí usamos pasado simple, una forma clara y ya conocida.",
        },
        {
          id: "m4-l5-e4",
          type: "choice",
          prompt: "¿Qué significa 'What am I missing?'",
          options: [
            "¿Qué perdí?",
            "¿Qué se me está pasando / qué no estoy viendo?",
            "¿Qué falta en el calendario?",
            "¿A quién extraño?",
          ],
          answer: 1,
          explanation:
            "'What am I missing?' pide que te señalen lo que no estás considerando en el problema.",
        },
        {
          id: "m4-l5-e5",
          type: "write",
          prompt: "Escribe en inglés: 'Estoy intentando reproducir el bug, pero no puedo.'",
          answer: "I'm trying to reproduce the bug, but I can't.",
          accept: [
            "I am trying to reproduce the bug, but I can't.",
            "I'm trying to reproduce the bug, but I cannot.",
          ],
          hint: "Usa 'I'm trying to reproduce the bug...'",
          explanation:
            "Dar contexto de lo que intentas hacer ayuda a que otros entiendan dónde necesitas apoyo.",
        },
        {
          id: "m4-l5-e6",
          type: "builder",
          prompt: "Construye: 'Ya intenté reiniciar el servicio, pero sigue fallando.'",
          words: ["I already tried", "restarting the service,", "but it still fails."],
          answer: "I already tried restarting the service, but it still fails.",
          explanation:
            "Contexto + intento previo + resultado actual: una forma clara y útil de pedir ayuda.",
        },
      ],
    },
    {
      id: "m4-l6",
      slug: "pair-programming-y-debugging-en-vivo",
      title: "Pair programming y debugging en vivo",
      step: "B1 · Paso 4.6",
      cefr: "B1",
      summary:
        "Narra lo que piensas, propone hipótesis y colabora en vivo sin perder claridad.",
      objectives: [
        "Explicar tu razonamiento mientras depuras o programas en pareja.",
        "Proponer hipótesis y siguientes pasos con frases simples.",
        "Confirmar entendimiento y pedir feedback durante la sesión.",
      ],
      pronunciation:
        "I suspect the issue is in the cache. Let's check the logs. What do you think?",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Requiere frases para proponer ('Let's...', 'What if we...?'), expresar hipótesis ('I suspect...', 'I'm not sure') y vocabulario ya visto (bug, test, log, cache, function). Todo se modela en las frases de esta sesión.",
        },
        {
          type: "technique",
          name: "Pensar en voz alta con estructura",
          desc: "En pair/debugging: observa ('I see...'), plantea hipótesis ('I suspect... / I think...'), propone acción ('Let's try/check...') y confirma ('Does that make sense?'). Mantiene a ambos alineados.",
        },
        {
          type: "phrases",
          title: "Frases para colaborar en vivo",
          items: [
            { en: "Let's take a look at this together.", es: "Veámoslo juntos." },
            { en: "I suspect the issue is in the cache.", es: "Sospecho que el problema está en la caché." },
            { en: "What if we add a log here?", es: "¿Y si agregamos un log aquí?" },
            { en: "Let me share my screen.", es: "Déjame compartir mi pantalla." },
            { en: "Can you walk me through this function?", es: "¿Me explicas esta función paso a paso?" },
            { en: "That makes sense. Let's try it.", es: "Tiene sentido. Probémoslo." },
            { en: "I'm not sure yet, but let's check the tests.", es: "Aún no estoy seguro, pero revisemos los tests." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Usa conectores para pensar en voz alta",
          body: "Marcadores como 'I mean', 'actually' y 'basically' ayudan a ajustar tu idea en tiempo real: 'Actually, I think the bug is elsewhere.' / 'Basically, we need to validate the input first.'",
        },
      ],
      exercises: [
        {
          id: "m4-l6-e1",
          type: "choice",
          prompt: "Quieres proponer una idea mientras depuran juntos. ¿Qué suena más natural?",
          options: [
            "Maybe do thing.",
            "What if we add a log here?",
            "You must add log.",
            "Log now.",
          ],
          answer: 1,
          explanation:
            "'What if we...?' propone una hipótesis o acción de forma colaborativa.",
        },
        {
          id: "m4-l6-e2",
          type: "builder",
          prompt: "Construye: 'Sospecho que el problema está en la caché.'",
          words: ["I suspect", "the issue", "is in", "the cache."],
          answer: "I suspect the issue is in the cache.",
          explanation:
            "'I suspect...' expresa una hipótesis sin afirmarla como hecho.",
        },
        {
          id: "m4-l6-e3",
          type: "write",
          prompt: "Escríbelo en inglés: '¿Me explicas esta función paso a paso?'",
          answer: "Can you walk me through this function?",
          accept: [
            "Could you walk me through this function?",
            "Can you walk me through this function",
          ],
          hint: "Usa 'walk me through...'.",
          explanation:
            "'Walk someone through' es pedir una explicación paso a paso, muy común en pair programming.",
        },
        {
          id: "m4-l6-e4",
          type: "choice",
          prompt: "Quieres mostrar que estás de acuerdo y avanzar. ¿Qué dices?",
          options: ["No.", "That makes sense. Let's try it.", "I don't know.", "Whatever."],
          answer: 1,
          explanation:
            "Validar la idea ('That makes sense') y proponer el siguiente paso ('Let's try it') mantiene el flujo.",
        },
        {
          id: "m4-l6-e5",
          type: "listen",
          prompt: "Escucha y escribe la propuesta de debugging en pareja.",
          audioText: "What if we add a log here?",
          answer: "What if we add a log here?",
          accept: ["What if we add a log here"],
          hint: "Empieza con 'What if we...'",
          explanation:
            "'What if we...?' es una forma colaborativa de proponer una hipótesis o experimento rápido.",
        },
        {
          id: "m4-l6-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Déjame compartir mi pantalla.'",
          answer: "Let me share my screen.",
          accept: ["Let me share my screen"],
          hint: "Usa 'Let me share...'",
          explanation:
            "Frase práctica y común en pair programming o llamadas para mostrar el problema en vivo.",
        },
      ],
    },
    {
      id: "m4-l7",
      slug: "practica-daily-ayuda-y-pair",
      title: "Práctica: daily, ayuda y colaboración",
      step: "B1 · Paso 4.7 · Práctica guiada",
      cefr: "B1",
      summary:
        "Sesión corta para separar y reforzar comunicación diaria: updates, pedir ayuda con contexto y colaborar en vivo.",
      objectives: [
        "Dar un update breve (ayer/hoy/bloqueo) con frases ya conocidas.",
        "Pedir ayuda de forma clara con contexto e intentos previos.",
        "Usar frases simples para pair programming y debugging."
      ],
      pronunciation:
        "Yesterday I fixed the bug. Today I'm working on tests. I'm stuck, so could you take a look?",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Repasa y combina lo visto en m4-l1 (daily/standup), m4-l5 (pedir ayuda y contexto) y m4-l6 (pair programming). Esta práctica usa solo estructuras y chunks ya enseñados en esas lecciones.",
        },
        {
          type: "technique",
          name: "Tres marcos útiles",
          desc: "Daily: 'Yesterday..., Today..., I'm blocked by / No blockers.' Ayuda: objetivo + problema + 'I already tried...' + pregunta. Pair: 'I suspect...', 'What if we...?', 'Can you walk me through...?'",
        },
        {
          type: "phrases",
          title: "Chunks de apoyo",
          items: [
            { en: "Yesterday I finished the integration. Today I'm working on the tests.", es: "Ayer terminé la integración. Hoy estoy trabajando en los tests." },
            { en: "I'm stuck on this issue. Could you take a look?", es: "Estoy atascado con este problema. ¿Podrías echarle un vistazo?" },
            { en: "I already tried restarting the service.", es: "Ya intenté reiniciar el servicio." },
            { en: "What if we add a log here?", es: "¿Y si agregamos un log aquí?" }
          ],
        }
      ],
      exercises: [
        {
          id: "m4-l7-e1",
          type: "builder",
          prompt: "Construye un update corto: 'Ayer terminé la integración. Hoy estoy trabajando en los tests.'",
          words: ["Yesterday I finished", "the integration.", "Today I'm working on", "the tests."],
          answer: "Yesterday I finished the integration. Today I'm working on the tests.",
          explanation:
            "Estructura clara de daily: qué hiciste ayer y qué haces hoy.",
        },
        {
          id: "m4-l7-e2",
          type: "write",
          prompt: "Escríbelo en inglés: 'Estoy atascado con este problema. ¿Podrías echarle un vistazo?'",
          answer: "I'm stuck on this issue. Could you take a look?",
          accept: [
            "I am stuck on this issue. Could you take a look?",
            "I'm stuck on this issue. Could you take a look when you have a minute?"
          ],
          hint: "Usa 'I'm stuck on...' y 'Could you take a look?'",
          explanation:
            "Pedir ayuda con problema claro y petición concreta es directo y profesional.",
        },
        {
          id: "m4-l7-e3",
          type: "choice",
          prompt: "Quieres proponer una hipótesis en pair programming. ¿Qué opción es mejor?",
          options: [
            "What if we add a log here?",
            "Add log now.",
            "Log maybe.",
            "You add log."
          ],
          answer: 0,
          explanation:
            "'What if we...?' propone una idea de forma colaborativa.",
        },
        {
          id: "m4-l7-e4",
          type: "write",
          prompt: "Escríbelo en inglés: 'Ya intenté reiniciar el servicio.'",
          answer: "I already tried restarting the service.",
          accept: [
            "I've already tried restarting the service.",
            "I have already tried restarting the service."
          ],
          hint: "Usa 'I already tried...'",
          explanation:
            "Compartir lo que ya probaste da contexto útil al pedir ayuda.",
        },
        {
          id: "m4-l7-e5",
          type: "builder",
          prompt: "Construye: 'Sospecho que el problema está en la caché.'",
          words: ["I suspect", "the issue", "is in", "the cache."],
          answer: "I suspect the issue is in the cache.",
          explanation:
            "'I suspect...' expresa una hipótesis mientras depuran juntos.",
        },
        {
          id: "m4-l7-e6",
          type: "choice",
          prompt: "En tu daily no tienes impedimentos. ¿Qué dices?",
          options: [
            "No blockers on my side.",
            "I have many blockers.",
            "Blocker yes.",
            "Maybe blocked."
          ],
          answer: 0,
          explanation:
            "Es una forma clara y natural de cerrar tu update cuando no hay bloqueos.",
        }
      ],
    },
    {
      id: "m4-l8",
      slug: "practica-reviews-incidentes-y-plazos",
      title: "Práctica: code reviews, incidentes y plazos",
      step: "B1-B2 · Paso 4.8 · Práctica guiada",
      cefr: "B1",
      summary:
        "Sesión corta para separar y reforzar m4-l2, m4-l3 y m4-l4: feedback en reviews, comunicación en incidentes y manejo de plazos.",
      objectives: [
        "Dar sugerencias y comentarios de code review de forma clara y profesional.",
        "Comunicar estado y acciones durante un incidente.",
        "Hablar de estimaciones, prioridades y alcance con frases ya vistas."
      ],
      pronunciation:
        "Could we rename this variable for clarity? I'm rolling back the last deploy. My estimate is two to three days.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Repasa m4-l2 (code review), m4-l3 (incidentes, on-call y postmortems) y m4-l4 (estimaciones, plazos y decir que no). Esta práctica usa solo chunks y estructuras ya enseñados en esas lecciones."
        },
        {
          type: "technique",
          name: "Tres contextos, lenguaje claro",
          desc: "Reviews: sugerencias y prioridad ('Could we...?', 'blocking/non-blocking'). Incidentes: estado y acción ('We have a production outage', 'I'm rolling back...', 'We're back to normal'). Plazos: estimación y alcance ('My estimate is...', 'Can we descope something?', 'What's the hard deadline?')."
        },
        {
          type: "phrases",
          title: "Chunks de apoyo",
          items: [
            { en: "Could we rename this variable for clarity?", es: "¿Podríamos renombrar esta variable para mayor claridad?" },
            { en: "I'm rolling back the last deploy.", es: "Estoy revirtiendo el último despliegue." },
            { en: "My estimate is two to three days.", es: "Mi estimación es de dos a tres días." },
            { en: "What's the hard deadline?", es: "¿Cuál es la fecha límite estricta?" }
          ]
        }
      ],
      exercises: [
        {
          id: "m4-l8-e1",
          type: "choice",
          prompt: "Quieres sugerir un cambio de nombre en un code review de forma amable. ¿Qué dices?",
          options: [
            "Rename this now.",
            "Could we rename this variable for clarity?",
            "Bad name.",
            "This is wrong."
          ],
          answer: 1,
          explanation:
            "'Could we...?' propone el cambio de forma colaborativa y profesional (m4-l2)."
        },
        {
          id: "m4-l8-e2",
          type: "write",
          prompt: "Escríbelo en inglés: 'Estoy revirtiendo el último despliegue.'",
          answer: "I'm rolling back the last deploy.",
          accept: ["I am rolling back the last deploy."],
          hint: "Usa presente continuo: 'I'm rolling back...'",
          explanation:
            "En un incidente, comunicar la acción en curso es clave (m4-l3)."
        },
        {
          id: "m4-l8-e3",
          type: "builder",
          prompt: "Construye: 'Mi estimación es de dos a tres días.'",
          words: ["My estimate", "is two", "to three days."],
          answer: "My estimate is two to three days.",
          explanation:
            "Dar una estimación clara ayuda a alinear expectativas (m4-l4)."
        },
        {
          id: "m4-l8-e4",
          type: "choice",
          prompt: "El servicio ya se recuperó después de un incidente. ¿Qué dices?",
          options: [
            "We're back to normal.",
            "We have a production outage.",
            "The root cause is unknown forever.",
            "I'm investigating now."
          ],
          answer: 0,
          explanation:
            "'We're back to normal' comunica que el servicio se ha estabilizado (m4-l3)."
        },
        {
          id: "m4-l8-e5",
          type: "write",
          prompt: "Escríbelo en inglés: '¿Cuál es la fecha límite estricta?'",
          answer: "What's the hard deadline?",
          accept: ["What is the hard deadline?"],
          hint: "Pregunta directa: 'What's the hard deadline?'",
          explanation:
            "Aclara si hay una fecha límite no negociable para priorizar (m4-l4)."
        },
        {
          id: "m4-l8-e6",
          type: "builder",
          prompt: "Construye: 'Esto es un problema bloqueante porque afecta a producción.'",
          words: ["This is a blocking issue", "because it affects", "production."],
          answer: "This is a blocking issue because it affects production.",
          explanation:
            "En un review, explicar por qué algo es bloqueante ayuda a priorizarlo (m4-l2)."
        }
      ],
    },
  ],
};
