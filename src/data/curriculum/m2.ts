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
  ],
};
