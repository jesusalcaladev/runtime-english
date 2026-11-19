import type { Module } from '../../lib/types'

export const m6: Module = {
  id: 'm6',
  code: 'MOD 06',
  level: 'B1-B2',
  title: 'Criterio Técnico y Arquitectura',
  shortTitle: 'Security & System Design',
  description:
    'Protege secretos, explica riesgos y defiende decisiones de arquitectura con trade-offs claros.',
  sessions: [
    {
      id: 'm6-l1',
      slug: 'seguridad-y-secretos',
      title: 'Seguridad, secretos y accesos',
      step: 'B2 · Paso 6.1',
      cefr: 'B2',
      summary:
        'Habla de credenciales, filtraciones y permisos con precisión, sin alarmismo y sin exponer datos.',
      objectives: [
        'Nombrar credenciales, filtraciones y permisos con el término correcto.',
        'Reaccionar a una clave expuesta y pedir su rotación.',
        'Explicar el principio de mínimo privilegio en una revisión.',
      ],
      pronunciation: 'The token leaked. We need to rotate the API keys and review the permissions.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Requiere vocabulario de credenciales/tokens/logs y estructuras para reportar acciones ('We need to...', 'I'm rotating...'). Esta lección introduce términos de seguridad (leak, rotate, least privilege, vulnerability) usados en los ejercicios.",
        },
        {
          type: 'technique',
          name: 'Comunicar seguridad con precisión',
          desc: "Describe hecho + impacto + acción: qué se expuso ('token leaked'), dónde/alcance si se sabe, y qué haces ahora ('rotate the key', 'revoke access'). Usa términos precisos: leak/expose, rotate, revoke, patch.",
        },
        {
          type: 'vocab',
          title: 'Vocabulario de seguridad (nuevo en esta lección)',
          items: [
            {
              en: 'secret',
              es: 'secreto o credencial sensible',
              example: 'Never commit secrets to the repository.',
            },
            { en: 'credential', es: 'credencial de acceso', example: 'The credentials expired.' },
            {
              en: 'leak / leaked',
              es: 'filtrar / filtrado o expuesto',
              example: 'The key leaked in a public repo.',
            },
            {
              en: 'rotate',
              es: 'rotar/cambiar una clave y revocar la anterior',
              example: 'We rotate the keys every 90 days.',
            },
            {
              en: 'permission(s)',
              es: 'permiso(s) de acceso',
              example: 'This service has too many permissions.',
            },
            {
              en: 'least privilege',
              es: 'principio de mínimo privilegio',
              example: 'Use least privilege for service accounts.',
            },
            {
              en: 'vulnerability',
              es: 'vulnerabilidad',
              example: 'The vulnerability was patched.',
            },
            {
              en: 'patch / patched',
              es: 'parchear / parcheado',
              example: 'The vulnerability was patched this morning.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para proteger el sistema',
          items: [
            {
              en: 'Never commit secrets to the repository.',
              es: 'Nunca subas secretos al repositorio.',
            },
            { en: 'The token leaked in the logs.', es: 'El token se filtró en los logs.' },
            { en: 'We need to rotate the API keys.', es: 'Necesitamos rotar las claves de API.' },
            {
              en: 'This service has too many permissions.',
              es: 'Este servicio tiene demasiados permisos.',
            },
            { en: 'We should apply least privilege.', es: 'Deberíamos aplicar mínimo privilegio.' },
            {
              en: 'The vulnerability was patched this morning.',
              es: 'La vulnerabilidad se parcheó esta mañana.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Un token filtrado en los logs',
          setting: 'Slack, #security',
          goal: 'Responder a una filtración de credenciales con medidas concretas.',
          context:
            'Leo detecta un token expuesto en los logs y Maya coordina la rotación de la clave y el menor privilegio.',
          lines: [
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'The auth token leaked in the logs again.',
              es: 'El token de autenticación se filtró en los logs otra vez.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Is it in a public channel? We need to rotate the key now.',
              es: '¿Está en un canal público? Necesitamos rotar la clave ahora.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Only in our private logs, but I'll rotate it and revoke the old one.",
              es: 'Solo en nuestros logs privados, pero la rotaré y revocaré la anterior.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Good. The service also has too many permissions — let's apply least privilege.",
              es: 'Bien. El servicio también tiene demasiados permisos: apliquemos mínimo privilegio.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Agreed. I already removed the value from the logs.',
              es: 'De acuerdo. Ya quité el valor de los logs.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm6-l1-e1',
          type: 'choice',
          prompt: 'Una API key aparece en un commit público. ¿Qué haces primero?',
          options: [
            'Delete the commit and forget it',
            'Rotate the key immediately',
            'Share it with the team to check',
            'Wait for CI to fail',
          ],
          answer: 1,
          explanation:
            'La clave ya está expuesta aunque borres el commit. Primero se rota; después se limpia el historial y se revisa el impacto.',
        },
        {
          id: 'm6-l1-e2',
          type: 'choice',
          prompt: '¿Cuál es la forma correcta de manejar secretos?',
          options: [
            'Hardcodearlos en el código',
            'Enviarlos por email al equipo',
            'Usar variables de entorno o un secret manager',
            'Escribirlos en los logs para depurar',
          ],
          answer: 2,
          explanation:
            'Variables de entorno o un secret manager mantienen las credenciales fuera del repositorio y de los logs.',
        },
        {
          id: 'm6-l1-e3',
          type: 'builder',
          prompt: "Construye: 'Necesitamos rotar las claves de API.'",
          words: ['We need', 'to rotate', 'the API keys.'],
          answer: 'We need to rotate the API keys.',
          explanation: "'Rotate a key' significa reemplazarla por una nueva y revocar la anterior.",
        },
        {
          id: 'm6-l1-e5',
          type: 'choice',
          prompt: '¿Qué frase comunica mejor el problema y la acción inmediata?',
          options: [
            'Something is wrong with security.',
            "A token leaked in the logs. I'm rotating it now.",
            'The token is bad.',
            'We had a small issue maybe.',
          ],
          answer: 1,
          explanation:
            "Buena comunicación de seguridad: hecho concreto ('leaked in the logs') + acción inmediata ('I'm rotating it now').",
        },
        {
          id: 'm6-l1-e7',
          type: 'choice',
          prompt: '¿Qué pasó en la conversación?',
          options: [
            'Un token de autenticación se filtró en los logs.',
            'Un servidor se cayó en producción.',
            'Un commit fue borrado por error.',
          ],
          answer: 0,
          explanation:
            "Leo dice 'The auth token leaked in the logs again': el token se filtró en los logs.",
        },
        {
          id: 'm6-l1-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'We rotated the API keys after the token appeared in a commit.',
          hint: 'Acción de seguridad en pasado.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm6-l1-e10',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'secret', es: 'secreto o credencial sensible' },
            { en: 'credential', es: 'credencial de acceso' },
            { en: 'leak / leaked', es: 'filtrar / filtrado o expuesto' },
            { en: 'rotate', es: 'rotar/cambiar una clave y revocar la anterior' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
      ],
    },
    {
      id: 'm6-l2',
      slug: 'system-design-conversacion',
      title: 'System design en una conversación',
      step: 'B2 · Paso 6.2',
      cefr: 'B2',
      summary:
        'Conduce una conversación de arquitectura: aclara requisitos, estima escala y defiende trade-offs.',
      objectives: [
        'Empezar por requisitos y escala antes de dibujar componentes.',
        'Nombrar cuellos de botella, caché, colas y consistencia.',
        'Explicar el coste de una decisión, no solo el beneficio.',
      ],
      pronunciation:
        'We can cache reads to reduce latency, but that adds complexity around consistency.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Útil conocer vocabulario de APIs/BD y poder explicar causas/consecuencias ('to reduce latency', 'adds complexity'). Esta lección enseña términos y marcos para conversaciones de system design.",
        },
        {
          type: 'technique',
          name: 'System design: razonar, no listar tecnologías',
          desc: '1) Requisitos y restricciones (usuarios, lecturas/escrituras, latencia). 2) Escala aproximada. 3) Componentes y flujo. 4) Trade-offs (beneficio vs coste/riesgo). Explica por qué eliges una opción.',
        },
        {
          type: 'vocab',
          title: 'Vocabulario de arquitectura',
          items: [
            {
              en: 'throughput',
              es: 'rendimiento o peticiones por segundo',
              example: 'We need higher throughput during the sale.',
            },
            { en: 'latency', es: 'latencia', example: 'Caching reduces latency.' },
            {
              en: 'bottleneck',
              es: 'cuello de botella',
              example: 'The database is the main bottleneck.',
            },
            { en: 'cache', es: 'caché', example: 'We can cache reads for five minutes.' },
            { en: 'queue', es: 'cola de mensajes', example: 'Put the email job in a queue.' },
            {
              en: 'consistency',
              es: 'consistencia de datos',
              example: 'This trade-off affects consistency.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para defender una decisión',
          items: [
            { en: "Let's start with the requirements.", es: 'Empecemos por los requisitos.' },
            {
              en: "What's the expected read-to-write ratio?",
              es: '¿Cuál es la proporción esperada de lecturas y escrituras?',
            },
            {
              en: 'The main bottleneck is the database.',
              es: 'El principal cuello de botella es la base de datos.',
            },
            {
              en: 'We can cache reads to reduce latency.',
              es: 'Podemos cachear lecturas para reducir la latencia.',
            },
            {
              en: 'This adds complexity but improves availability.',
              es: 'Esto añade complejidad pero mejora la disponibilidad.',
            },
            {
              en: 'The main risk is a single point of failure.',
              es: 'El principal riesgo es un único punto de fallo.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Qué demuestra cada movimiento',
          columns: ['Movimiento', 'Lo que demuestras'],
          rows: [
            ['Aclarar requisitos', 'Que no diseñas a ciegas.'],
            ['Estimar escala', 'Que entiendes el coste real.'],
            ['Nombrar un trade-off', 'Que tienes criterio, no solo herramientas.'],
          ],
        },
        {
          type: 'dialogue',
          title: 'Abrir una sesión de system design',
          setting: 'Entrevista de system design, sala de reuniones',
          goal: 'Abrir una sesión de system design aclarando requisitos y riesgos.',
          context:
            'Maya y Leo aclaran los requisitos de un sistema antes de dibujar la arquitectura: latencia, fuente de datos y riesgos.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Let's start with the requirements. What is the main goal?",
              es: 'Empecemos por los requisitos. ¿Cuál es el objetivo principal?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'We need low latency and one source of truth for the data.',
              es: 'Necesitamos baja latencia y una única fuente de verdad para los datos.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'What do you think is the main bottleneck?',
              es: '¿Qué crees que es el cuello de botella principal?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'The database. We can cache the most frequent reads.',
              es: 'La base de datos. Podemos cachear las lecturas más frecuentes.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Good. And the main risk?',
              es: 'Bien. ¿Y el riesgo principal?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'A single point of failure. Let us add a fallback.',
              es: 'Un único punto de fallo. Añadiríamos una alternativa.',
            },
          ],
        },
      ],

      exercises: [
        {
          id: 'm6-l2-e1',
          type: 'choice',
          prompt: '¿Cuál es el primer paso en una entrevista de system design?',
          options: [
            'Draw the database schema',
            'Clarify requirements and scale',
            'Choose a cloud provider',
            'Talk about caching',
          ],
          answer: 1,
          explanation:
            'Sin requisitos ni escala, cualquier arquitectura es una suposición. Primero se acota el problema.',
        },
        {
          id: 'm6-l2-e2',
          type: 'choice',
          prompt: "'The main bottleneck is the database.' ¿Qué significa?",
          options: [
            'La base de datos es el principal cuello de botella.',
            'La base de datos está vacía.',
            'La base de datos es más rápida que la caché.',
            'La base de datos no necesita índices.',
          ],
          answer: 0,
          explanation: "'Bottleneck' es el punto que limita el rendimiento de todo el sistema.",
        },
        {
          id: 'm6-l2-e3',
          type: 'builder',
          prompt: "Construye: 'Podemos cachear lecturas para reducir la latencia.'",
          words: ['We can', 'cache reads', 'to reduce', 'latency.'],
          answer: 'We can cache reads to reduce latency.',
          explanation:
            "'Cache reads' significa guardar lecturas frecuentes en caché; 'to reduce latency' explica el objetivo.",
        },
        {
          id: 'm6-l2-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'El principal riesgo es un único punto de fallo.'",
          answer: 'The main risk is a single point of failure.',
          accept: [
            'The biggest risk is a single point of failure.',
            'The main risk is a single point of failure',
          ],
          hint: "Usa 'single point of failure'.",
          explanation:
            "Un 'single point of failure' es un componente cuya caída tumba todo el sistema.",
        },
        {
          id: 'm6-l2-e6',
          type: 'write',
          prompt: "Escribe en inglés: 'Empecemos por los requisitos.'",
          answer: "Let's start with the requirements.",
          accept: ['Let us start with the requirements.'],
          hint: "Usa 'Let's start with...'",
          explanation:
            "En system design, empezar por requisitos evita diseñar a ciegas. 'Let's...' propone el siguiente paso.",
        },
        {
          id: 'm6-l2-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: "Let's start with the requirements and then discuss the main bottleneck.",
          hint: 'Abrir una sesión de system design.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm6-l2-e8',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'throughput', es: 'rendimiento o peticiones por segundo' },
            { en: 'latency', es: 'latencia' },
            { en: 'bottleneck', es: 'cuello de botella' },
            { en: 'cache', es: 'caché' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
      ],
    },
    {
      id: 'm6-l3',
      slug: 'performance-y-profiling',
      title: 'Performance, profiling y límites',
      step: 'B2 · Paso 6.3',
      cefr: 'B2',
      summary:
        'Mide antes de optimizar, lee percentiles y explica si el problema es CPU, memoria, red o base de datos.',
      objectives: [
        'Pedir métricas antes de proponer una optimización.',
        'Leer p50/p95 y distinguir CPU-bound de I/O-bound.',
        'Explicar el coste de una optimización en una revisión.',
      ],
      pronunciation:
        "The p95 latency doubled after the deploy. Let's profile the endpoint before we optimize.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Se apoya en vocabulario de APIs/servicios y comparaciones simples. Aquí se introducen métricas y términos de performance (latency, p95, CPU-bound, I/O-bound, memory leak, profiling).',
        },
        {
          type: 'technique',
          name: 'Performance: medir antes de optimizar',
          desc: 'Mide (p. ej. p95 latency), localiza el cuello de botella (CPU/IO/DB/query), aplica un cambio y vuelve a medir. Describe el resultado con datos y menciona el trade-off si existe.',
        },
        {
          type: 'vocab',
          title: 'Vocabulario de performance',
          items: [
            {
              en: 'p95 latency',
              es: 'latencia del percentil 95',
              example: 'The p95 latency doubled after the deploy.',
            },
            {
              en: 'profiling',
              es: 'perfilado de rendimiento',
              example: 'Profiling showed a hot loop.',
            },
            { en: 'CPU-bound', es: 'limitado por CPU', example: 'The service is CPU-bound.' },
            {
              en: 'I/O-bound',
              es: 'limitado por entrada/salida',
              example: 'The worker is I/O-bound.',
            },
            {
              en: 'memory leak',
              es: 'fuga de memoria',
              example: 'We have a memory leak in the worker.',
            },
            {
              en: 'full table scan',
              es: 'escaneo completo de tabla',
              example: 'The query is doing a full table scan.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para hablar de rendimiento',
          items: [
            { en: "Let's measure before we optimize.", es: 'Midamos antes de optimizar.' },
            {
              en: 'The p95 latency doubled after the deploy.',
              es: 'La latencia p95 se duplicó después del despliegue.',
            },
            { en: 'The service is CPU-bound.', es: 'El servicio está limitado por CPU.' },
            {
              en: 'The query is doing a full table scan.',
              es: 'La consulta está haciendo un escaneo completo de tabla.',
            },
            {
              en: 'This change trades memory for speed.',
              es: 'Este cambio cambia memoria por velocidad.',
            },
            {
              en: 'The improvement is within the margin of error.',
              es: 'La mejora está dentro del margen de error.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Latencia p95: medir antes de optimizar',
          setting: 'Reunión de rendimiento, sala de equipo',
          goal: 'Medir y diagnosticar una regresión de rendimiento antes de optimizar.',
          context:
            'Tras un despliegue se duplica la latencia p95. Maya y Leo perfilan el endpoint para encontrar la causa antes de optimizar.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'The p95 latency doubled after the deploy.',
              es: 'La latencia p95 se duplicó después del despliegue.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Let's profile the endpoint before we optimize anything.",
              es: 'Perfilemos el endpoint antes de optimizar nada.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Good. Profiling showed a full table scan.',
              es: 'Bien. El perfilado mostró un escaneo completo de tabla.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Then the database is the bottleneck, not the CPU.',
              es: 'Entonces la base de datos es el cuello de botella, no la CPU.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Adding an index trades memory for speed. Let's measure again after.",
              es: 'Añadir un índice cambia memoria por velocidad. Midamos de nuevo después.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm6-l3-e1',
          type: 'choice',
          prompt: 'Antes de optimizar un endpoint lento, ¿qué haces?',
          options: [
            'Rewrite it in another language',
            'Add more servers',
            'Measure and profile the bottleneck',
            'Increase the timeout',
          ],
          answer: 2,
          explanation:
            'Sin medir no sabes qué optimizar. El profiling muestra dónde se va el tiempo.',
        },
        {
          id: 'm6-l3-e2',
          type: 'choice',
          prompt: "'The service is CPU-bound.' ¿Qué significa?",
          options: [
            'El servicio está limitado por CPU.',
            'El servicio está limitado por la red.',
            'El servicio está limitado por el disco.',
            'El servicio no tiene suficiente memoria.',
          ],
          answer: 0,
          explanation:
            "'CPU-bound' describe una carga limitada por el procesador, no por la red o el disco.",
        },
        {
          id: 'm6-l3-e3',
          type: 'builder',
          prompt: "Construye: 'Midamos antes de optimizar.'",
          words: ["Let's", 'measure', 'before we', 'optimize.'],
          answer: "Let's measure before we optimize.",
          explanation:
            "'Let's + verbo base' propone el siguiente paso; 'before we optimize' marca el orden.",
        },
        {
          id: 'm6-l3-e5',
          type: 'choice',
          prompt:
            'El servicio pasa casi todo el tiempo esperando E/S (base de datos, disco, red). ¿Cómo lo describes?',
          options: [
            'The service is I/O-bound.',
            'The service is CPU-bound.',
            'The service is memory-bound only.',
            'The service is down.',
          ],
          answer: 0,
          explanation:
            "'I/O-bound' indica que el cuello de botella está en entrada/salida (red, disco, base de datos), no en la CPU.",
        },
        {
          id: 'm6-l3-e7',
          type: 'choice',
          prompt: '¿Cuál fue la causa de la regresión en la conversación?',
          options: [
            'Una consulta hacía un escaneo completo de tabla.',
            'La CPU estaba al 100%.',
            'Faltaban servidores.',
          ],
          answer: 0,
          explanation:
            "Maya dice 'Profiling showed a full table scan': la causa fue una consulta con escaneo completo de tabla.",
        },
        {
          id: 'm6-l3-e8',
          type: 'choice',
          prompt: '¿Qué hará el equipo después del cambio?',
          options: [
            'Volver a medir la latencia.',
            'Desplegar sin medir.',
            'Borrar los logs de rendimiento.',
          ],
          answer: 0,
          explanation:
            "Maya cierra con 'Let's measure again after': se mide de nuevo para comprobar la mejora con datos.",
        },
        {
          id: 'm6-l3-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The service is CPU-bound, so we cache the most frequent reads.',
          hint: 'Causa y solución.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm6-l4',
      slug: 'checkpoint-arquitectura-seguridad-performance',
      title: 'Checkpoint: seguridad, arquitectura y performance',
      step: 'B2 · Paso 6.4 · Checkpoint',
      cefr: 'B2',
      summary:
        'Recuperación activa de lo esencial: secretos, trade-offs, cuellos de botella y métricas antes de optimizar.',
      objectives: [
        'Recordar acciones clave ante una credencial expuesta.',
        'Explicar un trade-off y un cuello de botella con lenguaje claro.',
        'Aplicar el hábito de medir antes de optimizar.',
      ],
      pronunciation:
        'We rotated the leaked key, identified the database as the bottleneck, and measured p95 latency before optimizing.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Completa las lecciones de Módulo 6 (seguridad, system design y performance). Este checkpoint integra lo visto: responde desde memoria y, si fallas, vuelve a la lección concreta.',
        },
        {
          type: 'technique',
          name: 'Recuperación activa',
          desc: 'Intenta producir la respuesta (qué harías, qué término usarías) antes de releer. Mezclar temas (rotar claves, bottlenecks, métricas) ayuda a fijar el conocimiento en contextos reales.',
        },
        {
          type: 'phrases',
          title: 'Frases clave para recordar',
          items: [
            { en: 'We need to rotate the leaked key.', es: 'Necesitamos rotar la clave filtrada.' },
            { en: 'Apply least privilege.', es: 'Aplica mínimo privilegio.' },
            {
              en: 'The database is the bottleneck.',
              es: 'La base de datos es el cuello de botella.',
            },
            {
              en: 'This is a trade-off between latency and complexity.',
              es: 'Es un trade-off entre latencia y complejidad.',
            },
            {
              en: "Let's measure and profile before we optimize.",
              es: 'Midamos y hagamos profiling antes de optimizar.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm6-l4-e1',
          type: 'choice',
          prompt: 'Una clave aparece en logs públicos. ¿Qué acción es prioritaria?',
          options: [
            'Rotate the key immediately',
            'Document it and wait',
            'Share the key to debug faster',
            'Ignore it if the app still works',
          ],
          answer: 0,
          explanation:
            'Una credencial expuesta debe rotarse de inmediato; luego se revisa impacto y se corrige la causa de la filtración.',
        },
        {
          id: 'm6-l4-e2',
          type: 'builder',
          prompt: "Construye: 'La base de datos es el cuello de botella.'",
          words: ['The database', 'is', 'the bottleneck.'],
          answer: 'The database is the bottleneck.',
          explanation: "'Bottleneck' nombra el punto que limita el rendimiento del sistema.",
        },
        {
          id: 'm6-l4-e3',
          type: 'write',
          prompt: "Escribe en inglés: 'Midamos antes de optimizar.'",
          answer: "Let's measure before we optimize.",
          accept: ["Let's measure before optimizing.", 'Let us measure before we optimize.'],
          hint: "Usa 'Let's measure...'",
          explanation: 'Medir primero evita optimizaciones basadas en suposiciones.',
        },
        {
          id: 'm6-l4-e5',
          type: 'builder',
          prompt: "Construye: 'Deberíamos aplicar mínimo privilegio.'",
          words: ['We should', 'apply', 'least privilege.'],
          answer: 'We should apply least privilege.',
          explanation:
            "'Least privilege' limita permisos al mínimo necesario y reduce el impacto de una filtración.",
        },
        {
          id: 'm6-l4-e6',
          type: 'write',
          prompt: "Escribe en inglés: 'La latencia p95 aumentó después del despliegue.'",
          answer: 'The p95 latency increased after the deploy.',
          accept: [
            'The p95 latency increased after deployment.',
            'P95 latency increased after the deploy.',
            'The p95 latency went up after the deploy.',
          ],
          hint: "Usa 'p95 latency increased...'",
          explanation:
            'Describir la regresión con una métrica concreta (p95) hace el reporte útil y accionable.',
        },
        {
          id: 'm6-l4-e7',
          type: 'fill-blank',
          prompt: 'Completa el resumen: acción de seguridad y causa de rendimiento.',
          template: 'We need to ___ the leaked key. The database is the ___.',
          blanks: ['rotate', 'bottleneck'],
          hint: 'Clave expuesta → rotate. Punto que limita rendimiento → bottleneck.',
          explanation:
            "Checkpoint: recuerda acciones y términos clave de seguridad ('rotate') y performance/arquitectura ('bottleneck').",
        },
        {
          id: 'm6-l4-e8',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The main risk is a single point of failure in the database.',
          hint: 'Comunicar un riesgo.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm6-l5',
      slug: 'practica-seguridad-arquitectura-performance',
      title: 'Práctica: seguridad, arquitectura y performance',
      step: 'B2 · Paso 6.5 · Práctica guiada',
      cefr: 'B2',
      summary:
        'Sesión corta para separar y reforzar m6-l1 a m6-l3: respuesta a secretos expuestos, trade-offs y diagnóstico de rendimiento.',
      objectives: [
        'Comunicar acciones de seguridad con claridad (rotar, revisar permisos).',
        'Explicar decisiones de arquitectura con trade-offs simples.',
        'Describir problemas de rendimiento con métricas y siguiente paso.',
      ],
      pronunciation:
        'The token leaked, so we need to rotate it. The p95 latency doubled, so we should profile the API.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m6-l1 (seguridad y secretos), m6-l2 (system design) y m6-l3 (performance). Esta práctica usa solo términos y estructuras ya enseñados en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Problema → acción → razón',
          desc: "Seguridad: 'The token leaked, so we need to rotate it.' Arquitectura: trade-off claro ('faster, but more complex'). Performance: métrica + acción ('p95 doubled, so we should profile it').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            { en: 'We need to rotate the API key.', es: 'Necesitamos rotar la clave de API.' },
            { en: 'This is a single point of failure.', es: 'Este es un punto único de fallo.' },
            {
              en: 'The main bottleneck is the database.',
              es: 'El principal cuello de botella es la base de datos.',
            },
            { en: 'The p95 latency doubled.', es: 'La latencia p95 se duplicó.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm6-l5-e1',
          type: 'choice',
          prompt: 'Descubres que una API key se filtró en logs. ¿Qué acción es la más adecuada?',
          options: [
            'We need to rotate the API key.',
            'We need to cache the API key.',
            'We need to deploy the API key.',
            'We need to ignore the API key.',
          ],
          answer: 0,
          explanation: 'Ante una clave expuesta, lo correcto es rotarla (revocar y reemplazarla).',
        },
        {
          id: 'm6-l5-e2',
          type: 'builder',
          prompt: "Construye: 'Este es un punto único de fallo.'",
          words: ['This is', 'a single', 'point of', 'failure.'],
          answer: 'This is a single point of failure.',
          explanation:
            "Un 'single point of failure' es un componente cuyo fallo afecta a todo el sistema.",
        },
        {
          id: 'm6-l5-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'La latencia p95 se duplicó.'",
          answer: 'The p95 latency doubled.',
          accept: ['The p95 latency doubled'],
          hint: "Usa 'p95 latency' y pasado simple 'doubled'.",
          explanation:
            'Describir métricas con claridad ayuda a priorizar el diagnóstico de rendimiento.',
        },
        {
          id: 'm6-l5-e4',
          type: 'choice',
          prompt: 'Quieres explicar el principal límite de rendimiento. ¿Qué dices?',
          options: [
            'The main bottleneck is the database.',
            'The main feature is the database.',
            'The main secret is the database.',
            'The main endpoint is the database.',
          ],
          answer: 0,
          explanation: "'Bottleneck' es el cuello de botella: el punto que limita el rendimiento.",
        },
        {
          id: 'm6-l5-e5',
          type: 'builder',
          prompt: "Construye: 'Deberíamos medir antes de optimizar.'",
          words: ['We should', 'measure', 'before we', 'optimize.'],
          answer: 'We should measure before we optimize.',
          explanation: 'Buena práctica de performance: medir primero para optimizar con evidencia.',
        },
        {
          id: 'm6-l5-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Necesitamos revisar los permisos.'",
          answer: 'We need to review the permissions.',
          accept: ['We need to review permissions.'],
          hint: "Usa 'review the permissions'.",
          explanation:
            'Revisar permisos es parte de aplicar mínimo privilegio y mejorar seguridad.',
        },
        {
          id: 'm6-l5-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'We profiled the endpoint and reduced the latency by half.',
          hint: 'Dos acciones de optimización.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
  ],
}
