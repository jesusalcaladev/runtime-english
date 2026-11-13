import type { Module } from "../../lib/types";

export const m6: Module = {
  id: "m6",
  code: "MOD 06",
  level: "B1-B2",
  title: "Criterio Técnico y Arquitectura",
  shortTitle: "Security & System Design",
  description:
    "Protege secretos, explica riesgos y defiende decisiones de arquitectura con trade-offs claros.",
  sessions: [
    {
      id: "m6-l1",
      slug: "seguridad-y-secretos",
      title: "Seguridad, secretos y accesos",
      step: "B2 · Paso 6.1",
      cefr: "B2",
      minutes: 11,
      summary:
        "Habla de credenciales, filtraciones y permisos con precisión, sin alarmismo y sin exponer datos.",
      objectives: [
        "Nombrar credenciales, filtraciones y permisos con el término correcto.",
        "Reaccionar a una clave expuesta y pedir su rotación.",
        "Explicar el principio de mínimo privilegio en una revisión.",
      ],
      pronunciation:
        "The token leaked. We need to rotate the API keys and review the permissions.",
      blocks: [
        {
          type: "technique",
          name: "Precisión antes que alarma",
          desc: "En seguridad, las palabras importan: 'leaked' no es lo mismo que 'stolen', y 'rotate a key' no es 'delete a key'. Comunica el hecho, el impacto y la acción inmediata: 'A token leaked in the logs. I'm rotating it now.'",
        },
        {
          type: "vocab",
          title: "Vocabulario de seguridad",
          items: [
            { en: "secret", es: "secreto o credencial sensible", example: "Never commit secrets to the repository." },
            { en: "credential", es: "credencial de acceso", example: "The credentials expired." },
            { en: "leak", es: "filtración o exposición", example: "The key leaked in a public repo." },
            { en: "rotate", es: "rotar o cambiar una clave", example: "We rotate the keys every 90 days." },
            { en: "least privilege", es: "mínimo privilegio", example: "Use least privilege for service accounts." },
            { en: "vulnerability", es: "vulnerabilidad", example: "The vulnerability was patched." },
          ],
        },
        {
          type: "phrases",
          title: "Frases para proteger el sistema",
          items: [
            { en: "Never commit secrets to the repository.", es: "Nunca subas secretos al repositorio." },
            { en: "The token leaked in the logs.", es: "El token se filtró en los logs." },
            { en: "We need to rotate the API keys.", es: "Necesitamos rotar las claves de API." },
            { en: "This service has too many permissions.", es: "Este servicio tiene demasiados permisos." },
            { en: "We should apply least privilege.", es: "Deberíamos aplicar mínimo privilegio." },
            { en: "The vulnerability was patched this morning.", es: "La vulnerabilidad se parcheó esta mañana." },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Nunca pegues un token en el chat",
          body: "Si necesitas ayuda con una credencial, comparte el error y el nombre de la variable, no el valor. Un token pegado en Slack o en un ticket se considera expuesto y debe rotarse.",
        },
      ],
      exercises: [
        {
          id: "m6-l1-e1",
          type: "choice",
          prompt: "Una API key aparece en un commit público. ¿Qué haces primero?",
          options: [
            "Delete the commit and forget it",
            "Rotate the key immediately",
            "Share it with the team to check",
            "Wait for CI to fail",
          ],
          answer: 1,
          explanation:
            "La clave ya está expuesta aunque borres el commit. Primero se rota; después se limpia el historial y se revisa el impacto.",
        },
        {
          id: "m6-l1-e2",
          type: "choice",
          prompt: "¿Cuál es la forma correcta de manejar secretos?",
          options: [
            "Hardcodearlos en el código",
            "Enviarlos por email al equipo",
            "Usar variables de entorno o un secret manager",
            "Escribirlos en los logs para depurar",
          ],
          answer: 2,
          explanation:
            "Variables de entorno o un secret manager mantienen las credenciales fuera del repositorio y de los logs.",
        },
        {
          id: "m6-l1-e3",
          type: "builder",
          prompt: "Construye: 'Necesitamos rotar las claves de API.'",
          words: ["We need", "to rotate", "the API keys."],
          answer: "We need to rotate the API keys.",
          explanation:
            "'Rotate a key' significa reemplazarla por una nueva y revocar la anterior.",
        },
        {
          id: "m6-l1-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Nunca subas secretos al repositorio.'",
          answer: "Never commit secrets to the repository.",
          accept: [
            "Never push secrets to the repository.",
            "Never commit secrets to the repo.",
            "Never push secrets to the repo.",
          ],
          hint: "Usa 'Never commit secrets...'.",
          explanation:
            "En inglés técnico, 'commit secrets' es la forma habitual de hablar de subir credenciales al control de versiones.",
        },
      ],
    },
    {
      id: "m6-l2",
      slug: "system-design-conversacion",
      title: "System design en una conversación",
      step: "B2 · Paso 6.2",
      cefr: "B2",
      minutes: 13,
      summary:
        "Conduce una conversación de arquitectura: aclara requisitos, estima escala y defiende trade-offs.",
      objectives: [
        "Empezar por requisitos y escala antes de dibujar componentes.",
        "Nombrar cuellos de botella, caché, colas y consistencia.",
        "Explicar el coste de una decisión, no solo el beneficio.",
      ],
      pronunciation:
        "We can cache reads to reduce latency, but that adds complexity around consistency.",
      blocks: [
        {
          type: "technique",
          name: "Cuatro movimientos, no una lista de tecnologías",
          desc: "1) Aclara requisitos: usuarios, lecturas, escrituras y latencia. 2) Estima la escala. 3) Dibuja los componentes principales. 4) Defiende dos trade-offs y elige uno. Una entrevista no evalúa si nombras más herramientas, sino si razonas con ellas.",
        },
        {
          type: "vocab",
          title: "Vocabulario de arquitectura",
          items: [
            { en: "throughput", es: "rendimiento o peticiones por segundo", example: "We need higher throughput during the sale." },
            { en: "latency", es: "latencia", example: "Caching reduces latency." },
            { en: "bottleneck", es: "cuello de botella", example: "The database is the main bottleneck." },
            { en: "cache", es: "caché", example: "We can cache reads for five minutes." },
            { en: "queue", es: "cola de mensajes", example: "Put the email job in a queue." },
            { en: "consistency", es: "consistencia de datos", example: "This trade-off affects consistency." },
          ],
        },
        {
          type: "phrases",
          title: "Frases para defender una decisión",
          items: [
            { en: "Let's start with the requirements.", es: "Empecemos por los requisitos." },
            { en: "What's the expected read-to-write ratio?", es: "¿Cuál es la proporción esperada de lecturas y escrituras?" },
            { en: "The main bottleneck is the database.", es: "El principal cuello de botella es la base de datos." },
            { en: "We can cache reads to reduce latency.", es: "Podemos cachear lecturas para reducir la latencia." },
            { en: "This adds complexity but improves availability.", es: "Esto añade complejidad pero mejora la disponibilidad." },
            { en: "The main risk is a single point of failure.", es: "El principal riesgo es un único punto de fallo." },
          ],
        },
        {
          type: "table",
          title: "Qué demuestra cada movimiento",
          columns: ["Movimiento", "Lo que demuestras"],
          rows: [
            ["Aclarar requisitos", "Que no diseñas a ciegas."],
            ["Estimar escala", "Que entiendes el coste real."],
            ["Nombrar un trade-off", "Que tienes criterio, no solo herramientas."],
          ],
        },
      ],
      exercises: [
        {
          id: "m6-l2-e1",
          type: "choice",
          prompt: "¿Cuál es el primer paso en una entrevista de system design?",
          options: [
            "Draw the database schema",
            "Clarify requirements and scale",
            "Choose a cloud provider",
            "Talk about caching",
          ],
          answer: 1,
          explanation:
            "Sin requisitos ni escala, cualquier arquitectura es una suposición. Primero se acota el problema.",
        },
        {
          id: "m6-l2-e2",
          type: "choice",
          prompt: "'The main bottleneck is the database.' ¿Qué significa?",
          options: [
            "La base de datos es el principal cuello de botella.",
            "La base de datos está vacía.",
            "La base de datos es más rápida que la caché.",
            "La base de datos no necesita índices.",
          ],
          answer: 0,
          explanation:
            "'Bottleneck' es el punto que limita el rendimiento de todo el sistema.",
        },
        {
          id: "m6-l2-e3",
          type: "builder",
          prompt: "Construye: 'Podemos cachear lecturas para reducir la latencia.'",
          words: ["We can", "cache reads", "to reduce", "latency."],
          answer: "We can cache reads to reduce latency.",
          explanation:
            "'Cache reads' significa guardar lecturas frecuentes en caché; 'to reduce latency' explica el objetivo.",
        },
        {
          id: "m6-l2-e4",
          type: "write",
          prompt: "Escribe en inglés: 'El principal riesgo es un único punto de fallo.'",
          answer: "The main risk is a single point of failure.",
          accept: [
            "The biggest risk is a single point of failure.",
            "The main risk is a single point of failure",
          ],
          hint: "Usa 'single point of failure'.",
          explanation:
            "Un 'single point of failure' es un componente cuya caída tumba todo el sistema.",
        },
      ],
    },
    {
      id: "m6-l3",
      slug: "performance-y-profiling",
      title: "Performance, profiling y límites",
      step: "B2 · Paso 6.3",
      cefr: "B2",
      minutes: 12,
      summary:
        "Mide antes de optimizar, lee percentiles y explica si el problema es CPU, memoria, red o base de datos.",
      objectives: [
        "Pedir métricas antes de proponer una optimización.",
        "Leer p50/p95 y distinguir CPU-bound de I/O-bound.",
        "Explicar el coste de una optimización en una revisión.",
      ],
      pronunciation:
        "The p95 latency doubled after the deploy. Let's profile the endpoint before we optimize.",
      blocks: [
        {
          type: "technique",
          name: "Medir, localizar, cambiar, volver a medir",
          desc: "No optimices por intuición. Primero mide ('p95 latency doubled'), después localiza ('the endpoint is CPU-bound'), cambia una cosa y vuelve a medir. Una mejora sin medición es solo una opinión.",
        },
        {
          type: "vocab",
          title: "Vocabulario de performance",
          items: [
            { en: "p95 latency", es: "latencia del percentil 95", example: "The p95 latency doubled after the deploy." },
            { en: "profiling", es: "perfilado de rendimiento", example: "Profiling showed a hot loop." },
            { en: "CPU-bound", es: "limitado por CPU", example: "The service is CPU-bound." },
            { en: "I/O-bound", es: "limitado por entrada/salida", example: "The worker is I/O-bound." },
            { en: "memory leak", es: "fuga de memoria", example: "We have a memory leak in the worker." },
            { en: "full table scan", es: "escaneo completo de tabla", example: "The query is doing a full table scan." },
          ],
        },
        {
          type: "phrases",
          title: "Frases para hablar de rendimiento",
          items: [
            { en: "Let's measure before we optimize.", es: "Midamos antes de optimizar." },
            { en: "The p95 latency doubled after the deploy.", es: "La latencia p95 se duplicó después del despliegue." },
            { en: "The service is CPU-bound.", es: "El servicio está limitado por CPU." },
            { en: "The query is doing a full table scan.", es: "La consulta está haciendo un escaneo completo de tabla." },
            { en: "This change trades memory for speed.", es: "Este cambio cambia memoria por velocidad." },
            { en: "The improvement is within the margin of error.", es: "La mejora está dentro del margen de error." },
          ],
        },
      ],
      exercises: [
        {
          id: "m6-l3-e1",
          type: "choice",
          prompt: "Antes de optimizar un endpoint lento, ¿qué haces?",
          options: [
            "Rewrite it in another language",
            "Add more servers",
            "Measure and profile the bottleneck",
            "Increase the timeout",
          ],
          answer: 2,
          explanation:
            "Sin medir no sabes qué optimizar. El profiling muestra dónde se va el tiempo.",
        },
        {
          id: "m6-l3-e2",
          type: "choice",
          prompt: "'The service is CPU-bound.' ¿Qué significa?",
          options: [
            "El servicio está limitado por CPU.",
            "El servicio está limitado por la red.",
            "El servicio está limitado por el disco.",
            "El servicio no tiene suficiente memoria.",
          ],
          answer: 0,
          explanation:
            "'CPU-bound' describe una carga limitada por el procesador, no por la red o el disco.",
        },
        {
          id: "m6-l3-e3",
          type: "builder",
          prompt: "Construye: 'Midamos antes de optimizar.'",
          words: ["Let's", "measure", "before we", "optimize."],
          answer: "Let's measure before we optimize.",
          explanation:
            "'Let's + verbo base' propone el siguiente paso; 'before we optimize' marca el orden.",
        },
        {
          id: "m6-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'La latencia p95 se duplicó después del despliegue.'",
          answer: "The p95 latency doubled after the deploy.",
          accept: [
            "The p95 latency doubled after deployment.",
            "P95 latency doubled after the deploy.",
          ],
          hint: "Usa 'p95 latency' y 'doubled'.",
          explanation:
            "'Doubled' significa que se multiplicó por dos; es una forma precisa de describir una regresión.",
        },
      ],
    },
  ],
};
