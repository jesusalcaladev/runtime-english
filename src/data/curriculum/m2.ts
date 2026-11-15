import type { Module } from "../../lib/types";

export const m2: Module = {
  id: "m2",
  code: "MOD 02",
  level: "A1-A2",
  title: "Los 4 Tiempos Verbales del Dev",
  shortTitle: "4 Tiempos del Dev",
  description:
    "Presente simple, presente continuo, pasado simple y futuro simple aplicados al ciclo de desarrollo.",
  sessions: [
    {
      id: "m2-l1",
      slug: "cuatro-tiempos",
      title: "Los 4 tiempos que usarás cada día",
      step: "A2 · Paso 2.1",
      cefr: "A2",
      summary:
        "Presente, continuo, pasado y futuro cubren la mayor parte del trabajo diario. Empieza por estos cuatro y deja el present perfect para B1.",
      objectives: [
        "Describir lo que hace el código en presente simple.",
        "Reportar lo que estás haciendo ahora con presente continuo.",
        "Contar lo que ya hiciste y lo que harás en el sprint.",
      ],
      pronunciation:
        "Yesterday I fixed the bug, now I am running tests, and tomorrow I will deploy.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Debes sentirte cómodo con los verbos básicos del Módulo 1 (be/have/do/need/think, verbos técnicos como run/fix/push/pull) y la regla de tercera persona (-s). Aquí aprenderás cuándo usar cada tiempo; los ejemplos usan vocabulario ya visto en M1 (bug, tests, code, deploy, PR, database).",
        },
        {
          type: "technique",
          name: "Matriz Temporal del Sprint (qué tiempo usar)",
          desc: "1) Lo que el código HACE o es verdad general → presente simple ('returns', 'is'). 2) Lo que está pasando AHORA MISMO → presente continuo ('I'm fixing', 'is failing'). 3) Lo que YA pasó en un momento cerrado → pasado simple ('fixed yesterday', 'crashed at 3am'). 4) Lo que HARÁS / plan o decisión → futuro simple con 'will' ('I will deploy').",
        },
        {
          type: "callout",
          tone: "info",
          title: "¿Y el present perfect?",
          body: "'I've finished the API' es habitual en standups. Lo verás con más detalle más adelante. Por ahora, si necesitas hablar de algo terminado, usa pasado simple con un marcador claro: 'I finished it yesterday' o 'I finished it this morning'.",
        },
        {
          type: "tenses",
          items: [
            {
              name: "Presente Simple",
              tag: "Lo que el código HACE / rutina",
              formula: "This function returns a string",
              cases: [
                "useState returns an array.",
                "JavaScript is single-threaded.",
                "The endpoint expects a POST request.",
                "I push code every day.",
              ],
            },
            {
              name: "Presente Continuo",
              tag: "Lo que está pasando AHORA MISMO",
              formula: "I am fixing the bug",
              cases: [
                "I'm debugging the login issue.",
                "The server is crashing.",
                "The build is failing on CI.",
                "I'm reviewing your PR right now.",
              ],
            },
            {
              name: "Pasado Simple",
              tag: "Lo que YA hiciste / causa del bug",
              formula: "Yesterday, I fixed the bug",
              cases: [
                "I deployed version 2.0 yesterday.",
                "The previous developer forgot to close the connection.",
                "The database crashed at 3am.",
                "I merged your PR this morning.",
              ],
            },
            {
              name: "Futuro Simple",
              tag: "Lo que HARÁS / próximas tareas",
              formula: "I will refactor this next week",
              cases: [
                "We will migrate to TypeScript next month.",
                "I will add tests tomorrow.",
                "The new feature will be ready on Friday.",
                "I will push a fix in 10 minutes.",
              ],
            },
          ],
        },
      ],
      exercises: [
        {
          id: "m2-l1-e1",
          type: "choice",
          prompt:
            "Estás en una reunión y quieres decir qué estás haciendo en este instante:",
          options: [
            "I review your PR right now",
            "I'm reviewing your PR right now",
            "I reviewed your PR right now",
            "I will review your PR right now",
          ],
          answer: 1,
          explanation:
            "'right now' exige presente continuo: 'I'm reviewing your PR right now'.",
        },
        {
          id: "m2-l1-e2",
          type: "choice",
          prompt:
            "Quieres explicar en una retrospectiva qué causó el fallo de ayer:",
          options: [
            "The database crashes at 3am",
            "The database crashed at 3am",
            "The database is crashing at 3am",
            "The database will crash at 3am",
          ],
          answer: 1,
          explanation:
            "Evento ocurrido en un punto cerrado del pasado ('at 3am' ayer) → pasado simple ('crashed').",
        },
        {
          id: "m2-l1-e3",
          type: "builder",
          prompt: "Construye: 'Subiré un arreglo en 10 minutos.'",
          words: ["I will", "push", "a fix", "in 10 minutes."],
          answer: "I will push a fix in 10 minutes.",
          explanation:
            "Compromiso rápido a futuro → 'I will + verbo base (push)'.",
        },
        {
          id: "m2-l1-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Ayer desplegué la versión 2.0.'",
          answer: "I deployed version 2.0 yesterday.",
          accept: [
            "Yesterday I deployed version 2.0.",
            "I deployed v2.0 yesterday.",
          ],
          hint: "'Deploy' en pasado simple añade -ed: 'deployed'.",
          explanation:
            "El pasado simple con un marcador temporal ('yesterday') es la forma más clara de reportar algo terminado en una retrospectiva.",
        },
        {
          id: "m2-l1-e5",
          type: "choice",
          prompt: "Quieres describir lo que hace tu código en general: 'Esta función devuelve un string.' ¿Qué tiempo usas?",
          options: [
            "Presente simple: 'This function returns a string.'",
            "Presente continuo: 'This function is returning a string.'",
            "Pasado simple: 'This function returned a string.'",
            "Futuro simple: 'This function will return a string.'",
          ],
          answer: 0,
          explanation:
            "Para describir comportamiento habitual o lo que el código hace, usa presente simple: es claro y suena natural en docs y reviews.",
        },
        {
          id: "m2-l1-e6",
          type: "builder",
          prompt: "Construye: 'Estoy revisando tu PR ahora mismo.'",
          words: ["I'm reviewing", "your PR", "right now."],
          answer: "I'm reviewing your PR right now.",
          explanation:
            "Presente continuo + 'right now' comunica lo que está pasando en este momento, sin sonar robótico.",
        },
        {
          id: "m2-l1-e7",
          type: "fill-blank",
          prompt: "Completa con el tiempo correcto según la pista.",
          template: "Yesterday I ___ the bug. Now I ___ the tests. Tomorrow I ___ the fix.",
          blanks: ["fixed", "am running|I'm running", "will deploy|'ll deploy"],
          hint: "Pasado (yesterday) → fixed. Ahora (now) → am running. Mañana (tomorrow) → will deploy.",
          explanation:
            "Una misma historia en tres tiempos: pasado simple, presente continuo y futuro con 'will'. Los marcadores de tiempo te dicen cuál usar.",
        },
      ],
    },
    {
      id: "m2-l2",
      slug: "contar-un-bug",
      title: "Cuenta un bug en pasado, presente y futuro",
      step: "A2 · Paso 2.2",
      cefr: "A2",
      summary:
        "Cuenta una sola historia con tres tiempos: qué encontraste, qué estás haciendo y cuándo lo vas a arreglar.",
      objectives: [
        "Narrar un bug con pasado simple y marcadores de tiempo.",
        "Explicar la corrección que estás haciendo ahora.",
        "Comprometerte a un siguiente paso con futuro simple.",
      ],
      pronunciation:
        "I found a bug yesterday, I'm fixing it now, and I'll deploy the fix after the tests pass.",
      blocks: [
        {
          type: "technique",
          name: "La línea de tiempo del bug",
          desc: "Una historia clara tiene tres partes: 'I found the bug yesterday' (pasado), 'I'm writing a test now' (presente continuo) y 'I'll deploy the fix after the tests pass' (futuro). Si mezclas los tiempos, quien te escucha no sabe si el problema sigue abierto.",
        },
        {
          type: "phrases",
          title: "Frases para narrar el bug",
          items: [
            { en: "I found a bug in the login flow yesterday.", es: "Encontré un bug en el flujo de login ayer." },
            { en: "It happens when the token expires.", es: "Ocurre cuando el token caduca." },
            { en: "I'm writing a test to reproduce it now.", es: "Estoy escribiendo un test para reproducirlo ahora." },
            { en: "The fix is almost ready.", es: "El arreglo está casi listo." },
            { en: "I'll deploy the fix after the tests pass.", es: "Desplegaré el arreglo cuando pasen los tests." },
            { en: "The issue is still open.", es: "El problema sigue abierto." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Un tiempo por idea",
          body: "No necesitas una frase larga. Tres frases cortas con pasado, presente y futuro comunican mejor que una frase con cuatro tiempos mezclados.",
        },
      ],
      exercises: [
        {
          id: "m2-l2-e1",
          type: "choice",
          prompt: "¿Qué frase describe lo que estás haciendo ahora mismo?",
          options: [
            "I fixed the login bug.",
            "I will fix the login bug.",
            "I'm fixing the login bug.",
            "I fix the login bug every day.",
          ],
          answer: 2,
          explanation:
            "'Now' y una acción en curso piden presente continuo: 'I'm fixing the login bug'.",
        },
        {
          id: "m2-l2-e2",
          type: "choice",
          prompt: "¿Cuál cuenta correctamente la causa del bug en el pasado?",
          options: [
            "The token expires yesterday.",
            "The token expired yesterday.",
            "The token is expiring yesterday.",
            "The token will expire yesterday.",
          ],
          answer: 1,
          explanation:
            "'Yesterday' cierra el evento en el pasado: 'expired'.",
        },
        {
          id: "m2-l2-e3",
          type: "builder",
          prompt: "Construye: 'Desplegaré el arreglo cuando pasen los tests.'",
          words: ["I'll", "deploy", "the fix", "after the tests pass."],
          answer: "I'll deploy the fix after the tests pass.",
          explanation:
            "'I'll + verbo base' expresa el siguiente paso; 'after the tests pass' marca la condición.",
        },
        {
          id: "m2-l2-e4",
          type: "write",
          prompt: "Escribe en inglés: 'Encontré un bug en el login ayer.'",
          answer: "I found a bug in the login yesterday.",
          accept: [
            "Yesterday I found a bug in the login.",
            "I found a bug in login yesterday.",
          ],
          hint: "'Find' es irregular: find → found.",
          explanation:
            "'Found' es el pasado de 'find'. Añadir 'yesterday' deja claro que la acción ya terminó.",
        },
        {
          id: "m2-l2-e5",
          type: "choice",
          prompt: "Quieres sonar claro y tranquilo en un update: 'El problema sigue abierto.' ¿Cuál eliges?",
          options: [
            "The issue is still open.",
            "The issue still opens.",
            "The issue opened still.",
            "The issue is still opening.",
          ],
          answer: 0,
          explanation:
            "'Is still open' describe el estado actual de forma simple y natural. No necesitas una frase complicada para comunicar bien.",
        },
        {
          id: "m2-l2-e6",
          type: "builder",
          prompt: "Construye una línea de tiempo cómoda: 'Encontré el bug ayer, lo estoy arreglando ahora y lo desplegaré mañana.'",
          words: ["I found the bug yesterday,", "I'm fixing it now,", "and I'll deploy it tomorrow."],
          answer: "I found the bug yesterday, I'm fixing it now, and I'll deploy it tomorrow.",
          explanation:
            "Pasado, presente continuo y futuro en una sola historia: así tu update fluye y todos entienden el estado real.",
        },
        {
          id: "m2-l2-e7",
          type: "listen",
          prompt: "Escucha el update y escríbelo.",
          audioText: "I'm fixing the bug now and I'll deploy the fix tomorrow.",
          answer: "I'm fixing the bug now and I'll deploy the fix tomorrow.",
          accept: ["I am fixing the bug now and I will deploy the fix tomorrow."],
          hint: "Dos partes: ahora (I'm fixing...) y mañana (I'll deploy...).",
          explanation:
            "Listening en contexto real: updates cortos combinando presente continuo y futuro.",
        },
        {
          id: "m2-l2-e8",
          type: "fill-blank",
          prompt: "Completa la historia del bug con los tiempos correctos.",
          template: "I ___ the bug yesterday, I'm ___ it now, and I'll ___ the fix tomorrow.",
          blanks: ["found", "fixing", "deploy"],
          hint: "Pasado de find, forma -ing, y verbo base tras will.",
          explanation:
            "Una narrativa clara: pasado (found), presente continuo (fixing) y futuro con will (deploy).",
        },
        {
          id: "m2-l2-e9",
          type: "roleplay",
          prompt: "Responde como en un standup real.",
          scenario: "Tu lead pregunta: 'Any update on the login bug?'",
          goal: "Explica qué pasó, qué haces ahora y cuándo estará listo.",
          answer: "I found the bug yesterday. I'm fixing it now, and I'll deploy the fix tomorrow.",
          accept: [
            "I found the bug yesterday, I'm fixing it now, and I'll deploy the fix tomorrow.",
            "Yesterday I found the bug. I'm fixing it now and I will deploy the fix tomorrow.",
          ],
          hint: "Usa pasado + presente continuo + futuro.",
          explanation:
            "Role-play: practica una respuesta breve y clara con los tres tiempos clave del día a día.",
        },
      ],
    },
    {
      id: "m2-l3",
      slug: "practica-tiempos-bug",
      title: "Práctica: pasado, ahora y siguiente paso",
      step: "A2 · Paso 2.3 · Práctica guiada",
      cefr: "A2",
      summary:
        "Sesión corta para separar la práctica de m2-l2: narra un bug con pasado, presente continuo y futuro en drills simples.",
      objectives: [
        "Contar qué pasó con pasado simple y marcador de tiempo.",
        "Explicar qué haces ahora con presente continuo.",
        "Indicar el siguiente paso con 'will'."
      ],
      pronunciation:
        "I found the bug yesterday. I'm fixing it now. I'll deploy the fix tomorrow.",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Antes de esta lección",
          body: "Completa primero 'Cuenta un bug en pasado, presente y futuro' (m2-l2). Esta práctica separa la narrativa en ejercicios cortos usando solo tiempos y frases ya trabajados.",
        },
        {
          type: "technique",
          name: "Una idea, un tiempo",
          desc: "Pasado para lo que ya ocurrió ('I found...', 'it crashed...'), presente continuo para lo que haces ahora ('I'm fixing...'), y 'will' para el siguiente paso ('I'll deploy...').",
        },
        {
          type: "phrases",
          title: "Modelos de apoyo",
          items: [
            { en: "I found a bug yesterday.", es: "Encontré un bug ayer." },
            { en: "I'm fixing it now.", es: "Lo estoy arreglando ahora." },
            { en: "I'll deploy the fix tomorrow.", es: "Desplegaré el arreglo mañana." }
          ],
        }
      ],
      exercises: [
        {
          id: "m2-l3-e1",
          type: "choice",
          prompt: "¿Qué frase describe lo que ya pasó ayer?",
          options: [
            "I find a bug yesterday.",
            "I found a bug yesterday.",
            "I'm finding a bug yesterday.",
            "I will find a bug yesterday."
          ],
          answer: 1,
          explanation:
            "Para un evento terminado en el pasado usa pasado simple: 'I found a bug yesterday.'",
        },
        {
          id: "m2-l3-e2",
          type: "builder",
          prompt: "Construye: 'Lo estoy arreglando ahora.'",
          words: ["I'm fixing", "it", "now."],
          answer: "I'm fixing it now.",
          explanation:
            "Presente continuo para una acción en curso: 'I'm fixing it now.'",
        },
        {
          id: "m2-l3-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'Desplegaré el arreglo mañana.'",
          answer: "I'll deploy the fix tomorrow.",
          accept: ["I will deploy the fix tomorrow."],
          hint: "Usa 'I'll deploy...' + 'tomorrow'.",
          explanation:
            "Futuro simple con 'will' para el siguiente paso.",
        },
        {
          id: "m2-l3-e4",
          type: "choice",
          prompt: "Quieres decir que el problema sigue abierto ahora. ¿Cuál es correcta?",
          options: [
            "The issue is still open.",
            "The issue still opened.",
            "The issue was still open tomorrow.",
            "The issue is still opening yesterday."
          ],
          answer: 0,
          explanation:
            "'Is still open' describe el estado actual de forma simple y clara.",
        },
        {
          id: "m2-l3-e5",
          type: "builder",
          prompt: "Construye: 'Encontré el bug ayer y lo estoy arreglando ahora.'",
          words: ["I found the bug yesterday", "and", "I'm fixing it now."],
          answer: "I found the bug yesterday and I'm fixing it now.",
          explanation:
            "Combina pasado (qué pasó) y presente continuo (qué haces ahora) en una frase clara.",
        },
        {
          id: "m2-l3-e6",
          type: "write",
          prompt: "Escríbelo en inglés: 'Lo arreglaré después de los tests.'",
          answer: "I'll fix it after the tests.",
          accept: ["I will fix it after the tests."],
          hint: "Usa 'I'll fix it after...'",
          explanation:
            "'Will' + verbo base expresa el siguiente paso; 'after the tests' da el momento/condición.",
        }
      ],
    },
    {
      id: "m8-l2",
      slug: "pronunciacion-funcional-devs",
      title: "Pronunciación funcional para developers",
      step: "A2 · Paso 2.4 · Pronunciación",
      cefr: "A2",
      summary:
        "Practica palabras técnicas que se confunden al hablar: query, cache, route, queue, height y más.",
      objectives: [
        "Reconocer y practicar la pronunciación de términos técnicos comunes.",
        "Escuchar y repetir frases cortas con vocabulario de desarrollo.",
        "Ganar confianza al decir palabras frecuentes en reuniones y demos.",
      ],
      pronunciation:
        "Run the query, clear the cache, and check the route. The queue is empty and the height is fixed.",
      blocks: [
        {
          type: "technique",
          name: "Pronunciación funcional, no perfecta",
          desc: "El objetivo es que te entiendan en el trabajo. Practica las palabras que más usas (query, cache, route, schema, issue) en frases completas. Escucha, repite en voz alta y prioriza claridad sobre acento perfecto.",
        },
        {
          type: "vocab",
          title: "Palabras que conviene practicar",
          items: [
            { en: "query", es: "consulta (QUÍ-ri)", example: "Run the query again." },
            { en: "cache", es: "caché (cash)", example: "Clear the cache." },
            { en: "route", es: "ruta (rut/root)", example: "Check the route." },
            { en: "queue", es: "cola (kiú)", example: "The queue is empty." },
            { en: "schema", es: "esquema (SKÍ-ma)", example: "Update the schema." },
            { en: "issue", es: "incidencia/problema (Í-shu)", example: "Open an issue." },
            { en: "height / width", es: "alto / ancho", example: "Set the height and width." },
            { en: "deploy", es: "desplegar (di-PLÓI)", example: "Deploy to production." },
          ],
        },
        {
          type: "phrases",
          title: "Repite en voz alta",
          items: [
            { en: "Run the query and clear the cache.", es: "Ejecuta la consulta y limpia la caché." },
            { en: "This route returns a 404 error.", es: "Esta ruta devuelve un error 404." },
            { en: "The queue is processing the jobs.", es: "La cola está procesando los trabajos." },
            { en: "We need to update the database schema.", es: "Necesitamos actualizar el esquema de la base de datos." },
            { en: "I opened an issue for this bug.", es: "Abrí un issue para este bug." },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Usa el botón de voz",
          body: "Toca el ícono de volumen en las frases y palabras para escuchar y repetir. Practicar en frases cortas es más efectivo que memorizar palabras sueltas.",
        },
      ],
      exercises: [
        {
          id: "m8-l2-e1",
          type: "choice",
          prompt: "¿Cómo dirías 'Limpia la caché' en inglés?",
          options: ["Clear the cache.", "Clean the catch.", "Delete the cash.", "Clear the cage."],
          answer: 0,
          explanation:
            "'Cache' (caché) se escribe cache y en inglés suele sonar como 'cash': 'Clear the cache.'",
        },
        {
          id: "m8-l2-e2",
          type: "builder",
          prompt: "Construye: 'Ejecuta la consulta otra vez.'",
          words: ["Run", "the query", "again."],
          answer: "Run the query again.",
          explanation:
            "'Query' es consulta; una frase común es 'run the query'.",
        },
        {
          id: "m8-l2-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'La cola está vacía.'",
          answer: "The queue is empty.",
          accept: ["The queue is empty"],
          hint: "Usa 'queue'.",
          explanation:
            "'Queue' significa cola (de trabajos, mensajes, etc.).",
        },
        {
          id: "m8-l2-e4",
          type: "choice",
          prompt: "¿Qué par de palabras suele confundirse por sonido/escritura?",
          options: [
            "height y width",
            "bug y fix",
            "code y test",
            "user y admin",
          ],
          answer: 0,
          explanation:
            "'Height' (alto) y 'width' (ancho) se confunden seguido al hablar; conviene practicarlas juntas.",
        },
        {
          id: "m8-l2-e5",
          type: "listen",
          prompt: "Escucha y escribe la frase (dictado técnico).",
          audioText: "Run the query and clear the cache.",
          answer: "Run the query and clear the cache.",
          accept: ["Run the query and clear the cache"],
          hint: "Dos acciones: run the query / clear the cache.",
          explanation:
            "Listening con vocabulario de pronunciación frecuente: query y cache.",
        },
        {
          id: "m8-l2-e6",
          type: "speak",
          prompt: "Practica la pronunciación en voz alta.",
          answer: "The queue is empty and the route is correct.",
          accept: ["The queue is empty and the route is correct"],
          hint: "queue suena como 'cue', route como 'root/rut' según contexto.",
          explanation:
            "Speaking funcional: claridad en términos que suelen causar confusión en reuniones.",
        },
      ],
    },
  ],
};
