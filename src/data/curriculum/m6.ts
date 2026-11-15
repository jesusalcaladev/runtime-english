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
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Requiere vocabulario de credenciales/tokens/logs y estructuras para reportar acciones ('We need to...', 'I'm rotating...'). Esta lección introduce términos de seguridad (leak, rotate, least privilege, vulnerability) usados en los ejercicios.",
        },
        {
          type: "technique",
          name: "Comunicar seguridad con precisión",
          desc: "Describe hecho + impacto + acción: qué se expuso ('token leaked'), dónde/alcance si se sabe, y qué haces ahora ('rotate the key', 'revoke access'). Usa términos precisos: leak/expose, rotate, revoke, patch.",
        },
        {
          type: "vocab",
          title: "Vocabulario de seguridad (nuevo en esta lección)",
          items: [
            { en: "secret", es: "secreto o credencial sensible", example: "Never commit secrets to the repository." },
            { en: "credential", es: "credencial de acceso", example: "The credentials expired." },
            { en: "leak / leaked", es: "filtrar / filtrado o expuesto", example: "The key leaked in a public repo." },
            { en: "rotate", es: "rotar/cambiar una clave y revocar la anterior", example: "We rotate the keys every 90 days." },
            { en: "permission(s)", es: "permiso(s) de acceso", example: "This service has too many permissions." },
            { en: "least privilege", es: "principio de mínimo privilegio", example: "Use least privilege for service accounts." },
            { en: "vulnerability", es: "vulnerabilidad", example: "The vulnerability was patched." },
            { en: "patch / patched", es: "parchear / parcheado", example: "The vulnerability was patched this morning." },
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
        {
          id: "m6-l1-e5",
          type: "choice",
          prompt: "¿Qué frase comunica mejor el problema y la acción inmediata?",
          options: [
            "Something is wrong with security.",
            "A token leaked in the logs. I'm rotating it now.",
            "The token is bad.",
            "We had a small issue maybe.",
          ],
          answer: 1,
          explanation:
            "Buena comunicación de seguridad: hecho concreto ('leaked in the logs') + acción inmediata ('I'm rotating it now').",
        },
        {
          id: "m6-l1-e6",
          type: "builder",
          prompt: "Construye: 'Este servicio tiene demasiados permisos. Deberíamos aplicar mínimo privilegio.'",
          words: ["This service has", "too many permissions.", "We should apply", "least privilege."],
          answer: "This service has too many permissions. We should apply least privilege.",
          explanation:
            "Identificas el problema (demasiados permisos) y propones la práctica correcta: 'least privilege' (mínimo privilegio).",
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
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Útil conocer vocabulario de APIs/BD y poder explicar causas/consecuencias ('to reduce latency', 'adds complexity'). Esta lección enseña términos y marcos para conversaciones de system design.",
        },
        {
          type: "technique",
          name: "System design: razonar, no listar tecnologías",
          desc: "1) Requisitos y restricciones (usuarios, lecturas/escrituras, latencia). 2) Escala aproximada. 3) Componentes y flujo. 4) Trade-offs (beneficio vs coste/riesgo). Explica por qué eliges una opción.",
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
        {
          id: "m6-l2-e5",
          type: "choice",
          prompt: "¿Qué frase explica un trade-off de forma clara?",
          options: [
            "Caching is good.",
            "We can cache reads to reduce latency, but it adds complexity.",
            "Use cache always.",
            "Latency is a problem.",
          ],
          answer: 1,
          explanation:
            "Un buen trade-off menciona beneficio y coste: 'reduce latency, but it adds complexity'.",
        },
        {
          id: "m6-l2-e6",
          type: "write",
          prompt: "Escribe en inglés: 'Empecemos por los requisitos.'",
          answer: "Let's start with the requirements.",
          accept: ["Let us start with the requirements."],
          hint: "Usa 'Let's start with...'",
          explanation:
            "En system design, empezar por requisitos evita diseñar a ciegas. 'Let's...' propone el siguiente paso.",
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
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Se apoya en vocabulario de APIs/servicios y comparaciones simples. Aquí se introducen métricas y términos de performance (latency, p95, CPU-bound, I/O-bound, memory leak, profiling).",
        },
        {
          type: "technique",
          name: "Performance: medir antes de optimizar",
          desc: "Mide (p. ej. p95 latency), localiza el cuello de botella (CPU/IO/DB/query), aplica un cambio y vuelve a medir. Describe el resultado con datos y menciona el trade-off si existe.",
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
        {
          id: "m6-l3-e5",
          type: "choice",
          prompt: "El servicio usa mucho CPU al procesar peticiones. ¿Cómo lo describes?",
          options: [
            "The service is I/O-bound.",
            "The service is CPU-bound.",
            "The service is memory-bound only.",
            "The service is down.",
          ],
          answer: 1,
          explanation:
            "'CPU-bound' indica que el rendimiento está limitado por procesamiento (CPU), no por red o disco.",
        },
        {
          id: "m6-l3-e6",
          type: "builder",
          prompt: "Construye: 'Perfila el endpoint antes de optimizar.'",
          words: ["Profile", "the endpoint", "before you optimize."],
          answer: "Profile the endpoint before you optimize.",
          explanation:
            "Imperativo con paso concreto: primero perfilar/midir, luego optimizar. Usa estructuras ya vistas.",
        },
      ],
    },
    {
      id: "m6-l4",
      slug: "checkpoint-arquitectura-seguridad-performance",
      title: "Checkpoint: seguridad, arquitectura y performance",
      step: "B2 · Paso 6.4 · Checkpoint",
      cefr: "B2",
      minutes: 8,
      summary:
        "Recuperación activa de lo esencial: secretos, trade-offs, cuellos de botella y métricas antes de optimizar.",
      objectives: [
        "Recordar acciones clave ante una credencial expuesta.",
        "Explicar un trade-off y un cuello de botella con lenguaje claro.",
        "Aplicar el hábito de medir antes de optimizar.",
      ],
      pronunciation:
        "We rotated the leaked key, identified the database as the bottleneck, and measured p95 latency before optimizing.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Checkpoint de integración (M6)",
          body: "Repasa seguridad, system design y performance vistos en este módulo. Responde desde memoria y, si fallas, vuelve a la lección concreta. El objetivo es usar los términos y acciones correctas con claridad.",
        },
        {
          type: "technique",
          name: "Recuperación activa",
          desc: "Intenta producir la respuesta (qué harías, qué término usarías) antes de releer. Mezclar temas (rotar claves, bottlenecks, métricas) ayuda a fijar el conocimiento en contextos reales.",
        },
        {
          type: "phrases",
          title: "Frases clave para recordar",
          items: [
            { en: "We need to rotate the leaked key.", es: "Necesitamos rotar la clave filtrada." },
            { en: "Apply least privilege.", es: "Aplica mínimo privilegio." },
            { en: "The database is the bottleneck.", es: "La base de datos es el cuello de botella." },
            { en: "This is a trade-off between latency and complexity.", es: "Es un trade-off entre latencia y complejidad." },
            { en: "Let's measure and profile before we optimize.", es: "Midamos y hagamos profiling antes de optimizar." },
          ],
        },
      ],
      exercises: [
        {
          id: "m6-l4-e1",
          type: "choice",
          prompt: "Una clave aparece en logs públicos. ¿Qué acción es prioritaria?",
          options: [
            "Rotate the key immediately",
            "Document it and wait",
            "Share the key to debug faster",
            "Ignore it if the app still works",
          ],
          answer: 0,
          explanation:
            "Una credencial expuesta debe rotarse de inmediato; luego se revisa impacto y se corrige la causa de la filtración.",
        },
        {
          id: "m6-l4-e2",
          type: "builder",
          prompt: "Construye: 'La base de datos es el cuello de botella.'",
          words: ["The database", "is", "the bottleneck."],
          answer: "The database is the bottleneck.",
          explanation:
            "'Bottleneck' nombra el punto que limita el rendimiento del sistema.",
        },
        {
          id: "m6-l4-e3",
          type: "write",
          prompt: "Escribe en inglés: 'Midamos antes de optimizar.'",
          answer: "Let's measure before we optimize.",
          accept: [
            "Let's measure before optimizing.",
            "Let us measure before we optimize.",
          ],
          hint: "Usa 'Let's measure...'",
          explanation:
            "Medir primero evita optimizaciones basadas en suposiciones.",
        },
        {
          id: "m6-l4-e4",
          type: "choice",
          prompt: "'A single point of failure' significa:",
          options: [
            "Un componente cuya caída tumba el sistema",
            "Un error que solo ocurre una vez",
            "Un test que falla en CI",
            "Una métrica de latencia",
          ],
          answer: 0,
          explanation:
            "Es un componente crítico sin redundancia: si falla, todo el sistema se ve afectado.",
        },
        {
          id: "m6-l4-e5",
          type: "builder",
          prompt: "Construye: 'Deberíamos aplicar mínimo privilegio.'",
          words: ["We should", "apply", "least privilege."],
          answer: "We should apply least privilege.",
          explanation:
            "'Least privilege' limita permisos al mínimo necesario y reduce el impacto de una filtración.",
        },
        {
          id: "m6-l4-e6",
          type: "write",
          prompt: "Escribe en inglés: 'La latencia p95 aumentó después del despliegue.'",
          answer: "The p95 latency increased after the deploy.",
          accept: [
            "The p95 latency increased after deployment.",
            "P95 latency increased after the deploy.",
            "The p95 latency went up after the deploy.",
          ],
          hint: "Usa 'p95 latency increased...'",
          explanation:
            "Describir la regresión con una métrica concreta (p95) hace el reporte útil y accionable.",
        },
        {
          id: "m6-l4-e7",
          type: "fill-blank",
          prompt: "Completa el resumen: acción de seguridad y causa de rendimiento.",
          template: "We need to ___ the leaked key. The database is the ___.",
          blanks: ["rotate", "bottleneck"],
          hint: "Clave expuesta → rotate. Punto que limita rendimiento → bottleneck.",
          explanation:
            "Checkpoint: recuerda acciones y términos clave de seguridad ('rotate') y performance/arquitectura ('bottleneck').",
        },
      ],
    },
  ],
};
