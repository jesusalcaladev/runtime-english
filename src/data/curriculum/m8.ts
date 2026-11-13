import type { Module } from "../../lib/types";

export const m8: Module = {
  id: "m8",
  code: "MOD 08",
  level: "B1-B2",
  title: "Práctica Intensiva y Repasos",
  shortTitle: "Práctica & Repasos",
  description:
    "Lectura de docs, prompts para AI agents, pronunciación funcional, micro-repasos espaciados y drills de situaciones reales para afianzar todo.",
  sessions: [
    {
      id: "m8-l1",
      slug: "leer-docs-y-specs-rapido",
      title: "Lectura rápida de docs y specs",
      step: "B1 · Paso 8.1",
      cefr: "B1",
      minutes: 10,
      summary:
        "Identifica en un texto técnico qué es obligatorio, recomendado y cuál es el siguiente paso.",
      objectives: [
        "Reconocer palabras clave como must, should, required y optional.",
        "Extraer la acción principal de una especificación o documentación.",
        "Resumir un requisito técnico en una frase clara.",
      ],
      pronunciation:
        "The client must send a token. You should retry on failure. This field is optional.",
      blocks: [
        {
          type: "technique",
          name: "Busca verbos de requisito, no leas todo igual",
          desc: "En docs/specs, enfócate primero en: must/required (obligatorio), should/recommended (recomendado), may/optional (opcional). Luego identifica sujeto, acción y condición: 'The client must send a token.' Eso te da el 80% del valor en poco tiempo.",
        },
        {
          type: "vocab",
          title: "Palabras clave en documentación",
          items: [
            { en: "must / required", es: "obligatorio", example: "The request must include an API key." },
            { en: "should / recommended", es: "recomendado", example: "You should validate the input." },
            { en: "may / optional", es: "opcional", example: "This field is optional." },
            { en: "deprecated", es: "obsoleto, se eliminará", example: "This endpoint is deprecated." },
            { en: "breaking change", es: "cambio incompatible", example: "Version 2 includes a breaking change." },
            { en: "caveat", es: "advertencia o limitación", example: "One caveat: this only works on Linux." },
          ],
        },
        {
          type: "phrases",
          title: "Cómo resumir lo que leíste",
          items: [
            { en: "In short, we must send an API key.", es: "En resumen, debemos enviar una API key." },
            { en: "The main requirement is to validate the input.", es: "El requisito principal es validar la entrada." },
            { en: "This is optional, so we can skip it for now.", es: "Esto es opcional, así que podemos omitirlo por ahora." },
            { en: "According to the docs, this endpoint is deprecated.", es: "Según la documentación, este endpoint está obsoleto." },
          ],
        },
      ],
      exercises: [
        {
          id: "m8-l1-e1",
          type: "choice",
          prompt: "La doc dice: 'The client must include a valid token.' ¿Qué significa 'must'?",
          options: ["Es opcional", "Es obligatorio", "Es recomendado", "Está prohibido"],
          answer: 1,
          explanation:
            "'Must' indica un requisito obligatorio: el cliente tiene que incluir un token válido.",
        },
        {
          id: "m8-l1-e2",
          type: "choice",
          prompt: "¿Qué significa 'This endpoint is deprecated'?",
          options: [
            "Es el más nuevo y recomendado.",
            "Está obsoleto y puede eliminarse en el futuro.",
            "Es obligatorio usarlo.",
            "Funciona solo en producción.",
          ],
          answer: 1,
          explanation:
            "'Deprecated' significa obsoleto: aún puede funcionar, pero no se recomienda y puede eliminarse.",
        },
        {
          id: "m8-l1-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'En resumen, debemos enviar una clave de API.'",
          answer: "In short, we must send an API key.",
          accept: ["In short, we must send an API key"],
          hint: "Usa 'In short, we must...'",
          explanation:
            "'In short' resume; 'must' marca que es obligatorio.",
        },
        {
          id: "m8-l1-e4",
          type: "builder",
          prompt: "Construye: 'Este campo es opcional, así que podemos omitirlo por ahora.'",
          words: ["This field is optional,", "so we can", "skip it", "for now."],
          answer: "This field is optional, so we can skip it for now.",
          explanation:
            "'Optional' indica que no es requerido; 'skip it for now' comunica la decisión práctica.",
        },
      ],
    },
    {
      id: "m8-l7",
      slug: "prompts-y-ai-agents",
      title: "Prompts y trabajo con AI agents",
      step: "B1 · Paso 8.2",
      cefr: "B1",
      minutes: 14,
      summary:
        "Ruta completa para hablarle a un AI agent en inglés claro y natural: plan del prompt, vocabulario técnico y expresiones nativas para pedir, acotar e iterar.",
      objectives: [
        "Estructurar prompts claros con contexto, tarea, restricciones y formato de salida.",
        "Usar vocabulario y frases nativas comunes al trabajar con coding agents.",
        "Pedir cambios, correcciones y sanity checks sin ambigüedad ni fricción.",
      ],
      pronunciation:
        "Here's the context. Could you walk me through the fix, call out any edge cases, and keep the API the same?",
      blocks: [
        {
          type: "technique",
          name: "Ruta limpia: Contexto → Objetivo → Restricciones → Formato → Revisión",
          desc: "Piensa el prompt como un mini brief: 1) Contexto: qué hay, dónde está y qué pasa ahora. 2) Objetivo: qué resultado quieres (refactor, debug, explain, draft). 3) Restricciones: límites claros (no breaking changes, keep it simple, out of scope). 4) Formato: cómo debe responder (steps, diff, list, JSON). 5) Revisión: pide que señale riesgos o casos borde y tú haces un sanity check final.",
        },
        {
          type: "vocab",
          title: "Vocabulario esencial de prompts y agentes",
          items: [
            { en: "prompt / instruction", es: "instrucción que das al modelo", example: "Write a clear prompt with enough context." },
            { en: "context", es: "información de fondo relevante", example: "Here's the context: this endpoint times out under load." },
            { en: "constraint", es: "restricción o límite", example: "One constraint: do not change the public API." },
            { en: "output format", es: "formato de salida esperado", example: "Use this output format: cause, fix, and test." },
            { en: "tool call", es: "uso de una herramienta por el agente", example: "The agent made a tool call to read the file." },
            { en: "hallucination", es: "respuesta inventada o no fundamentada", example: "Double-check the answer for hallucinations." },
            { en: "edge case", es: "caso límite o poco común", example: "Call out any edge cases for null input." },
            { en: "happy path", es: "flujo normal sin errores", example: "This works on the happy path, but fails on retries." },
            { en: "boilerplate", es: "código repetitivo/plantilla", example: "Generate the boilerplate, then I'll refine it." },
          ],
        },
        {
          type: "vocab",
          title: "Inglés nativo para pedir y guiar (muy común)",
          items: [
            { en: "walk me through", es: "explícame paso a paso", example: "Can you walk me through this change?" },
            { en: "break it down", es: "desglósalo en partes simples", example: "Break it down into smaller steps." },
            { en: "spell out", es: "explicarlo con detalle y claridad", example: "Spell out the assumptions you're making." },
            { en: "call out", es: "señalar o destacar algo importante", example: "Call out any breaking changes." },
            { en: "from scratch", es: "desde cero", example: "Rewrite this function from scratch." },
            { en: "take another pass", es: "revisarlo/hacer otra pasada", example: "Can you take another pass at the error handling?" },
            { en: "sanity check", es: "revisión rápida para ver si tiene sentido", example: "Do a quick sanity check on this approach." },
            { en: "keep it simple", es: "mantenlo simple", example: "Let's keep it simple for now." },
            { en: "out of scope", es: "fuera del alcance", example: "Refactoring the database layer is out of scope." },
          ],
        },
        {
          type: "phrases",
          title: "Frases nativas para prompts claros",
          items: [
            { en: "Here's the context: ...", es: "Aquí está el contexto: ..." },
            { en: "What I'm trying to do is...", es: "Lo que intento hacer es..." },
            { en: "Walk me through your reasoning.", es: "Explícame tu razonamiento paso a paso." },
            { en: "Call out any edge cases or trade-offs.", es: "Señala cualquier caso borde o trade-off." },
            { en: "Keep the existing behavior the same.", es: "Mantén el comportamiento existente igual." },
            { en: "Let's keep this out of scope for now.", es: "Dejemos esto fuera del alcance por ahora." },
            { en: "Can you take another pass and simplify it?", es: "¿Puedes revisarlo otra vez y simplificarlo?" },
            { en: "Explain it in plain English.", es: "Explícalo en inglés sencillo." },
          ],
        },
        {
          type: "table",
          title: "De vago a nativo y claro",
          columns: ["En vez de...", "Di mejor...", "Por qué funciona"],
          rows: [
            ["Fix this.", "Here's the bug and expected behavior. Can you fix it without changing the API?", "Da contexto, objetivo y restricción."],
            ["Explain.", "Can you walk me through this step by step?", "Pide una explicación guiada y natural."],
            ["Is this okay?", "Can you do a quick sanity check and call out any edge cases?", "Pide revisión concreta, no un sí/no vago."],
            ["Rewrite it.", "Can you take another pass and keep it simple?", "Suena natural e indica estilo deseado."],
            ["Anything else?", "Is there anything out of scope or risky here?", "Ayuda a descubrir riesgos y límites."],
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Sonar nativo = sonar claro",
          body: "No necesitas slang para sonar natural. Frases simples como 'walk me through', 'call out', 'keep it simple' o 'from scratch' son inglés nativo cotidiano en equipos tech. Usa un tono directo y amable: pide, acota y revisa.",
        },
        {
          type: "callout",
          tone: "warning",
          title: "Verifica antes de confiar",
          body: "Aunque el agente explique con seguridad, haz un sanity check: ejecuta tests, revisa edge cases y confirma que no inventó APIs o detalles (hallucinations).",
        },
      ],
      exercises: [
        {
          id: "m8-l7-e1",
          type: "choice",
          prompt: "Quieres que el agente no cambie la API pública. ¿Qué parte del prompt es?",
          options: ["Una restricción (constraint)", "El formato de salida", "Un ejemplo", "Un saludo"],
          answer: 0,
          explanation:
            "Es una restricción: define un límite claro ('do not change the public API').",
        },
        {
          id: "m8-l7-e2",
          type: "choice",
          prompt: "De forma nativa, ¿cómo pides que te expliquen algo paso a paso?",
          options: [
            "Can you walk me through it?",
            "Can you road me it?",
            "Do a walking to me.",
            "You explain me walking.",
          ],
          answer: 0,
          explanation:
            "'Walk me through it' es una frase nativa muy común para pedir una explicación guiada.",
        },
        {
          id: "m8-l7-e3",
          type: "builder",
          prompt: "Construye: 'Señala cualquier caso borde o trade-off.'",
          words: ["Call out", "any edge cases", "or trade-offs."],
          answer: "Call out any edge cases or trade-offs.",
          explanation:
            "'Call out' significa señalar o destacar; es muy natural en revisiones técnicas.",
        },
        {
          id: "m8-l7-e4",
          type: "write",
          prompt: "Escríbelo en inglés: 'Explícame tu razonamiento paso a paso.'",
          answer: "Walk me through your reasoning.",
          accept: [
            "Walk me through your reasoning step by step.",
            "Can you walk me through your reasoning?",
            "Could you walk me through your reasoning?",
          ],
          hint: "Usa 'Walk me through...'",
          explanation:
            "Forma nativa y clara de pedir que desglosen el razonamiento.",
        },
        {
          id: "m8-l7-e5",
          type: "choice",
          prompt: "¿Qué significa 'take another pass at the error handling'?",
          options: [
            "Ignorar el manejo de errores",
            "Revisarlo/mejorarlo otra vez",
            "Borrarlo desde cero sin razón",
            "Pasarlo a otro equipo",
          ],
          answer: 1,
          explanation:
            "'Take another pass' es hacer otra revisión o intento para mejorarlo.",
        },
        {
          id: "m8-l7-e6",
          type: "builder",
          prompt: "Construye: 'Mantén el comportamiento existente igual.'",
          words: ["Keep the", "existing behavior", "the same."],
          answer: "Keep the existing behavior the same.",
          explanation:
            "Restricción clave y muy natural para evitar regresiones.",
        },
        {
          id: "m8-l7-e7",
          type: "write",
          prompt: "Escríbelo en inglés: 'Haz una revisión rápida y señala cualquier caso borde.'",
          answer: "Do a quick sanity check and call out any edge cases.",
          accept: [
            "Do a quick sanity check and call out any edge cases",
            "Can you do a quick sanity check and call out any edge cases?",
          ],
          hint: "Usa 'sanity check' y 'call out'.",
          explanation:
            "Combina dos expresiones nativas muy usadas para pedir revisión concreta.",
        },
        {
          id: "m8-l7-e8",
          type: "choice",
          prompt: "Quieres decir que algo no forma parte del trabajo ahora. ¿Qué dices?",
          options: [
            "It's out of scope for now.",
            "It's out of road for now.",
            "It's off the scope path.",
            "It's without scope never.",
          ],
          answer: 0,
          explanation:
            "'Out of scope' es la forma estándar y nativa de decir que algo queda fuera del alcance.",
        },
        {
          id: "m8-l7-e9",
          type: "builder",
          prompt: "Construye: 'Explícalo en inglés sencillo.'",
          words: ["Explain it", "in plain", "English."],
          answer: "Explain it in plain English.",
          explanation:
            "'In plain English' pide una explicación simple y directa, sin jerga innecesaria.",
        },
        {
          id: "m8-l7-e10",
          type: "write",
          prompt: "Escríbelo en inglés: 'Reescribe esta función desde cero, pero mantenlo simple.'",
          answer: "Rewrite this function from scratch, but keep it simple.",
          accept: [
            "Rewrite this function from scratch but keep it simple.",
            "Rewrite this function from scratch, but keep it simple",
          ],
          hint: "Usa 'from scratch' y 'keep it simple'.",
          explanation:
            "'From scratch' (desde cero) y 'keep it simple' son expresiones nativas muy comunes.",
        },
      ],
    },
    {
      id: "m8-l2",
      slug: "pronunciacion-funcional-devs",
      title: "Pronunciación funcional para developers",
      step: "A2 · Paso 8.3",
      cefr: "A2",
      minutes: 8,
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
      ],
    },
    {
      id: "m8-l3",
      slug: "micro-repaso-fundamentos",
      title: "Micro-repaso: fundamentos A1-A2",
      step: "A2 · Paso 8.4 · Repaso",
      cefr: "A2",
      minutes: 8,
      summary:
        "Repaso corto y espaciado de lo esencial: verbos, errores simples, aclarar y acciones diarias.",
      objectives: [
        "Recordar estructuras básicas usadas en el trabajo técnico.",
        "Responder rápido con frases claras y correctas.",
        "Detectar huecos para volver a sesiones anteriores si hace falta.",
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
            { en: "I pushed the changes.", es: "Subí los cambios." },
          ],
        },
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
        },
      ],
    },
    {
      id: "m8-l4",
      slug: "micro-repaso-comunicacion-b1-b2",
      title: "Micro-repaso: comunicación B1-B2",
      step: "B1 · Paso 8.5 · Repaso",
      cefr: "B1",
      minutes: 10,
      summary:
        "Repaso mixto de PRs, async, incidentes, conectores y estimaciones con drills rápidos.",
      objectives: [
        "Practicar frases profesionales en situaciones reales de equipo.",
        "Usar conectores y estructuras claras bajo presión.",
        "Reforzar vocabulario de reviews, bloqueos y estimaciones.",
      ],
      pronunciation:
        "LGTM once tests pass. I'm blocked by API access. Basically, we need to reduce the scope.",
      blocks: [
        {
          type: "technique",
          name: "Mezcla intencional",
          desc: "Este repaso mezcla temas (PR, async, incidentes, conectores) para simular el trabajo real. Responde con la estructura más simple: contexto, hecho, siguiente paso.",
        },
        {
          type: "table",
          title: "Sentence frames útiles",
          columns: ["Situación", "Marco"],
          rows: [
            ["Estado", "Status: [estado]. Next step: [acción]."],
            ["Bloqueo", "I'm blocked by [causa]. I need [ayuda]."],
            ["Estimación", "It will take [rango], assuming [supuesto]."],
            ["PR", "This might break when [caso]. Could you [acción]?"],
          ],
        },
      ],
      exercises: [
        {
          id: "m8-l4-e1",
          type: "choice",
          prompt: "Quieres aprobar un PR condicionado a que pasen los tests. ¿Qué dices?",
          options: ["Ship now.", "LGTM once the tests pass.", "It is bad.", "No merge."],
          answer: 1,
          explanation: "'LGTM once the tests pass' aprueba con una condición clara.",
        },
        {
          id: "m8-l4-e2",
          type: "write",
          prompt: "Escríbelo en inglés: 'Estoy bloqueado por el acceso a la API.'",
          answer: "I'm blocked by API access.",
          accept: ["I am blocked by API access.", "I'm blocked by access to the API."],
          hint: "Usa 'I'm blocked by...'",
          explanation: "Comunica el bloqueo y su causa de forma directa.",
        },
        {
          id: "m8-l4-e3",
          type: "builder",
          prompt: "Construye: 'Básicamente, necesitamos reducir el alcance.'",
          words: ["Basically,", "we need", "to reduce", "the scope."],
          answer: "Basically, we need to reduce the scope.",
          explanation: "'Basically' resume la idea principal; 'reduce the scope' es reducir alcance.",
        },
        {
          id: "m8-l4-e4",
          type: "choice",
          prompt: "Quieres corregir algo: el problema no es backend, es frontend. ¿Qué dices?",
          options: [
            "Anyway, it's the frontend.",
            "Actually, the issue is in the frontend.",
            "Currently, the issue is in the frontend.",
            "I mean backend frontend.",
          ],
          answer: 1,
          explanation: "'Actually' se usa para corregir: 'en realidad, el problema está en el frontend'.",
        },
        {
          id: "m8-l4-e5",
          type: "write",
          prompt: "Escríbelo en inglés: 'Tomará dos o tres días, suponiendo que la API sea estable.'",
          answer: "It will take two to three days, assuming the API is stable.",
          accept: [
            "It'll take two to three days, assuming the API is stable.",
            "It will take two to three days assuming the API is stable.",
          ],
          hint: "Usa 'It will take...' y 'assuming...'",
          explanation: "Rango + supuesto es la forma profesional de estimar.",
        },
        {
          id: "m8-l4-e6",
          type: "builder",
          prompt: "Construye: 'Esto podría fallar cuando la entrada es null. ¿Podrías agregar una validación?'",
          words: ["This might break", "when the input is null.", "Could you add", "a validation?"],
          answer: "This might break when the input is null. Could you add a validation?",
          explanation: "Feedback de PR útil: riesgo concreto + sugerencia accionable.",
        },
      ],
    },
    {
      id: "m8-l5",
      slug: "drills-situaciones-reales",
      title: "Drills: cómo dirías y escríbelo",
      step: "B1 · Paso 8.6 · Práctica guiada",
      cefr: "B1",
      minutes: 12,
      summary:
        "Ejercicios guiados por situación real: bug, review, demo, ayuda y handoff. Piensa, escribe y compara.",
      objectives: [
        "Responder rápido a situaciones comunes con inglés claro.",
        "Practicar el patrón 'cómo dirías / escríbelo' con contexto.",
        "Usar frases modelo y adaptarlas a tu caso.",
      ],
      pronunciation:
        "I found the root cause. Let me walk you through the fix. Could you take a look when you have a minute?",
      blocks: [
        {
          type: "technique",
          name: "Patrón de respuesta rápida",
          desc: "Para cada situación: 1) contexto corto, 2) hecho principal, 3) siguiente paso. Ej.: 'I found the root cause (hecho). It was a null value (contexto). I'll add a check and push a fix (siguiente paso).'",
        },
        {
          type: "phrases",
          title: "Modelos por situación",
          items: [
            { en: "I found the root cause: the token was expired.", es: "Encontré la causa raíz: el token había expirado." },
            { en: "I suggest adding a test for this case.", es: "Sugiero agregar un test para este caso." },
            { en: "Let me walk you through the fix.", es: "Déjame mostrarte el arreglo paso a paso." },
            { en: "Could you take a look when you have a minute?", es: "¿Podrías echarle un vistazo cuando tengas un minuto?" },
            { en: "Status: done. Next step: deploy to staging.", es: "Estado: listo. Próximo paso: desplegar a staging." },
            { en: "In other words, we need to retry the request.", es: "En otras palabras, necesitamos reintentar la petición." },
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Glosario en contexto",
          body: "Aprende términos dentro de frases reales: 'root cause' (causa raíz), 'retry' (reintentar), 'walk you through' (explicar paso a paso), 'staging' (entorno de pruebas). Así se fijan más rápido que en listas sueltas.",
        },
      ],
      exercises: [
        {
          id: "m8-l5-e1",
          type: "write",
          prompt: "Situación: encontraste la causa de un bug. Escríbelo: 'Encontré la causa raíz: el token había expirado.'",
          answer: "I found the root cause: the token had expired.",
          accept: [
            "I found the root cause: the token was expired.",
            "I found the root cause: the token expired.",
          ],
          hint: "Usa 'I found the root cause...'",
          explanation: "Nombrar la causa raíz es claro y profesional en incidentes y debugging.",
        },
        {
          id: "m8-l5-e2",
          type: "choice",
          prompt: "Situación: quieres sugerir un test en un PR. ¿Cómo lo dirías?",
          options: [
            "Add test.",
            "I suggest adding a test for this case.",
            "Test missing bad.",
            "You forgot test.",
          ],
          answer: 1,
          explanation: "'I suggest adding...' es una sugerencia clara y respetuosa.",
        },
        {
          id: "m8-l5-e3",
          type: "write",
          prompt: "Situación: vas a mostrar un arreglo. Escríbelo: 'Déjame mostrarte el arreglo paso a paso.'",
          answer: "Let me walk you through the fix.",
          accept: ["Let me walk you through the fix"],
          hint: "Usa 'walk you through...'",
          explanation: "Frase ideal para empezar una demo o explicación técnica.",
        },
        {
          id: "m8-l5-e4",
          type: "builder",
          prompt: "Situación: handoff. Construye: 'Estado: listo. Próximo paso: desplegar a staging.'",
          words: ["Status: done.", "Next step:", "deploy", "to staging."],
          answer: "Status: done. Next step: deploy to staging.",
          explanation: "Sentence frame de estado + siguiente paso: rápido y claro en async.",
        },
        {
          id: "m8-l5-e5",
          type: "write",
          prompt: "Situación: reformula para que se entienda. Escríbelo: 'En otras palabras, necesitamos reintentar la petición.'",
          answer: "In other words, we need to retry the request.",
          accept: [
            "In other words, we need to retry the request",
            "In other words we need to retry the request.",
          ],
          hint: "Empieza con 'In other words,'.",
          explanation: "'In other words' reformula la idea con otras palabras más claras.",
        },
        {
          id: "m8-l5-e6",
          type: "choice",
          prompt: "Situación: necesitas ayuda sin urgencia agresiva. ¿Qué eliges?",
          options: [
            "Help me now.",
            "Could you take a look when you have a minute?",
            "Fix this ASAP!!!",
            "You must check this.",
          ],
          answer: 1,
          explanation: "Petición educada y realista para trabajo asíncrono.",
        },
      ],
    },
    {
      id: "m8-l6",
      slug: "emails-tickets-y-mensajes-profesionales",
      title: "Emails, tickets y mensajes profesionales",
      step: "B1 · Paso 8.7 · Práctica guiada",
      cefr: "B1",
      minutes: 10,
      summary:
        "Escribe mensajes claros para reportar avances, pedir acciones y cerrar tareas sin ambigüedad.",
      objectives: [
        "Redactar mensajes cortos con contexto, acción y cierre.",
        "Usar frases modelo para tickets, emails y chat profesional.",
        "Confirmar entendimiento y próximos pasos por escrito.",
      ],
      pronunciation:
        "Hi team, the fix is ready. Please review the ticket when you can. Let me know if you need anything else.",
      blocks: [
        {
          type: "technique",
          name: "Mensaje profesional en 3 líneas",
          desc: "1) Contexto/estado: qué pasó o en qué punto estás. 2) Acción o petición: qué necesitas o qué harás. 3) Cierre: disponibilidad o confirmación. Ejemplo: 'The fix is deployed to staging. Please test the login flow. Let me know if you find any issues.'",
        },
        {
          type: "phrases",
          title: "Frases modelo",
          items: [
            { en: "Hi team, here's a quick update.", es: "Hola equipo, aquí va una actualización rápida." },
            { en: "The issue has been fixed and deployed to staging.", es: "El problema fue arreglado y desplegado a staging." },
            { en: "Please review the ticket when you can.", es: "Por favor revisa el ticket cuando puedas." },
            { en: "Let me know if you need any more details.", es: "Avísame si necesitas más detalles." },
            { en: "I'll follow up once I have more information.", es: "Haré seguimiento cuando tenga más información." },
            { en: "Thanks for your help.", es: "Gracias por tu ayuda." },
          ],
        },
        {
          type: "table",
          title: "Sentence frames para escribir rápido",
          columns: ["Objetivo", "Marco"],
          rows: [
            ["Dar estado", "The [task/issue] is [status]."],
            ["Pedir acción", "Please [action] when you [time/condition]."],
            ["Cerrar", "Let me know if you need [anything/more details]."],
          ],
        },
      ],
      exercises: [
        {
          id: "m8-l6-e1",
          type: "choice",
          prompt: "Quieres empezar un mensaje de actualización de forma clara. ¿Qué eliges?",
          options: [
            "Hey.",
            "Hi team, here's a quick update.",
            "Listen.",
            "Now read this.",
          ],
          answer: 1,
          explanation:
            "Una apertura clara y profesional prepara al lector: 'Hi team, here's a quick update.'",
        },
        {
          id: "m8-l6-e2",
          type: "builder",
          prompt: "Construye: 'El problema fue arreglado y desplegado a staging.'",
          words: ["The issue", "has been fixed", "and deployed", "to staging."],
          answer: "The issue has been fixed and deployed to staging.",
          explanation:
            "Presente perfecto pasivo para comunicar estado/resultado: 'has been fixed and deployed'.",
        },
        {
          id: "m8-l6-e3",
          type: "write",
          prompt: "Escríbelo en inglés: 'Avísame si necesitas más detalles.'",
          answer: "Let me know if you need more details.",
          accept: [
            "Let me know if you need any more details.",
            "Please let me know if you need more details.",
          ],
          hint: "Usa 'Let me know if...'",
          explanation:
            "Cierre útil que deja abierta la comunicación sin sonar insistente.",
        },
        {
          id: "m8-l6-e4",
          type: "choice",
          prompt: "¿Qué mensaje cierra mejor una tarea por escrito?",
          options: [
            "Done.",
            "I'll follow up once I have more information.",
            "Whatever happens happens.",
            "No more messages.",
          ],
          answer: 1,
          explanation:
            "Indicar el siguiente paso o seguimiento ('I'll follow up...') da claridad sobre qué esperar.",
        },
      ],
    },
  ],
};
