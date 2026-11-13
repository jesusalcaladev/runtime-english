import type { Module } from "../../lib/types";

export const m5: Module = {
  id: "m5",
  code: "MOD 05",
  level: "B1-B2",
  title: "Commits, Async y Entrevistas",
  shortTitle: "Commits, Async & Interviews",
  description:
    "Conventional Commits, Pull Requests, mensajes asíncronos de Slack y entrevistas técnicas en inglés.",
  sessions: [
    {
      id: "m5-l1",
      slug: "commits-prs-docs",
      title: "Conventional Commits, Pull Requests y Preguntas Técnicas",
      step: "B2 · Paso 5.1",
      cefr: "B2",
      minutes: 14,
      summary:
        "Escribe como un ingeniero senior en repositorios open-source y equipos globales.",
      objectives: [
        "Escribir commits en presente imperativo con prefijos estándar.",
        "Redactar una descripción de PR que se entienda en 30 segundos.",
        "Formular una pregunta técnica con estructura Expected vs Actual.",
      ],
      pronunciation:
        "Fix: resolve CORS error in production and update the API documentation.",
      blocks: [
        {
          type: "technique",
          name: "La regla de oro del commit: 'This commit will...'",
          desc: "En equipos que usan Conventional Commits, evita el pasado ('added login') y los mensajes vagos ('fix stuff'). Escribe en presente imperativo completando mentalmente la frase 'If applied, this commit will... [add login endpoint]'. Si tu equipo usa otro estilo, sigue su convención.",
        },
        {
          type: "table",
          title: "Tipos de Conventional Commits",
          columns: ["Tipo", "Uso", "Ejemplo"],
          rows: [
            ["feat:", "Nueva funcionalidad", "feat: add login endpoint"],
            ["fix:", "Corrección de bug", "fix: resolve CORS error in production"],
            ["docs:", "Cambios en documentación", "docs: update README with setup instructions"],
            ["refactor:", "Mejora interna sin cambiar función", "refactor: extract validation logic"],
            ["test:", "Agregar o modificar tests", "test: add unit tests for password hashing"],
            ["chore:", "Mantenimiento / dependencias", "chore: update npm dependencies"],
          ],
        },
        {
          type: "phrases",
          title: "Descripción de Pull Request",
          items: [
            { en: "This PR fixes #123 / Closes #456", es: "Vincula y cierra automáticamente el issue." },
            { en: "Ready for review / Requesting review from @username", es: "Solicita revisión formal al equipo." },
            { en: "Addresses the comments from the last review", es: "Indica que ya aplicaste los cambios pedidos." },
            { en: "This is a breaking change", es: "Advierte que rompe compatibilidad anterior." },
          ],
        },
        {
          type: "table",
          title: "Plantilla de Stack Overflow",
          columns: ["Paso", "Frase modelo"],
          rows: [
            ["1. Qué intentas hacer", "I'm trying to store the auth token in localStorage after login."],
            ["2. Qué ya intentaste", "I've already tried clearing the cache and checking the network tab."],
            ["3. Esperado vs Real", "I expected the token to persist, but it returns null after refresh."],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Evita quedarte en 'it doesn't work'",
          body: "Es la frase que nadie puede responder. Di qué esperabas, qué pasó y qué error exacto aparece. Eso es la diferencia entre una respuesta en 5 minutos y silencio total.",
        },
      ],
      exercises: [
        {
          id: "m5-l1-e1",
          type: "choice",
          prompt:
            "Acabas de mejorar la legibilidad de una función de validación sin alterar lo que devuelve. ¿Qué commit es correcto?",
          options: [
            "feat: changed validation",
            "refactor: extract validation logic to separate function",
            "fix: refactored validation yesterday",
            "docs: new validation function",
          ],
          answer: 1,
          explanation:
            "Mejorar estructura sin cambiar funcionalidad es 'refactor:', seguido de verbo imperativo en presente ('extract').",
        },
        {
          id: "m5-l1-e2",
          type: "builder",
          prompt:
            "Construye la estructura clave de Stack Overflow: 'Esperaba que pasara X, pero pasó Y.'",
          words: ["I expected", "X to happen,", "but Y", "happened instead."],
          answer: "I expected X to happen, but Y happened instead.",
          explanation:
            "Esta estructura contrastiva permite que cualquier developer entienda tu bug en cinco segundos.",
        },
        {
          id: "m5-l1-e3",
          type: "write",
          prompt:
            "Escribe el commit para un bug de CORS resuelto en producción, usando el prefijo correcto.",
          answer: "fix: resolve CORS error in production",
          accept: [
            "fix: resolve the CORS error in production",
            "fix: fix CORS error in production",
          ],
          explanation:
            "Commit en presente imperativo: 'fix:' + 'resolve...'. No 'fixed' ni 'fixing'.",
        },
        {
          id: "m5-l1-e4",
          type: "choice",
          prompt:
            "Actualizaste las instrucciones de instalación del README. ¿Qué commit sigue la convención?",
          options: [
            "docs: update installation instructions",
            "feat: updated the README yesterday",
            "chore: documentation stuff",
            "fix: docs are working",
          ],
          answer: 0,
          explanation:
            "Un cambio solo de documentación usa 'docs:' y verbo en presente imperativo: 'update installation instructions'.",
        },
      ],
    },
    {
      id: "m5-l2",
      slug: "slack-trabajo-asincrono",
      title: "Slack, email y trabajo asíncrono",
      step: "B2 · Paso 5.2",
      cefr: "B2",
      minutes: 10,
      summary:
        "Escribe mensajes que se entiendan sin contexto: heads-up, ETA, follow-up y loop in.",
      objectives: [
        "Estructurar un mensaje asíncrono con contexto, petición y plazo.",
        "Pedir un ETA o hacer seguimiento sin sonar agresivo.",
        "Usar el vocabulario de Slack y email profesional.",
      ],
      pronunciation:
        "Quick heads-up: the deploy is blocked. Do you have an ETA for the fix?",
      blocks: [
        {
          type: "technique",
          name: "La fórmula del mensaje asíncrono",
          desc: "Contexto + petición + plazo. Ejemplo: 'Quick heads-up: the deploy is blocked by the API change. Can you review the PR by 3 p.m.?' Si falta uno de los tres, aumentan las idas y venidas.",
        },
        {
          type: "phrases",
          title: "Frases de Slack y email",
          items: [
            { en: "Quick heads-up: I'll be offline this afternoon.", es: "Aviso rápido: estaré desconectado esta tarde." },
            { en: "Do you have an ETA for the fix?", es: "¿Tienes una estimación para el arreglo?" },
            { en: "Looping in Ana for context.", es: "Añado a Ana para dar contexto." },
            { en: "I'll follow up tomorrow.", es: "Haré seguimiento mañana." },
            { en: "Can we take this to a thread?", es: "¿Lo pasamos a un hilo?" },
            { en: "Just to confirm: we're shipping on Friday.", es: "Solo para confirmar: lanzamos el viernes." },
            { en: "No rush, but could you take a look when you have a minute?", es: "Sin prisa, pero ¿podrías mirarlo cuando tengas un minuto?" },
            { en: "I'll keep you posted.", es: "Te mantengo al tanto." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "No mandes solo 'hey'",
          body: "Un mensaje sin contexto obliga a la otra persona a preguntar qué necesitas. Incluye el tema, la petición y el plazo en el primer mensaje. En async, la claridad es cortesía.",
        },
      ],
      exercises: [
        {
          id: "m5-l2-e1",
          type: "choice",
          prompt: "¿Cuál es el mensaje de Slack más útil?",
          options: [
            "hey",
            "Quick heads-up: the deploy is blocked. Can you review the PR by 3 p.m.?",
            "hello???",
            "urgent",
          ],
          answer: 1,
          explanation:
            "El mensaje útil incluye contexto, petición concreta y plazo. 'hey' obliga a otra ronda de preguntas.",
        },
        {
          id: "m5-l2-e2",
          type: "choice",
          prompt: "¿Cómo pides un ETA sin sonar agresivo?",
          options: ["When?", "Do you have an ETA for the fix?", "Why are you late?", "Fix it now"],
          answer: 1,
          explanation:
            "'Do you have an ETA for the fix?' pide una estimación de forma neutra y profesional.",
        },
        {
          id: "m5-l2-e3",
          type: "builder",
          prompt: "Construye: 'Añado a Ana para dar contexto.'",
          words: ["Looping in", "Ana", "for context."],
          answer: "Looping in Ana for context.",
          explanation:
            "'Loop someone in' significa incluir a alguien en la conversación o el hilo.",
        },
        {
          id: "m5-l2-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Te aviso cuando esté listo.'",
          answer: "I'll let you know when it's ready.",
          accept: [
            "I will let you know when it is ready.",
            "I'll let you know when it is ready.",
          ],
          hint: "Usa 'I'll let you know when...'.",
          explanation:
            "'Let you know' es la forma estándar de prometer un aviso sin comprometerte a una hora exacta.",
        },
      ],
    },
    {
      id: "m5-l3",
      slug: "entrevistas-tecnicas",
      title: "Entrevistas técnicas en inglés",
      step: "B2 · Paso 5.3",
      cefr: "B2",
      minutes: 12,
      summary:
        "Preséntate, cuenta una historia con STAR y habla de trade-offs sin memorizar un guion.",
      objectives: [
        "Construir una presentación profesional de 30 segundos.",
        "Responder preguntas de comportamiento con STAR.",
        "Explicar decisiones técnicas usando trade-offs.",
      ],
      pronunciation:
        "In my last role, I led the migration to the cloud. The main trade-off was latency versus cost.",
      blocks: [
        {
          type: "technique",
          name: "STAR: la estructura de una buena respuesta",
          desc: "Situation (contexto), Task (tu responsabilidad), Action (qué hiciste) y Result (qué cambió). En una entrevista, una historia concreta con resultados vale más que una lista de adjetivos.",
        },
        {
          type: "phrases",
          title: "Frases para la entrevista",
          items: [
            { en: "I've been working as a backend developer for three years.", es: "Llevo tres años trabajando como backend developer." },
            { en: "In my last role, I led the migration to the cloud.", es: "En mi último puesto, lideré la migración a la nube." },
            { en: "The main trade-off was latency versus cost.", es: "El principal trade-off era latencia frente a coste." },
            { en: "I'm looking for a role where I can own the architecture.", es: "Busco un puesto donde pueda ser responsable de la arquitectura." },
            { en: "Could you tell me more about the on-call rotation?", es: "¿Podrías contarme más sobre la rotación de on-call?" },
            { en: "I'd love to learn more about the team.", es: "Me gustaría conocer mejor al equipo." },
          ],
        },
        {
          type: "table",
          title: "Preguntas y estructura",
          columns: ["Pregunta", "Qué buscan", "Tu estructura"],
          rows: [
            ["Tell me about yourself", "Resumen profesional relevante", "Rol + años + especialidad + interés"],
            ["Tell me about a difficult bug", "Cómo diagnosticas", "STAR + resultado medible"],
            ["Why do you want this role?", "Motivación y encaje", "Producto + equipo + crecimiento"],
            ["Do you have any questions?", "Interés real", "Equipo, on-call, roadmap"],
          ],
        },
      ],
      exercises: [
        {
          id: "m5-l3-e1",
          type: "choice",
          prompt: "'Tell me about yourself'. ¿Cuál es un buen comienzo?",
          options: [
            "I'm a backend developer with three years of experience.",
            "I am 25 years old and I like computers.",
            "I don't know what to say.",
            "My whole life story starts in a small town.",
          ],
          answer: 0,
          explanation:
            "Una entrevista espera un resumen profesional: rol, experiencia y especialidad. Los datos personales irrelevantes no ayudan.",
        },
        {
          id: "m5-l3-e2",
          type: "choice",
          prompt: "¿Qué significa STAR en una entrevista de comportamiento?",
          options: [
            "Situation, Task, Action, Result",
            "Skill, Team, Ambition, Role",
            "Story, Time, Answer, Reason",
            "System, Test, API, Release",
          ],
          answer: 0,
          explanation:
            "STAR = Situation, Task, Action, Result. Te obliga a contar una historia concreta con un resultado.",
        },
        {
          id: "m5-l3-e3",
          type: "builder",
          prompt: "Construye: 'El principal trade-off era latencia frente a coste.'",
          words: ["The main trade-off", "was", "latency versus cost."],
          answer: "The main trade-off was latency versus cost.",
          explanation:
            "'Trade-off' es la palabra clave para mostrar criterio técnico en una entrevista o una revisión de arquitectura.",
        },
        {
          id: "m5-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Lideré la migración a la nube el año pasado.'",
          answer: "I led the cloud migration last year.",
          accept: [
            "I led the migration to the cloud last year.",
            "Last year I led the cloud migration.",
          ],
          hint: "'Led' es el pasado de 'lead'.",
          explanation:
            "'Led' es el pasado irregular de 'lead'. Es una frase fuerte para una respuesta STAR.",
        },
      ],
    },
    {
      id: "m5-l4",
      slug: "conectores-y-discourse-markers",
      title: "Conectores y discourse markers",
      step: "B1 · Paso 5.4",
      cefr: "B1",
      minutes: 10,
      summary:
        "Usa I mean, actually, basically y otros conectores para sonar natural, aclarar ideas y ordenar tu mensaje.",
      objectives: [
        "Aclarar o corregir lo que acabas de decir con marcadores naturales.",
        "Ordenar explicaciones técnicas con conectores simples.",
        "Evitar sonar brusco usando marcadores de cortesía y reformulación.",
      ],
      pronunciation:
        "I mean, the fix is simple. Actually, we should refactor this first. Basically, the cache is stale.",
      blocks: [
        {
          type: "technique",
          name: "Los marcadores no cambian el hecho, cambian la intención",
          desc: "En inglés hablado, palabras como 'I mean', 'actually' o 'basically' ayudan a reformular, corregir o resumir. No son relleno vacío: le dicen a la otra persona cómo interpretar lo que viene. Úsalos con moderación y con un propósito claro.",
        },
        {
          type: "vocab",
          title: "Conectores y marcadores comunes",
          items: [
            { en: "I mean", es: "quiero decir / o sea", example: "I mean, we can ship today if tests pass." },
            { en: "actually", es: "en realidad / de hecho", example: "Actually, the bug is in the frontend." },
            { en: "basically", es: "básicamente / en resumen", example: "Basically, the cache is stale." },
            { en: "to be honest", es: "para ser honesto", example: "To be honest, I don't think this will scale." },
            { en: "in other words", es: "en otras palabras", example: "In other words, we need to retry the request." },
            { en: "anyway", es: "en fin / de todos modos", example: "Anyway, let's focus on the fix." },
            { en: "you know", es: "sabes / ya sabes", example: "It's a race condition, you know?" },
            { en: "so", es: "así que / entonces", example: "So, we should roll back." },
          ],
        },
        {
          type: "phrases",
          title: "Cómo usarlos en contexto técnico",
          items: [
            { en: "I mean, it's not a blocker, but we should fix it soon.", es: "O sea, no es un bloqueador, pero deberíamos arreglarlo pronto." },
            { en: "Actually, the issue was caused by a typo.", es: "En realidad, el problema lo causó un typo." },
            { en: "Basically, we need to clear the cache.", es: "Básicamente, tenemos que limpiar la caché." },
            { en: "To be honest, I'm not sure this is the right approach.", es: "Para ser honesto, no estoy seguro de que sea el enfoque correcto." },
            { en: "In other words, the service is timing out.", es: "En otras palabras, el servicio está agotando el tiempo." },
            { en: "Anyway, back to the main issue.", es: "En fin, volvamos al problema principal." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Cuidado con 'actually'",
          body: "'Actually' corrige o introduce un contraste real; no significa 'actualmente'. Para 'actualmente' usa 'currently' o 'right now'. Ejemplo: 'Actually, it works' = en realidad funciona; 'Currently, it works' = ahora mismo funciona.",
        },
        {
          type: "table",
          title: "Qué intención transmite cada marcador",
          columns: ["Marcador", "Intención", "Ejemplo"],
          rows: [
            ["I mean", "Reformular o aclarar", "I mean, we need more tests."],
            ["Actually", "Corregir o matizar", "Actually, it's already deployed."],
            ["Basically", "Resumir lo esencial", "Basically, the API is down."],
            ["To be honest", "Dar una opinión directa", "To be honest, I'd refactor it."],
            ["Anyway", "Volver al tema o cerrar", "Anyway, let's merge this."],
          ],
        },
      ],
      exercises: [
        {
          id: "m5-l4-e1",
          type: "choice",
          prompt: "Quieres corregir una idea: pensabas que el bug era del backend, pero es del frontend. ¿Qué marcador encaja mejor?",
          options: ["I mean, the bug is in the frontend.", "Actually, the bug is in the frontend.", "Anyway, the bug is in the frontend.", "You know, the bug is in the frontend."],
          answer: 1,
          explanation:
            "'Actually' se usa para corregir o contrastar con lo que se creía antes: en realidad, el bug está en el frontend.",
        },
        {
          id: "m5-l4-e2",
          type: "choice",
          prompt: "¿Qué significa 'actually' en inglés?",
          options: ["Actualmente", "En realidad / de hecho", "Finalmente", "A veces"],
          answer: 1,
          explanation:
            "'Actually' es un false friend común: no significa 'actualmente'. Significa 'en realidad' o 'de hecho'.",
        },
        {
          id: "m5-l4-e3",
          type: "builder",
          prompt: "Construye: 'Básicamente, tenemos que limpiar la caché.'",
          words: ["Basically,", "we need", "to clear", "the cache."],
          answer: "Basically, we need to clear the cache.",
          explanation:
            "'Basically' introduce un resumen simple de la idea principal.",
        },
        {
          id: "m5-l4-e4",
          type: "write",
          prompt: "Escribe en inglés: 'O sea, no es un bloqueador.' (empieza con 'I mean,')",
          answer: "I mean, it's not a blocker.",
          accept: [
            "I mean, it is not a blocker.",
            "I mean it's not a blocker.",
          ],
          hint: "Usa 'I mean,' para reformular o aclarar.",
          explanation:
            "'I mean' sirve para aclarar o suavizar lo que quieres decir: 'o sea, no es un bloqueador'.",
        },
      ],
    },
  ],
};
