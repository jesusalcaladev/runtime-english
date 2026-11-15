import type { Module } from "../../lib/types";

export const m3: Module = {
  id: "m3",
  code: "MOD 03",
  level: "A1-A2",
  title: "Git, Testing, APIs y Phrasal Verbs",
  shortTitle: "Git, Testing & APIs",
  description:
    "Terminal, errores de consola, phrasal verbs, testing y el vocabulario base de APIs, HTTP y bases de datos.",
  sessions: [
    {
      id: "m3-l1",
      slug: "git-y-errores",
      title: "Git, GitHub y Mensajes de Error en Consola",
      step: "A2 · Paso 3.1",
      cefr: "A2",
      summary:
        "Lee cualquier stack trace o flujo de Git sin abrir el traductor y entiende qué te está pidiendo el sistema.",
      objectives: [
        "Reconocer 8 términos esenciales de Git y GitHub.",
        "Entender los 10 errores de consola más comunes.",
        "Explicar qué significa 'Port already in use' y cómo arreglarlo.",
      ],
      pronunciation:
        "Pull before you push to avoid a merge conflict in the main branch.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Conviene que ya manejes imperativos y verbos técnicos básicos de M1–M2 (run, pull, push, commit, merge, fix, deploy, test). En esta lección aprenderás vocabulario nuevo de Git/errores; los ejercicios usan palabras presentadas aquí (repo, branch, PR, port, process, module, path, etc.).",
        },
        {
          type: "technique",
          name: "Cómo leer un error sin agobiarte",
          desc: "No necesitas entender todo el stack trace. 1) Busca el mensaje clave ('Port already in use', 'Module not found'). 2) Identifica dónde ocurre (archivo/línea si aparece). 3) Piensa en la causa más común. Los errores siguen patrones repetibles: reconocer el patrón te da el siguiente paso.",
        },
        {
          type: "vocab",
          title: "Git & GitHub (vocabulario nuevo)",
          items: [
            { en: "repo (repository)", es: "repositorio de código", example: "Clone the repo.", note: "clone = copiar a tu máquina (verbo nuevo aquí)." },
            { en: "branch", es: "rama de desarrollo", example: "Create a new branch.", note: "create = crear (nuevo aquí)." },
            { en: "PR / pull request", es: "solicitud para revisar y unir cambios", example: "Open a PR when you're done.", note: "open = abrir." },
            { en: "merge", es: "unir cambios/ramas", example: "Merge the PR." },
            { en: "commit", es: "guardar un conjunto de cambios", example: "Write a clear commit message." },
            { en: "push / pull", es: "subir / traer cambios", example: "Pull before you push." },
            { en: "clone / fork", es: "copiar el repo localmente / copiarlo a tu cuenta", example: "Fork the repo, then clone it." },
            { en: "issue", es: "tarea o problema registrado", example: "Open an issue on GitHub." },
          ],
        },
        {
          type: "table",
          title: "Errores de consola frecuentes (mensaje → causa → acción)",
          columns: ["Error", "Qué significa", "Acción típica"],
          rows: [
            ["Syntax error", "Error de sintaxis", "Revisa paréntesis, llaves y comas."],
            ["Undefined variable", "Variable no definida", "Declara o importa la variable antes de usarla."],
            ["Null pointer / undefined", "Intentas usar algo que es null/undefined", "Verifica que el valor exista antes de usarlo."],
            ["Timeout", "Tardó demasiado", "Revisa red/consulta o aumenta el tiempo de espera."],
            ["Permission denied", "Sin permisos suficientes", "Revisa permisos o credenciales."],
            ["Port already in use", "El puerto ya está ocupado", "Mata/cierra el proceso anterior o cambia el puerto."],
            ["Module not found", "No encuentra un módulo/librería", "Ejecuta npm install o revisa la ruta/import."],
            ["Failed to fetch", "Falló la petición de red", "Revisa URL, servidor y conexión."],
            ["CORS error", "Bloqueo por origen cruzado", "Configura CORS en el backend."],
          ],
        },
        {
          type: "phrases",
          title: "Acciones útiles al ver un error (imperativos)",
          items: [
            { en: "Read the error message.", es: "Lee el mensaje de error." },
            { en: "Check the file and line.", es: "Revisa el archivo y la línea." },
            { en: "Kill the previous process.", es: "Detén/mata el proceso anterior." },
            { en: "Change the port.", es: "Cambia el puerto." },
            { en: "Run npm install.", es: "Ejecuta npm install." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Estrategia",
          body: "Mensaje clave → posible causa → una acción concreta. Ej.: 'Port already in use' → otro proceso usa el puerto → 'Kill the previous process and change the port.'",
        },
      ],
      exercises: [
        {
          id: "m3-l1-e1",
          type: "choice",
          prompt:
            "Te sale 'Port already in use' al ejecutar npm run dev. ¿Qué significa?",
          options: [
            "La sintaxis tiene un error",
            "Otro proceso ya está ocupando ese puerto",
            "Falta instalar node_modules",
            "El token expiró",
          ],
          answer: 1,
          explanation:
            "'Port already in use' indica que otro servidor ya está escuchando en ese mismo puerto.",
        },
        {
          id: "m3-l1-e2",
          type: "choice",
          prompt:
            "¿Qué buena práctica evita conflictos antes de subir tu código al repositorio remoto?",
          options: [
            "Fork before you clone",
            "Pull before you push",
            "Merge before you commit",
            "Deploy before you test",
          ],
          answer: 1,
          explanation:
            "'Pull before you push' descarga los últimos cambios del equipo antes de subir los tuyos.",
        },
        {
          id: "m3-l1-e3",
          type: "builder",
          prompt: "Construye: 'Descarga los últimos cambios antes de subir.'",
          words: ["Pull", "the latest changes", "before", "you push."],
          answer: "Pull the latest changes before you push.",
          explanation:
            "Imperativo + 'before' + presente simple: una estructura muy común en documentación.",
        },
        {
          id: "m3-l1-e4",
          type: "builder",
          prompt: "Construye: 'Mata el proceso anterior y cambia el puerto.'",
          words: ["Kill", "the previous process", "and", "change the port."],
          answer: "Kill the previous process and change the port.",
          explanation:
            "Dos imperativos unidos con 'and'. Es la instrucción típica cuando 'Port already in use' bloquea el arranque.",
        },
        {
          id: "m3-l1-e5",
          type: "choice",
          prompt: "Ves 'Module not found'. ¿Qué haces primero de forma natural?",
          options: [
            "Run npm install or check the import path.",
            "Delete the repository.",
            "Change the language.",
            "Ignore it and deploy.",
          ],
          answer: 0,
          explanation:
            "Cuando falta un módulo, lo normal es instalar dependencias o revisar la ruta. Un diagnóstico simple y tranquilo funciona mejor.",
        },
        {
          id: "m3-l1-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Abre un PR cuando termines.'",
          answer: "Open a PR when you're done.",
          accept: [
            "Open a PR when you are done.",
            "Open a pull request when you're done.",
          ],
          hint: "Usa el imperativo 'Open a PR...'",
          explanation:
            "Instrucción clara y muy común en equipos: cuándo abrir el pull request.",
        },
      ],
    },
    {
      id: "m3-l2",
      slug: "conceptos-y-phrasal-verbs",
      title: "Conceptos de arquitectura + phrasal verbs para dev",
      step: "A2 · Paso 3.2",
      cefr: "A2",
      summary:
        "Los términos de arquitectura y los 14 phrasal verbs que escucharás en cada llamada técnica.",
      objectives: [
        "Distinguir frontend/backend, staging/production y request/response.",
        "Usar phrasal verbs de acción técnica como set up o roll back.",
        "Distinguir 'roll back' (revertir) de 'break down' (desglosar).",
      ],
      pronunciation:
        "I ran into a bug in staging, so we need to roll back to the previous version.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Necesitas imperativos y tiempos básicos de M1–M2 (run, pull, push, can, pasado simple como 'ran into'). Aquí aprenderás conceptos de arquitectura y phrasal verbs nuevos como bloques completos; los ejercicios solo usan verbos/estructuras ya vistos más los que se presentan en esta lección.",
        },
        {
          type: "technique",
          name: "Phrasal verbs: aprende el bloque completo",
          desc: "No traduzcas palabra por palabra. 'Set up' = configurar/preparar, 'run into' = encontrarse con (un problema), 'roll back' = revertir. En conversación técnica suenan muy naturales ('roll back the deploy', 'run into a bug'). Memorízalos como chunks.",
        },
        {
          type: "vocab",
          title: "Conceptos de arquitectura",
          items: [
            { en: "frontend / backend", es: "interfaz de usuario / servidor y lógica" },
            { en: "API / endpoint", es: "interfaz de comunicación / URL específica" },
            { en: "request / response", es: "petición enviada / respuesta del servidor" },
            { en: "status code", es: "código HTTP (200 OK, 404 Not Found, 500 Error)" },
            { en: "query / migration", es: "consulta a BD / cambio de esquema en BD" },
            { en: "production / staging / local", es: "usuarios reales / pruebas / tu máquina" },
            { en: "refactor / legacy code", es: "mejorar estructura / código antiguo difícil" },
            { en: "dependency / env variables", es: "librería requerida / claves secretas (.env)" },
          ],
        },
        {
          type: "table",
          title: "14 phrasal verbs de dev",
          columns: ["Phrasal verb", "Español", "Ejemplo"],
          rows: [
            ["set up", "configurar", "Set up the development environment."],
            ["log in / log out", "iniciar / cerrar sesión", "Log in to the dashboard."],
            ["sign up", "registrarse", "Sign up for a free API key."],
            ["run into", "encontrarse con (un bug)", "I ran into a bug."],
            ["figure out", "resolver / entender", "I can't figure out this error."],
            ["break down", "desglosar (o averiarse, según contexto)", "Break down the task into smaller pieces."],
            ["roll back", "revertir versión", "Roll back to the previous version."],
            ["clear out", "limpiar caché/datos", "Clear out the cache."],
            ["plug in", "conectar / integrar", "Plug in the new module."],
            ["comment out", "comentar código", "Comment out the console.log."],
            ["check out", "cambiar de rama / revisar", "Check out my new branch."],
            ["sync up", "sincronizar cambios", "Sync up with the latest changes."],
            ["speed up", "acelerar / optimizar", "This will speed up the build."],
            ["shut down", "apagar servidor", "The server shut down unexpectedly."],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Consejo práctico",
          body: "Fíjate en el verbo+partícula+objeto como unidad: 'set up the environment', 'run into a bug', 'roll back to the previous version', 'figure out this error'. Repetir el chunk completo te ayuda a usarlo sin traducir.",
        },
      ],
      exercises: [
        {
          id: "m3-l2-e1",
          type: "choice",
          prompt:
            "El despliegue nuevo rompió producción. ¿Qué phrasal verb usas para volver a la versión anterior?",
          options: ["sign up", "roll back", "comment out", "plug in"],
          answer: 1,
          explanation:
            "'roll back' significa revertir un despliegue o cambio hacia una versión estable anterior.",
        },
        {
          id: "m3-l2-e2",
          type: "choice",
          prompt:
            "Quieres desactivar temporalmente un console.log sin borrarlo:",
          options: [
            "Clear out the console.log",
            "Comment out the console.log",
            "Shut down the console.log",
            "Break down the console.log",
          ],
          answer: 1,
          explanation:
            "'comment out' significa convertir una línea o bloque de código en comentario.",
        },
        {
          id: "m3-l2-e3",
          type: "builder",
          prompt: "Construye: 'Configura el entorno de desarrollo.'",
          words: ["Set up", "the development", "environment."],
          answer: "Set up the development environment.",
          explanation:
            "'Set up' es el phrasal verb universal para instalar y configurar un entorno.",
        },
        {
          id: "m3-l2-e4",
          type: "builder",
          prompt: "Construye: 'No puedo entender este error.'",
          words: ["I can't", "figure out", "this error."],
          answer: "I can't figure out this error.",
          explanation:
            "'Figure out' significa entender o resolver. Es una de las formas más naturales de pedir ayuda con un bug.",
        },
        {
          id: "m3-l2-e5",
          type: "choice",
          prompt: "Estás depurando y encontraste un problema inesperado. ¿Cómo lo dices naturalmente?",
          options: [
            "I ran into a bug.",
            "I ran to a bug.",
            "I ran inside a bug.",
            "I run intoed a bug.",
          ],
          answer: 0,
          explanation:
            "'Run into' significa encontrarse con un problema o bug. Es muy común y suena natural en equipos de desarrollo.",
        },
        {
          id: "m3-l2-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Sincronízate con los últimos cambios.'",
          answer: "Sync up with the latest changes.",
          accept: [
            "Sync with the latest changes.",
            "Sync up with the latest changes",
          ],
          hint: "Usa 'Sync up with...'",
          explanation:
            "'Sync up' es una forma natural y frecuente de pedir que alguien actualice su trabajo con lo más reciente.",
        },
        {
          id: "m3-l2-e7",
          type: "fill-blank",
          prompt: "Completa con el phrasal verb correcto (de esta lección).",
          template: "I ___ a bug in staging, so we need to ___ to the previous version.",
          blanks: ["ran into", "roll back"],
          hint: "Encontrarse con un problema → 'ran into'. Revertir → 'roll back'.",
          explanation:
            "Repaso en contexto: 'ran into a bug' (pasado de 'run into') y 'roll back' son chunks muy comunes en trabajo técnico.",
        },
      ],
    },
    {
      id: "m3-l3",
      slug: "testing-y-calidad",
      title: "Testing y calidad sin traductor",
      step: "A2 · Paso 3.3",
      cefr: "A2",
      summary:
        "Unit, integration, e2e, mocks y tests flaky: el vocabulario para hablar de calidad con tu equipo.",
      objectives: [
        "Distinguir unit, integration y end-to-end tests.",
        "Explicar qué es un test flaky y por qué importa.",
        "Hablar de cobertura, regresiones y edge cases.",
      ],
      pronunciation:
        "The unit tests pass, but the end-to-end test is flaky in CI.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Usarás verbos y estructuras ya vistas (run, pass, fail, add, fix, need to). Esta lección introduce vocabulario de testing (unit/integration/e2e, mock, flaky, regression, edge case); los términos aparecen explicados antes de usarse en ejercicios.",
        },
        {
          type: "technique",
          name: "La pirámide de tests (qué prueba cada nivel)",
          desc: "Unit tests: una pieza pequeña y aislada (una función). Integration tests: cómo encajan varias piezas (p. ej. app + base de datos). End-to-end (e2e): el flujo completo como un usuario real. Más cobertura de flujo suele implicar tests más lentos y frágiles.",
        },
        {
          type: "vocab",
          title: "Vocabulario de calidad",
          items: [
            { en: "unit test", es: "test unitario", example: "Add a unit test for this function." },
            { en: "integration test", es: "test de integración", example: "The integration test hits the database." },
            { en: "end-to-end test", es: "test de extremo a extremo", example: "The end-to-end test covers checkout." },
            { en: "mock / stub", es: "simulación de una dependencia", example: "Mock the API call in the test." },
            { en: "flaky test", es: "test inestable", example: "That test is flaky in CI." },
            { en: "coverage", es: "cobertura", example: "Coverage dropped after the refactor." },
            { en: "regression", es: "regresión", example: "Add a regression test for this bug." },
            { en: "edge case", es: "caso límite", example: "What happens in the empty edge case?" },
          ],
        },
        {
          type: "table",
          title: "Qué prueba cada test",
          columns: ["Tipo", "Qué comprueba", "Señal de alarma"],
          rows: [
            ["Unit", "Una función o módulo aislado", "Demasiado lento para ser unitario"],
            ["Integration", "Varias piezas conectadas", "Depende de datos reales sin control"],
            ["End-to-end", "Un flujo completo de usuario", "Falla de forma intermitente"],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Habla de calidad sin estrés",
          body: "Frases simples funcionan muy bien: 'The tests pass', 'This test is flaky', 'We need a regression test'. Ser claro y específico vale más que usar términos complejos.",
        },
      ],
      exercises: [
        {
          id: "m3-l3-e1",
          type: "choice",
          prompt: "¿Qué test comprueba una sola función de forma aislada?",
          options: ["End-to-end test", "Unit test", "Load test", "Smoke test"],
          answer: 1,
          explanation:
            "Un 'unit test' prueba una unidad pequeña y aislada, normalmente una función o un módulo.",
        },
        {
          id: "m3-l3-e2",
          type: "choice",
          prompt: "Un test pasa a veces y falla sin que cambie el código. ¿Cómo lo describes?",
          options: ["A flaky test", "A legacy test", "A mocked test", "A green test"],
          answer: 0,
          explanation:
            "'Flaky' describe un test inestable que no da el mismo resultado en cada ejecución.",
        },
        {
          id: "m3-l3-e3",
          type: "builder",
          prompt: "Construye: 'Necesitamos añadir un test de regresión para este bug.'",
          words: ["We need", "to add", "a regression test", "for this bug."],
          answer: "We need to add a regression test for this bug.",
          explanation:
            "'Need to + verbo' expresa necesidad. Un regression test evita que el bug vuelva.",
        },
        {
          id: "m3-l3-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Ese test es inestable; lo arreglaremos.'",
          answer: "That test is flaky. We will fix it.",
          accept: [
            "That test is flaky; we will fix it.",
            "That test is flaky, we will fix it.",
            "That test is flaky. We'll fix it.",
            "That test is flaky; we're going to fix it.",
            "That test is flaky. We are going to fix it.",
          ],
          hint: "Usa 'flaky' y futuro con 'will' ('We will fix it').",
          explanation:
            "Para un plan/decisión clara puedes usar 'will' (ya visto): 'We will fix it'. También escucharás 'going to', pero aquí priorizamos una forma simple.",
        },
        {
          id: "m3-l3-e5",
          type: "builder",
          prompt: "Construye: 'Agrega un test unitario para esta función.'",
          words: ["Add", "a unit test", "for this", "function."],
          answer: "Add a unit test for this function.",
          explanation:
            "Petición directa y natural en un PR o tarea de equipo.",
        },
        {
          id: "m3-l3-e6",
          type: "choice",
          prompt: "¿Qué significa 'edge case'?",
          options: [
            "El caso principal y más común",
            "Un caso límite o poco común",
            "Un error de compilación",
            "Una prueba borrada",
          ],
          answer: 1,
          explanation:
            "'Edge case' es un caso límite. Pensar en edge cases te ayuda a escribir software más sólido y a comunicarte con precisión.",
        },
        {
          id: "m3-l3-e7",
          type: "fill-blank",
          prompt: "Completa con el tipo de test correcto (vocabulario de esta lección).",
          template: "A ___ test checks one function. An ___ test checks how parts work together.",
          blanks: ["unit", "integration"],
          hint: "Pieza pequeña aislada → unit. Varias piezas conectadas → integration.",
          explanation:
            "Repaso directo de los niveles: 'unit test' (aislado) e 'integration test' (piezas conectadas).",
        },
      ],
    },
    {
      id: "m3-l4",
      slug: "api-http-bases-de-datos",
      title: "API, HTTP y bases de datos",
      step: "A2 · Paso 3.4",
      cefr: "A2",
      summary:
        "Endpoints, status codes, payloads y queries: el inglés que aparece en cada petición.",
      objectives: [
        "Nombrar las partes de una petición HTTP.",
        "Reconocer los status codes más comunes.",
        "Hablar de queries, índices, migraciones y caché.",
      ],
      pronunciation:
        "The endpoint returns a 500 error when the database query fails.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Ya conoces verbos como call/fetch/return/fail y errores comunes. Aquí aprenderás términos HTTP/BD (request, endpoint, payload, status code, query, migration, cache) usados en las tablas y ejercicios de esta misma lección.",
        },
        {
          type: "technique",
          name: "Anatomía de una petición HTTP",
          desc: "Cliente → envía un request a un endpoint (URL) con método (GET/POST...), headers y a veces payload/body. Servidor → responde con status code (200, 401, 500...) y body. Para explicar un problema: endpoint/método + status code + causa probable.",
        },
        {
          type: "table",
          title: "Status codes que debes reconocer",
          columns: ["Código", "Significado", "Cuándo lo ves"],
          rows: [
            ["200 OK", "Todo salió bien", "GET o actualización correcta"],
            ["201 Created", "Recurso creado", "Después de un POST"],
            ["400 Bad Request", "Petición mal formada", "Falta un campo o el JSON es inválido"],
            ["401 Unauthorized", "No autenticado", "Falta el token o expiró"],
            ["403 Forbidden", "Sin permiso", "Tienes sesión, pero no acceso"],
            ["404 Not Found", "No existe", "URL o recurso inexistente"],
            ["409 Conflict", "Conflicto", "Duplicado o versión desactualizada"],
            ["500 Internal Server Error", "Fallo del servidor", "Excepción no controlada"],
          ],
        },
        {
          type: "vocab",
          title: "Bases de datos y rendimiento",
          items: [
            { en: "query", es: "consulta", example: "This query is too slow." },
            { en: "index", es: "índice", example: "Add an index on the user_id column." },
            { en: "migration", es: "migración de esquema", example: "Run the migration before deploying." },
            { en: "cache", es: "caché", example: "The response is stored in the cache." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Describe el problema en orden",
          body: "Para sonar claro: endpoint/método → status code → causa probable. Ej.: 'The POST /login endpoint returns 401 because the token is missing.' Orden simple, mensaje potente.",
        },
      ],
      exercises: [
        {
          id: "m3-l4-e1",
          type: "choice",
          prompt: "¿Qué significa un status code 404?",
          options: [
            "El servidor falló",
            "No se encontró el recurso",
            "No estás autenticado",
            "El recurso se creó",
          ],
          answer: 1,
          explanation:
            "404 Not Found significa que la URL o el recurso solicitado no existe.",
        },
        {
          id: "m3-l4-e2",
          type: "choice",
          prompt: "Tienes sesión iniciada, pero no permiso para ver ese recurso. ¿Qué código esperas?",
          options: ["401", "403", "404", "500"],
          answer: 1,
          explanation:
            "401 es falta de autenticación; 403 es falta de permisos con una identidad ya autenticada.",
        },
        {
          id: "m3-l4-e3",
          type: "builder",
          prompt: "Construye: 'La API devuelve un error 500.'",
          words: ["The API", "returns", "a 500 error."],
          answer: "The API returns a 500 error.",
          explanation:
            "'Returns a 500 error' es la forma habitual de describir una respuesta de error del servidor.",
        },
        {
          id: "m3-l4-e4",
          type: "write",
          prompt: "Escribe en inglés: 'La petición falló porque el token expiró.'",
          answer: "The request failed because the token expired.",
          accept: [
            "The request failed because the token had expired.",
            "The request failed because the token has expired.",
          ],
          hint: "Usa 'failed because' + pasado simple.",
          explanation:
            "'Expired' es pasado simple; 'had expired' también funciona si quieres marcar que ocurrió antes de la petición.",
        },
        {
          id: "m3-l4-e5",
          type: "choice",
          prompt: "Quieres decir que falta autenticación. ¿Qué status code encaja?",
          options: ["401 Unauthorized", "403 Forbidden", "200 OK", "409 Conflict"],
          answer: 0,
          explanation:
            "401 significa que no estás autenticado (falta o es inválido el token). 403 es cuando sí estás autenticado pero no tienes permiso.",
        },
        {
          id: "m3-l4-e6",
          type: "builder",
          prompt: "Construye: 'Ejecuta la migración antes de desplegar.'",
          words: ["Run", "the migration", "before", "you deploy."],
          answer: "Run the migration before you deploy.",
          explanation:
            "Instrucción clara con estructuras ya vistas: imperativo ('Run...') + 'before you deploy' (presente simple).",
        },
        {
          id: "m3-l4-e7",
          type: "listen",
          prompt: "Escucha y escribe el reporte del problema (endpoint + código).",
          audioText: "The API returns a 500 error.",
          answer: "The API returns a 500 error.",
          accept: ["The API returns a 500 error"],
          hint: "Empieza con 'The API returns...'",
          explanation:
            "Dictado de una frase modelo para reportar fallos: sujeto (The API) + verbo (returns) + resultado (a 500 error).",
        },
      ],
    },
    {
      id: "m3-l5",
      slug: "errores-stack-traces-y-logs",
      title: "Errores, stack traces y logs",
      step: "A2 · Paso 3.5",
      cefr: "A2",
      summary:
        "Lee mensajes de error y stack traces, explica qué pasó y pide ayuda con el contexto exacto.",
      objectives: [
        "Entender mensajes de error comunes y describirlos en inglés.",
        "Ubicar el archivo, línea y causa probable en un stack trace.",
        "Pedir ayuda compartiendo error, contexto y lo que ya intentaste.",
      ],
      pronunciation:
        "I'm getting a TypeError: undefined is not a function at line 42. I think the value is null.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Esta lección reúne vocabulario de errores (TypeError, stack trace, null/undefined, logs) y frases para pedir ayuda. Todo lo necesario para los ejercicios aparece en los bloques y ejemplos de esta sesión.",
        },
        {
          type: "technique",
          name: "Reportar un error: fórmula clara",
          desc: "1) Mensaje exacto ('I'm getting...'). 2) Dónde ocurre (archivo/línea o función, 'It fails at...'). 3) Qué esperabas vs qué pasa ('I expected..., but...'). 4) Qué ya probaste ('I already checked...'). Así otros pueden ayudarte rápido.",
        },
        {
          type: "vocab",
          title: "Errores y términos comunes",
          items: [
            { en: "TypeError", es: "error de tipo", example: "TypeError: undefined is not a function." },
            { en: "ReferenceError", es: "variable no definida", example: "ReferenceError: user is not defined." },
            { en: "stack trace", es: "traza de la pila de llamadas", example: "Check the stack trace for the file and line." },
            { en: "log", es: "registro", example: "The logs show a timeout." },
            { en: "null / undefined", es: "nulo / no definido", example: "The value is null." },
            { en: "permission denied", es: "permiso denegado", example: "I'm getting 'permission denied'." },
            { en: "connection refused", es: "conexión rechazada", example: "The database connection was refused." },
          ],
        },
        {
          type: "phrases",
          title: "Cómo reportar un error",
          items: [
            { en: "I'm getting this error: ...", es: "Me está saliendo este error: ..." },
            { en: "It fails at line 42 in auth.ts.", es: "Falla en la línea 42 de auth.ts." },
            { en: "The stack trace points to the login function.", es: "El stack trace apunta a la función de login." },
            { en: "I expected it to return a user, but it returns null.", es: "Esperaba que devolviera un usuario, pero devuelve null." },
            { en: "I already checked the logs.", es: "Ya revisé los logs." },
            { en: "Could you help me figure out what's causing this?", es: "¿Me ayudas a ver qué está causando esto?" },
          ],
        },
        {
          type: "table",
          title: "Mensaje → explicación clara",
          columns: ["Mensaje", "Cómo decirlo"],
          rows: [
            ["undefined is not a function", "I'm calling a function, but the value is undefined."],
            ["connection refused", "The app can't connect to the service; the connection was refused."],
            ["permission denied", "The process doesn't have permission to access that file."],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Pedir ayuda es una habilidad",
          body: "Comparte el error exacto, el archivo/línea y lo que ya probaste. No es molestia: es información útil. En inglés, frases como 'I'm getting this error...' y 'I already checked...' (o 'I've already checked...') suenan naturales y colaborativas.",
        },
      ],
      exercises: [
        {
          id: "m3-l5-e1",
          type: "choice",
          prompt: "Ves 'TypeError: undefined is not a function'. ¿Qué explicación es más clara?",
          options: [
            "It is broken.",
            "I'm calling something as a function, but its value is undefined.",
            "The computer is wrong.",
            "There is an error somewhere.",
          ],
          answer: 1,
          explanation:
            "Explicar el tipo de error y la causa probable ayuda a depurar rápido: llamas algo como función pero es undefined.",
        },
        {
          id: "m3-l5-e2",
          type: "builder",
          prompt: "Construye: 'Falla en la línea 42 de auth.ts.'",
          words: ["It fails", "at line 42", "in auth.ts."],
          answer: "It fails at line 42 in auth.ts.",
          explanation:
            "Dar archivo y línea es clave cuando compartes un stack trace.",
        },
        {
          id: "m3-l5-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'Me está saliendo este error: conexión rechazada.'",
          answer: "I'm getting this error: connection refused.",
          accept: [
            "I am getting this error: connection refused.",
            "I'm getting this error: Connection refused.",
          ],
          hint: "Usa 'I'm getting this error: ...'",
          explanation:
            "Citar el mensaje exacto ('connection refused') hace el reporte preciso.",
        },
        {
          id: "m3-l5-e4",
          type: "choice",
          prompt: "¿Qué información hace más útil tu pedido de ayuda?",
          options: [
            "Solo decir 'it doesn't work'.",
            "Error exacto, dónde ocurre, qué esperabas y qué probaste.",
            "Enviar una captura sin texto.",
            "Decir que es urgente.",
          ],
          answer: 1,
          explanation:
            "Error + ubicación + expectativa + intentos previos es la fórmula más rápida para recibir ayuda.",
        },
        {
          id: "m3-l5-e5",
          type: "builder",
          prompt: "Construye: 'El stack trace apunta a la función de login.'",
          words: ["The stack trace", "points to", "the login function."],
          answer: "The stack trace points to the login function.",
          explanation:
            "'Points to' es una forma natural de decir dónde parece originarse el problema.",
        },
        {
          id: "m3-l5-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Ya revisé los logs.'",
          answer: "I already checked the logs.",
          accept: [
            "I've already checked the logs.",
            "I have already checked the logs.",
            "I already checked the logs",
          ],
          hint: "Puedes usar pasado simple: 'I already checked...'",
          explanation:
            "Decir lo que ya intentaste da contexto útil. 'I already checked the logs.' (pasado simple) es claro; también escucharás 'I've already checked...' en equipos (forma que verás más adelante).",
        },
        {
          id: "m3-l5-e7",
          type: "dialogue-order",
          prompt: "Ordena cómo pedir ayuda con un error (de forma clara).",
          lines: [
            "I'm getting this error: connection refused.",
            "It fails in auth.ts when I try to log in.",
            "I already checked the logs. Any ideas?",
          ],
          explanation:
            "Orden útil: error exacto → dónde/cuándo ocurre → qué ya probaste + pregunta. Así facilitas que te ayuden.",
        },
      ],
    },
    {
      id: "m8-l3",
      slug: "micro-repaso-fundamentos",
      title: "Micro-repaso: fundamentos A1-A2",
      step: "A2 · Paso 3.6 · Checkpoint",
      cefr: "A2",
      summary:
        "Repaso corto y espaciado de lo esencial: verbos, errores simples, aclarar y acciones diarias.",
      objectives: [
        "Recordar estructuras básicas usadas en el trabajo técnico.",
        "Responder rápido con frases claras y correctas.",
        "Detectar huecos para volver a sesiones anteriores si hace falta."
      ],
      pronunciation:
        "I fixed the bug. I'm working on it now. Could you clarify what you mean?",
      blocks: [
        {
          type: "technique",
          name: "Repaso espaciado: poco, claro y frecuente",
          desc: "Un micro-repaso mezcla temas ya vistos para reforzar memoria. Si fallas en algo, vuelve a la sesión original, corrige y sigue. La meta es fluidez y claridad, no perfección.",
        },
        {
          type: "phrases",
          title: "Frases núcleo",
          items: [
            { en: "I fixed the bug.", es: "Arreglé el bug." },
            { en: "I'm working on it now.", es: "Estoy trabajando en eso ahora." },
            { en: "It doesn't work.", es: "No funciona." },
            { en: "Could you clarify what you mean?", es: "¿Podrías aclarar a qué te refieres?" },
            { en: "I pushed the changes.", es: "Subí los cambios." }
          ],
        }
      ],
      exercises: [
        {
          id: "m8-l3-e1",
          type: "choice",
          prompt: "¿Cómo dirías que estás trabajando en algo ahora mismo?",
          options: ["I work on it now.", "I'm working on it now.", "I worked on it now.", "I working on it."],
          answer: 1,
          explanation: "Acción en curso: presente continuo 'I'm working on it now.'",
        },
        {
          id: "m8-l3-e2",
          type: "write",
          prompt: "Escríbelo en inglés: 'Arreglé el bug.'",
          answer: "I fixed the bug.",
          accept: ["I fixed the bug"],
          hint: "Pasado simple: 'fixed'.",
          explanation: "Acción terminada: 'I fixed the bug.'",
        },
        {
          id: "m8-l3-e3",
          type: "builder",
          prompt: "Construye: '¿Podrías aclarar a qué te refieres?'",
          words: ["Could you clarify", "what you", "mean?"],
          answer: "Could you clarify what you mean?",
          explanation: "Frase clave para pedir aclaración con cortesía.",
        },
        {
          id: "m8-l3-e4",
          type: "choice",
          prompt: "¿Qué frase reporta un problema de forma simple y clara?",
          options: ["Is bad.", "It doesn't work.", "Broken thing.", "No good code."],
          answer: 1,
          explanation: "'It doesn't work.' es simple, claro y muy usado.",
        },
        {
          id: "m8-l3-e5",
          type: "write",
          prompt: "Escríbelo en inglés: 'Subí los cambios.'",
          answer: "I pushed the changes.",
          accept: ["I pushed the changes"],
          hint: "Pasado de 'push' = 'pushed'.",
          explanation: "En git, 'push the changes' es la forma común de decir subir los cambios.",
        },
        {
          id: "m8-l3-e6",
          type: "choice",
          prompt: "Te piden repetir. ¿Qué dices?",
          options: ["No.", "Could you say that again, please?", "Listen better.", "Again now."],
          answer: 1,
          explanation: "Pedir repetición con cortesía: 'Could you say that again, please?'",
        }
      ],
    },
    {
      id: "m3-l7",
      slug: "practica-git-http-errores",
      title: "Práctica: Git, HTTP y reporte de errores",
      step: "A2 · Paso 3.7 · Práctica guiada",
      cefr: "A2",
      summary:
        "Sesión corta para separar y reforzar m3-l1, m3-l4 y m3-l5: mensajes de error, status codes y reportes claros.",
      objectives: [
        "Elegir acciones simples ante errores comunes (puerto, módulo, conexión).",
        "Describir un fallo HTTP o de runtime con información útil.",
        "Pedir ayuda con error, ubicación y contexto ya intentado."
      ],
      pronunciation:
        "I'm getting this error: connection refused. The API returns a 500 error. Could you help me?",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Repasa m3-l1 (Git/errores), m3-l4 (API/HTTP) y m3-l5 (stack traces y logs). Esta práctica usa solo términos y frases ya enseñados en esas lecciones.",
        },
        {
          type: "technique",
          name: "Reportar y actuar con claridad",
          desc: "Error común → acción típica (p. ej. 'Port already in use' → cambiar puerto/matar proceso). Para pedir ayuda: error exacto + dónde ocurre + qué ya probaste.",
        },
        {
          type: "phrases",
          title: "Chunks de apoyo",
          items: [
            { en: "The API returns a 500 error.", es: "La API devuelve un error 500." },
            { en: "I'm getting this error: connection refused.", es: "Me está saliendo este error: connection refused." },
            { en: "It fails at line 42 in auth.ts.", es: "Falla en la línea 42 de auth.ts." },
            { en: "I already checked the logs.", es: "Ya revisé los logs." }
          ],
        }
      ],
      exercises: [
        {
          id: "m3-l7-e1",
          type: "choice",
          prompt: "Ves 'Port already in use'. ¿Qué acción encaja con lo aprendido?",
          options: [
            "Kill the previous process or change the port.",
            "Delete the repo.",
            "Ignore the error.",
            "Open a new issue only."
          ],
          answer: 0,
          explanation:
            "Si el puerto está ocupado, la acción típica es detener el proceso anterior o cambiar el puerto.",
        },
        {
          id: "m3-l7-e2",
          type: "builder",
          prompt: "Construye: 'La API devuelve un error 500.'",
          words: ["The API", "returns", "a 500 error."],
          answer: "The API returns a 500 error.",
          explanation:
            "Frase modelo para reportar un status code del servidor.",
        },
        {
          id: "m3-l7-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'Me está saliendo este error: conexión rechazada.'",
          answer: "I'm getting this error: connection refused.",
          accept: ["I am getting this error: connection refused."],
          hint: "Usa 'I'm getting this error: ...'",
          explanation:
            "Cita el mensaje exacto para que el reporte sea claro.",
        },
        {
          id: "m3-l7-e4",
          type: "choice",
          prompt: "¿Qué mensaje es más útil para pedir ayuda?",
          options: [
            "It doesn't work.",
            "I'm getting this error: connection refused. It fails in auth.ts. I already checked the logs.",
            "Help now.",
            "Something is wrong."
          ],
          answer: 1,
          explanation:
            "Incluye error exacto, ubicación y lo que ya probaste.",
        },
        {
          id: "m3-l7-e5",
          type: "builder",
          prompt: "Construye: 'Falla en la línea 42 de auth.ts.'",
          words: ["It fails", "at line 42", "in auth.ts."],
          answer: "It fails at line 42 in auth.ts.",
          explanation:
            "Indicar archivo y línea ayuda a localizar el problema rápidamente.",
        },
        {
          id: "m3-l7-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Ya revisé los logs.'",
          answer: "I already checked the logs.",
          accept: ["I've already checked the logs.", "I have already checked the logs."],
          hint: "Pasado simple: 'I already checked...'",
          explanation:
            "Compartir lo que ya intentaste da contexto y ahorra tiempo.",
        }
      ],
    },
  ],
};
