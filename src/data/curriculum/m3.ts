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
      minutes: 12,
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
          type: "technique",
          name: "Decodificación de Stack Traces",
          desc: "Los errores en consola siguen patrones predecibles: 'Cannot read property X of undefined' (intentas acceder a algo nulo) o 'Port already in use' (otro servidor sigue corriendo en ese puerto).",
        },
        {
          type: "vocab",
          title: "Git & GitHub",
          items: [
            { en: "repo", es: "repositorio Git", example: "Clone the repo." },
            { en: "branch", es: "rama de desarrollo", example: "Create a new branch for this feature." },
            { en: "PR (Pull Request)", es: "solicitud de revisión/cambios", example: "Open a PR when you're done." },
            { en: "merge", es: "unir ramas", example: "Merge conflict!" },
            { en: "commit", es: "guardado de cambios", example: "Write a clear commit message." },
            { en: "push / pull", es: "subir / bajar cambios", example: "Pull before you push." },
            { en: "clone / fork", es: "copiar local / copiar a tu cuenta", example: "Fork the repo first." },
            { en: "issue", es: "problema o tarea", example: "Create an issue on GitHub." },
          ],
        },
        {
          type: "table",
          title: "Errores de consola",
          columns: ["Error", "Qué significa", "Cómo arreglarlo"],
          rows: [
            ["Syntax error", "Error de sintaxis", "Revisa paréntesis, llaves y puntos y comas."],
            ["Undefined variable", "Variable no definida", "Declara la variable antes de usarla."],
            ["Null pointer exception", "Usas algo que es null", "Verifica que el dato no sea null."],
            ["Timeout", "Se tardó demasiado", "Aumenta el tiempo de espera u optimiza la query."],
            ["Permission denied", "Sin acceso suficiente", "Cambia permisos o verifica credenciales."],
            ["Port already in use", "Puerto ocupado", "Mata el proceso anterior o cambia de puerto."],
            ["Cannot read properties of undefined", "El objeto padre es undefined", "Usa optional chaining (?.) o valida el objeto."],
            ["Module not found", "No encuentra la librería", "Ejecuta npm install o revisa la ruta relativa."],
            ["Failed to fetch", "Falló la petición de red", "Verifica la URL del endpoint y la conexión."],
            ["CORS error", "Bloqueo de origen cruzado", "Configura Access-Control-Allow-Origin en el backend."],
          ],
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
      ],
    },
    {
      id: "m3-l2",
      slug: "conceptos-y-phrasal-verbs",
      title: "Conceptos de arquitectura + phrasal verbs para dev",
      step: "A2 · Paso 3.2",
      cefr: "A2",
      minutes: 14,
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
          type: "technique",
          name: "Phrasal Verbs de Acción Técnica",
          desc: "En conversación, 'roll back' suena más natural que 'revert the deployment'; 'revert' también es correcto, pero más formal. Lo mismo pasa con 'set up' frente a 'configure'. Apréndelos como comandos completos, no palabra por palabra.",
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
      ],
    },
    {
      id: "m3-l3",
      slug: "testing-y-calidad",
      title: "Testing y calidad sin traductor",
      step: "A2 · Paso 3.3",
      cefr: "A2",
      minutes: 10,
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
          type: "technique",
          name: "La pirámide de tests",
          desc: "Unit tests comprueban una pieza pequeña y aislada. Integration tests comprueban cómo encajan varias piezas. End-to-end tests recorren el flujo completo, como un usuario real. Cuantos más niveles añades, más lentos y frágiles suelen ser.",
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
          prompt: "Escribe en inglés: 'Ese test es flaky; vamos a arreglarlo.'",
          answer: "That test is flaky; we're going to fix it.",
          accept: [
            "That test is flaky. We are going to fix it.",
            "That test is flaky, we're going to fix it.",
            "That test is flaky; we are going to fix it.",
          ],
          hint: "'We're going to + verbo' expresa un plan.",
          explanation:
            "'Going to' es natural para un plan ya decidido; 'fix it' se refiere al test.",
        },
      ],
    },
    {
      id: "m3-l4",
      slug: "api-http-bases-de-datos",
      title: "API, HTTP y bases de datos",
      step: "A2 · Paso 3.4",
      cefr: "A2",
      minutes: 11,
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
          type: "technique",
          name: "Anatomía de una petición",
          desc: "El cliente envía un request a un endpoint con headers y un payload. El servidor responde con un status code y un response body. Si algo falla, el código y el mensaje te dicen dónde mirar.",
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
      ],
    },
  ],
};
