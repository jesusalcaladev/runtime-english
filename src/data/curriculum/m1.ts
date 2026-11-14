import type { Module } from "../../lib/types";

export const m1: Module = {
  id: "m1",
  code: "MOD 01",
  level: "A1-A2",
  title: "Cimientos, Números y Preguntas",
  shortTitle: "Verbos, Números & Preguntas",
  description:
    "Los 10 verbos reyes, los 20 verbos técnicos, números y fechas, y cómo preguntar y aclarar sin trabarte.",
  sessions: [
    {
      id: "m1-l1",
      slug: "verbos-reyes",
      title: "Los 10 Verbos Reyes en Contexto Técnico",
      step: "A1 · Paso 1.1",
      cefr: "A1",
      minutes: 10,
      summary:
        "Domina cómo se comportan los 10 verbos fundamentales cuando hablas de servidores, funciones y errores.",
      objectives: [
        "Usar be, have, do, say, go, can, want, need, know y think.",
        "Aplicar la -s de tercera persona al hablar de código.",
        "Construir frases de debugging con 'I think'.",
      ],
      pronunciation:
        "The server is down and the error says permission denied.",
      blocks: [
        {
          type: "technique",
          name: "Regla de la 3ª Persona en Código",
          desc: "Cuando hablas de una pieza del sistema (the server, the function, the API), el verbo va en tercera persona y añade -S: 'The function has...', 'The error says...', 'The code goes...', 'This library needs...'. Con 'can', el modal no lleva -s: 'The API can handle...'.",
        },
        {
          type: "vocab",
          title: "Los 10 verbos reyes",
          items: [
            { en: "to be", es: "ser / estar (estado del sistema)", example: "The server is down.", note: "El servidor está caído." },
            { en: "to have", es: "tener (características)", example: "This function has two parameters.", note: "Esta función tiene dos parámetros." },
            { en: "to do", es: "hacer (ejecutar acción)", example: "The script does nothing.", note: "El script no hace nada." },
            { en: "to say", es: "decir / especificar (logs)", example: "The error says permission denied.", note: "El error dice permiso denegado." },
            { en: "to go", es: "ir / moverse (flujo del código)", example: "The code goes into an infinite loop.", note: "El código entra en un bucle infinito." },
            { en: "can", es: "poder (capacidad del sistema)", example: "This API can handle 1,000 requests per second.", note: "Esta API puede manejar 1.000 peticiones por segundo." },
            { en: "to want", es: "querer (requerimiento)", example: "The client wants a login page.", note: "El cliente quiere una página de login." },
            { en: "to need", es: "necesitar (dependencia)", example: "This library needs Node 18.", note: "Esta librería necesita Node 18." },
            { en: "to know", es: "saber / conocer", example: "I don't know why this broke.", note: "No sé por qué se rompió esto." },
            { en: "to think", es: "pensar (debugging)", example: "I think the issue is in the cache.", note: "Creo que el problema está en la caché." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Truco de conversación",
          body: "Si no recuerdas el verbo exacto, usa 'it is / it has / it needs'. En una call técnica, una frase simple bien conjugada comunica más que una frase compleja mal armada.",
        },
      ],
      exercises: [
        {
          id: "m1-l1-e1",
          type: "choice",
          prompt:
            "Completa el reporte de error: 'This library _____ Node 18 to run properly.'",
          options: ["need", "needs", "is need", "needing"],
          answer: 1,
          explanation:
            "'This library' equivale a 'it' (3ª persona singular), por lo que 'need' lleva -s: 'needs'.",
        },
        {
          id: "m1-l1-e2",
          type: "choice",
          prompt:
            "Elige la frase técnicamente correcta sobre capacidad del sistema:",
          options: [
            "This API cans handle 1,000 requests per second",
            "This API can handles 1,000 requests per second",
            "This API can handle 1,000 requests per second",
            "This API is can handle 1,000 requests per second",
          ],
          answer: 2,
          explanation:
            "'can' es un modal invariable: nunca lleva -s y el verbo siguiente va en forma base ('handle').",
        },
        {
          id: "m1-l1-e3",
          type: "builder",
          prompt:
            "Construye la frase de debugging: 'Creo que el problema está en la caché.'",
          words: ["I think", "the issue", "is in", "the cache."],
          answer: "I think the issue is in the cache.",
          explanation:
            "Estructura limpia: sujeto + verbo ('I think') + cláusula ('the issue is in the cache').",
        },
        {
          id: "m1-l1-e4",
          type: "write",
          prompt: "Escribe en inglés: 'La función tiene dos parámetros.'",
          answer: "The function has two parameters.",
          accept: [
            "This function has two parameters.",
            "The function has two parameters",
          ],
          hint: "El sujeto es 'the function' (it), así que 'have' se convierte en 'has'.",
          explanation:
            "Tercera persona singular: 'The function has two parameters'. Este es el patrón que usarás en documentación y code reviews.",
        },
        {
          id: "m1-l1-e5",
          type: "choice",
          prompt: "Completa: 'The script _____ nothing when I click the button.'",
          options: ["do", "does", "is do", "doing"],
          answer: 1,
          explanation:
            "'The script' es tercera persona singular, así que usa 'does': 'The script does nothing'. Es una forma simple y muy común de reportar un fallo.",
        },
        {
          id: "m1-l1-e6",
          type: "write",
          prompt: "Escríbelo en inglés de forma natural: 'No sé por qué se rompió esto.'",
          answer: "I don't know why this broke.",
          accept: [
            "I do not know why this broke.",
            "I don't know why this is broken.",
          ],
          hint: "Usa 'I don't know why...'",
          explanation:
            "Frase honesta y muy útil en debugging. Sonar natural también es admitir con claridad lo que no sabes.",
        },
        {
          id: "m1-l1-e7",
          type: "listen",
          prompt: "Escucha y escribe la frase (listening/dictado).",
          audioText: "The server is down.",
          answer: "The server is down.",
          accept: ["The server is down"],
          hint: "Empieza con 'The server...'",
          explanation:
            "Práctica de listening: escucha la frase y escríbela. Presta atención a 'is' (estado actual del servidor).",
        },
        {
          id: "m1-l1-e8",
          type: "fill-blank",
          prompt: "Completa los espacios con las formas correctas.",
          template: "I ___ the issue is in the cache because the function ___ two parameters.",
          blanks: ["think", "has"],
          hint: "Primera persona: 'think'. Tercera persona: 'has'.",
          explanation:
            "Repaso en contexto: 'I think...' (opinión/debugging) y 'the function has...' (tercera persona singular).",
        },
      ],
    },
    {
      id: "m1-l2",
      slug: "verbos-tecnicos",
      title: "Los 20 Verbos Técnicos Diarios",
      step: "A2 · Paso 1.2",
      cefr: "A2",
      minutes: 12,
      summary:
        "Las acciones exactas que ejecutas en tu terminal, IDE y repositorio Git, con el imperativo que aparece en cualquier README.",
      objectives: [
        "Reconocer los 20 verbos de terminal más frecuentes.",
        "Entender el imperativo de documentación y READMEs.",
        "Describir qué hace una función en presente simple.",
      ],
      pronunciation:
        "Pull the latest version, fix the bug locally, and push your changes.",
      blocks: [
        {
          type: "technique",
          name: "Imperativo Técnico (Documentación y READMEs)",
          desc: "Cuando lees instrucciones en inglés ('Run npm install', 'Push your changes', 'Fetch the data'), el verbo va al inicio en forma base, sin sujeto. No es falta de cortesía: es el estándar.",
        },
        {
          type: "vocab",
          title: "20 verbos del día a día",
          items: [
            { en: "run", es: "ejecutar (código, script)", example: "Run npm install first." },
            { en: "build", es: "compilar / construir", example: "The build failed." },
            { en: "deploy", es: "desplegar", example: "We deploy every Friday." },
            { en: "push", es: "subir código", example: "Push your changes." },
            { en: "pull", es: "traer cambios del remoto", example: "Pull the latest version." },
            { en: "commit", es: "confirmar cambios en Git", example: "Did you commit your code?" },
            { en: "merge", es: "fusionar ramas", example: "Merge the PR." },
            { en: "break", es: "romper / funcionar mal", example: "This update breaks the app." },
            { en: "fix", es: "arreglar", example: "Fix the bug before shipping." },
            { en: "test", es: "probar", example: "Test it locally first." },
            { en: "debug", es: "depurar", example: "I'm debugging this function." },
            { en: "log", es: "registrar / ver en consola", example: "Log the response." },
            { en: "return", es: "devolver (valor)", example: "This function returns a promise." },
            { en: "call", es: "llamar (función, API)", example: "Call the API with the ID." },
            { en: "pass", es: "pasar (argumento)", example: "Pass the user ID as a parameter." },
            { en: "throw", es: "lanzar (error)", example: "Throw an error if invalid." },
            { en: "catch", es: "capturar (error)", example: "Catch the exception." },
            { en: "fetch", es: "obtener (datos)", example: "Fetch the data from the database." },
            { en: "handle", es: "manejar (evento/error)", example: "Handle the click event." },
            { en: "update", es: "actualizar", example: "Update the state." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Aprende cómodo: verbo + objeto",
          body: "No memorices listas sueltas. Aprende bloques naturales: 'run the tests', 'push the changes', 'open a PR', 'fetch the data'. Si piensas en chunks, hablas más rápido y con menos esfuerzo.",
        },
      ],
      exercises: [
        {
          id: "m1-l2-e1",
          type: "choice",
          prompt:
            "¿Qué verbo técnico significa 'obtener datos desde una API o base de datos'?",
          options: ["throw", "fetch", "merge", "log"],
          answer: 1,
          explanation:
            "'fetch' significa obtener o traer datos (ej: 'Fetch the data from the database').",
        },
        {
          id: "m1-l2-e2",
          type: "choice",
          prompt:
            "Completa la instrucción de manejo de errores: '_____ an error if the token is invalid.'",
          options: ["Catch", "Throw", "Merge", "Deploy"],
          answer: 1,
          explanation:
            "'Throw an error' significa lanzar una excepción cuando una validación falla; 'catch' es capturarla.",
        },
        {
          id: "m1-l2-e3",
          type: "builder",
          prompt: "Construye: 'Esta función devuelve una promesa.'",
          words: ["This function", "returns", "a promise."],
          answer: "This function returns a promise.",
          explanation:
            "Presente simple para describir qué hace el código: 'This function returns a promise'.",
        },
        {
          id: "m1-l2-e4",
          type: "write",
          prompt: "Escribe la instrucción: 'Ejecuta los tests antes de desplegar.'",
          answer: "Run the tests before you deploy.",
          accept: [
            "Run tests before you deploy.",
            "Run the tests before deploying.",
          ],
          hint: "Empieza con el verbo en forma base: 'Run...'.",
          explanation:
            "El imperativo técnico va al inicio y sin sujeto. 'Before you deploy' deja claro el orden de las acciones.",
        },
        {
          id: "m1-l2-e5",
          type: "choice",
          prompt: "Quieres decir 'trae los últimos cambios del remoto'. ¿Qué verbo usas?",
          options: ["push", "pull", "commit", "throw"],
          answer: 1,
          explanation:
            "'Pull' trae cambios desde el remoto; 'push' los envía. Confundirlos es muy común al principio, así que fija el par: pull = traer, push = subir.",
        },
        {
          id: "m1-l2-e6",
          type: "builder",
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ["Pull", "the latest changes", "and run", "the tests."],
          answer: "Pull the latest changes and run the tests.",
          explanation:
            "Dos imperativos conectados con 'and': instrucciones claras y naturales, igual que en un README.",
        },
        {
          id: "m1-l2-e7",
          type: "speak",
          prompt: "Pronuncia esta instrucción técnica en voz alta.",
          answer: "Run the tests before you deploy.",
          accept: ["Run tests before you deploy."],
          hint: "Enfócate en el ritmo: Run the tests / before you deploy.",
          explanation:
            "Práctica de speaking: decir instrucciones claras es clave en trabajo en equipo. Usa el micrófono o escribe si no está disponible.",
        },
        {
          id: "m1-l2-e8",
          type: "dialogue-order",
          prompt: "Ordena este mini diálogo de trabajo.",
          lines: [
            "Can you pull the latest changes?",
            "Sure. I pulled them and I'm running the tests now.",
            "Great. Let me know if the build passes.",
          ],
          explanation:
            "Diálogos claros: petición → confirmación con estado actual → seguimiento. Útil para chat y llamadas.",
        },
        {
          id: "m1-l2-e9",
          type: "fix-error",
          prompt: "Corrige el error en esta instrucción de README.",
          sentence: "Please to run the tests before deploy.",
          answer: "Please run the tests before deploying.",
          accept: ["Please run the tests before you deploy."],
          hint: "Imperativo: 'run' sin 'to'. Revisa la segunda parte.",
          explanation:
            "En imperativos no usamos 'to' antes del verbo ('run', no 'to run'). 'Before deploying' o 'before you deploy' son naturales.",
        },
      ],
    },
    {
      id: "m1-l3",
      slug: "numeros-versiones-fechas",
      title: "Números, versiones y fechas sin trabarte",
      step: "A2 · Paso 1.3",
      cefr: "A2",
      minutes: 9,
      summary:
        "Di versiones, cantidades, horas y fechas con naturalidad en una call, un changelog o un ticket.",
      objectives: [
        "Leer versiones y decimales con 'point', no con 'comma'.",
        "Decir fechas y horas en el formato que usa un equipo internacional.",
        "Expresar rangos y porcentajes sin bloquear la conversación.",
      ],
      pronunciation:
        "Version two point four point one was released on March third at ten thirty a.m.",
      blocks: [
        {
          type: "technique",
          name: "Cómo se leen los números técnicos",
          desc: "Las versiones se leen con 'point': 2.4.1 → 'two point four point one'. En Estados Unidos la fecha March 3rd se dice 'March third'; en Reino Unido también oirás 'the third of March'. Las horas se dicen 'ten thirty', no 'ten and thirty'.",
        },
        {
          type: "vocab",
          title: "Números que aparecen cada día",
          items: [
            { en: "version 2.4.1", es: "versión 2.4.1", example: "We released version 2.4.1 today.", note: "Se dice 'two point four point one'." },
            { en: "1,000 requests", es: "1.000 peticiones", example: "The API handles 1,000 requests per second." },
            { en: "3.14", es: "3,14", example: "Pi is approximately three point one four." },
            { en: "50%", es: "50 %", example: "The cache hit rate is fifty percent." },
            { en: "10:30 a.m.", es: "10:30 a. m.", example: "The standup is at ten thirty a.m." },
            { en: "March 3rd", es: "3 de marzo", example: "The release is scheduled for March third." },
            { en: "2–4 minutes", es: "de 2 a 4 minutos", example: "The deploy takes from two to four minutes." },
            { en: "1st / 2nd / 3rd", es: "1.º / 2.º / 3.º", example: "This is our third release this month." },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "No digas 'two comma four'",
          body: "En inglés, la coma separa miles y el punto separa decimales. Para versiones y números decimales usa 'point': 'two point four'. Si dices 'comma', tu interlocutor pensará en una lista.",
        },
      ],
      exercises: [
        {
          id: "m1-l3-e1",
          type: "choice",
          prompt: "¿Cómo se lee 'v2.4.1' en una call?",
          options: [
            "version two point four point one",
            "version two comma four comma one",
            "version two four one",
            "version second point fourth point first",
          ],
          answer: 0,
          explanation:
            "Las versiones se leen con 'point' entre cada número: 'two point four point one'.",
        },
        {
          id: "m1-l3-e2",
          type: "choice",
          prompt: "El deploy está programado para el 3 de marzo. ¿Cuál es la opción natural?",
          options: [
            "The deploy is scheduled for March 3rd.",
            "The deploy is scheduled in March 3rd.",
            "The deploy is scheduled on March third day.",
            "The deploy is scheduled to March 3rd.",
          ],
          answer: 0,
          explanation:
            "Para una fecha programada se usa 'for': 'scheduled for March 3rd'. También puedes decir 'on March 3rd' si hablas del día concreto.",
        },
        {
          id: "m1-l3-e3",
          type: "builder",
          prompt: "Construye: 'El despliegue tarda de 2 a 4 minutos.'",
          words: ["The deploy", "takes", "from 2 to 4", "minutes."],
          answer: "The deploy takes from 2 to 4 minutes.",
          explanation:
            "'From X to Y' expresa un rango. En una call puedes decir 'from two to four minutes'.",
        },
        {
          id: "m1-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'La versión 2.0 se lanzó el 3 de marzo.'",
          answer: "Version 2.0 was released on March 3rd.",
          accept: [
            "Version 2.0 was released on March 3.",
            "Version two point zero was released on March 3rd.",
          ],
          hint: "Usa 'was released on' + la fecha.",
          explanation:
            "'Was released' es pasado simple en voz pasiva; 'on' acompaña al día concreto.",
        },
        {
          id: "m1-l3-e5",
          type: "choice",
          prompt: "¿Cómo dices 'la reunión es a las 10:30 a. m.' de forma natural?",
          options: [
            "The meeting is in ten thirty a.m.",
            "The meeting is at ten thirty a.m.",
            "The meeting is on ten thirty a.m.",
            "The meeting is to ten thirty a.m.",
          ],
          answer: 1,
          explanation:
            "Para horas usamos 'at': 'at ten thirty a.m.'. Preposiciones pequeñas, pero hacen que suenes mucho más natural.",
        },
        {
          id: "m1-l3-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'La tasa de acierto de caché es 50%.'",
          answer: "The cache hit rate is fifty percent.",
          accept: [
            "The cache hit rate is 50 percent.",
            "The cache hit rate is 50%.",
          ],
          hint: "Puedes escribir 'fifty percent' o '50%'.",
          explanation:
            "Decir porcentajes con calma ('fifty percent') te ayuda a comunicar números con claridad en una call.",
        },
      ],
    },
    {
      id: "m1-l4",
      slug: "preguntar-y-aclarar",
      title: "Preguntar y pedir aclaraciones sin miedo",
      step: "A2 · Paso 1.4",
      cefr: "A2",
      minutes: 9,
      summary:
        "Las preguntas de rescate que necesitas cuando no entiendes una palabra, un acento o una tarea.",
      objectives: [
        "Preguntar el significado de una palabra técnica.",
        "Pedir que repitan o expliquen algo sin perder profesionalidad.",
        "Confirmar que entendiste la tarea correcta.",
      ],
      pronunciation:
        "Could you explain that again? I didn't catch the last part.",
      blocks: [
        {
          type: "technique",
          name: "Preguntas de rescate",
          desc: "Pedir aclaración es parte del trabajo. Usa 'What does X mean?', 'Could you explain that again?', 'How do I run the tests?' y 'Do you mean staging?'. Son preguntas cortas, directas y educadas.",
        },
        {
          type: "phrases",
          title: "Frases para no quedarte callado",
          items: [
            { en: "What does 'flaky' mean?", es: "¿Qué significa 'flaky'?" },
            { en: "Could you explain that again?", es: "¿Podrías explicarlo otra vez?" },
            { en: "Sorry, I didn't catch that.", es: "Perdón, no lo entendí." },
            { en: "How do I run the tests?", es: "¿Cómo ejecuto los tests?" },
            { en: "Do you mean the staging environment?", es: "¿Te refieres al entorno de staging?" },
            { en: "Is it okay if I ask a question?", es: "¿Está bien si hago una pregunta?" },
            { en: "Could you spell that, please?", es: "¿Podrías deletrearlo, por favor?" },
            { en: "Let me confirm: we deploy on Friday, right?", es: "Déjame confirmar: desplegamos el viernes, ¿verdad?" },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Pedir aclaración no te hace ver mal",
          body: "Quedarte callado y asumir la tarea equivocada cuesta más que una pregunta de cinco segundos. En equipos remotos, confirmar por escrito evita malentendidos.",
        },
      ],
      exercises: [
        {
          id: "m1-l4-e1",
          type: "choice",
          prompt: "No entiendes la palabra 'flaky'. ¿Qué pregunta usas?",
          options: [
            "What means flaky?",
            "What does flaky mean?",
            "What is mean flaky?",
            "How means flaky?",
          ],
          answer: 1,
          explanation:
            "La estructura correcta es 'What does + palabra + mean?'. 'What means flaky?' es un error frecuente.",
        },
        {
          id: "m1-l4-e2",
          type: "choice",
          prompt: "No oíste la última parte de una explicación. ¿Qué dices?",
          options: [
            "Sorry, I didn't catch that. Could you repeat it?",
            "Repeat.",
            "I don't hear you.",
            "What?",
          ],
          answer: 0,
          explanation:
            "'I didn't catch that' es la forma natural de decir que no entendiste; añadir 'Could you repeat it?' suena educado.",
        },
        {
          id: "m1-l4-e3",
          type: "builder",
          prompt: "Construye: '¿Podrías explicar eso otra vez, por favor?'",
          words: ["Could you", "explain that again,", "please?"],
          answer: "Could you explain that again, please?",
          explanation:
            "'Could you...?' es la fórmula más segura para pedir algo en una reunión.",
        },
        {
          id: "m1-l4-e4",
          type: "write",
          prompt: "Pregunta en inglés cómo ejecutar los tests.",
          answer: "How do I run the tests?",
          accept: [
            "How do I run tests?",
            "How can I run the tests?",
            "How should I run the tests?",
          ],
          hint: "Empieza con 'How do I...?' y usa 'run the tests'.",
          explanation:
            "'How do I + verbo?' es la estructura básica para preguntar por un procedimiento.",
        },
        {
          id: "m1-l4-e5",
          type: "builder",
          prompt: "Construye: 'Déjame confirmar: desplegamos el viernes, ¿verdad?'",
          words: ["Let me confirm:", "we deploy", "on Friday,", "right?"],
          answer: "Let me confirm: we deploy on Friday, right?",
          explanation:
            "Confirmar en voz alta evita malentendidos. 'Right?' al final suena natural y cómodo, no agresivo.",
        },
        {
          id: "m1-l4-e6",
          type: "write",
          prompt: "Escríbelo en inglés con amabilidad: '¿Podrías deletrearlo, por favor?'",
          answer: "Could you spell that, please?",
          accept: [
            "Could you spell that please?",
            "Can you spell that, please?",
          ],
          hint: "Usa 'Could you spell that...?'",
          explanation:
            "Pedir que deletreen es totalmente normal, sobre todo con nombres de variables, ramas o servicios.",
        },
      ],
    },
    {
      id: "m1-l5",
      slug: "checkpoint-fundamentos",
      title: "Checkpoint: fundamentos en uso real",
      step: "A2 · Paso 1.5 · Checkpoint",
      cefr: "A2",
      minutes: 7,
      summary:
        "Recupera lo esencial del módulo sin releer: verbos, acciones técnicas, números y cómo pedir aclaración.",
      objectives: [
        "Usar verbos clave en frases cortas y correctas.",
        "Decir versiones/números y pedir aclaración con naturalidad.",
        "Detectar qué tema conviene repasar antes de seguir.",
      ],
      pronunciation:
        "The API needs a token. Could you explain that again? Version two point zero was released today.",
      blocks: [
        {
          type: "technique",
          name: "Recuperación activa",
          desc: "Responde primero desde memoria. Si fallas, vuelve a la sesión del tema (verbos, números o aclaraciones), corrige y continúa. Recordar activamente fija mejor que volver a leer.",
        },
        {
          type: "phrases",
          title: "Chunks útiles para recordar",
          items: [
            { en: "The function returns a value.", es: "La función devuelve un valor." },
            { en: "Pull the latest changes.", es: "Trae los últimos cambios." },
            { en: "Version 2.0", es: "Versión 2.0 (two point zero)." },
            { en: "Could you explain that again?", es: "¿Podrías explicarlo otra vez?" },
          ],
        },
      ],
      exercises: [
        {
          id: "m1-l5-e1",
          type: "choice",
          prompt: "Elige la frase correcta para describir lo que necesita el sistema:",
          options: [
            "The API need a token.",
            "The API needs a token.",
            "The API needing a token.",
            "The API is need a token.",
          ],
          answer: 1,
          explanation:
            "Con 'the API' (tercera persona singular) el verbo lleva -s: 'needs'.",
        },
        {
          id: "m1-l5-e2",
          type: "builder",
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ["Pull", "the latest changes", "and run", "the tests."],
          answer: "Pull the latest changes and run the tests.",
          explanation:
            "Imperativos en secuencia: instrucciones claras como en un README.",
        },
        {
          id: "m1-l5-e3",
          type: "choice",
          prompt: "¿Cómo se lee 'v2.0' en inglés técnico?",
          options: [
            "version two comma zero",
            "version two point zero",
            "version twenty",
            "version two zero point",
          ],
          answer: 1,
          explanation:
            "En versiones y decimales se usa 'point': 'two point zero'.",
        },
        {
          id: "m1-l5-e4",
          type: "write",
          prompt: "Escribe en inglés: '¿Podrías explicarlo otra vez, por favor?'",
          answer: "Could you explain that again, please?",
          accept: [
            "Could you explain that again please?",
            "Can you explain that again, please?",
          ],
          hint: "Usa 'Could you explain that again...?'",
          explanation:
            "Frase de rescate muy útil para pedir aclaración con cortesía.",
        },
        {
          id: "m1-l5-e5",
          type: "builder",
          prompt: "Construye: 'Creo que el problema está en la caché.'",
          words: ["I think", "the issue", "is in", "the cache."],
          answer: "I think the issue is in the cache.",
          explanation:
            "'I think' + cláusula es una forma simple de compartir tu hipótesis en debugging.",
        },
      ],
    },
  ],
};
