import type { Module } from '../../lib/types'

export const m1: Module = {
  id: 'm1',
  code: 'MOD 01',
  level: 'A1-A2',
  title: 'Cimientos, Números y Preguntas',
  shortTitle: 'Verbos, Números & Preguntas',
  description:
    'To be en presente y pasado, los 10 verbos reyes, los 20 verbos técnicos, números y fechas, y cómo preguntar y aclarar sin trabarte.',
  sessions: [
    {
      id: 'm1-l0',
      slug: 'to-be-presente-pasado',
      title: 'Presente y pasado: to be (am / is / are / was / were)',
      step: 'A1 · Paso 1.0',
      cefr: 'A1',
      summary:
        'Antes de avanzar, aprende la base: cómo hablar de ahora (presente) y de antes (pasado) con el verbo to be, el más usado en inglés.',
      objectives: [
        'Usar am / is / are para describir estados y situaciones en presente.',
        'Usar was / were para hablar de estados o situaciones en pasado.',
        'Diferenciar presente y pasado con marcadores de tiempo simples (now, today, yesterday).',
      ],
      pronunciation: 'The server is down now. It was fine yesterday.',
      blocks: [
        {
          type: 'technique',
          name: 'Presente vs pasado (idea clave)',
          desc: "Presente = ahora o en general (now, today). Pasado = antes, ya terminó (yesterday, last week). En esta lección te enfocas en el verbo 'to be' (ser/estar): presente → am / is / are. pasado → was / were.",
        },
        {
          type: 'vocab',
          title: 'To be en presente y pasado',
          items: [
            {
              en: 'I am',
              es: 'yo soy / estoy (presente)',
              example: 'I am ready.',
              note: "Contracción común: I'm.",
            },
            {
              en: 'he / she / it is',
              es: 'él / ella / eso es o está (presente)',
              example: 'The server is down.',
              note: "Contracción: it's / the server's (en habla). Para cosas/sistemas usa 'it is'.",
            },
            {
              en: 'we / you / they are',
              es: 'somos/estamos, eres/están (presente)',
              example: 'We are online.',
              note: "Contracción: we're / you're / they're.",
            },
            {
              en: 'I / he / she / it was',
              es: 'yo era/estaba, él/ella/eso era/estaba (pasado)',
              example: 'The server was down yesterday.',
              note: 'Pasado de am/is.',
            },
            {
              en: 'we / you / they were',
              es: 'éramos/estábamos, eran/estaban (pasado)',
              example: 'We were in a meeting.',
              note: 'Pasado de are.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Ahora vs antes (ejemplos simples)',
          items: [
            { en: 'The app is slow now.', es: 'La app está lenta ahora. (presente)' },
            { en: 'The app was slow yesterday.', es: 'La app estaba lenta ayer. (pasado)' },
            { en: 'I am on the login page.', es: 'Estoy en la página de login. (presente)' },
            { en: 'I was on the login page.', es: 'Estaba en la página de login. (pasado)' },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Cómo reconocer el tiempo',
          body: "Si ves 'now' o 'today', piensa en presente (is/are/am). Si ves 'yesterday' o algo que ya terminó, piensa en pasado (was/were). Esta diferencia te ayudará en las siguientes lecciones.",
        },
        {
          type: 'dialogue',
          title: 'El servidor: ¿ahora o ayer?',
          setting: 'Slack, #incidentes',
          goal: 'Distinguir el to be en presente y en pasado.',
          context:
            'El servidor está caído y Maya y Leo lo comentan por Slack. Comparan cómo está ahora con cómo estaba ayer.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'The server is down now.',
              es: 'El servidor está caído ahora.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Really? It was fine yesterday. What happened?',
              es: '¿En serio? Estaba bien ayer. ¿Qué pasó?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "I don't know. Are you on the login page?",
              es: 'No lo sé. ¿Estás en la página de login?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Yes, I am, and the app is really slow today.',
              es: 'Sí, estoy, y la app está muy lenta hoy.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'We were in a meeting at ten, so we were late to the alert.',
              es: 'Estábamos en una reunión a las diez, así que llegamos tarde a la alerta.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'No worries. I am on it now.',
              es: 'No te preocupes. Estoy en eso ahora.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l0-e1',
          type: 'choice',
          prompt: "Completa: 'The server ___ down now.' (ahora)",
          options: ['is', 'was', 'are', 'were'],
          answer: 0,
          explanation: "'Now' indica presente y el sujeto es 'the server' (it), así que usa 'is'.",
        },
        {
          id: 'm1-l0-e2',
          type: 'choice',
          prompt: "Completa: 'The server ___ down yesterday.' (ayer)",
          options: ['is', 'was', 'are', 'were'],
          answer: 1,
          explanation:
            "'Yesterday' indica pasado y el sujeto es 'the server' (it), así que usa 'was'.",
        },
        {
          id: 'm1-l0-e3',
          type: 'builder',
          prompt: "Construye: 'La app estaba lenta ayer.'",
          words: ['The app', 'was', 'slow', 'yesterday.'],
          answer: 'The app was slow yesterday.',
          explanation: "Pasado con 'was' (para it/the app) + marcador de tiempo 'yesterday'.",
        },
        {
          id: 'm1-l0-e5',
          type: 'fill-blank',
          prompt: 'Completa con presente o pasado según el tiempo.',
          template: 'The app ___ slow now, but it ___ fine yesterday.',
          blanks: ['is', 'was'],
          hint: 'now → presente (is). yesterday → pasado (was).',
          explanation:
            "Contraste claro: presente con 'is' y pasado con 'was' para el mismo sujeto (it/the app).",
        },
        {
          id: 'm1-l0-e6',
          type: 'choice',
          prompt: '¿De qué hablaron Maya y Leo?',
          options: [
            'De que el servidor está caído ahora pero estaba bien ayer.',
            'De que el servidor está bien ahora.',
            'De que la app estaba lenta ayer.',
          ],
          answer: 0,
          explanation:
            "Maya dice 'The server is down now' y Leo responde 'It was fine yesterday': presente y pasado con to be.",
        },
        {
          id: 'm1-l0-e7',
          type: 'choice',
          prompt: '¿Cómo estaba el servidor ayer?',
          options: ['Estaba bien.', 'Estaba caído.', 'Estaba lento.'],
          answer: 0,
          explanation:
            "Leo dice 'It was fine yesterday': pasado de to be ('was') para un estado que ya terminó.",
        },
        {
          id: 'm1-l0-e8',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I was a junior developer, and now I am a senior engineer.',
          hint: 'To be en pasado y presente: was / am.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm1-l1',
      slug: 'verbos-reyes',
      title: 'Los 10 Verbos Reyes en Contexto Técnico',
      step: 'A1 · Paso 1.1',
      cefr: 'A1',
      summary:
        'Aprende los 10 verbos básicos que usarás en casi todas las frases técnicas, con la regla clave: en tercera persona (it/the server/the function) el verbo suele llevar -s.',
      objectives: [
        'Reconocer y usar be, have, do, say, go, can, want, need, know y think en contexto.',
        'Aplicar la -s de tercera persona al hablar de sistemas, funciones o errores (has, does, says, goes, wants, needs).',
        "Construir frases simples y claras para describir estado, capacidad y opiniones ('I think...').",
      ],
      pronunciation: 'The server is down and the error says permission denied.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Completa primero el Paso 1.0 (to be en presente y pasado: is/are/am/was/were). Aquí trabajarás en presente con los verbos más usados y la regla de tercera persona (-s).',
        },
        {
          type: 'technique',
          name: 'Regla de oro (tercera persona en presente)',
          desc: "Cuando el sujeto es una cosa o sistema (the server, the function, the API, this library), piensa en 'it'. En presente: be → is, have → has, do → does, say → says, go → goes, want → wants, need → needs, know → knows, think → thinks. Excepción importante: 'can' es modal y NO cambia (The API can handle...). Con 'I/you/we/they' el verbo va en forma base (I need, they have).",
        },
        {
          type: 'vocab',
          title: "Los 10 verbos reyes (con su forma para 'it')",
          items: [
            {
              en: 'to be → is',
              es: 'ser / estar (estado del sistema)',
              example: 'The server is down.',
              note: "is = forma de 'be' para it/the server.",
            },
            {
              en: 'to have → has',
              es: 'tener (características)',
              example: 'This function has two parameters.',
              note: 'parameters = parámetros.',
            },
            {
              en: 'to do → does',
              es: 'hacer (ejecutar acción)',
              example: 'The script does nothing.',
              note: 'script = script; nothing = nada.',
            },
            {
              en: 'to say → says',
              es: 'decir / mostrar (logs/errores)',
              example: 'The error says "permission denied".',
              note: 'error = error.',
            },
            {
              en: 'to go → goes',
              es: 'ir / entrar (flujo del código)',
              example: 'The code goes into an infinite loop.',
              note: 'loop = bucle; infinite = infinito.',
            },
            {
              en: 'can → can',
              es: 'poder (capacidad del sistema)',
              example: 'This API can handle 1,000 requests per second.',
              note: 'can no cambia; handle = manejar.',
            },
            {
              en: 'to want → wants',
              es: 'querer (requerimiento)',
              example: 'The client wants a login page.',
              note: 'client = cliente.',
            },
            {
              en: 'to need → needs',
              es: 'necesitar (dependencia/requisito)',
              example: 'This library needs Node 18.',
              note: 'library = librería.',
            },
            {
              en: 'to know → know (I)',
              es: 'saber / conocer',
              example: "I don't know why this is broken.",
              note: "Con 'I' usa know; is broken = está roto.",
            },
            {
              en: 'to think → think (I)',
              es: 'pensar / creer (hipótesis)',
              example: 'I think the issue is in the cache.',
              note: 'issue = problema; cache = caché.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases modelo (solo con lo aprendido aquí)',
          items: [
            { en: 'The server is down.', es: 'El servidor está caído.' },
            { en: 'The function has two parameters.', es: 'La función tiene dos parámetros.' },
            { en: 'The script does nothing.', es: 'El script no hace nada.' },
            { en: 'This API can handle requests.', es: 'Esta API puede manejar peticiones.' },
            {
              en: 'I think the issue is in the cache.',
              es: 'Creo que el problema está en la caché.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'El error habla: verbos reyes en acción',
          setting: 'Slack, #backend',
          goal: 'Describir un error usando la -s de tercera persona.',
          context:
            'Leo investiga un error de permisos y Maya le ayuda a encontrar la causa. Repasan lo que dicen y necesitan la API y el cliente.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'What does the error say?',
              es: '¿Qué dice el error?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "It says 'permission denied'.",
              es: "Dice 'permiso denegado'.",
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'I think the API needs a token. Does the client send one?',
              es: 'Creo que la API necesita un token. ¿Envía uno el cliente?',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "It doesn't. The client wants a login page first.",
              es: 'No. El cliente quiere una página de login primero.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Right. Look at getToken: this function has two parameters.',
              es: 'Correcto. Mira getToken: esta función tiene dos parámetros.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Right. I don't know why it is broken, but I can check them.",
              es: 'Cierto. No sé por qué está roto, pero puedo revisarlos.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l1-e1',
          type: 'choice',
          prompt: "Completa el reporte de error: 'This library _____ Node 18 to run properly.'",
          options: ['need', 'needs', 'is need', 'needing'],
          answer: 1,
          explanation:
            "'This library' equivale a 'it' (3ª persona singular), por lo que 'need' lleva -s: 'needs'.",
        },
        {
          id: 'm1-l1-e2',
          type: 'choice',
          prompt: 'Elige la frase técnicamente correcta sobre capacidad del sistema:',
          options: [
            'This API cans handle 1,000 requests per second',
            'This API can handles 1,000 requests per second',
            'This API can handle 1,000 requests per second',
            'This API is can handle 1,000 requests per second',
          ],
          answer: 2,
          explanation:
            "'can' es un modal invariable: nunca lleva -s y el verbo siguiente va en forma base ('handle').",
        },
        {
          id: 'm1-l1-e3',
          type: 'builder',
          prompt: "Construye la frase de debugging: 'Creo que el problema está en la caché.'",
          words: ['I think', 'the issue', 'is in', 'the cache.'],
          answer: 'I think the issue is in the cache.',
          explanation:
            "Estructura limpia: sujeto + verbo ('I think') + cláusula ('the issue is in the cache').",
        },
        {
          id: 'm1-l1-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'La función tiene dos parámetros.'",
          answer: 'The function has two parameters.',
          accept: ['This function has two parameters.', 'The function has two parameters'],
          hint: "El sujeto es 'the function' (it), así que 'have' se convierte en 'has'.",
          explanation:
            "Tercera persona singular: 'The function has two parameters'. Este es el patrón que usarás en documentación y code reviews.",
        },
        {
          id: 'm1-l1-e5',
          type: 'choice',
          prompt: "Completa: 'The script _____ nothing when I click the button.'",
          options: ['do', 'does', 'is do', 'doing'],
          answer: 1,
          explanation:
            "'The script' es tercera persona singular, así que usa 'does': 'The script does nothing'. Es una forma simple y muy común de reportar un fallo.",
        },
        {
          id: 'm1-l1-e7',
          type: 'listen',
          prompt: 'Escucha y escribe la frase (listening/dictado).',
          audioText: 'The server is down.',
          answer: 'The server is down.',
          accept: ['The server is down'],
          hint: "Empieza con 'The server...'",
          explanation:
            "Práctica de listening: escucha la frase y escríbela. Presta atención a 'is' (estado actual del servidor).",
        },
        {
          id: 'm1-l1-e8',
          type: 'fill-blank',
          prompt: 'Completa los espacios con las formas correctas (solo verbos de esta lección).',
          template: 'I ___ the issue is in the cache because the function ___ two parameters.',
          blanks: ['think', 'has'],
          hint: "Con 'I' usa 'think'. Con 'the function' (it) usa 'has'.",
          explanation:
            "Repaso en contexto: 'I think...' (opinión/hipótesis) y 'the function has...' (tercera persona singular). Todas las palabras ya aparecieron en los ejemplos.",
        },
      ],
    },
    {
      id: 'm1-l2',
      slug: 'verbos-tecnicos',
      title: 'Los 20 Verbos Técnicos Diarios',
      step: 'A2 · Paso 1.2',
      cefr: 'A2',
      summary:
        "Los verbos de acción más usados en terminal, Git y documentación. Aquí aprenderás el imperativo (instrucciones como 'Run the tests') y a describir qué hace el código en presente simple.",
      objectives: [
        'Reconocer 20 verbos técnicos frecuentes y sus combinaciones comunes (run tests, push changes, fix a bug).',
        'Usar el imperativo para dar instrucciones claras (verbo en forma base al inicio).',
        "Describir qué hace algo en presente simple con tercera persona: 'This function returns...'.",
      ],
      pronunciation: 'Pull the latest changes, fix the bug locally, and push your changes.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Asegúrate de dominar el Paso 1.0 (presente/pasado de to be) y el Paso 1.1 (verbos reyes y -s en tercera persona). Esta lección se enfoca en verbos técnicos en imperativo y presente simple.',
        },
        {
          type: 'technique',
          name: 'Dos formas que verás en esta lección',
          desc: "1) Imperativo (instrucciones/README): verbo en forma base al inicio, sin sujeto → 'Run npm install', 'Push your changes'. 2) Presente simple para describir: 'This function returns a promise' / 'The build fails' (aquí se aplica la regla de -s de la lección anterior). En esta lección verás ambos; los tiempos en progreso ('I'm debugging') y el pasado simple se estudian en el Módulo 2.",
        },
        {
          type: 'vocab',
          title: '20 verbos del día a día (aprende el bloque verbo + objeto)',
          items: [
            { en: 'run', es: 'ejecutar (código, tests, script)', example: 'Run the tests.' },
            { en: 'build', es: 'compilar / construir', example: 'Build the project.' },
            { en: 'deploy', es: 'desplegar', example: 'Deploy the app.' },
            { en: 'push', es: 'subir cambios (al remoto)', example: 'Push your changes.' },
            { en: 'pull', es: 'traer cambios (del remoto)', example: 'Pull the latest changes.' },
            { en: 'commit', es: 'confirmar cambios en Git', example: 'Commit your changes.' },
            { en: 'merge', es: 'fusionar ramas o cambios', example: 'Merge the PR.' },
            {
              en: 'break',
              es: 'romper / hacer que falle',
              example: 'This update can break the app.',
            },
            { en: 'fix', es: 'arreglar', example: 'Fix the bug.' },
            { en: 'test', es: 'probar', example: 'Test it locally.' },
            { en: 'debug', es: 'depurar (buscar el problema)', example: 'Debug the function.' },
            { en: 'log', es: 'registrar / mostrar en consola', example: 'Log the response.' },
            {
              en: 'return',
              es: 'devolver (un valor)',
              example: 'This function returns a promise.',
            },
            { en: 'call', es: 'llamar (función, API)', example: 'Call the API.' },
            { en: 'pass', es: 'pasar (un argumento/valor)', example: 'Pass the user ID.' },
            { en: 'throw', es: 'lanzar (un error)', example: 'Throw an error.' },
            { en: 'catch', es: 'capturar (un error)', example: 'Catch the error.' },
            { en: 'fetch', es: 'obtener (datos)', example: 'Fetch the data.' },
            { en: 'handle', es: 'manejar (evento/error)', example: 'Handle the error.' },
            { en: 'update', es: 'actualizar', example: 'Update the code.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l2-e1',
          type: 'choice',
          prompt: "¿Qué verbo técnico significa 'obtener datos desde una API o base de datos'?",
          options: ['throw', 'fetch', 'merge', 'log'],
          answer: 1,
          explanation:
            "'fetch' significa obtener o traer datos (ej: 'Fetch the data from the database').",
        },
        {
          id: 'm1-l2-e3',
          type: 'builder',
          prompt: "Construye: 'Esta función devuelve una promesa.'",
          words: ['This function', 'returns', 'a promise.'],
          answer: 'This function returns a promise.',
          explanation:
            "Presente simple para describir qué hace el código: 'This function returns a promise'.",
        },
        {
          id: 'm1-l2-e4',
          type: 'write',
          prompt: "Escribe la instrucción: 'Ejecuta los tests antes de desplegar.'",
          answer: 'Run the tests before you deploy.',
          accept: ['Run tests before you deploy.', 'Run the tests before deploying.'],
          hint: "Empieza con el verbo en forma base: 'Run...'.",
          explanation:
            "El imperativo técnico va al inicio y sin sujeto. 'Before you deploy' deja claro el orden de las acciones.",
        },
        {
          id: 'm1-l2-e6',
          type: 'builder',
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ['Pull', 'the latest changes', 'and run', 'the tests.'],
          answer: 'Pull the latest changes and run the tests.',
          explanation:
            "Dos imperativos conectados con 'and': instrucciones claras y naturales, igual que en un README.",
        },
        {
          id: 'm1-l2-e7',
          type: 'speak',
          prompt: 'Pronuncia esta instrucción técnica en voz alta.',
          answer: 'Run the tests before you deploy.',
          accept: ['Run tests before you deploy.'],
          hint: 'Enfócate en el ritmo: Run the tests / before you deploy.',
          explanation:
            'Práctica de speaking: decir instrucciones claras es clave en trabajo en equipo. Usa el micrófono o escribe si no está disponible.',
        },
        {
          id: 'm1-l2-e8',
          type: 'dialogue-order',
          prompt: 'Ordena este mini diálogo de trabajo (petición → respuesta → seguimiento).',
          context:
            'Maya pide por Slack a Leo que traiga los últimos cambios antes de seguir; Leo responde y queda pendiente saber si pasan los tests.',
          lines: [
            'Can you pull the latest changes?',
            'Sure. I can pull them and run the tests now.',
            'Great. Let me know if the tests pass.',
          ],
          explanation:
            "Diálogo con estructuras ya vistas: petición con 'Can you...?', respuesta con 'can + verbo base', y seguimiento con 'Let me know if...'. Más adelante (Módulo 2) verás formas como 'I'm running' para acciones en progreso.",
        },
        {
          id: 'm1-l2-e9',
          type: 'fix-error',
          prompt: 'Corrige el error en esta instrucción de README.',
          sentence: 'Please to run the tests before deploy.',
          answer: 'Please run the tests before you deploy.',
          accept: ['Please run the tests before deploying.'],
          hint: "Imperativo: usa 'run' (sin 'to'). Para la segunda parte usa 'before you deploy'.",
          explanation:
            "En imperativos no usamos 'to' antes del verbo ('run', no 'to run'). Para conectar acciones, 'before you deploy' es claro y usa solo presente simple (que verás/practicarás en contexto).",
        },
      ],
    },
    {
      id: 'm1-l3',
      slug: 'numeros-versiones-fechas',
      title: 'Números, versiones y fechas sin trabarte',
      step: 'A2 · Paso 1.3',
      cefr: 'A2',
      summary:
        'Di versiones, cantidades, horas y fechas con naturalidad en una call, un changelog o un ticket.',
      objectives: [
        "Leer versiones y decimales con 'point', no con 'comma'.",
        'Decir fechas y horas en el formato que usa un equipo internacional.',
        'Expresar rangos y porcentajes sin bloquear la conversación.',
      ],
      pronunciation:
        'Version two point four point one is available now. Version two point zero was released on March third at ten thirty a.m.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Conviene haber completado los Pasos 1.0–1.2 (to be, verbos reyes y verbos técnicos). Aquí practicarás números, versiones, horas y fechas; si ves 'was released', recuerda que 'was' es el pasado de 'to be' visto en el Paso 1.0.",
        },
        {
          type: 'technique',
          name: 'Cómo se leen los números técnicos',
          desc: "Las versiones se leen con 'point': 2.4.1 → 'two point four point one'. En Estados Unidos la fecha March 3rd se dice 'March third'; en Reino Unido también oirás 'the third of March'. Las horas se dicen 'ten thirty', no 'ten and thirty'.",
        },
        {
          type: 'vocab',
          title: 'Números que aparecen cada día',
          items: [
            {
              en: 'version 2.4.1',
              es: 'versión 2.4.1',
              example: 'Version 2.4.1 is available today.',
              note: "Se dice 'two point four point one'.",
            },
            {
              en: '1,000 requests',
              es: '1.000 peticiones',
              example: 'The API handles 1,000 requests per second.',
            },
            { en: '3.14', es: '3,14', example: 'Pi is approximately three point one four.' },
            { en: '50%', es: '50 %', example: 'The cache hit rate is fifty percent.' },
            { en: '10:30 a.m.', es: '10:30 a. m.', example: 'The standup is at ten thirty a.m.' },
            {
              en: 'March 3rd',
              es: '3 de marzo',
              example: 'The release is scheduled for March third.',
            },
            {
              en: '2–4 minutes',
              es: 'de 2 a 4 minutos',
              example: 'The deploy takes from two to four minutes.',
            },
            {
              en: '1st / 2nd / 3rd',
              es: '1.º / 2.º / 3.º',
              example: 'This is our third release this month.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l3-e1',
          type: 'choice',
          prompt: "¿Cómo se lee 'v2.4.1' en una call?",
          options: [
            'version two point four point one',
            'version two comma four comma one',
            'version two four one',
            'version second point fourth point first',
          ],
          answer: 0,
          explanation:
            "Las versiones se leen con 'point' entre cada número: 'two point four point one'.",
        },
        {
          id: 'm1-l3-e2',
          type: 'choice',
          prompt: 'El deploy está programado para el 3 de marzo. ¿Cuál es la opción natural?',
          options: [
            'The deploy is scheduled for March 3rd.',
            'The deploy is scheduled in March 3rd.',
            'The deploy is scheduled on March third day.',
            'The deploy is scheduled to March 3rd.',
          ],
          answer: 0,
          explanation:
            "Para una fecha programada se usa 'for': 'scheduled for March 3rd'. También puedes decir 'on March 3rd' si hablas del día concreto.",
        },
        {
          id: 'm1-l3-e3',
          type: 'builder',
          prompt: "Construye: 'El despliegue tarda de 2 a 4 minutos.'",
          words: ['The deploy', 'takes', 'from 2 to 4', 'minutes.'],
          answer: 'The deploy takes from 2 to 4 minutes.',
          explanation:
            "'From X to Y' expresa un rango. En una call puedes decir 'from two to four minutes'.",
        },
        {
          id: 'm1-l3-e4',
          type: 'write',
          prompt: "Escribe en inglés: 'La versión 2.0 se lanzó el 3 de marzo.'",
          answer: 'Version 2.0 was released on March 3rd.',
          accept: [
            'Version 2.0 was released on March 3.',
            'Version two point zero was released on March 3rd.',
          ],
          hint: "Usa 'was released on' + la fecha (pasado, ya visto en Paso 1.0).",
          explanation:
            "'Was released' usa 'was' (pasado de 'is') para hablar de algo que ya ocurrió; 'on' acompaña al día concreto.",
        },
        {
          id: 'm1-l3-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'La tasa de acierto de caché es 50%.'",
          answer: 'The cache hit rate is fifty percent.',
          accept: ['The cache hit rate is 50 percent.', 'The cache hit rate is 50%.'],
          hint: "Puedes escribir 'fifty percent' o '50%'.",
          explanation:
            "Decir porcentajes con calma ('fifty percent') te ayuda a comunicar números con claridad en una call.",
        },
        {
          id: 'm1-l3-e7',
          type: 'listen',
          prompt: 'Escucha y escribe la versión en inglés (dictado de números).',
          audioText: 'Version two point four point one.',
          answer: 'Version 2.4.1.',
          accept: [
            'Version 2.4.1',
            'Version two point four point one.',
            'Version two point four point one',
          ],
          hint: "Empieza con 'Version...'",
          explanation:
            "Repaso auditivo: en versiones técnicas se pronuncia cada separador como 'point'. Puedes escribirlo con números o con palabras.",
        },
        {
          id: 'm1-l3-e8',
          type: 'fill-blank',
          prompt: 'Completa la frase con la preposición/hora correctas.',
          template: 'The meeting is ___ ten thirty a.m. ___ March 3rd.',
          blanks: ['at', 'on'],
          hint: "Horas → 'at'. Día/fecha concreta → 'on'.",
          explanation:
            "Preposiciones de tiempo frecuentes: 'at ten thirty a.m.' (hora) y 'on March 3rd' (fecha concreta).",
        },
      ],
    },
    {
      id: 'm1-l4',
      slug: 'preguntar-y-aclarar',
      title: 'Preguntar y pedir aclaraciones sin miedo',
      step: 'A2 · Paso 1.4',
      cefr: 'A2',
      summary:
        'Las preguntas de rescate que necesitas cuando no entiendes una palabra, un acento o una tarea.',
      objectives: [
        'Preguntar el significado de una palabra técnica.',
        'Pedir que repitan o expliquen algo sin perder profesionalidad.',
        'Confirmar que entendiste la tarea correcta.',
      ],
      pronunciation: "Could you explain that again? I didn't catch the last part.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Recomendado tras los Pasos 1.0–1.3. Aprenderás frases de rescate para pedir aclaración; algunas (como 'I didn't catch that') usan pasado simple como chunk útil, que se profundiza en el Módulo 2.",
        },
        {
          type: 'technique',
          name: 'Preguntas de rescate',
          desc: "Pedir aclaración es parte del trabajo. Usa 'What does X mean?', 'Could you explain that again?', 'How do I run the tests?' y 'Do you mean staging?'. Son preguntas cortas, directas y educadas. Nota: 'I didn't catch that' usa pasado ('didn't' = did not) para algo que ya ocurrió (no lo entendiste hace un momento); apréndela como frase útil y verás el pasado simple en detalle en el Módulo 2.",
        },
        {
          type: 'phrases',
          title: 'Frases para no quedarte callado',
          items: [
            { en: "What does 'flaky' mean?", es: "¿Qué significa 'flaky'?" },
            { en: 'Could you explain that again?', es: '¿Podrías explicarlo otra vez?' },
            { en: "Sorry, I didn't catch that.", es: 'Perdón, no lo entendí.' },
            { en: 'How do I run the tests?', es: '¿Cómo ejecuto los tests?' },
            {
              en: 'Do you mean the staging environment?',
              es: '¿Te refieres al entorno de staging?',
            },
            { en: 'Is it okay if I ask a question?', es: '¿Está bien si hago una pregunta?' },
            { en: 'Could you spell that, please?', es: '¿Podrías deletrearlo, por favor?' },
            {
              en: 'Let me confirm: we deploy on Friday, right?',
              es: 'Déjame confirmar: desplegamos el viernes, ¿verdad?',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Aclarar antes de equivocarse',
          setting: 'Reunión, sala de equipo',
          goal: 'Pedir aclaración y confirmar una fecha con frases de rescate.',
          context:
            'Maya da instrucciones de deploy y usa una palabra técnica que Leo no conoce. Leo pide que repita, explique y confirme la fecha.',
          lines: [
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Sorry, I didn't catch that. Could you repeat the deploy day?",
              es: 'Perdón, no lo entendí. ¿Podrías repetir el día del deploy?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Of course. We deploy on Friday.',
              es: 'Claro. Desplegamos el viernes.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "Thanks. One thing: what does 'flaky' mean?",
              es: "Gracias. Una cosa: ¿qué significa 'flaky'?",
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'It means the test fails sometimes, not every time.',
              es: 'Significa que el test falla a veces, no siempre.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Got it. Could you spell it, please?',
              es: 'Entendido. ¿Podrías deletrearlo, por favor?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'F-L-A-K-Y. Let me confirm: we deploy on Friday, right?',
              es: 'F-L-A-K-Y. Déjame confirmar: desplegamos el viernes, ¿verdad?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l4-e1',
          type: 'choice',
          prompt: "No entiendes la palabra 'flaky'. ¿Qué pregunta usas?",
          options: [
            'What means flaky?',
            'What does flaky mean?',
            'What is mean flaky?',
            'How means flaky?',
          ],
          answer: 1,
          explanation:
            "La estructura correcta es 'What does + palabra + mean?'. 'What means flaky?' es un error frecuente.",
        },
        {
          id: 'm1-l4-e3',
          type: 'builder',
          prompt: "Construye: '¿Podrías explicar eso otra vez, por favor?'",
          words: ['Could you', 'explain that again,', 'please?'],
          answer: 'Could you explain that again, please?',
          explanation: "'Could you...?' es la fórmula más segura para pedir algo en una reunión.",
        },
        {
          id: 'm1-l4-e4',
          type: 'write',
          prompt: 'Pregunta en inglés cómo ejecutar los tests.',
          answer: 'How do I run the tests?',
          accept: [
            'How do I run tests?',
            'How can I run the tests?',
            'How should I run the tests?',
          ],
          hint: "Empieza con 'How do I...?' y usa 'run the tests'.",
          explanation:
            "'How do I + verbo?' es la estructura básica para preguntar por un procedimiento.",
        },
        {
          id: 'm1-l4-e5',
          type: 'builder',
          prompt: "Construye: 'Déjame confirmar: desplegamos el viernes, ¿verdad?'",
          words: ['Let me confirm:', 'we deploy', 'on Friday,', 'right?'],
          answer: 'Let me confirm: we deploy on Friday, right?',
          explanation:
            "Confirmar en voz alta evita malentendidos. 'Right?' al final suena natural y cómodo, no agresivo.",
        },
        {
          id: 'm1-l4-e6',
          type: 'write',
          prompt: "Escríbelo en inglés con amabilidad: '¿Podrías deletrearlo, por favor?'",
          answer: 'Could you spell that, please?',
          accept: ['Could you spell that please?', 'Can you spell that, please?'],
          hint: "Usa 'Could you spell that...?'",
          explanation:
            'Pedir que deletreen es totalmente normal, sobre todo con nombres de variables, ramas o servicios.',
        },
        {
          id: 'm1-l4-e7',
          type: 'listen',
          prompt: 'Escucha y escribe la pregunta (pedir repetición).',
          audioText: 'Could you explain that again, please?',
          answer: 'Could you explain that again, please?',
          accept: ['Could you explain that again please?', 'Can you explain that again, please?'],
          hint: "Empieza con 'Could you...'",
          explanation:
            'Listening de una frase clave para pedir aclaración con cortesía en reuniones o llamadas.',
        },
        {
          id: 'm1-l4-e8',
          type: 'fix-error',
          prompt: 'Corrige la pregunta (error común).',
          sentence: "What means 'cache'?",
          answer: "What does 'cache' mean?",
          accept: ['What does cache mean?'],
          hint: 'Estructura: What does + palabra + mean?',
          explanation:
            "Para preguntar por el significado: 'What does X mean?' (no 'What means X?').",
        },
      ],
    },
    {
      id: 'm1-l5',
      slug: 'checkpoint-fundamentos',
      title: 'Checkpoint: fundamentos en uso real',
      step: 'A2 · Paso 1.5 · Checkpoint',
      cefr: 'A2',
      summary:
        'Recupera lo esencial del módulo sin releer: verbos, acciones técnicas, números y cómo pedir aclaración.',
      objectives: [
        'Usar verbos clave en frases cortas y correctas.',
        'Decir versiones/números y pedir aclaración con naturalidad.',
        'Detectar qué tema conviene repasar antes de seguir.',
      ],
      pronunciation:
        'The API needs a token. Could you explain that again? Version two point zero was released today.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Checkpoint recomendado tras completar los Pasos 1.0–1.4 del Módulo 1. Integra to be (presente/pasado), verbos, números/fechas y frases de aclaración.',
        },
        {
          type: 'technique',
          name: 'Recuperación activa',
          desc: 'Responde primero desde memoria. Si fallas, vuelve a la sesión del tema (verbos, números o aclaraciones), corrige y continúa. Recordar activamente fija mejor que volver a leer.',
        },
        {
          type: 'phrases',
          title: 'Chunks útiles para recordar',
          items: [
            { en: 'The function returns a value.', es: 'La función devuelve un valor.' },
            { en: 'Pull the latest changes.', es: 'Trae los últimos cambios.' },
            { en: 'Version 2.0', es: 'Versión 2.0 (two point zero).' },
            { en: 'Could you explain that again?', es: '¿Podrías explicarlo otra vez?' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm1-l5-e1',
          type: 'choice',
          prompt: 'Elige la frase correcta para describir lo que necesita el sistema:',
          options: [
            'The API need a token.',
            'The API needs a token.',
            'The API needing a token.',
            'The API is need a token.',
          ],
          answer: 1,
          explanation: "Con 'the API' (tercera persona singular) el verbo lleva -s: 'needs'.",
        },
        {
          id: 'm1-l5-e2',
          type: 'builder',
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ['Pull', 'the latest changes', 'and run', 'the tests.'],
          answer: 'Pull the latest changes and run the tests.',
          explanation: 'Imperativos en secuencia: instrucciones claras como en un README.',
        },
        {
          id: 'm1-l5-e3',
          type: 'choice',
          prompt: "¿Cómo se lee 'v2.0' en inglés técnico?",
          options: [
            'version two comma zero',
            'version two point zero',
            'version twenty',
            'version two zero point',
          ],
          answer: 1,
          explanation: "En versiones y decimales se usa 'point': 'two point zero'.",
        },
        {
          id: 'm1-l5-e4',
          type: 'write',
          prompt: "Escribe en inglés: '¿Podrías explicarlo otra vez, por favor?'",
          answer: 'Could you explain that again, please?',
          accept: ['Could you explain that again please?', 'Can you explain that again, please?'],
          hint: "Usa 'Could you explain that again...?'",
          explanation: 'Frase de rescate muy útil para pedir aclaración con cortesía.',
        },
        {
          id: 'm1-l5-e5',
          type: 'builder',
          prompt: "Construye: 'Creo que el problema está en la caché.'",
          words: ['I think', 'the issue', 'is in', 'the cache.'],
          answer: 'I think the issue is in the cache.',
          explanation:
            "'I think' + cláusula es una forma simple de compartir tu hipótesis en debugging.",
        },
        {
          id: 'm1-l5-e6',
          type: 'write',
          prompt: "Escribe en inglés: 'La función devuelve un valor.'",
          answer: 'The function returns a value.',
          accept: ['This function returns a value.', 'The function returns a value'],
          hint: "Tercera persona singular: 'returns'.",
          explanation:
            'Repaso de patrón clave de m1-l1: sujeto técnico + verbo en presente simple.',
        },
        {
          id: 'm1-l5-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I fix bugs, I run tests and I push the code.',
          hint: 'Tres verbos técnicos en presente.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
  ],
}
