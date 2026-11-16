import type { Module } from '../../lib/types'

export const m5: Module = {
  id: 'm5',
  code: 'MOD 05',
  level: 'B1-B2',
  title: 'Commits, Async y Entrevistas',
  shortTitle: 'Commits, Async & Interviews',
  description:
    'Conventional Commits, Pull Requests, mensajes asíncronos de Slack y entrevistas técnicas en inglés.',
  sessions: [
    {
      id: 'm5-l1',
      slug: 'commits-prs-docs',
      title: 'Conventional Commits, Pull Requests y Preguntas Técnicas',
      step: 'B2 · Paso 5.1',
      cefr: 'B2',
      summary: 'Escribe como un ingeniero senior en repositorios open-source y equipos globales.',
      objectives: [
        'Escribir commits en presente imperativo con prefijos estándar.',
        'Redactar una descripción de PR que se entienda en 30 segundos.',
        'Formular una pregunta técnica con estructura Expected vs Actual.',
      ],
      pronunciation: 'Fix: resolve CORS error in production and update the API documentation.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere imperativos y vocabulario de cambios (add, fix, update, refactor, test) de módulos anteriores. Aquí aprenderás convenciones (Conventional Commits, estructura de PR y reporte de bugs) y las frases específicas usadas en ejercicios.',
        },
        {
          type: 'technique',
          name: "Commit claro: 'If applied, this commit will...'",
          desc: "Usa presente/imperativo en el mensaje: 'add login endpoint', 'fix CORS error'. Prefijos comunes: feat, fix, docs, refactor, test, chore. Evita pasado ('added') y mensajes vagos ('fix stuff'). Si tu equipo usa otra convención, síguela.",
        },
        {
          type: 'table',
          title: 'Tipos de Conventional Commits',
          columns: ['Tipo', 'Uso', 'Ejemplo'],
          rows: [
            ['feat:', 'Nueva funcionalidad', 'feat: add login endpoint'],
            ['fix:', 'Corrección de bug', 'fix: resolve CORS error in production'],
            ['docs:', 'Cambios en documentación', 'docs: update README with setup instructions'],
            [
              'refactor:',
              'Mejora interna sin cambiar función',
              'refactor: extract validation logic',
            ],
            ['test:', 'Agregar o modificar tests', 'test: add unit tests for password hashing'],
            ['chore:', 'Mantenimiento / dependencias', 'chore: update npm dependencies'],
          ],
        },
        {
          type: 'vocab',
          title: 'Vocabulario nuevo (usado en ejemplos y ejercicios)',
          items: [
            {
              en: 'endpoint',
              es: 'punto de acceso/ruta de una API',
              example: 'feat: add login endpoint',
            },
            {
              en: 'setup instructions',
              es: 'instrucciones de instalación/configuración',
              example: 'docs: update README with setup instructions',
            },
            {
              en: 'dependencies',
              es: 'dependencias/librerías del proyecto',
              example: 'chore: update npm dependencies',
            },
            {
              en: 'breaking change',
              es: 'cambio que rompe compatibilidad',
              example: 'This is a breaking change.',
            },
            {
              en: 'login bug',
              es: 'error/bug en el inicio de sesión',
              example: 'This PR fixes the login bug.',
            },
            {
              en: 'password hashing',
              es: 'proceso de convertir contraseñas en hash (seguro)',
              example: 'test: add tests for password hashing',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Descripción de Pull Request',
          items: [
            {
              en: 'This PR fixes #123 / Closes #456',
              es: 'Vincula y cierra automáticamente el issue.',
            },
            {
              en: 'Ready for review / Requesting review from @username',
              es: 'Solicita revisión formal al equipo.',
            },
            {
              en: 'Addresses the comments from the last review',
              es: 'Indica que ya aplicaste los cambios pedidos.',
            },
            { en: 'This is a breaking change', es: 'Advierte que rompe compatibilidad anterior.' },
          ],
        },
        {
          type: 'table',
          title: 'Plantilla de Stack Overflow',
          columns: ['Paso', 'Frase modelo'],
          rows: [
            [
              '1. Qué intentas hacer',
              "I'm trying to store the auth token in localStorage after login.",
            ],
            [
              '2. Qué ya intentaste',
              'I already tried clearing the cache and checking the network tab.',
            ],
            [
              '3. Esperado vs Real',
              'I expected the token to persist, but it returns null after refresh.',
            ],
          ],
        },
        {
          type: 'dialogue',
          title: 'Del commit al PR: convenciones en equipo',
          context:
            'Maya revisa el PR de Leo y repasan juntos el mensaje de commit y la descripción.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Your PR fixes the login bug, but the commit message says "fixed stuff".',
              es: 'Tu PR arregla el bug de login, pero el mensaje de commit dice "fixed stuff".',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'What should I write instead?',
              es: '¿Qué debería escribir en su lugar?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Use a prefix and an imperative verb: "fix: resolve CORS error in production".',
              es: 'Usa un prefijo y un verbo en imperativo: "fix: resolve CORS error in production".',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Got it. I\'ll also add "Closes #123" to link the issue.',
              es: 'Entendido. También añadiré "Closes #123" para vincular el issue.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Perfect. Mark it ready for review and I'll take a look.",
              es: 'Perfecto. Márcalo listo para revisión y le echo un vistazo.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l1-e1',
          type: 'choice',
          prompt:
            'Acabas de mejorar la legibilidad de una función de validación sin alterar lo que devuelve. ¿Qué commit es correcto?',
          options: [
            'feat: changed validation',
            'refactor: extract validation logic to separate function',
            'fix: refactored validation yesterday',
            'docs: new validation function',
          ],
          answer: 1,
          explanation:
            "Mejorar estructura sin cambiar funcionalidad es 'refactor:', seguido de verbo imperativo en presente ('extract').",
        },
        {
          id: 'm5-l1-e2',
          type: 'builder',
          prompt:
            "Construye la estructura clave de Stack Overflow: 'Esperaba que pasara X, pero pasó Y.'",
          words: ['I expected', 'X to happen,', 'but Y', 'happened instead.'],
          answer: 'I expected X to happen, but Y happened instead.',
          explanation:
            'Esta estructura contrastiva permite que cualquier developer entienda tu bug en cinco segundos.',
        },
        {
          id: 'm5-l1-e3',
          type: 'write',
          prompt:
            'Escribe el commit para un bug de CORS resuelto en producción, usando el prefijo correcto.',
          answer: 'fix: resolve CORS error in production',
          accept: [
            'fix: resolve the CORS error in production',
            'fix: fix CORS error in production',
          ],
          hint: "Empieza con 'fix:' y usa el verbo en forma base: 'resolve'.",
          explanation:
            "Commit en presente imperativo: 'fix:' + 'resolve...'. No 'fixed' ni 'fixing'.",
        },
        {
          id: 'm5-l1-e4',
          type: 'choice',
          prompt:
            'Actualizaste las instrucciones de instalación del README. ¿Qué commit sigue la convención?',
          options: [
            'docs: update installation instructions',
            'feat: updated the README yesterday',
            'chore: documentation stuff',
            'fix: docs are working',
          ],
          answer: 0,
          explanation:
            "Un cambio solo de documentación usa 'docs:' y verbo en presente imperativo: 'update installation instructions'.",
        },
        {
          id: 'm5-l1-e5',
          type: 'builder',
          prompt: "Construye la descripción breve de un PR: 'Esto arregla el error de login.'",
          words: ['This PR', 'fixes', 'the login bug.'],
          answer: 'This PR fixes the login bug.',
          explanation:
            "Descripción clara y directa: qué hace el PR. Usar 'fixes' vincula la intención del cambio.",
        },
        {
          id: 'm5-l1-e6',
          type: 'write',
          prompt:
            "Escribe en inglés: 'Agrega tests para el hash de contraseñas.' (como mensaje de commit tipo test:)",
          answer: 'test: add tests for password hashing',
          accept: [
            'test: add unit tests for password hashing',
            'test: add tests for password hashing.',
          ],
          hint: "Usa el prefijo 'test:' y verbo imperativo 'add'.",
          explanation:
            "Conventional Commits: tipo + dos puntos + descripción breve en imperativo ('add tests...').",
        },
        {
          id: 'm5-l1-e7',
          type: 'choice',
          prompt: '¿Qué estaba mal en el mensaje de commit de Leo?',
          options: [
            'Decía "fixed stuff", sin prefijo ni verbo imperativo.',
            'Usaba el prefijo "fix:" correctamente.',
            'Estaba escrito en inglés.',
          ],
          answer: 0,
          explanation:
            "Maya señala 'the commit message says \"fixed stuff\"' y propone 'fix: resolve CORS error in production': prefijo + imperativo.",
        },
        {
          id: 'm5-l1-e8',
          type: 'choice',
          prompt: '¿Qué hará Leo para vincular el issue?',
          options: [
            'Añadir "Closes #123" al PR.',
            'Borrar el issue del repositorio.',
            'Escribir el commit en tiempo pasado.',
          ],
          answer: 0,
          explanation:
            "Leo dice 'I'll also add \"Closes #123\" to link the issue': esa sintaxis cierra el issue automáticamente.",
        },
        {
          id: 'm5-l1-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I have to update the documentation before the pull request.',
          hint: 'have to + verbo base.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm5-l2',
      slug: 'slack-trabajo-asincrono',
      title: 'Slack, email y trabajo asíncrono',
      step: 'B2 · Paso 5.2',
      cefr: 'B2',
      summary:
        'Escribe mensajes que se entiendan sin contexto: heads-up, ETA, follow-up y loop in.',
      objectives: [
        'Estructurar un mensaje asíncrono con contexto, petición y plazo.',
        'Pedir un ETA o hacer seguimiento sin sonar agresivo.',
        'Usar el vocabulario de Slack y email profesional.',
      ],
      pronunciation: 'Quick heads-up: the deploy is blocked. Do you have an ETA for the fix?',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Necesitas peticiones corteses ('Can/Could you...?'), tiempos futuros simples y vocabulario de PR/deploy. Esta lección enseña frases de async (heads-up, ETA, follow up, loop in) y estructura de mensajes.",
        },
        {
          type: 'technique',
          name: 'Mensaje asíncrono efectivo: contexto + petición + plazo',
          desc: "Ej.: 'Quick heads-up: the deploy is blocked. Can you review the PR by 3 p.m.?' Incluir contexto, qué necesitas y cuándo (o indicar 'no rush') reduce idas y vueltas.",
        },
        {
          type: 'vocab',
          title: 'Vocabulario y chunks de esta lección',
          items: [
            {
              en: 'heads-up',
              es: 'aviso rápido/previo',
              example: "Quick heads-up: I'll be offline this afternoon.",
            },
            {
              en: 'ETA (estimated time of arrival)',
              es: 'tiempo estimado',
              example: 'Do you have an ETA for the fix?',
            },
            {
              en: 'loop in',
              es: 'incluir a alguien en la conversación',
              example: 'Looping in Ana for context.',
            },
            { en: 'follow up', es: 'hacer seguimiento', example: "I'll follow up tomorrow." },
            { en: 'thread', es: 'hilo de conversación', example: 'Can we take this to a thread?' },
            {
              en: 'keep someone posted',
              es: 'mantener a alguien informado',
              example: "I'll keep you posted.",
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases de Slack y email',
          items: [
            {
              en: "Quick heads-up: I'll be offline this afternoon.",
              es: 'Aviso rápido: estaré desconectado esta tarde.',
            },
            {
              en: 'Do you have an ETA for the fix?',
              es: '¿Tienes una estimación para el arreglo?',
            },
            { en: 'Looping in Ana for context.', es: 'Añado a Ana para dar contexto.' },
            { en: "I'll follow up tomorrow.", es: 'Haré seguimiento mañana.' },
            { en: 'Can we take this to a thread?', es: '¿Lo pasamos a un hilo?' },
            {
              en: "Just to confirm: we're shipping on Friday.",
              es: 'Solo para confirmar: lanzamos el viernes.',
            },
            {
              en: 'No rush, but could you take a look when you have a minute?',
              es: 'Sin prisa, pero ¿podrías mirarlo cuando tengas un minuto?',
            },
            { en: "I'll keep you posted.", es: 'Te mantengo al tanto.' },
          ],
        },
        {
          type: 'dialogue',
          title: 'Un mensaje de Slack que se entiende sin contexto',
          context: 'Leo avisa por Slack de un bloqueo y Maya responde con una petición y un plazo.',
          lines: [
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Quick heads-up: the deploy is blocked by the API change.',
              es: 'Aviso rápido: el despliegue está bloqueado por el cambio de la API.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Do you have an ETA for the fix?',
              es: '¿Tienes una estimación para el arreglo?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "About two hours. I'm looping in Ana for context.",
              es: 'Unas dos horas. Añado a Ana para dar contexto.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Thanks. Can you review the PR by 3 p.m.?',
              es: 'Gracias. ¿Puedes revisar el PR antes de las 3 p.m.?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Sure. I'll keep you posted.",
              es: 'Claro. Te mantengo al tanto.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l2-e1',
          type: 'choice',
          prompt: '¿Cuál es el mensaje de Slack más útil?',
          options: [
            'hey',
            'Quick heads-up: the deploy is blocked. Can you review the PR by 3 p.m.?',
            'hello???',
            'urgent',
          ],
          answer: 1,
          explanation:
            "El mensaje útil incluye contexto, petición concreta y plazo. 'hey' obliga a otra ronda de preguntas.",
        },
        {
          id: 'm5-l2-e2',
          type: 'choice',
          prompt: '¿Cómo pides un ETA sin sonar agresivo?',
          options: ['When?', 'Do you have an ETA for the fix?', 'Why are you late?', 'Fix it now'],
          answer: 1,
          explanation:
            "'Do you have an ETA for the fix?' pide una estimación de forma neutra y profesional.",
        },
        {
          id: 'm5-l2-e3',
          type: 'builder',
          prompt: "Construye: 'Añado a Ana para dar contexto.'",
          words: ['Looping in', 'Ana', 'for context.'],
          answer: 'Looping in Ana for context.',
          explanation:
            "'Loop someone in' significa incluir a alguien en la conversación o el hilo.",
        },
        {
          id: 'm5-l2-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'Te aviso cuando esté listo.'",
          answer: "I'll let you know when it's ready.",
          accept: [
            'I will let you know when it is ready.',
            "I'll let you know when it is ready.",
            "I will let you know when it's ready.",
          ],
          hint: "Usa 'I'll let you know when...'.",
          explanation:
            "'Let you know' es la forma estándar de prometer un aviso sin comprometerte a una hora exacta.",
        },
        {
          id: 'm5-l2-e5',
          type: 'dialogue-order',
          prompt: 'Ordena un mensaje asíncrono claro (contexto → petición → seguimiento).',
          lines: [
            'Quick heads-up: the deploy is blocked by the API change.',
            'Can you review the PR by 3 p.m.?',
            "Thanks — I'll follow up after that.",
          ],
          explanation:
            'Un buen mensaje async da contexto, hace una petición concreta (con plazo si aplica) y muestra el siguiente paso.',
        },
        {
          id: 'm5-l2-e6',
          type: 'choice',
          prompt: 'Quieres confirmar un acuerdo sin sonar agresivo. ¿Qué frase encaja mejor?',
          options: [
            "Just to confirm: we're shipping on Friday, right?",
            'We ship Friday. Ok?',
            "You said Friday, don't forget.",
            'Friday. Yes or no.',
          ],
          answer: 0,
          explanation:
            "'Just to confirm...' es una forma educada y clara de verificar entendimiento en trabajo asíncrono.",
        },
        {
          id: 'm5-l2-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Could you review the ticket when you have time? No rush.',
          hint: 'Petición asíncrona amable.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm5-l2-e10',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'heads-up', es: 'aviso rápido/previo' },
            { en: 'ETA (estimated time of arrival)', es: 'tiempo estimado' },
            { en: 'loop in', es: 'incluir a alguien en la conversación' },
            { en: 'follow up', es: 'hacer seguimiento' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
        {
          id: 'm5-l2-e11',
          type: 'dialogue-branch',
          prompt: 'Elige la mejor respuesta asíncrona.',
          steps: [
            {
              speaker: 'Maya',
              line: 'Can you send the update in Slack?',
              choices: [
                {
                  en: 'Sure, I will post it after the standup.',
                  correct: true,
                  feedback: 'Confirmas y dás momento concreto.',
                },
                {
                  en: 'I will call you right now.',
                  correct: false,
                  feedback: 'Una llamada no es una respuesta asíncrona.',
                },
              ],
            },
            {
              speaker: 'Maya',
              line: 'Thanks. Please include the blockers too.',
              choices: [
                {
                  en: 'Will do. I will mention them in the update.',
                  correct: true,
                  feedback: 'Confirmas y recoges el feedback.',
                },
                {
                  en: 'I will send a voice note at midnight.',
                  correct: false,
                  feedback: 'No es asíncrono ni respeta el plazo.',
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
      id: 'm5-l3',
      slug: 'entrevistas-tecnicas',
      title: 'Entrevistas técnicas en inglés',
      step: 'B2 · Paso 5.3',
      cefr: 'B2',
      summary:
        'Preséntate, cuenta una historia con STAR y habla de trade-offs sin memorizar un guion.',
      objectives: [
        'Construir una presentación profesional de 30 segundos.',
        'Responder preguntas de comportamiento con STAR.',
        'Explicar decisiones técnicas usando trade-offs.',
      ],
      pronunciation:
        'In my last role, I led the migration to the cloud. The main trade-off was latency versus cost.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere pasado simple para contar experiencias, vocabulario de roles/proyectos y capacidad de explicar decisiones. Se introducen estructura STAR y frases típicas de entrevista en esta sesión.',
        },
        {
          type: 'technique',
          name: 'STAR: estructura para respuestas de comportamiento',
          desc: 'Situation (contexto), Task (tu responsabilidad), Action (qué hiciste tú) y Result (impacto/resultado, idealmente medible). Respuestas concretas y breves funcionan mejor que generalidades.',
        },
        {
          type: 'vocab',
          title: 'Vocabulario clave de entrevista (usado en esta lección)',
          items: [
            {
              en: 'experience',
              es: 'experiencia',
              example: 'I have three years of experience as a backend developer.',
            },
            {
              en: 'role',
              es: 'puesto/rol',
              example: 'In my last role, I led the migration to the cloud.',
            },
            {
              en: 'lead / led',
              es: 'liderar / lideré (pasado)',
              example: 'I led the migration to the cloud.',
            },
            {
              en: 'trade-off',
              es: 'compensación entre opciones',
              example: 'The main trade-off was latency versus cost.',
            },
            {
              en: 'latency vs cost',
              es: 'latencia frente a coste',
              example: 'The main trade-off was latency versus cost.',
            },
            {
              en: 'as a result',
              es: 'como resultado',
              example: 'As a result, we reduced latency by 20%.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para la entrevista',
          items: [
            {
              en: 'I have three years of experience as a backend developer.',
              es: 'Tengo tres años de experiencia como desarrollador backend.',
            },
            {
              en: 'In my last role, I led the migration to the cloud.',
              es: 'En mi último puesto, lideré la migración a la nube.',
            },
            {
              en: 'The main trade-off was latency versus cost.',
              es: 'El principal trade-off era latencia frente a coste.',
            },
            {
              en: "I'm looking for a role where I can own the architecture.",
              es: 'Busco un puesto donde pueda ser responsable de la arquitectura.',
            },
            {
              en: 'Could you tell me more about the on-call rotation?',
              es: '¿Podrías contarme más sobre la rotación de on-call?',
            },
            {
              en: "I'd love to learn more about the team.",
              es: 'Me gustaría conocer mejor al equipo.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Preguntas y estructura',
          columns: ['Pregunta', 'Qué buscan', 'Tu estructura'],
          rows: [
            [
              'Tell me about yourself',
              'Resumen profesional relevante',
              'Rol + años + especialidad + interés',
            ],
            ['Tell me about a difficult bug', 'Cómo diagnosticas', 'STAR + resultado medible'],
            [
              'Why do you want this role?',
              'Motivación y encaje',
              'Producto + equipo + crecimiento',
            ],
            ['Do you have any questions?', 'Interés real', 'Equipo, on-call, roadmap'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l3-e1',
          type: 'choice',
          prompt: "'Tell me about yourself'. ¿Cuál es un buen comienzo?",
          options: [
            "I'm a backend developer with three years of experience.",
            'I am 25 years old and I like computers.',
            "I don't know what to say.",
            'My whole life story starts in a small town.',
          ],
          answer: 0,
          explanation:
            'Una entrevista espera un resumen profesional: rol, experiencia y especialidad. Los datos personales irrelevantes no ayudan.',
        },
        {
          id: 'm5-l3-e2',
          type: 'choice',
          prompt: '¿Qué significa STAR en una entrevista de comportamiento?',
          options: [
            'Situation, Task, Action, Result',
            'Skill, Team, Ambition, Role',
            'Story, Time, Answer, Reason',
            'System, Test, API, Release',
          ],
          answer: 0,
          explanation:
            'STAR = Situation, Task, Action, Result. Te obliga a contar una historia concreta con un resultado.',
        },
        {
          id: 'm5-l3-e3',
          type: 'builder',
          prompt: "Construye: 'El principal trade-off era latencia frente a coste.'",
          words: ['The main trade-off', 'was', 'latency versus cost.'],
          answer: 'The main trade-off was latency versus cost.',
          explanation:
            "'Trade-off' es la palabra clave para mostrar criterio técnico en una entrevista o una revisión de arquitectura.",
        },
        {
          id: 'm5-l3-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'Lideré la migración a la nube el año pasado.'",
          answer: 'I led the cloud migration last year.',
          accept: [
            'I led the migration to the cloud last year.',
            'Last year I led the cloud migration.',
          ],
          hint: "'Led' es el pasado de 'lead'.",
          explanation:
            "'Led' es el pasado irregular de 'lead'. Es una frase fuerte para una respuesta STAR.",
        },
        {
          id: 'm5-l3-e5',
          type: 'builder',
          prompt:
            "Construye una respuesta breve (STAR - resultado): 'Como resultado, redujimos la latencia un 20%.'",
          words: ['As a result,', 'we reduced', 'latency by 20%.'],
          answer: 'As a result, we reduced latency by 20%.',
          explanation:
            "En STAR, el resultado debe ser claro y, si es posible, medible ('by 20%'). 'Reduced' es pasado simple de 'reduce'.",
        },
        {
          id: 'm5-l3-e6',
          type: 'speak',
          prompt: 'Practica en voz alta tu presentación breve (rol entrevista).',
          answer: 'I am a backend developer with three years of experience.',
          accept: ["I'm a backend developer with three years of experience."],
          hint: 'Habla claro: rol + años de experiencia.',
          explanation:
            "Práctica de speaking: una apertura simple y profesional para 'Tell me about yourself'. Enfócate en claridad y ritmo.",
        },
      ],
    },
    {
      id: 'm5-l4',
      slug: 'conectores-y-discourse-markers',
      title: 'Conectores y discourse markers',
      step: 'B1 · Paso 5.4',
      cefr: 'B1',
      summary:
        'Usa I mean, actually, basically y otros conectores para sonar natural, aclarar ideas y ordenar tu mensaje.',
      objectives: [
        'Aclarar o corregir lo que acabas de decir con marcadores naturales.',
        'Ordenar explicaciones técnicas con conectores simples.',
        'Evitar sonar brusco usando marcadores de cortesía y reformulación.',
      ],
      pronunciation:
        'I mean, the fix is simple. Actually, we should refactor this first. Basically, the cache is stale.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Útil tener fluidez básica con frases de opinión y explicación. Aquí aprenderás discourse markers (I mean, actually, basically, etc.) y su intención; todos se practican en contexto antes de los ejercicios.',
        },
        {
          type: 'technique',
          name: 'Discourse markers: señalan tu intención',
          desc: "'I mean' reformula/aclara, 'actually' corrige o contrasta, 'basically' resume, 'anyway' retoma/cierra tema. No cambian los hechos, pero ayudan a que te entiendan mejor en conversación.",
        },
        {
          type: 'vocab',
          title: 'Conectores y marcadores comunes',
          items: [
            {
              en: 'I mean',
              es: 'quiero decir / o sea',
              example: 'I mean, we can ship today if tests pass.',
            },
            {
              en: 'actually',
              es: 'en realidad / de hecho',
              example: 'Actually, the bug is in the frontend.',
            },
            {
              en: 'basically',
              es: 'básicamente / en resumen',
              example: 'Basically, the cache is stale.',
            },
            {
              en: 'to be honest',
              es: 'para ser honesto',
              example: "To be honest, I don't think this will scale.",
            },
            {
              en: 'in other words',
              es: 'en otras palabras',
              example: 'In other words, we need to retry the request.',
            },
            {
              en: 'anyway',
              es: 'en fin / de todos modos',
              example: "Anyway, let's focus on the fix.",
            },
            { en: 'you know', es: 'sabes / ya sabes', example: "It's a race condition, you know?" },
            { en: 'so', es: 'así que / entonces', example: 'So, we should roll back.' },
          ],
        },
        {
          type: 'phrases',
          title: 'Cómo usarlos en contexto técnico',
          items: [
            {
              en: "I mean, it's not a blocker, but we should fix it soon.",
              es: 'O sea, no es un bloqueador, pero deberíamos arreglarlo pronto.',
            },
            {
              en: 'Actually, the issue was caused by a typo.',
              es: 'En realidad, el problema lo causó un typo.',
            },
            {
              en: 'Basically, we need to clear the cache.',
              es: 'Básicamente, tenemos que limpiar la caché.',
            },
            {
              en: "To be honest, I'm not sure this is the right approach.",
              es: 'Para ser honesto, no estoy seguro de que sea el enfoque correcto.',
            },
            {
              en: 'In other words, the service is timing out.',
              es: 'En otras palabras, el servicio está agotando el tiempo.',
            },
            {
              en: 'Anyway, back to the main issue.',
              es: 'En fin, volvamos al problema principal.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Qué intención transmite cada marcador',
          columns: ['Marcador', 'Intención', 'Ejemplo'],
          rows: [
            ['I mean', 'Reformular o aclarar', 'I mean, we need more tests.'],
            ['Actually', 'Corregir o matizar', "Actually, it's already deployed."],
            ['Basically', 'Resumir lo esencial', 'Basically, the API is down.'],
            ['To be honest', 'Dar una opinión directa', "To be honest, I'd refactor it."],
            ['Anyway', 'Volver al tema o cerrar', "Anyway, let's merge this."],
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l4-e1',
          type: 'choice',
          prompt:
            'Quieres corregir una idea: pensabas que el bug era del backend, pero es del frontend. ¿Qué marcador encaja mejor?',
          options: [
            'I mean, the bug is in the frontend.',
            'Actually, the bug is in the frontend.',
            'Anyway, the bug is in the frontend.',
            'You know, the bug is in the frontend.',
          ],
          answer: 1,
          explanation:
            "'Actually' se usa para corregir o contrastar con lo que se creía antes: en realidad, el bug está en el frontend.",
        },
        {
          id: 'm5-l4-e2',
          type: 'choice',
          prompt: "¿Qué significa 'actually' en inglés?",
          options: ['Actualmente', 'En realidad / de hecho', 'Finalmente', 'A veces'],
          answer: 1,
          explanation:
            "'Actually' es un false friend común: no significa 'actualmente'. Significa 'en realidad' o 'de hecho'.",
        },
        {
          id: 'm5-l4-e3',
          type: 'builder',
          prompt: "Construye: 'Básicamente, tenemos que limpiar la caché.'",
          words: ['Basically,', 'we need', 'to clear', 'the cache.'],
          answer: 'Basically, we need to clear the cache.',
          explanation: "'Basically' introduce un resumen simple de la idea principal.",
        },
        {
          id: 'm5-l4-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'O sea, no es un bloqueador.' (empieza con 'I mean,')",
          answer: "I mean, it's not a blocker.",
          accept: [
            'I mean, it is not a blocker.',
            "I mean it's not a blocker.",
            "I mean, it isn't a blocker.",
            "I mean it isn't a blocker.",
          ],
          hint: "Usa 'I mean,' para reformular o aclarar.",
          explanation:
            "'I mean' sirve para aclarar o suavizar lo que quieres decir: 'o sea, no es un bloqueador'.",
        },
        {
          id: 'm5-l4-e5',
          type: 'fill-blank',
          prompt: 'Completa con el discourse marker adecuado (de esta lección).',
          template: '___, the issue was in the config file. ___, we just need to update one value.',
          blanks: ['Actually', 'Basically'],
          hint: "Corregir/contrastar → 'Actually'. Resumir lo esencial → 'Basically'.",
          explanation:
            "Cada marcador señala intención: 'Actually' introduce una corrección y 'Basically' resume la idea principal.",
        },
        {
          id: 'm5-l4-e6',
          type: 'choice',
          prompt:
            'Quieres cerrar una digresión y volver al tema principal. ¿Qué marcador encaja mejor?',
          options: ['Anyway', 'Actually', 'To be honest', 'You know'],
          answer: 0,
          explanation:
            "'Anyway' se usa para retomar o cerrar el tema: 'Anyway, back to the main issue.'",
        },
        {
          id: 'm5-l4-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The build failed; however, we fixed it and deployed again.',
          hint: 'Conector de contraste.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm5-l4-e8',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'I mean', es: 'quiero decir / o sea' },
            { en: 'actually', es: 'en realidad / de hecho' },
            { en: 'basically', es: 'básicamente / en resumen' },
            { en: 'to be honest', es: 'para ser honesto' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
      ],
    },
    {
      id: 'm5-l5',
      slug: 'explicar-cambios-y-demos',
      title: 'Explicar cambios y dar una demo corta',
      step: 'B1 · Paso 5.5',
      cefr: 'B1',
      summary: 'Explica qué cambiaste, por qué y cómo probarlo en una demo breve y clara.',
      objectives: [
        'Presentar un cambio técnico en orden: problema, solución, impacto.',
        'Guiar una demo corta con pasos simples.',
        'Responder preguntas sobre el cambio sin perder el hilo.',
      ],
      pronunciation:
        'Let me show you what changed. Basically, we fixed the timeout issue and added a retry.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Necesitas pasado/presente para comparar antes/después y vocabulario de cambios (fix, add, handle). Esta lección enseña frases para guiar una demo corta paso a paso.',
        },
        {
          type: 'technique',
          name: 'Demo corta y clara: problema → cambio → resultado',
          desc: "1) Antes/problema ('Before this change...'). 2) Qué hiciste ('We fixed/added...'). 3) Ahora/cómo probar ('Now..., you can test it by...'). Cierra invitando preguntas.",
        },
        {
          type: 'vocab',
          title: 'Vocabulario y chunks para demos',
          items: [
            {
              en: 'walk someone through',
              es: 'mostrar/explicar paso a paso',
              example: 'Let me walk you through the change.',
            },
            {
              en: 'before this change / now',
              es: 'antes de este cambio / ahora',
              example: 'Before this change... Now, it handles the error correctly.',
            },
            {
              en: 'crash (on login)',
              es: 'fallar/caerse (al iniciar sesión)',
              example: 'The app crashed on login.',
            },
            {
              en: 'handle (an error)',
              es: 'manejar (un error)',
              example: 'Now, it handles the error correctly.',
            },
            {
              en: 'test it by clicking...',
              es: 'probarlo haciendo clic en...',
              example: 'You can test it by clicking this button.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para explicar y mostrar',
          items: [
            {
              en: 'Let me walk you through the change.',
              es: 'Déjame mostrarte el cambio paso a paso.',
            },
            {
              en: 'Before this change, the app crashed on login.',
              es: 'Antes de este cambio, la app se caía al iniciar sesión.',
            },
            {
              en: 'Now, it handles the error correctly.',
              es: 'Ahora maneja el error correctamente.',
            },
            {
              en: 'You can test it by clicking this button.',
              es: 'Puedes probarlo haciendo clic en este botón.',
            },
            {
              en: 'The main impact is better performance.',
              es: 'El impacto principal es mejor rendimiento.',
            },
            { en: 'Let me know if anything is unclear.', es: 'Avísame si algo no queda claro.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l5-e1',
          type: 'choice',
          prompt: 'Vas a empezar una demo. ¿Cuál frase es más clara?',
          options: [
            'Look.',
            'Let me walk you through the change.',
            'Things happened.',
            'I did stuff.',
          ],
          answer: 1,
          explanation:
            "'Let me walk you through the change' introduce la demo de forma clara y profesional.",
        },
        {
          id: 'm5-l5-e2',
          type: 'builder',
          prompt: "Construye: 'Antes de este cambio, la app se caía al iniciar sesión.'",
          words: ['Before this change,', 'the app', 'crashed', 'on login.'],
          answer: 'Before this change, the app crashed on login.',
          explanation: "Comparar 'before' y 'after' ayuda a mostrar el valor del cambio.",
        },
        {
          id: 'm5-l5-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Ahora maneja el error correctamente.'",
          answer: 'Now, it handles the error correctly.',
          accept: ['Now it handles the error correctly.', 'Now, it handles errors correctly.'],
          hint: "Empieza con 'Now,'.",
          explanation: "'Now' marca el resultado actual después del cambio.",
        },
        {
          id: 'm5-l5-e4',
          type: 'choice',
          prompt: '¿Cómo invitas preguntas al final de una explicación?',
          options: [
            "That's it.",
            'Let me know if anything is unclear.',
            'No questions.',
            'Finished.',
          ],
          answer: 1,
          explanation:
            "'Let me know if anything is unclear' abre espacio a preguntas de forma amable y profesional.",
        },
        {
          id: 'm5-l5-e5',
          type: 'builder',
          prompt: "Construye: 'Puedes probarlo haciendo clic en este botón.'",
          words: ['You can test it', 'by clicking', 'this button.'],
          answer: 'You can test it by clicking this button.',
          explanation:
            "Dar un paso concreto para probar ('by clicking this button') hace la demo fácil de seguir. 'Clicking' es la forma -ing del verbo 'click' (hacer clic).",
        },
        {
          id: 'm5-l5-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Déjame mostrarte el cambio paso a paso.'",
          answer: 'Let me walk you through the change.',
          accept: ['Let me walk you through this change.', 'Let me walk you through the changes.'],
          hint: "Usa 'Let me walk you through...'",
          explanation: 'Frase clara para iniciar una demo o explicación guiada de un cambio.',
        },
        {
          id: 'm5-l5-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Let me walk you through the demo: problem, change and result.',
          hint: 'Introducir una demo.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm5-l5-e8',
          type: 'dialogue-branch',
          prompt: 'Elige cómo abrir una demo.',
          steps: [
            {
              speaker: 'Leo',
              line: 'Ready for the demo?',
              choices: [
                {
                  en: 'Yes. Let me walk you through the demo first.',
                  correct: true,
                  feedback: 'Chunk natural para guiar una demo.',
                },
                {
                  en: 'No, let us skip it.',
                  correct: false,
                  feedback: 'No ayuda a quien presenta.',
                },
              ],
            },
            {
              speaker: 'Leo',
              line: 'Great. Who closes the demo?',
              choices: [
                {
                  en: 'Maya will close with the next steps.',
                  correct: true,
                  feedback: 'Cierre claro con siguientes pasos.',
                },
                {
                  en: 'Nobody. We can skip the ending.',
                  correct: false,
                  feedback: 'Una demo necesita cierre y próximos pasos.',
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
      id: 'm5-l6',
      slug: 'comentarios-de-pr-claros',
      title: 'Comentarios de PR: claros y profesionales',
      step: 'B2 · Paso 5.6',
      cefr: 'B2',
      summary:
        'Aprueba, pide cambios o sugiere mejoras con comentarios concretos, amables y accionables.',
      objectives: [
        'Escribir comentarios de PR con contexto y sugerencia clara.',
        'Distinguir un bloqueo de un nit y comunicarlo bien.',
        'Reescribir comentarios duros en feedback útil.',
      ],
      pronunciation:
        'Nit: could you rename this variable? This might break when the input is null. LGTM once tests pass.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Requiere frases de sugerencia ('Could you...?', 'I suggest...'), condicionales simples ('might break when...') y etiquetas de review vistas antes. Aquí se practica feedback concreto y respetuoso.",
        },
        {
          type: 'technique',
          name: 'Comentario de PR accionable: qué + impacto + sugerencia',
          desc: "Señala el punto concreto, explica el riesgo/impacto y propone una acción ('This might break when... Could you add...?'). Marca si es 'nit' o bloqueante cuando aplique.",
        },
        {
          type: 'vocab',
          title: 'Vocabulario y etiquetas de revisión',
          items: [
            {
              en: 'nit',
              es: 'detalle menor (no suele bloquear)',
              example: 'Nit: consider renaming this variable for clarity.',
            },
            {
              en: 'might break',
              es: 'podría fallar/romperse',
              example: 'This might break when the input is null.',
            },
            {
              en: 'guard clause / check',
              es: 'condición de guarda/validación',
              example: 'Could you add a check?',
            },
            {
              en: 'extract into a helper function',
              es: 'extraer a una función auxiliar',
              example: 'I suggest extracting this into a helper function.',
            },
            { en: 'LGTM', es: 'Looks Good To Me (aprobado)', example: 'LGTM once the tests pass.' },
            {
              en: 'Nice catch',
              es: 'buen hallazgo',
              example: 'Nice catch, thanks for fixing this.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para revisar PRs',
          items: [
            {
              en: 'Could you add a test for this case?',
              es: '¿Podrías agregar un test para este caso?',
            },
            {
              en: 'This might break when the input is null.',
              es: 'Esto podría fallar cuando la entrada es null.',
            },
            {
              en: 'Nit: consider renaming this variable for clarity.',
              es: 'Detalle menor: considera renombrar esta variable para mayor claridad.',
            },
            {
              en: 'I suggest extracting this into a helper function.',
              es: 'Sugiero extraer esto a una función helper.',
            },
            { en: 'LGTM once the tests pass.', es: 'Aprobado cuando pasen los tests.' },
            {
              en: 'Can you explain why we need this change?',
              es: '¿Puedes explicar por qué necesitamos este cambio?',
            },
            {
              en: 'Nice catch, thanks for fixing this.',
              es: 'Buen hallazgo, gracias por arreglarlo.',
            },
          ],
        },
        {
          type: 'table',
          title: 'De duro a útil',
          columns: ['Comentario duro', 'Comentario útil'],
          rows: [
            ['This is wrong.', 'This might break when the list is empty. Could we add a check?'],
            ['Bad name.', 'Nit: could you rename this to `userId` for clarity?'],
            ['Why?', 'Can you explain why we need this change here?'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l6-e1',
          type: 'choice',
          prompt: 'Quieres pedir un cambio sin sonar agresivo. ¿Qué comentario es mejor?',
          options: [
            'This is bad.',
            'This might break when the input is null. Could you add a guard clause?',
            'Fix this.',
            'Wrong.',
          ],
          answer: 1,
          explanation:
            'Explicas el riesgo y propones una acción concreta: eso es feedback útil y profesional.',
        },
        {
          id: 'm5-l6-e2',
          type: 'builder',
          prompt:
            "Construye: 'Detalle menor: considera renombrar esta variable para mayor claridad.'",
          words: ['Nit:', 'consider renaming', 'this variable', 'for clarity.'],
          answer: 'Nit: consider renaming this variable for clarity.',
          explanation: "'Nit' marca que es un detalle menor; 'consider' suaviza la sugerencia.",
        },
        {
          id: 'm5-l6-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Aprobado cuando pasen los tests.'",
          answer: 'LGTM once the tests pass.',
          accept: ['LGTM once tests pass.', 'Looks good to me once the tests pass.'],
          hint: "Usa 'LGTM once...'",
          explanation: "'LGTM once...' aprueba condicionado a que se cumpla algo específico.",
        },
        {
          id: 'm5-l6-e4',
          type: 'choice',
          prompt: "¿Qué significa 'nit' en un code review?",
          options: [
            'Un bug crítico.',
            'Un detalle menor que no suele bloquear el merge.',
            'Un error de seguridad.',
            'Una solicitud de borrado.',
          ],
          answer: 1,
          explanation:
            "'Nit' (nitpick) es un comentario menor, de estilo o claridad, normalmente no bloqueante.",
        },
        {
          id: 'm5-l6-e5',
          type: 'fix-error',
          prompt: 'Reescribe este comentario para que sea útil y respetuoso.',
          sentence: 'Bad name.',
          answer: 'Nit: could you rename this variable for clarity?',
          accept: [
            'Nit: could you rename this to `userId` for clarity?',
            'Nit: consider renaming this variable for clarity.',
          ],
          hint: "Usa 'Nit:' si es menor y sugiere una acción concreta.",
          explanation:
            'Un buen comentario indica la intención (nit), el punto (nombre) y una sugerencia concreta.',
        },
        {
          id: 'm5-l6-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Puedes explicar por qué necesitamos este cambio?'",
          answer: 'Can you explain why we need this change?',
          accept: [
            'Could you explain why we need this change?',
            'Can you explain why we need this change',
          ],
          hint: "Usa 'Can/Could you explain why...?'",
          explanation:
            'Pedir contexto con respeto ayuda a entender la intención del PR antes de sugerir cambios.',
        },
        {
          id: 'm5-l6-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'This looks good. Could you add a test for the edge case?',
          hint: 'Feedback positivo + petición.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm5-l7',
      slug: 'reuniones-cortas-y-actualizaciones',
      title: 'Reuniones cortas y actualizaciones claras',
      step: 'B1 · Paso 5.7',
      cefr: 'B1',
      summary:
        'Da updates en 30 segundos, pide aclaración, interrumpe con respeto y cierra con próximos pasos.',
      objectives: [
        'Dar una actualización breve con contexto y siguiente paso.',
        'Pedir aclaración o repetir sin interrumpir bruscamente.',
        'Cerrar una reunión con acciones y responsables claros.',
      ],
      pronunciation:
        "Quick update: I finished the fix and I'm testing it now. Sorry to interrupt, could you clarify that?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Se apoya en estructura de standup (M4), peticiones educadas y confirmaciones. Esta lección añade frases para interrumpir, aclarar y cerrar reuniones con próximos pasos.',
        },
        {
          type: 'technique',
          name: 'Participar en reuniones: breve, claro y respetuoso',
          desc: "Updates en 3 partes (ayer/hoy/bloqueo). Para intervenir: 'Sorry to interrupt, but...'. Para confirmar: 'Just to confirm...'. Para cerrar: 'What are the next steps?' y asignar responsables.",
        },
        {
          type: 'vocab',
          title: 'Chunks útiles para reuniones',
          items: [
            {
              en: 'quick update',
              es: 'actualización rápida',
              example: 'Quick update: the feature is ready for review.',
            },
            {
              en: 'sorry to interrupt',
              es: 'disculpa que interrumpa',
              example: 'Sorry to interrupt, but could you clarify that?',
            },
            { en: 'clarify', es: 'aclarar', example: 'Could you clarify that?' },
            {
              en: 'just to confirm',
              es: 'solo para confirmar',
              example: "Just to confirm, we're launching on Monday, right?",
            },
            { en: 'next steps', es: 'próximos pasos', example: 'What are the next steps?' },
            { en: 'take care of', es: 'encargarse de', example: "I'll take care of that." },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases para reuniones',
          items: [
            {
              en: 'Quick update: the feature is ready for review.',
              es: 'Actualización rápida: la función está lista para revisión.',
            },
            {
              en: 'Sorry to interrupt, but could you clarify that?',
              es: 'Disculpa que interrumpa, ¿podrías aclarar eso?',
            },
            {
              en: 'Could you say that again, please?',
              es: '¿Podrías decirlo otra vez, por favor?',
            },
            {
              en: "Just to confirm, we're launching on Monday, right?",
              es: 'Solo para confirmar, lanzamos el lunes, ¿verdad?',
            },
            { en: 'What are the next steps?', es: '¿Cuáles son los próximos pasos?' },
            { en: "I'll take care of that.", es: 'Yo me encargo de eso.' },
          ],
        },
        {
          type: 'table',
          title: 'Interrumpir y aclarar con respeto',
          columns: ['Situación', 'Frase'],
          rows: [
            ['No entendiste', "Sorry, could you clarify what you mean by 'stable'?"],
            ['Necesitas interrumpir', 'Sorry to interrupt, but I have a quick question.'],
            ['Confirmar acuerdo', "Just to confirm, I'll handle the deployment."],
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l7-e1',
          type: 'choice',
          prompt: 'Quieres interrumpir con respeto para hacer una pregunta. ¿Qué dices?',
          options: [
            'Stop.',
            'Sorry to interrupt, but I have a quick question.',
            'Wait now.',
            "I don't care.",
          ],
          answer: 1,
          explanation:
            "'Sorry to interrupt, but...' es una forma educada de entrar en la conversación.",
        },
        {
          id: 'm5-l7-e2',
          type: 'builder',
          prompt: "Construye: 'Actualización rápida: la función está lista para revisión.'",
          words: ['Quick update:', 'the feature', 'is ready', 'for review.'],
          answer: 'Quick update: the feature is ready for review.',
          explanation: "'Quick update' señala que serás breve y directo.",
        },
        {
          id: 'm5-l7-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Solo para confirmar, yo me encargo del despliegue.'",
          answer: "Just to confirm, I'll handle the deployment.",
          accept: [
            'Just to confirm, I will handle the deployment.',
            "Just to confirm, I'll take care of the deployment.",
          ],
          hint: "Usa 'Just to confirm,...'",
          explanation: "'Just to confirm' evita malentendidos al cerrar acciones y responsables.",
        },
        {
          id: 'm5-l7-e4',
          type: 'choice',
          prompt: 'No entendiste un punto técnico. ¿Qué es lo mejor pedir?',
          options: ['Whatever.', 'Could you clarify what you mean by that?', 'I know it.', 'No.'],
          answer: 1,
          explanation:
            "Pedir aclaración es profesional y evita errores: 'Could you clarify what you mean by that?'",
        },
        {
          id: 'm5-l7-e5',
          type: 'builder',
          prompt: "Construye: 'Solo para confirmar, lanzamos el lunes, ¿verdad?'",
          words: ['Just to confirm,', "we're launching", 'on Monday,', 'right?'],
          answer: "Just to confirm, we're launching on Monday, right?",
          explanation:
            'Confirmar acuerdos en voz alta evita malentendidos sobre fechas y responsables.',
        },
        {
          id: 'm5-l7-e6',
          type: 'listen',
          prompt: 'Escucha y escribe la frase para pedir aclaración en una reunión.',
          audioText: 'Could you clarify what you mean by that?',
          answer: 'Could you clarify what you mean by that?',
          accept: ['Could you clarify what you mean by that'],
          hint: "Empieza con 'Could you clarify...'",
          explanation:
            'Frase clave para pedir precisión cuando un término o punto técnico no queda claro.',
        },
      ],
    },
    {
      id: 'm5-l8',
      slug: 'async-avanzado-mensajes-claros',
      title: 'Async avanzado: tickets y mensajes que funcionan',
      step: 'B2 · Paso 5.8',
      cefr: 'B2',
      summary:
        'Escribe tickets, handoffs y actualizaciones async con contexto, estado y siguiente acción claros.',
      objectives: [
        'Redactar un handoff o ticket que otro pueda retomar sin reunión.',
        'Comunicar estado, riesgo y siguiente paso en pocas líneas.',
        'Usar sentence frames para escribir más rápido y claro.',
      ],
      pronunciation:
        "Status: in progress. Blocker: waiting for API access. Next step: I'll deploy once access is granted.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere vocabulario de estado, bloqueos y próximos pasos visto en M4–M5. Aquí se sistematiza en plantillas (frames) para tickets/handoffs async.',
        },
        {
          type: 'technique',
          name: 'Frames para async: rellena los huecos',
          desc: "Plantillas reutilizables: 'Status: [X]. Blocker: [Y]. Next step: [Z].' / 'Context: ... Expected: ... Actual: ...'. Cuanto más concretos los campos, más útil el mensaje.",
        },
        {
          type: 'vocab',
          title: 'Vocabulario para tickets y handoffs',
          items: [
            {
              en: 'status / in progress',
              es: 'estado / en progreso',
              example: 'Status: in progress.',
            },
            {
              en: 'blocker',
              es: 'bloqueo',
              example: 'Blocker: waiting for access to the production database.',
            },
            {
              en: 'next step',
              es: 'próximo paso',
              example: 'Next step: run the migration tonight.',
            },
            {
              en: 'context',
              es: 'contexto',
              example: 'Context: the error happens only on Safari.',
            },
            {
              en: 'handoff',
              es: 'traspaso de trabajo',
              example: 'Handoff: I documented the steps in the ticket.',
            },
            {
              en: 'FYI',
              es: 'para tu información (sin acción inmediata)',
              example: 'FYI: the PR is ready for review.',
            },
            {
              en: 'QA sign-off',
              es: 'aprobación de QA/calidad',
              example: 'Needs QA sign-off before release.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Mensajes async avanzados',
          items: [
            {
              en: 'Status: in progress. Next step: run the migration tonight.',
              es: 'Estado: en progreso. Próximo paso: ejecutar la migración esta noche.',
            },
            {
              en: 'Blocker: waiting for access to the production database.',
              es: 'Bloqueo: esperando acceso a la base de datos de producción.',
            },
            {
              en: 'Context: the error happens only on Safari.',
              es: 'Contexto: el error ocurre solo en Safari.',
            },
            {
              en: 'Handoff: I documented the steps in the ticket.',
              es: 'Traspaso: documenté los pasos en el ticket.',
            },
            {
              en: "FYI: I'll be out tomorrow, but the PR is ready for review.",
              es: 'Para tu info: mañana no estaré, pero el PR está listo para revisión.',
            },
            {
              en: 'Please let me know if you need more details.',
              es: 'Avísame si necesitas más detalles.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Plantilla de handoff/ticket',
          columns: ['Campo', 'Ejemplo'],
          rows: [
            ['Context', "Users can't log in on mobile Safari."],
            ['Status', 'Root cause identified: cookie SameSite setting.'],
            ['Next step', 'Update config and test on staging.'],
            ['Risk/Blocker', 'Needs QA sign-off before release.'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l8-e1',
          type: 'choice',
          prompt: 'Debes dejar un handoff claro. ¿Qué mensaje es mejor?',
          options: [
            'I did some stuff.',
            'Status: fixed locally. Blocker: needs staging access. Next step: deploy after QA sign-off.',
            'Almost done.',
            'Check it.',
          ],
          answer: 1,
          explanation: 'Estado, bloqueo y próximo paso permiten que otro continúe sin reunión.',
        },
        {
          id: 'm5-l8-e2',
          type: 'builder',
          prompt: "Construye: 'Bloqueo: esperando acceso a la base de datos de producción.'",
          words: ['Blocker:', 'waiting for access', 'to the production database.'],
          answer: 'Blocker: waiting for access to the production database.',
          explanation: 'Nombrar el bloqueo explícitamente ayuda a desbloquearlo rápido.',
        },
        {
          id: 'm5-l8-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Para tu info: el PR está listo para revisión.'",
          answer: 'FYI: the PR is ready for review.',
          accept: [
            'FYI, the PR is ready for review.',
            'FYI: the pull request is ready for review.',
          ],
          hint: "Empieza con 'FYI:'.",
          explanation:
            "'FYI' (for your information) comparte información sin pedir acción inmediata.",
        },
        {
          id: 'm5-l8-e4',
          type: 'choice',
          prompt:
            "¿Qué completa mejor el sentence frame? 'I'm working on ___, I expect to finish by ___.'",
          options: [
            'things / soon',
            'the login fix / tomorrow afternoon',
            'stuff / later',
            'it / maybe',
          ],
          answer: 1,
          explanation:
            'Los marcos funcionan mejor con detalles concretos: qué tarea y cuándo esperas terminar.',
        },
        {
          id: 'm5-l8-e5',
          type: 'write',
          prompt:
            "Escribe en inglés: 'Estado: en progreso. Próximo paso: ejecutar la migración esta noche.'",
          answer: 'Status: in progress. Next step: run the migration tonight.',
          accept: [
            'Status: in progress. Next step: run the migration tonight',
            'Status: In progress. Next step: run the migration tonight.',
          ],
          hint: "Usa el frame 'Status: ... Next step: ...'",
          explanation:
            'Plantillas de estado y siguiente paso hacen los handoffs claros sin necesidad de reunión.',
        },
        {
          id: 'm5-l8-e6',
          type: 'builder',
          prompt:
            "Construye: 'Para tu info: mañana no estaré, pero el PR está listo para revisión.'",
          words: ['FYI:', "I'll be out tomorrow,", 'but the PR is', 'ready for review.'],
          answer: "FYI: I'll be out tomorrow, but the PR is ready for review.",
          explanation:
            'Mensaje async útil: comparte contexto y estado del trabajo para que el equipo pueda continuar.',
        },
        {
          id: 'm5-l8-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I will follow up with the client after the standup.',
          hint: 'follow up with + momento.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l4',
      slug: 'micro-repaso-comunicacion-b1-b2',
      title: 'Micro-repaso: comunicación B1-B2',
      step: 'B1 · Paso 5.9 · Checkpoint',
      cefr: 'B1',
      summary:
        'Repaso mixto de PRs, async, incidentes, conectores y estimaciones con drills rápidos.',
      objectives: [
        'Practicar frases profesionales en situaciones reales de equipo.',
        'Usar conectores y estructuras claras bajo presión.',
        'Reforzar vocabulario de reviews, bloqueos y estimaciones.',
      ],
      pronunciation:
        "LGTM once tests pass. I'm blocked by API access. Basically, we need to reduce the scope.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Recomendado tras completar las lecciones clave de M4–M5 (PRs, async, incidentes, conectores y estimaciones). Este repaso mezcla esos temas: si algo no sale, vuelve a la lección específica.',
        },
        {
          type: 'technique',
          name: 'Estrategia de repaso',
          desc: "Responde con estructura simple: contexto/hecho → impacto o estado → siguiente paso. Usa frames conocidos ('Status...', 'I'm blocked by...', 'It will take... assuming...') para ganar claridad bajo presión.",
        },
        {
          type: 'phrases',
          title: 'Frases cortas que siempre funcionan',
          items: [
            {
              en: 'Status: in progress. Next step: open the PR.',
              es: 'Estado: en progreso. Próximo paso: abrir el PR.',
            },
            {
              en: "I'm blocked by API access. Could you help me?",
              es: 'Estoy bloqueado por el acceso a la API. ¿Podrías ayudarme?',
            },
            {
              en: 'Basically, we need to fix the root cause first.',
              es: 'Básicamente, necesitamos arreglar la causa raíz primero.',
            },
            {
              en: 'Actually, the issue is on the frontend.',
              es: 'En realidad, el problema está en el frontend.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Sentence frames útiles',
          columns: ['Situación', 'Marco'],
          rows: [
            ['Estado', 'Status: [estado]. Next step: [acción].'],
            ['Bloqueo', "I'm blocked by [causa]. I need [ayuda]."],
            ['Estimación', 'It will take [rango], assuming [supuesto].'],
            ['PR', 'This might break when [caso]. Could you [acción]?'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l4-e1',
          type: 'choice',
          prompt: 'Quieres aprobar un PR condicionado a que pasen los tests. ¿Qué dices?',
          options: ['Ship now.', 'LGTM once the tests pass.', 'It is bad.', 'No merge.'],
          answer: 1,
          explanation: "'LGTM once the tests pass' aprueba con una condición clara.",
        },
        {
          id: 'm8-l4-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Estoy bloqueado por el acceso a la API.'",
          answer: "I'm blocked by API access.",
          accept: ['I am blocked by API access.', "I'm blocked by access to the API."],
          hint: "Usa 'I'm blocked by...'",
          explanation: 'Comunica el bloqueo y su causa de forma directa.',
        },
        {
          id: 'm8-l4-e3',
          type: 'builder',
          prompt: "Construye: 'Básicamente, necesitamos reducir el alcance.'",
          words: ['Basically,', 'we need', 'to reduce', 'the scope.'],
          answer: 'Basically, we need to reduce the scope.',
          explanation:
            "'Basically' resume la idea principal; 'reduce the scope' es reducir alcance.",
        },
        {
          id: 'm8-l4-e4',
          type: 'choice',
          prompt: 'Quieres corregir algo: el problema no es backend, es frontend. ¿Qué dices?',
          options: [
            "Anyway, it's the frontend.",
            'Actually, the issue is in the frontend.',
            'Currently, the issue is in the frontend.',
            'I mean backend frontend.',
          ],
          answer: 1,
          explanation:
            "'Actually' se usa para corregir: 'en realidad, el problema está en el frontend'.",
        },
        {
          id: 'm8-l4-e5',
          type: 'write',
          prompt:
            "Escríbelo en inglés: 'Tomará dos o tres días, suponiendo que la API sea estable.'",
          answer: 'It will take two to three days, assuming the API is stable.',
          accept: [
            "It'll take two to three days, assuming the API is stable.",
            'It will take two to three days assuming the API is stable.',
          ],
          hint: "Usa 'It will take...' y 'assuming...'",
          explanation: 'Rango + supuesto es la forma profesional de estimar.',
        },
        {
          id: 'm8-l4-e6',
          type: 'builder',
          prompt:
            "Construye: 'Esto podría fallar cuando la entrada es null. ¿Podrías agregar una validación?'",
          words: ['This might break', 'when the input is null.', 'Could you add', 'a validation?'],
          answer: 'This might break when the input is null. Could you add a validation?',
          explanation: 'Feedback de PR útil: riesgo concreto + sugerencia accionable.',
        },
        {
          id: 'm8-l4-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'We rolled out the feature and followed up with the team.',
          hint: 'Dos phrasal verbs de entrega.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm5-l10',
      slug: 'practica-prs-async-y-feedback',
      title: 'Práctica: PRs, async y feedback claro',
      step: 'B1-B2 · Paso 5.10 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar comunicación escrita: commits/PR, mensajes async y feedback accionable.',
      objectives: [
        'Usar frases claras para PRs, bloqueos y seguimiento.',
        'Escribir updates async con estado y siguiente paso.',
        'Dar feedback de revisión concreto y respetuoso.',
      ],
      pronunciation:
        "LGTM once the tests pass. I'm blocked by API access. Could you add a test for this case?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m5-l1 (commits/PRs), m5-l2 (Slack/async), m5-l6 (comentarios de PR) y m5-l8 (handoffs/tickets). Esta práctica usa solo chunks y estructuras ya enseñados.',
        },
        {
          type: 'technique',
          name: 'Escribir para que otros actúen',
          desc: "Sé específico: estado/bloqueo + siguiente paso en async; en PRs, riesgo + sugerencia concreta ('This might break...', 'Could you add...') o aprobación clara ('LGTM once...').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            { en: 'LGTM once the tests pass.', es: 'Aprobado cuando pasen los tests.' },
            { en: "I'm blocked by API access.", es: 'Estoy bloqueado por el acceso a la API.' },
            {
              en: 'Status: in progress. Next step: open the PR.',
              es: 'Estado: en progreso. Próximo paso: abrir el PR.',
            },
            {
              en: 'Could you add a test for this case?',
              es: '¿Podrías agregar un test para este caso?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l10-e1',
          type: 'choice',
          prompt: 'Quieres aprobar un PR condicionado a que pasen los tests. ¿Qué dices?',
          options: ['Ship now.', 'LGTM once the tests pass.', 'It is bad.', 'No merge.'],
          answer: 1,
          explanation: "'LGTM once the tests pass' aprueba con una condición clara.",
        },
        {
          id: 'm5-l10-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Estoy bloqueado por el acceso a la API.'",
          answer: "I'm blocked by API access.",
          accept: ['I am blocked by API access.', "I'm blocked by access to the API."],
          hint: "Usa 'I'm blocked by...'",
          explanation: 'Comunica bloqueo y causa de forma directa.',
        },
        {
          id: 'm5-l10-e3',
          type: 'builder',
          prompt: "Construye: 'Estado: en progreso. Próximo paso: abrir el PR.'",
          words: ['Status: in progress.', 'Next step:', 'open the PR.'],
          answer: 'Status: in progress. Next step: open the PR.',
          explanation: 'Marco async claro: estado actual y siguiente acción.',
        },
        {
          id: 'm5-l10-e4',
          type: 'choice',
          prompt: 'Quieres pedir un test de forma educada en un PR. ¿Qué opción es mejor?',
          options: [
            'Add test now.',
            'Could you add a test for this case?',
            'No tests.',
            'Test missing.',
          ],
          answer: 1,
          explanation: "'Could you add...?' es una sugerencia clara y respetuosa.",
        },
        {
          id: 'm5-l10-e5',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Haré seguimiento mañana.'",
          answer: "I'll follow up tomorrow.",
          accept: ['I will follow up tomorrow.'],
          hint: "Usa 'follow up'.",
          explanation: "'Follow up' indica que harás seguimiento en un momento concreto.",
        },
        {
          id: 'm5-l10-e6',
          type: 'builder',
          prompt:
            "Construye: 'Esto podría fallar cuando la entrada es null. ¿Podrías agregar una validación?'",
          words: ['This might break', 'when the input is null.', 'Could you add', 'a validation?'],
          answer: 'This might break when the input is null. Could you add a validation?',
          explanation: 'Feedback de PR útil: riesgo concreto + sugerencia accionable.',
        },
        {
          id: 'm5-l10-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I left actionable feedback on the pull request this morning.',
          hint: 'feedback accionable.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm5-l11',
      slug: 'practica-entrevistas-y-demos',
      title: 'Práctica: entrevistas y demos técnicas',
      step: 'B1-B2 · Paso 5.11 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar m5-l3 y m5-l5: hablar de experiencia, trade-offs y explicar un cambio o demo con claridad.',
      objectives: [
        'Describir experiencia y decisiones técnicas con frases ya vistas.',
        'Explicar un cambio (antes/ahora) y su impacto.',
        'Hacer preguntas claras en contexto de entrevista o demo.',
      ],
      pronunciation:
        'I have three years of experience. Let me walk you through the change. Now, it handles the error correctly.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m5-l3 (entrevistas técnicas) y m5-l5 (explicar cambios y dar una demo corta). Esta práctica usa solo chunks y estructuras ya enseñados en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Contar experiencia y explicar un cambio',
          desc: "Entrevista: experiencia ('I have... years of experience'), decisiones/trade-offs ('The main trade-off was...'), preguntas. Demo: guía ('Let me walk you through...'), antes/ahora ('Before..., Now...') e impacto.",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: 'I have three years of experience as a backend developer.',
              es: 'Tengo tres años de experiencia como desarrollador backend.',
            },
            {
              en: 'The main trade-off was latency versus cost.',
              es: 'El principal compromiso fue latencia frente a coste.',
            },
            {
              en: 'Let me walk you through the change.',
              es: 'Déjame explicarte el cambio paso a paso.',
            },
            {
              en: 'Now, it handles the error correctly.',
              es: 'Ahora, maneja el error correctamente.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l11-e1',
          type: 'choice',
          prompt: 'En una entrevista quieres mencionar tu experiencia. ¿Qué opción encaja?',
          options: [
            'I have three years of experience as a backend developer.',
            'I experience three years backend.',
            'Three years I am experience.',
            'I have experience three years developer.',
          ],
          answer: 0,
          explanation: 'Frase modelo clara para hablar de experiencia en una entrevista (m5-l3).',
        },
        {
          id: 'm5-l11-e2',
          type: 'builder',
          prompt: "Construye: 'Déjame explicarte el cambio paso a paso.'",
          words: ['Let me', 'walk you through', 'the change.'],
          answer: 'Let me walk you through the change.',
          explanation:
            "'Walk you through' es una forma natural de guiar a alguien por un cambio o demo.",
        },
        {
          id: 'm5-l11-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Ahora, maneja el error correctamente.'",
          answer: 'Now, it handles the error correctly.',
          accept: ['Now it handles the error correctly.'],
          hint: "Contrasta el estado actual: 'Now, it handles...'",
          explanation: "En una demo, 'Now...' muestra el resultado después del cambio.",
        },
        {
          id: 'm5-l11-e4',
          type: 'choice',
          prompt: 'Quieres explicar una decisión técnica en una entrevista. ¿Qué dices?',
          options: [
            'The main trade-off was latency versus cost.',
            'The main bug was latency versus cost.',
            'The main test was latency versus cost.',
            'The main deploy was latency versus cost.',
          ],
          answer: 0,
          explanation: "'Trade-off' describe un compromiso entre dos factores (m5-l3).",
        },
        {
          id: 'm5-l11-e5',
          type: 'builder',
          prompt: "Construye: '¿Podrías contarme más sobre la rotación de guardias?'",
          words: ['Could you tell me more', 'about the on-call', 'rotation?'],
          answer: 'Could you tell me more about the on-call rotation?',
          explanation: 'Pregunta educada y específica, útil al final de una entrevista.',
        },
        {
          id: 'm5-l11-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Antes de este cambio, la app fallaba al iniciar sesión.'",
          answer: 'Before this change, the app crashed on login.',
          accept: ['Before this change the app crashed on login.'],
          hint: "Usa 'Before this change...' y pasado simple 'crashed'.",
          explanation:
            'Describir el estado anterior ayuda a explicar el valor del cambio en una demo.',
        },
        {
          id: 'm5-l11-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I built a small service and explained the trade-offs in the demo.',
          hint: 'Explicar decisiones técnicas.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm5-l12',
      slug: 'practica-conectores-y-reuniones-cortas',
      title: 'Práctica: conectores y reuniones cortas',
      step: 'B1 · Paso 5.12 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar m5-l4 y m5-l7: conectores/discourse markers y frases para reuniones breves y actualizaciones.',
      objectives: [
        'Usar conectores comunes para explicar, corregir o resumir con claridad.',
        'Dar updates breves y pedir aclaración o confirmación en reuniones.',
        'Cerrar con próximos pasos o acciones de forma natural.',
      ],
      pronunciation:
        'Actually, the issue was caused by a typo. Quick update: the feature is ready for review. What are the next steps?',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m5-l4 (conectores y discourse markers) y m5-l7 (reuniones cortas y actualizaciones claras). Esta práctica usa solo chunks y estructuras ya enseñados en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Conectar ideas y ser claro en vivo',
          desc: "Conectores: 'actually' corrige, 'basically' resume, 'I mean' aclara, 'anyway' retoma el tema. Reuniones: 'Quick update...', 'Just to confirm...', 'Sorry to interrupt...', 'What are the next steps?'",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: 'Actually, the issue was caused by a typo.',
              es: 'En realidad, el problema fue causado por un error tipográfico.',
            },
            {
              en: 'Basically, we need to clear the cache.',
              es: 'Básicamente, necesitamos limpiar la caché.',
            },
            {
              en: 'Quick update: the feature is ready for review.',
              es: 'Actualización rápida: la función está lista para revisión.',
            },
            {
              en: "Just to confirm, we're launching on Monday, right?",
              es: 'Solo para confirmar, lanzamos el lunes, ¿verdad?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm5-l12-e1',
          type: 'choice',
          prompt:
            'Quieres corregir una idea y dar la causa real del problema. ¿Qué conector encaja?',
          options: [
            'Actually, the issue was caused by a typo.',
            'Anyway, the issue was caused by a typo.',
            'Basically, the issue was caused by a typo.',
            'You know, the issue was caused by a typo.',
          ],
          answer: 0,
          explanation: "'Actually' se usa para corregir o precisar información (m5-l4).",
        },
        {
          id: 'm5-l12-e2',
          type: 'builder',
          prompt: "Construye: 'Actualización rápida: la función está lista para revisión.'",
          words: ['Quick update:', 'the feature is', 'ready for review.'],
          answer: 'Quick update: the feature is ready for review.',
          explanation:
            "'Quick update:' es una forma directa de dar una actualización breve (m5-l7).",
        },
        {
          id: 'm5-l12-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Básicamente, necesitamos limpiar la caché.'",
          answer: 'Basically, we need to clear the cache.',
          accept: ['Basically we need to clear the cache.'],
          hint: "Usa 'Basically, ...'",
          explanation: "'Basically' resume la idea principal de forma sencilla (m5-l4).",
        },
        {
          id: 'm5-l12-e4',
          type: 'choice',
          prompt: 'En una reunión quieres confirmar algo antes de seguir. ¿Qué dices?',
          options: [
            "Just to confirm, we're launching on Monday, right?",
            "Anyway, we're launching on Monday.",
            "You know, we're launching on Monday.",
            'I mean, launch Monday maybe.',
          ],
          answer: 0,
          explanation: "'Just to confirm...' sirve para verificar que entendiste bien (m5-l7).",
        },
        {
          id: 'm5-l12-e5',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Cuáles son los próximos pasos?'",
          answer: 'What are the next steps?',
          accept: ['What are the next steps'],
          hint: 'Pregunta directa sobre acciones siguientes.',
          explanation: 'Cierra reuniones o conversaciones aclarando qué sigue (m5-l7).',
        },
        {
          id: 'm5-l12-e6',
          type: 'builder',
          prompt: "Construye: 'De todos modos, volvamos al tema principal.'",
          words: ['Anyway,', 'back to', 'the main issue.'],
          answer: 'Anyway, back to the main issue.',
          explanation:
            "'Anyway' ayuda a retomar el tema principal después de una digresión (m5-l4).",
        },
        {
          id: 'm5-l12-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'First, we discussed the bug; then we agreed on the next step.',
          hint: 'Secuencia con First / then.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
  ],
}
