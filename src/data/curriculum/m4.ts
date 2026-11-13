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
      minutes: 11,
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
          type: "technique",
          name: "Estructura de 3 Puntos (Yesterday / Today / Blockers)",
          desc: "En un daily de 60 segundos solo necesitas tres conectores: 'Yesterday I finished...', 'Today I'm working on...', 'I'm blocked by...'.",
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
      ],
    },
    {
      id: "m4-l2",
      slug: "code-review-en-ingles",
      title: "Code Review: cómo comentar sin sonar agresivo",
      step: "B2 · Paso 4.2",
      cefr: "B2",
      minutes: 11,
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
          type: "text",
          body: "Un code review mal escrito genera fricción. El inglés profesional usa marcadores explícitos de intención: 'nit' (detalle menor), 'non-blocking' (sugerencia, no impide aprobar) y 'blocking' (hay que resolverlo antes del merge).",
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
      ],
    },
    {
      id: "m4-l3",
      slug: "incidentes-on-call",
      title: "Incidentes, on-call y postmortems",
      step: "B2 · Paso 4.3",
      cefr: "B2",
      minutes: 11,
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
          type: "technique",
          name: "Flujo de un incidente",
          desc: "Primero reconoce el impacto ('We have an outage'), después mitiga ('We're rolling back'), comunica el estado y solo al final escribe el postmortem con la causa raíz. En incidentes, la claridad importa más que la elegancia.",
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
      ],
    },
    {
      id: "m4-l4",
      slug: "estimaciones-y-plazos",
      title: "Estimaciones, plazos y decir que no",
      step: "B2 · Paso 4.4",
      cefr: "B2",
      minutes: 12,
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
          type: "technique",
          name: "Estima con rango, supuesto y consecuencia",
          desc: "Una estimación profesional tiene tres piezas: el rango ('two to three days'), el supuesto ('assuming the API is stable') y la consecuencia ('if it isn't, we'll need another day'). Así el equipo puede decidir, no solo esperar.",
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
      ],
    },
    {
      id: "m4-l5",
      slug: "pedir-ayuda-y-dar-contexto",
      title: "Pedir ayuda y dar contexto técnico",
      step: "B1 · Paso 4.5",
      cefr: "B1",
      minutes: 10,
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
          type: "technique",
          name: "Pedir ayuda bien = contexto + intento + pregunta",
          desc: "No digas solo 'it doesn't work'. Explica: 1) qué intentas lograr, 2) qué ya probaste, 3) qué pasa ahora, 4) qué ayuda necesitas. Una buena pregunta ahorra tiempo a todos y recibe mejores respuestas.",
        },
        {
          type: "phrases",
          title: "Frases para pedir ayuda",
          items: [
            { en: "I'm stuck on this issue.", es: "Estoy atascado con este problema." },
            { en: "Could you take a look when you have a minute?", es: "¿Podrías echarle un vistazo cuando tengas un minuto?" },
            { en: "I'm trying to reproduce the bug, but I can't.", es: "Estoy intentando reproducir el bug, pero no puedo." },
            { en: "I've already tried restarting the service.", es: "Ya intenté reiniciar el servicio." },
            { en: "What am I missing?", es: "¿Qué se me está pasando?" },
            { en: "Any ideas on what could be causing this?", es: "¿Alguna idea de qué podría estar causando esto?" },
          ],
        },
        {
          type: "table",
          title: "De vaga a útil",
          columns: ["Mensaje vago", "Mensaje útil"],
          rows: [
            ["It doesn't work.", "The API returns 500 when I send an empty array. I've checked the logs."],
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
            "I'm stuck on a bug: the API returns 500 with an empty array. I've checked the logs. Any ideas?",
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
          answer: "I've already tried restarting the service.",
          accept: [
            "I have already tried restarting the service.",
            "I already tried restarting the service.",
          ],
          hint: "Usa 'I've already tried...'.",
          explanation:
            "Decir lo que ya probaste evita sugerencias repetidas y muestra contexto.",
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
      ],
    },
    {
      id: "m4-l6",
      slug: "pair-programming-y-debugging-en-vivo",
      title: "Pair programming y debugging en vivo",
      step: "B1 · Paso 4.6",
      cefr: "B1",
      minutes: 11,
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
          type: "technique",
          name: "Piensa en voz alta, pero con estructura",
          desc: "En pair programming, di qué ves, qué sospechas y qué harás: 'I see X, I suspect Y, let's try Z.' Esto mantiene a la otra persona alineada y hace el debugging más rápido.",
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
      ],
    },
  ],
};
