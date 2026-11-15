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
      minutes: 12,
      summary:
        "Aprende los 10 verbos básicos que usarás en casi todas las frases técnicas, con la regla clave: en tercera persona (it/the server/the function) el verbo suele llevar -s.",
      objectives: [
        "Reconocer y usar be, have, do, say, go, can, want, need, know y think en contexto.",
        "Aplicar la -s de tercera persona al hablar de sistemas, funciones o errores (has, does, says, goes, wants, needs).",
        "Construir frases simples y claras para describir estado, capacidad y opiniones ('I think...').",
      ],
      pronunciation:
        "The server is down and the error says permission denied.",
      blocks: [
        {
          type: "technique",
          name: "Antes de empezar: regla de oro (tercera persona)",
          desc: "Cuando el sujeto es una cosa o sistema (the server, the function, the API, this library), piensa en 'it'. En presente: be → is, have → has, do → does, say → says, go → goes, want → wants, need → needs, know → knows, think → thinks. Excepción importante: 'can' es modal y NO cambia (The API can handle...). Con 'I/you/we/they' el verbo va en forma base (I need, they have).",
        },
        {
          type: "vocab",
          title: "Los 10 verbos reyes (con su forma para 'it')",
          items: [
            { en: "to be → is", es: "ser / estar (estado del sistema)", example: "The server is down.", note: "is = forma de 'be' para it/the server." },
            { en: "to have → has", es: "tener (características)", example: "This function has two parameters.", note: "parameters = parámetros." },
            { en: "to do → does", es: "hacer (ejecutar acción)", example: "The script does nothing.", note: "script = script; nothing = nada." },
            { en: "to say → says", es: "decir / mostrar (logs/errores)", example: "The error says \"permission denied\".", note: "error = error." },
            { en: "to go → goes", es: "ir / entrar (flujo del código)", example: "The code goes into an infinite loop.", note: "loop = bucle; infinite = infinito." },
            { en: "can → can", es: "poder (capacidad del sistema)", example: "This API can handle 1,000 requests per second.", note: "can no cambia; handle = manejar." },
            { en: "to want → wants", es: "querer (requerimiento)", example: "The client wants a login page.", note: "client = cliente." },
            { en: "to need → needs", es: "necesitar (dependencia/requisito)", example: "This library needs Node 18.", note: "library = librería." },
            { en: "to know → know (I)", es: "saber / conocer", example: "I don't know why this is broken.", note: "Con 'I' usa know; is broken = está roto." },
            { en: "to think → think (I)", es: "pensar / creer (hipótesis)", example: "I think the issue is in the cache.", note: "issue = problema; cache = caché." },
          ],
        },
        {
          type: "phrases",
          title: "Frases modelo (solo con lo aprendido aquí)",
          items: [
            { en: "The server is down.", es: "El servidor está caído." },
            { en: "The function has two parameters.", es: "La función tiene dos parámetros." },
            { en: "The script does nothing.", es: "El script no hace nada." },
            { en: "This API can handle requests.", es: "Esta API puede manejar peticiones." },
            { en: "I think the issue is in the cache.", es: "Creo que el problema está en la caché." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Cómo usar esta lección",
          body: "Primero mira la tabla de verbos y las frases modelo. Los ejercicios solo usan estos 10 verbos y palabras que aparecen en los ejemplos (server, function, script, error, code, API, client, library, issue, cache, parameters, requests). Si dudas, vuelve a la forma para 'it' (is/has/does/needs...).",
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
          prompt: "Escríbelo en inglés de forma natural: 'No sé por qué esto está roto.'",
          answer: "I don't know why this is broken.",
          accept: [
            "I do not know why this is broken.",
            "I don't know why it is broken.",
          ],
          hint: "Usa 'I don't know why...' + 'is broken' (ya visto en el vocabulario).",
          explanation:
            "Frase honesta y muy útil en debugging. Usa solo estructuras ya vistas: 'I don't know' y 'is broken' (estado).",
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
          prompt: "Completa los espacios con las formas correctas (solo verbos de esta lección).",
          template: "I ___ the issue is in the cache because the function ___ two parameters.",
          blanks: ["think", "has"],
          hint: "Con 'I' usa 'think'. Con 'the function' (it) usa 'has'.",
          explanation:
            "Repaso en contexto: 'I think...' (opinión/hipótesis) y 'the function has...' (tercera persona singular). Todas las palabras ya aparecieron en los ejemplos.",
        },
      ],
    },
    {
      id: "m1-l2",
      slug: "verbos-tecnicos",
      title: "Los 20 Verbos Técnicos Diarios",
      step: "A2 · Paso 1.2",
      cefr: "A2",
      minutes: 14,
      summary:
        "Los verbos de acción más usados en terminal, Git y documentación. Aquí aprenderás el imperativo (instrucciones como 'Run the tests') y a describir qué hace el código en presente simple.",
      objectives: [
        "Reconocer 20 verbos técnicos frecuentes y sus combinaciones comunes (run tests, push changes, fix a bug).",
        "Usar el imperativo para dar instrucciones claras (verbo en forma base al inicio).",
        "Describir qué hace algo en presente simple con tercera persona: 'This function returns...'.",
      ],
      pronunciation:
        "Pull the latest changes, fix the bug locally, and push your changes.",
      blocks: [
        {
          type: "technique",
          name: "Dos formas que verás en esta lección",
          desc: "1) Imperativo (instrucciones/README): verbo en forma base al inicio, sin sujeto → 'Run npm install', 'Push your changes'. 2) Presente simple para describir: 'This function returns a promise' / 'The build fails' (aquí se aplica la regla de -s de la lección anterior). En esta lección verás ambos; los tiempos en progreso ('I'm debugging') se estudian en el Módulo 2.",
        },
        {
          type: "vocab",
          title: "20 verbos del día a día (aprende el bloque verbo + objeto)",
          items: [
            { en: "run", es: "ejecutar (código, tests, script)", example: "Run the tests." },
            { en: "build", es: "compilar / construir", example: "Build the project." },
            { en: "deploy", es: "desplegar", example: "Deploy the app." },
            { en: "push", es: "subir cambios (al remoto)", example: "Push your changes." },
            { en: "pull", es: "traer cambios (del remoto)", example: "Pull the latest changes." },
            { en: "commit", es: "confirmar cambios en Git", example: "Commit your changes." },
            { en: "merge", es: "fusionar ramas o cambios", example: "Merge the PR." },
            { en: "break", es: "romper / hacer que falle", example: "This update can break the app." },
            { en: "fix", es: "arreglar", example: "Fix the bug." },
            { en: "test", es: "probar", example: "Test it locally." },
            { en: "debug", es: "depurar (buscar el problema)", example: "Debug the function." },
            { en: "log", es: "registrar / mostrar en consola", example: "Log the response." },
            { en: "return", es: "devolver (un valor)", example: "This function returns a promise." },
            { en: "call", es: "llamar (función, API)", example: "Call the API." },
            { en: "pass", es: "pasar (un argumento/valor)", example: "Pass the user ID." },
            { en: "throw", es: "lanzar (un error)", example: "Throw an error." },
            { en: "catch", es: "capturar (un error)", example: "Catch the error." },
            { en: "fetch", es: "obtener (datos)", example: "Fetch the data." },
            { en: "handle", es: "manejar (evento/error)", example: "Handle the error." },
            { en: "update", es: "actualizar", example: "Update the code." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Aprende cómodo: verbo + objeto",
          body: "No memorices palabras sueltas. Aprende bloques: 'run the tests', 'push the changes', 'fix the bug', 'fetch the data'. Los ejercicios de esta lección usan estos verbos y palabras básicas ya vistas (tests, changes, bug, app, function, API, error, data, code, PR).",
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
          prompt: "Ordena este mini diálogo de trabajo (petición → respuesta → seguimiento).",
          lines: [
            "Can you pull the latest changes?",
            "Sure. I can pull them and run the tests now.",
            "Great. Let me know if the tests pass.",
          ],
          explanation:
            "Diálogo con estructuras ya vistas: petición con 'Can you...?', respuesta con 'can + verbo base', y seguimiento con 'Let me know if...'. Más adelante (Módulo 2) verás formas como 'I'm running' para acciones en progreso.",
        },
        {
          id: "m1-l2-e9",
          type: "fix-error",
          prompt: "Corrige el error en esta instrucción de README.",
          sentence: "Please to run the tests before deploy.",
          answer: "Please run the tests before you deploy.",
          accept: ["Please run the tests before deploying."],
          hint: "Imperativo: usa 'run' (sin 'to'). Para la segunda parte usa 'before you deploy'.",
          explanation:
            "En imperativos no usamos 'to' antes del verbo ('run', no 'to run'). Para conectar acciones, 'before you deploy' es claro y usa solo presente simple (que verás/practicarás en contexto).",
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
        {
          id: "m1-l3-e7",
          type: "listen",
          prompt: "Escucha y escribe la versión en inglés (dictado de números).",
          audioText: "Version two point four point one.",
          answer: "Version 2.4.1.",
          accept: [
            "Version 2.4.1",
            "Version two point four point one.",
            "Version two point four point one",
          ],
          hint: "Empieza con 'Version...'",
          explanation:
            "Repaso auditivo: en versiones técnicas se pronuncia cada separador como 'point'. Puedes escribirlo con números o con palabras.",
        },
        {
          id: "m1-l3-e8",
          type: "fill-blank",
          prompt: "Completa la frase con la preposición/hora correctas.",
          template: "The meeting is ___ ten thirty a.m. ___ March 3rd.",
          blanks: ["at", "on"],
          hint: "Horas → 'at'. Día/fecha concreta → 'on'.",
          explanation:
            "Preposiciones de tiempo frecuentes: 'at ten thirty a.m.' (hora) y 'on March 3rd' (fecha concreta).",
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
        {
          id: "m1-l4-e7",
          type: "listen",
          prompt: "Escucha y escribe la pregunta (pedir repetición).",
          audioText: "Could you explain that again, please?",
          answer: "Could you explain that again, please?",
          accept: [
            "Could you explain that again please?",
            "Can you explain that again, please?",
          ],
          hint: "Empieza con 'Could you...'",
          explanation:
            "Listening de una frase clave para pedir aclaración con cortesía en reuniones o llamadas.",
        },
        {
          id: "m1-l4-e8",
          type: "fix-error",
          prompt: "Corrige la pregunta (error común).",
          sentence: "What means 'flaky'?",
          answer: "What does 'flaky' mean?",
          accept: ["What does flaky mean?"],
          hint: "Estructura: What does + palabra + mean?",
          explanation:
            "Para preguntar por el significado: 'What does X mean?' (no 'What means X?').",
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
        {
          id: "m1-l5-e6",
          type: "write",
          prompt: "Escribe en inglés: 'La función devuelve un valor.'",
          answer: "The function returns a value.",
          accept: [
            "This function returns a value.",
            "The function returns a value",
          ],
          hint: "Tercera persona singular: 'returns'.",
          explanation:
            "Repaso de patrón clave de m1-l1: sujeto técnico + verbo en presente simple.",
        },
      ],
    },
    {
      id: "m1-l6",
      slug: "practica-verbos-tecnicos",
      title: "Práctica: verbos técnicos en acción",
      step: "A2 · Paso 1.6 · Práctica guiada",
      cefr: "A2",
      minutes: 8,
      summary:
        "Sesión corta para separar y reforzar m1-l2: imperativos, secuencias y descripciones simples con verbos técnicos.",
      objectives: [
        "Dar instrucciones claras con imperativos (run, pull, push, test, fix).",
        "Describir qué hace el código en presente simple con tercera persona.",
        "Encadenar acciones técnicas en orden lógico."
      ],
      pronunciation:
        "Pull the latest changes, run the tests, and fix the bug before you deploy.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Completa primero 'Los 20 Verbos Técnicos Diarios' (m1-l2). Esta práctica separa los ejercicios en drills cortos usando solo verbos y palabras ya vistos allí.",
        },
        {
          type: "technique",
          name: "Dos patrones clave",
          desc: "Imperativo para instrucciones: 'Run the tests.' / 'Fix the bug.' Presente simple para describir: 'This function returns a value.' / 'The build fails.' (con -s en tercera persona).",
        },
        {
          type: "phrases",
          title: "Chunks de apoyo (ya vistos)",
          items: [
            { en: "Pull the latest changes.", es: "Trae los últimos cambios." },
            { en: "Run the tests.", es: "Ejecuta los tests." },
            { en: "Push your changes.", es: "Sube tus cambios." },
            { en: "This function returns a value.", es: "Esta función devuelve un valor." }
          ],
        }
      ],
      exercises: [
        {
          id: "m1-l6-e1",
          type: "choice",
          prompt: "Quieres pedir que traigan los últimos cambios del remoto. ¿Qué verbo usas?",
          options: ["push", "pull", "throw", "catch"],
          answer: 1,
          explanation:
            "'Pull' trae cambios del remoto; 'push' los envía.",
        },
        {
          id: "m1-l6-e2",
          type: "builder",
          prompt: "Construye: 'Ejecuta los tests y sube tus cambios.'",
          words: ["Run", "the tests", "and push", "your changes."],
          answer: "Run the tests and push your changes.",
          explanation:
            "Dos imperativos conectados con 'and' para dar instrucciones claras.",
        },
        {
          id: "m1-l6-e3",
          type: "write",
          prompt: "Escribe en inglés: 'Esta función devuelve un valor.'",
          answer: "This function returns a value.",
          accept: ["This function returns a value"],
          hint: "Presente simple con tercera persona: 'returns'.",
          explanation:
            "Para describir lo que hace el código, usa presente simple: 'returns'.",
        },
        {
          id: "m1-l6-e4",
          type: "choice",
          prompt: "¿Qué instrucción es correcta para manejar un error en código?",
          options: ["Catch the error.", "Deploy the error.", "Merge the error.", "Build the error."],
          answer: 0,
          explanation:
            "'Catch the error' significa capturar el error (verbo técnico visto en m1-l2).",
        },
        {
          id: "m1-l6-e5",
          type: "builder",
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ["Pull", "the latest changes", "and run", "the tests."],
          answer: "Pull the latest changes and run the tests.",
          explanation:
            "Secuencia común antes de trabajar o desplegar: primero actualizar, luego probar.",
        },
        {
          id: "m1-l6-e6",
          type: "write",
          prompt: "Escribe la instrucción: 'Arregla el bug antes de desplegar.'",
          answer: "Fix the bug before you deploy.",
          accept: ["Fix the bug before deploying."],
          hint: "Imperativo: 'Fix...' y luego 'before you deploy'.",
          explanation:
            "Instrucción clara con orden de acciones usando verbos ya conocidos.",
        }
      ],
    },
    {
      id: "m1-l7",
      slug: "practica-mixta-fundamentos",
      title: "Práctica mixta: fundamentos en acción",
      step: "A2 · Paso 1.7 · Práctica guiada",
      cefr: "A2",
      minutes: 8,
      summary:
        "Sesión corta para mezclar y reforzar lo esencial de m1-l1 a m1-l4: verbos, acciones técnicas, versiones/números y aclaraciones.",
      objectives: [
        "Usar verbos y acciones técnicas en frases simples y correctas.",
        "Decir versiones y pedir aclaración con naturalidad.",
        "Combinar instrucciones y descripciones cortas en contexto real."
      ],
      pronunciation:
        "The function returns a value. Run the tests before you deploy. Could you explain that again, please?",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Repasa m1-l1 (verbos reyes), m1-l2 (verbos técnicos), m1-l3 (números, versiones y fechas) y m1-l4 (preguntar y aclarar). Esta práctica mezcla solo contenido ya enseñado en esas lecciones."
        },
        {
          type: "technique",
          name: "Combinar bloques básicos",
          desc: "Describe (presente simple), da instrucciones (imperativo), comunica datos (versiones/números) y pide ayuda o aclaración ('Could you...?', 'What does ... mean?')."
        },
        {
          type: "phrases",
          title: "Chunks de apoyo",
          items: [
            { en: "The function returns a value.", es: "La función devuelve un valor." },
            { en: "Run the tests before you deploy.", es: "Ejecuta los tests antes de desplegar." },
            { en: "Version 2.0 was released today.", es: "La versión 2.0 se publicó hoy." },
            { en: "Could you explain that again, please?", es: "¿Podrías explicarlo otra vez, por favor?" }
          ]
        }
      ],
      exercises: [
        {
          id: "m1-l7-e1",
          type: "choice",
          prompt: "¿Qué frase describe correctamente una acción habitual del sistema?",
          options: [
            "The server handle requests.",
            "The server handles requests.",
            "The server handling requests.",
            "The server is handle requests."
          ],
          answer: 1,
          explanation:
            "Presente simple con tercera persona singular: 'The server handles requests.'"
        },
        {
          id: "m1-l7-e2",
          type: "builder",
          prompt: "Construye: 'Ejecuta los tests antes de desplegar.'",
          words: ["Run", "the tests", "before you", "deploy."],
          answer: "Run the tests before you deploy.",
          explanation:
            "Imperativo + secuencia clara, útil en instrucciones técnicas."
        },
        {
          id: "m1-l7-e3",
          type: "write",
          prompt: "Escríbelo en inglés: '¿Podrías explicarlo otra vez, por favor?'",
          answer: "Could you explain that again, please?",
          accept: ["Could you explain that again please?", "Can you explain that again, please?"],
          hint: "Frase de cortesía: 'Could you explain...?'",
          explanation:
            "Pedir aclaración con cortesía es clave en trabajo en equipo."
        },
        {
          id: "m1-l7-e4",
          type: "choice",
          prompt: "¿Cómo dirías la versión 2.0 en inglés técnico?",
          options: [
            "version two comma zero",
            "version two point zero",
            "version twenty",
            "version two zero point"
          ],
          answer: 1,
          explanation:
            "En versiones se usa 'point': 'two point zero'."
        },
        {
          id: "m1-l7-e5",
          type: "builder",
          prompt: "Construye: 'La función devuelve un valor.'",
          words: ["The function", "returns", "a value."],
          answer: "The function returns a value.",
          explanation:
            "Patrón básico de descripción: sujeto técnico + verbo en presente simple."
        },
        {
          id: "m1-l7-e6",
          type: "write",
          prompt: "Escribe la instrucción en inglés: 'Abre el archivo de configuración.'",
          answer: "Open the configuration file.",
          accept: ["Open the config file."],
          hint: "Usa imperativo: 'Open...'",
          explanation:
            "Instrucción directa con verbo técnico ya trabajado en el módulo."
        }
      ],
    },
  ],
};
