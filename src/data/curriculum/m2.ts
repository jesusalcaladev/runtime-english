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
      minutes: 14,
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
          type: "technique",
          name: "Matriz Temporal del Sprint",
          desc: "1) Lo que el código HACE → presente simple. 2) Lo que estás HACIENDO ahora → presente continuo (-ing). 3) Lo que YA hiciste → pasado simple (-ed / irregular). 4) Lo que HARÁS luego → futuro simple (will).",
        },
        {
          type: "callout",
          tone: "info",
          title: "¿Y el present perfect?",
          body: "'I've finished the API' es habitual en standups. Lo verás en B1 con más detalle. Por ahora, si necesitas hablar de algo terminado, usa pasado simple con un marcador claro: 'I finished it yesterday' o 'I finished it this morning'.",
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
      ],
    },
    {
      id: "m2-l2",
      slug: "contar-un-bug",
      title: "Cuenta un bug en pasado, presente y futuro",
      step: "A2 · Paso 2.2",
      cefr: "A2",
      minutes: 11,
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
      ],
    },
  ],
};
