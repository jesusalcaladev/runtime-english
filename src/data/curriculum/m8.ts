import type { Module } from '../../lib/types'

export const m8: Module = {
  id: 'm8',
  code: 'MOD 08',
  level: 'B1-B2',
  title: 'Práctica Aplicada y Repaso Final',
  shortTitle: 'Práctica Aplicada',
  description:
    'Lectura de docs, prompts para AI agents, drills de situaciones reales, mensajes profesionales y repaso final integrado.',
  sessions: [
    {
      id: 'm8-l1',
      slug: 'leer-docs-y-specs-rapido',
      title: 'Lectura rápida de docs y specs',
      step: 'B1 · Paso 8.1',
      cefr: 'B1',
      summary:
        'Identifica en un texto técnico qué es obligatorio, recomendado y cuál es el siguiente paso.',
      objectives: [
        'Reconocer palabras clave como must, should, required y optional.',
        'Extraer la acción principal de una especificación o documentación.',
        'Resumir un requisito técnico en una frase clara.',
      ],
      pronunciation:
        'The client must send a token. You should retry on failure. This field is optional.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere lectura básica de inglés técnico y verbos modales/imperativos ya vistos. Aquí aprenderás a extraer requisitos (must/should/may), estado (deprecated) y a resumir la acción principal.',
        },
        {
          type: 'technique',
          name: 'Leer docs rápido: identifica requisito y acción',
          desc: 'Escanea primero palabras clave: must/required (obligatorio), should/recommended (recomendado), may/optional (opcional), deprecated/breaking change (riesgo/cambio). Luego resume: quién + qué debe hacer + condición.',
        },
        {
          type: 'vocab',
          title: 'Palabras clave en documentación',
          items: [
            {
              en: 'must / required',
              es: 'obligatorio',
              example: 'The request must include an API key.',
            },
            {
              en: 'should / recommended',
              es: 'recomendado',
              example: 'You should validate the input.',
            },
            { en: 'may / optional', es: 'opcional', example: 'This field is optional.' },
            {
              en: 'deprecated',
              es: 'obsoleto, se eliminará',
              example: 'This endpoint is deprecated.',
            },
            {
              en: 'breaking change',
              es: 'cambio incompatible',
              example: 'Version 2 includes a breaking change.',
            },
            {
              en: 'caveat',
              es: 'advertencia o limitación',
              example: 'One caveat: this only works on Linux.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Cómo resumir lo que leíste',
          items: [
            {
              en: 'In short, we must send an API key.',
              es: 'En resumen, debemos enviar una API key.',
            },
            {
              en: 'The main requirement is to validate the input.',
              es: 'El requisito principal es validar la entrada.',
            },
            {
              en: 'This is optional, so we can skip it for now.',
              es: 'Esto es opcional, así que podemos omitirlo por ahora.',
            },
            {
              en: 'According to the docs, this endpoint is deprecated.',
              es: 'Según la documentación, este endpoint está obsoleto.',
            },
          ],
        },
        {
          type: 'dialogue',
          title: 'Leer la spec en voz alta',
          context: 'Maya y Leo repasan los requisitos de una spec y resumen qué deben hacer.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'According to the docs, the client must send a valid token.',
              es: 'Según la documentación, el cliente debe enviar un token válido.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'And the timeout field? Is it required?',
              es: '¿Y el campo timeout? ¿Es obligatorio?',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "No, it's optional. But you should retry on failure — that's recommended.",
              es: 'No, es opcional. Pero debes reintentar si falla: eso es recomendado.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'One caveat: the old endpoint is deprecated.',
              es: 'Una advertencia: el endpoint antiguo está obsoleto.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Right. Version 2 has a breaking change. In short, we must update the client.',
              es: 'Correcto. La versión 2 tiene un cambio incompatible. En resumen, debemos actualizar el cliente.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l1-e1',
          type: 'choice',
          prompt: "La doc dice: 'The client must include a valid token.' ¿Qué significa 'must'?",
          options: ['Es opcional', 'Es obligatorio', 'Es recomendado', 'Está prohibido'],
          answer: 1,
          explanation:
            "'Must' indica un requisito obligatorio: el cliente tiene que incluir un token válido.",
        },
        {
          id: 'm8-l1-e2',
          type: 'choice',
          prompt: "¿Qué significa 'This endpoint is deprecated'?",
          options: [
            'Es el más nuevo y recomendado.',
            'Está obsoleto y puede eliminarse en el futuro.',
            'Es obligatorio usarlo.',
            'Funciona solo en producción.',
          ],
          answer: 1,
          explanation:
            "'Deprecated' significa obsoleto: aún puede funcionar, pero no se recomienda y puede eliminarse.",
        },
        {
          id: 'm8-l1-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'En resumen, debemos enviar una clave de API.'",
          answer: 'In short, we must send an API key.',
          accept: ['In short, we must send an API key'],
          hint: "Usa 'In short, we must...'",
          explanation: "'In short' resume; 'must' marca que es obligatorio.",
        },
        {
          id: 'm8-l1-e4',
          type: 'builder',
          prompt: "Construye: 'Este campo es opcional, así que podemos omitirlo por ahora.'",
          words: ['This field is optional,', 'so we can', 'skip it', 'for now.'],
          answer: 'This field is optional, so we can skip it for now.',
          explanation:
            "'Optional' indica que no es requerido; 'skip it for now' comunica la decisión práctica.",
        },
        {
          id: 'm8-l1-e5',
          type: 'choice',
          prompt: "La doc dice: 'You should retry on failure.' ¿Qué significa 'should' aquí?",
          options: ['Es obligatorio', 'Es recomendado', 'Está prohibido', 'Es imposible'],
          answer: 1,
          explanation:
            "'Should' indica recomendación (buena práctica), no una obligación estricta como 'must'.",
        },
        {
          id: 'm8-l1-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Según la documentación, este endpoint está obsoleto.'",
          answer: 'According to the docs, this endpoint is deprecated.',
          accept: ['According to the docs, this endpoint is deprecated'],
          hint: "Usa 'According to the docs...' y 'deprecated'.",
          explanation:
            'Frase modelo de la lección para resumir un estado importante encontrado en documentación.',
        },
        {
          id: 'm8-l1-e7',
          type: 'choice',
          prompt: 'Según la conversación, ¿qué es obligatorio que haga el cliente?',
          options: [
            'Enviar un token válido.',
            'Usar el campo timeout.',
            'Llamar al endpoint obsoleto.',
            'Omitir los reintentos.',
          ],
          answer: 0,
          explanation: "Maya dice 'According to the docs, the client must send a valid token'.",
        },
        {
          id: 'm8-l1-e8',
          type: 'choice',
          prompt: '¿Cuál fue el resumen final sobre la versión 2 de la spec?',
          options: [
            'Hay un breaking change y deben actualizar el cliente.',
            'La versión 2 es completamente opcional.',
            'El endpoint obsoleto seguirá igual.',
            'No hay ningún cambio.',
          ],
          answer: 0,
          explanation:
            "Maya cierra con 'Version 2 has a breaking change. In short, we must update the client'.",
        },
        {
          id: 'm8-l1-e9',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The spec says the endpoint expects a POST request with a JSON body.',
          hint: 'Leer una spec en voz alta.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l7',
      slug: 'prompts-y-ai-agents',
      title: 'Prompts y trabajo con AI agents',
      step: 'B1 · Paso 8.2',
      cefr: 'B1',
      summary:
        'Ruta completa para hablarle a un AI agent en inglés claro y natural: plan del prompt, vocabulario técnico y expresiones nativas para pedir, acotar e iterar.',
      objectives: [
        'Estructurar prompts claros con contexto, tarea, restricciones y formato de salida.',
        'Usar vocabulario y frases nativas comunes al trabajar con coding agents.',
        'Pedir cambios, correcciones y sanity checks sin ambigüedad ni fricción.',
      ],
      pronunciation:
        "Here's the context. Could you walk me through the fix, call out any edge cases, and keep the API the same?",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere vocabulario técnico general y capacidad de describir tareas/errores. Esta lección introduce vocabulario y frases para trabajar con AI agents/prompts; todo lo usado en ejercicios se presenta en los bloques.',
        },
        {
          type: 'technique',
          name: 'Prompt claro para un agente: contexto → objetivo → límites → formato',
          desc: '1) Contexto: qué sistema/archivo y qué pasa. 2) Objetivo: qué quieres obtener. 3) Restricciones: qué no debe cambiar, alcance, supuestos. 4) Formato de salida: pasos, diff, lista, etc. 5) Revisión: pide edge cases/riesgos y verifica tú el resultado.',
        },
        {
          type: 'vocab',
          title: 'Vocabulario esencial de prompts y agentes',
          items: [
            {
              en: 'prompt / instruction',
              es: 'instrucción que das al modelo',
              example: 'Write a clear prompt with enough context.',
            },
            {
              en: 'context',
              es: 'información de fondo relevante',
              example: "Here's the context: this endpoint times out under load.",
            },
            {
              en: 'constraint',
              es: 'restricción o límite',
              example: 'One constraint: do not change the public API.',
            },
            {
              en: 'output format',
              es: 'formato de salida esperado',
              example: 'Use this output format: cause, fix, and test.',
            },
            {
              en: 'tool call',
              es: 'uso de una herramienta por el agente',
              example: 'The agent made a tool call to read the file.',
            },
            {
              en: 'hallucination',
              es: 'respuesta inventada o no fundamentada',
              example: 'Double-check the answer for hallucinations.',
            },
            {
              en: 'edge case',
              es: 'caso límite o poco común',
              example: 'Call out any edge cases for null input.',
            },
            {
              en: 'happy path',
              es: 'flujo normal sin errores',
              example: 'This works on the happy path, but fails on retries.',
            },
            {
              en: 'boilerplate',
              es: 'código repetitivo/plantilla',
              example: "Generate the boilerplate, then I'll refine it.",
            },
          ],
        },
        {
          type: 'vocab',
          title: 'Inglés nativo para pedir y guiar (muy común)',
          items: [
            {
              en: 'walk me through',
              es: 'explícame paso a paso',
              example: 'Can you walk me through this change?',
            },
            {
              en: 'break it down',
              es: 'desglósalo en partes simples',
              example: 'Break it down into smaller steps.',
            },
            {
              en: 'spell out',
              es: 'explicarlo con detalle y claridad',
              example: "Spell out the assumptions you're making.",
            },
            {
              en: 'call out',
              es: 'señalar o destacar algo importante',
              example: 'Call out any breaking changes.',
            },
            {
              en: 'from scratch',
              es: 'desde cero',
              example: 'Rewrite this function from scratch.',
            },
            {
              en: 'take another pass',
              es: 'revisarlo/hacer otra pasada',
              example: 'Can you take another pass at the error handling?',
            },
            {
              en: 'sanity check',
              es: 'revisión rápida para ver si tiene sentido',
              example: 'Do a quick sanity check on this approach.',
            },
            {
              en: 'keep it simple',
              es: 'mantenlo simple',
              example: "Let's keep it simple for now.",
            },
            {
              en: 'out of scope',
              es: 'fuera del alcance',
              example: 'Refactoring the database layer is out of scope.',
            },
          ],
        },
        {
          type: 'phrases',
          title: 'Frases nativas para prompts claros',
          items: [
            { en: "Here's the context: ...", es: 'Aquí está el contexto: ...' },
            { en: "What I'm trying to do is...", es: 'Lo que intento hacer es...' },
            { en: 'Walk me through your reasoning.', es: 'Explícame tu razonamiento paso a paso.' },
            {
              en: 'Call out any edge cases or trade-offs.',
              es: 'Señala cualquier caso borde o trade-off.',
            },
            {
              en: 'Keep the existing behavior the same.',
              es: 'Mantén el comportamiento existente igual.',
            },
            {
              en: "Let's keep this out of scope for now.",
              es: 'Dejemos esto fuera del alcance por ahora.',
            },
            {
              en: 'Can you take another pass and simplify it?',
              es: '¿Puedes revisarlo otra vez y simplificarlo?',
            },
            { en: 'Explain it in plain English.', es: 'Explícalo en inglés sencillo.' },
          ],
        },
        {
          type: 'table',
          title: 'De vago a nativo y claro',
          columns: ['En vez de...', 'Di mejor...', 'Por qué funciona'],
          rows: [
            [
              'Fix this.',
              "Here's the bug and expected behavior. Can you fix it without changing the API?",
              'Da contexto, objetivo y restricción.',
            ],
            [
              'Explain.',
              'Can you walk me through this step by step?',
              'Pide una explicación guiada y natural.',
            ],
            [
              'Is this okay?',
              'Can you do a quick sanity check and call out any edge cases?',
              'Pide revisión concreta, no un sí/no vago.',
            ],
            [
              'Rewrite it.',
              'Can you take another pass and keep it simple?',
              'Suena natural e indica estilo deseado.',
            ],
            [
              'Anything else?',
              'Is there anything out of scope or risky here?',
              'Ayuda a descubrir riesgos y límites.',
            ],
          ],
        },
        {
          type: 'dialogue',
          title: 'Escribir el prompt antes de pasarlo',
          context:
            'Dos devs acuerdan el contexto, la restricción y el formato del prompt para un agente.',
          lines: [
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: "Let's write the prompt first. Here's the context: the endpoint times out under load.",
              es: 'Escribamos primero el prompt. Aquí está el contexto: el endpoint expira bajo carga.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: "What I'm trying to do is add a retry. One constraint: keep the public API the same.",
              es: 'Lo que intento hacer es añadir un reintento. Una restricción: mantener la API pública igual.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Good. Ask it to walk me through the fix and call out any edge cases.',
              es: 'Bien. Pídele que explique la solución paso a paso y señale los casos borde.',
            },
            {
              speaker: 'b',
              name: 'Leo',
              role: 'Dev',
              en: 'Should we include the output format? I want cause, fix, and test.',
              es: '¿Incluimos el formato de salida? Quiero causa, solución y test.',
            },
            {
              speaker: 'a',
              name: 'Maya',
              role: 'Lead',
              en: 'Yes, and add a sanity check. Refactoring the database layer is out of scope.',
              es: 'Sí, y añade una revisión rápida. Refactorizar la capa de datos queda fuera del alcance.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l7-e1',
          type: 'choice',
          prompt: 'Quieres que el agente no cambie la API pública. ¿Qué parte del prompt es?',
          options: [
            'Una restricción (constraint)',
            'El formato de salida',
            'Un ejemplo',
            'Un saludo',
          ],
          answer: 0,
          explanation:
            "Es una restricción: define un límite claro ('do not change the public API').",
        },
        {
          id: 'm8-l7-e2',
          type: 'choice',
          prompt: 'De forma nativa, ¿cómo pides que te expliquen algo paso a paso?',
          options: [
            'Can you walk me through it?',
            'Can you road me it?',
            'Do a walking to me.',
            'You explain me walking.',
          ],
          answer: 0,
          explanation:
            "'Walk me through it' es una frase nativa muy común para pedir una explicación guiada.",
        },
        {
          id: 'm8-l7-e3',
          type: 'builder',
          prompt: "Construye: 'Señala cualquier caso borde o trade-off.'",
          words: ['Call out', 'any edge cases', 'or trade-offs.'],
          answer: 'Call out any edge cases or trade-offs.',
          explanation:
            "'Call out' significa señalar o destacar; es muy natural en revisiones técnicas.",
        },
        {
          id: 'm8-l7-e4',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Explícame tu razonamiento paso a paso.'",
          answer: 'Walk me through your reasoning.',
          accept: [
            'Walk me through your reasoning step by step.',
            'Can you walk me through your reasoning?',
            'Could you walk me through your reasoning?',
          ],
          hint: "Usa 'Walk me through...'",
          explanation: 'Forma nativa y clara de pedir que desglosen el razonamiento.',
        },
        {
          id: 'm8-l7-e5',
          type: 'choice',
          prompt: "¿Qué significa 'take another pass at the error handling'?",
          options: [
            'Ignorar el manejo de errores',
            'Revisarlo/mejorarlo otra vez',
            'Borrarlo desde cero sin razón',
            'Pasarlo a otro equipo',
          ],
          answer: 1,
          explanation: "'Take another pass' es hacer otra revisión o intento para mejorarlo.",
        },
        {
          id: 'm8-l7-e6',
          type: 'builder',
          prompt: "Construye: 'Mantén el comportamiento existente igual.'",
          words: ['Keep the', 'existing behavior', 'the same.'],
          answer: 'Keep the existing behavior the same.',
          explanation: 'Restricción clave y muy natural para evitar regresiones.',
        },
        {
          id: 'm8-l7-e7',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Haz una revisión rápida y señala cualquier caso borde.'",
          answer: 'Do a quick sanity check and call out any edge cases.',
          accept: [
            'Do a quick sanity check and call out any edge cases',
            'Can you do a quick sanity check and call out any edge cases?',
          ],
          hint: "Usa 'sanity check' y 'call out'.",
          explanation: 'Combina dos expresiones nativas muy usadas para pedir revisión concreta.',
        },
        {
          id: 'm8-l7-e8',
          type: 'choice',
          prompt: 'Quieres decir que algo no forma parte del trabajo ahora. ¿Qué dices?',
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
          id: 'm8-l7-e9',
          type: 'builder',
          prompt: "Construye: 'Explícalo en inglés sencillo.'",
          words: ['Explain it', 'in plain', 'English.'],
          answer: 'Explain it in plain English.',
          explanation:
            "'In plain English' pide una explicación simple y directa, sin jerga innecesaria.",
        },
        {
          id: 'm8-l7-e10',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Reescribe esta función desde cero, pero mantenlo simple.'",
          answer: 'Rewrite this function from scratch, but keep it simple.',
          accept: [
            'Rewrite this function from scratch but keep it simple.',
            'Rewrite this function from scratch, but keep it simple',
          ],
          hint: "Usa 'from scratch' y 'keep it simple'.",
          explanation:
            "'From scratch' (desde cero) y 'keep it simple' son expresiones nativas muy comunes.",
        },
        {
          id: 'm8-l7-e11',
          type: 'choice',
          prompt: 'En la conversación, ¿cuál es la restricción (constraint) del prompt?',
          options: [
            'Mantener la API pública igual.',
            'Cambiar la base de datos.',
            'Borrar el endpoint.',
            'Añadir un endpoint nuevo.',
          ],
          answer: 0,
          explanation: "Leo dice 'One constraint: keep the public API the same'.",
        },
        {
          id: 'm8-l7-e12',
          type: 'choice',
          prompt: '¿Qué le pidieron al agente en el prompt?',
          options: [
            'Que explique paso a paso, señale casos borde y dé causa, solución y test.',
            'Que ignore los errores.',
            'Que refactorice la base de datos.',
            'Que escriba documentación.',
          ],
          answer: 0,
          explanation:
            "Maya pide 'walk me through the fix and call out any edge cases', y Leo quiere 'cause, fix, and test' como formato de salida.",
        },
        {
          id: 'm8-l7-e13',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Here is the context, the goal and the constraints for the agent.',
          hint: 'Estructura de un prompt.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm8-l7-e14',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            { en: 'prompt / instruction', es: 'instrucción que das al modelo' },
            { en: 'context', es: 'información de fondo relevante' },
            { en: 'constraint', es: 'restricción o límite' },
            { en: 'output format', es: 'formato de salida esperado' },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
      ],
    },

    {
      id: 'm8-l5',
      slug: 'drills-situaciones-reales',
      title: 'Drills: cómo dirías y escríbelo',
      step: 'B1 · Paso 8.3 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Ejercicios guiados por situación real: bug, review, demo, ayuda y handoff. Piensa, escribe y compara.',
      objectives: [
        'Responder rápido a situaciones comunes con inglés claro.',
        "Practicar el patrón 'cómo dirías / escríbelo' con contexto.",
        'Usar frases modelo y adaptarlas a tu caso.',
      ],
      pronunciation:
        'I found the root cause. Let me walk you through the fix. Could you take a look when you have a minute?',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Integra vocabulario y estructuras de módulos previos (debug, PR, demo, handoff). Los modelos de frase aparecen en la lección; los ejercicios piden aplicar esos patrones a situaciones concretas.',
        },
        {
          type: 'technique',
          name: 'Responder rápido: contexto → hecho → siguiente paso',
          desc: 'Estructura breve para situaciones reales: qué pasa/contexto, hecho o causa principal, y siguiente acción. Esto funciona en bugs, reviews, demos y handoffs.',
        },
        {
          type: 'phrases',
          title: 'Modelos por situación',
          items: [
            {
              en: 'I found the root cause: the token expired.',
              es: 'Encontré la causa raíz: el token expiró.',
            },
            {
              en: 'I suggest adding a test for this case.',
              es: 'Sugiero agregar un test para este caso.',
            },
            {
              en: 'Let me walk you through the fix.',
              es: 'Déjame mostrarte el arreglo paso a paso.',
            },
            {
              en: 'Could you take a look when you have a minute?',
              es: '¿Podrías echarle un vistazo cuando tengas un minuto?',
            },
            {
              en: 'Status: done. Next step: deploy to staging.',
              es: 'Estado: listo. Próximo paso: desplegar a staging.',
            },
            {
              en: 'In other words, we need to retry the request.',
              es: 'En otras palabras, necesitamos reintentar la petición.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l5-e1',
          type: 'write',
          prompt:
            "Situación: encontraste la causa de un bug. Escríbelo: 'Encontré la causa raíz: el token expiró.'",
          answer: 'I found the root cause: the token expired.',
          accept: ['I found the root cause: the token had expired.'],
          hint: "Usa 'I found the root cause...' + pasado simple.",
          explanation:
            "Nombrar la causa raíz es claro y profesional en incidentes y debugging. Aquí basta con pasado simple ('expired'); 'had expired' se explica en el Paso 4.0 (B1).",
        },
        {
          id: 'm8-l5-e2',
          type: 'choice',
          prompt: 'Situación: quieres sugerir un test en un PR. ¿Cómo lo dirías?',
          options: [
            'Add test.',
            'I suggest adding a test for this case.',
            'Test missing bad.',
            'You forgot test.',
          ],
          answer: 1,
          explanation: "'I suggest adding...' es una sugerencia clara y respetuosa.",
        },
        {
          id: 'm8-l5-e3',
          type: 'write',
          prompt:
            "Situación: vas a mostrar un arreglo. Escríbelo: 'Déjame mostrarte el arreglo paso a paso.'",
          answer: 'Let me walk you through the fix.',
          accept: ['Let me walk you through the fix'],
          hint: "Usa 'walk you through...'",
          explanation: 'Frase ideal para empezar una demo o explicación técnica.',
        },
        {
          id: 'm8-l5-e4',
          type: 'builder',
          prompt:
            "Situación: handoff. Construye: 'Estado: listo. Próximo paso: desplegar a staging.'",
          words: ['Status: done.', 'Next step:', 'deploy', 'to staging.'],
          answer: 'Status: done. Next step: deploy to staging.',
          explanation: 'Sentence frame de estado + siguiente paso: rápido y claro en async.',
        },
        {
          id: 'm8-l5-e5',
          type: 'write',
          prompt:
            "Situación: reformula para que se entienda. Escríbelo: 'En otras palabras, necesitamos reintentar la petición.'",
          answer: 'In other words, we need to retry the request.',
          accept: [
            'In other words, we need to retry the request',
            'In other words we need to retry the request.',
          ],
          hint: "Empieza con 'In other words,'.",
          explanation: "'In other words' reformula la idea con otras palabras más claras.",
        },
        {
          id: 'm8-l5-e6',
          type: 'choice',
          prompt: 'Situación: necesitas ayuda sin urgencia agresiva. ¿Qué eliges?',
          options: [
            'Help me now.',
            'Could you take a look when you have a minute?',
            'Fix this ASAP!!!',
            'You must check this.',
          ],
          answer: 1,
          explanation: 'Petición educada y realista para trabajo asíncrono.',
        },
        {
          id: 'm8-l5-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Do a quick sanity check and call out any edge cases.',
          hint: 'Dos chunks de revisión.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l6',
      slug: 'emails-tickets-y-mensajes-profesionales',
      title: 'Emails, tickets y mensajes profesionales',
      step: 'B1 · Paso 8.4 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Escribe mensajes claros para reportar avances, pedir acciones y cerrar tareas sin ambigüedad.',
      objectives: [
        'Redactar mensajes cortos con contexto, acción y cierre.',
        'Usar frases modelo para tickets, emails y chat profesional.',
        'Confirmar entendimiento y próximos pasos por escrito.',
      ],
      pronunciation:
        'Hi team, the fix is ready. Please review the ticket when you can. Let me know if you need anything else.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Requiere formas básicas de estado, peticiones y cierres vistos antes. Aquí se consolidan en plantillas para emails/tickets/chat profesional.',
        },
        {
          type: 'technique',
          name: 'Escribir claro en 3 partes',
          desc: "1) Estado/contexto. 2) Acción o petición concreta. 3) Cierre/seguimiento ('Let me know if...'). Mensajes cortos y estructurados evitan ambigüedad en async.",
        },
        {
          type: 'phrases',
          title: 'Frases modelo',
          items: [
            {
              en: "Hi team, here's a quick update.",
              es: 'Hola equipo, aquí va una actualización rápida.',
            },
            {
              en: 'The issue is fixed and deployed to staging.',
              es: 'El problema está arreglado y desplegado a staging.',
            },
            {
              en: 'Please review the ticket when you can.',
              es: 'Por favor revisa el ticket cuando puedas.',
            },
            {
              en: 'Let me know if you need any more details.',
              es: 'Avísame si necesitas más detalles.',
            },
            {
              en: "I'll follow up once I have more information.",
              es: 'Haré seguimiento cuando tenga más información.',
            },
            { en: 'Thanks for your help.', es: 'Gracias por tu ayuda.' },
          ],
        },
        {
          type: 'table',
          title: 'Sentence frames para escribir rápido',
          columns: ['Objetivo', 'Marco'],
          rows: [
            ['Dar estado', 'The [task/issue] is [status].'],
            ['Pedir acción', 'Please [action] when you [time/condition].'],
            ['Cerrar', 'Let me know if you need [anything/more details].'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l6-e1',
          type: 'choice',
          prompt: 'Quieres empezar un mensaje de actualización de forma clara. ¿Qué eliges?',
          options: ['Hey.', "Hi team, here's a quick update.", 'Listen.', 'Now read this.'],
          answer: 1,
          explanation:
            "Una apertura clara y profesional prepara al lector: 'Hi team, here's a quick update.'",
        },
        {
          id: 'm8-l6-e2',
          type: 'builder',
          prompt: "Construye: 'El problema está arreglado y desplegado en staging.'",
          words: ['The issue', 'is fixed', 'and deployed', 'to staging.'],
          answer: 'The issue is fixed and deployed to staging.',
          explanation:
            "Forma clara y simple para comunicar el estado actual: 'is fixed and deployed' (resultado/estado). Usa vocabulario ya visto (issue, fix, deploy, staging).",
        },
        {
          id: 'm8-l6-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Avísame si necesitas más detalles.'",
          answer: 'Let me know if you need more details.',
          accept: [
            'Let me know if you need any more details.',
            'Please let me know if you need more details.',
          ],
          hint: "Usa 'Let me know if...'",
          explanation: 'Cierre útil que deja abierta la comunicación sin sonar insistente.',
        },
        {
          id: 'm8-l6-e4',
          type: 'choice',
          prompt: '¿Qué mensaje cierra mejor una tarea por escrito?',
          options: [
            'Done.',
            "I'll follow up once I have more information.",
            'Whatever happens happens.',
            'No more messages.',
          ],
          answer: 1,
          explanation:
            "Indicar el siguiente paso o seguimiento ('I'll follow up...') da claridad sobre qué esperar.",
        },
        {
          id: 'm8-l6-e5',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Por favor revisa el ticket cuando puedas.'",
          answer: 'Please review the ticket when you can.',
          accept: ['Please review the ticket when you can'],
          hint: "Petición concreta + 'when you can'.",
          explanation:
            'Pide una acción clara y con cortesía usando una frase modelo de la lección.',
        },
        {
          id: 'm8-l6-e6',
          type: 'builder',
          prompt: "Construye: 'Hola equipo, aquí va una actualización rápida.'",
          words: ['Hi team,', "here's", 'a quick', 'update.'],
          answer: "Hi team, here's a quick update.",
          explanation: 'Apertura profesional para emails, tickets o mensajes de chat.',
        },
        {
          id: 'm8-l6-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Could you clarify the acceptance criteria in the ticket?',
          hint: 'Pregunta profesional.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
        {
          id: 'm8-l6-e8',
          type: 'match',
          prompt: 'Empareja cada término con su significado.',
          pairs: [
            {
              en: "Hi team, here's a quick update.",
              es: 'Hola equipo, aquí va una actualización rápida.',
            },
            {
              en: 'The issue is fixed and deployed to staging.',
              es: 'El problema está arreglado y desplegado a staging.',
            },
            {
              en: 'Please review the ticket when you can.',
              es: 'Por favor revisa el ticket cuando puedas.',
            },
            {
              en: 'Let me know if you need any more details.',
              es: 'Avísame si necesitas más detalles.',
            },
          ],
          explanation:
            'Emparejar el término con su significado refuerza el vocabulario de esta lección.',
        },
      ],
    },
    {
      id: 'm7-l5',
      slug: 'repaso-final-practica-extra',
      title: 'Repaso final: práctica extra',
      step: 'B1-B2 · Paso 8.5 · Repaso final',
      cefr: 'B1',
      summary:
        'Una sesión larga e intuitiva para repasar todo: cómo dirías esto, escríbelo, arma frases y elige la mejor opción.',
      objectives: [
        'Repasar vocabulario y frases clave de todo el curso en situaciones reales.',
        'Practicar cómo decir y escribir ideas comunes de trabajo técnico.',
        'Ganar fluidez combinando verbos, tiempos, conectores y comunicación profesional.',
      ],
      pronunciation:
        'I mean, the build failed, but I fixed it. Actually, we should add a test before we merge.',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Recomendado tras avanzar por los módulos principales (M1–M7/M8 según tu progreso). Esta sesión mezcla contenidos de todo el curso como práctica de recuperación: si algo falla, vuelve al módulo correspondiente.',
        },
        {
          type: 'technique',
          name: 'Cómo aprovechar el repaso',
          desc: 'Piensa la idea, elige la forma más simple y clara, y verifica sujeto+tiempo+complemento. Prioriza claridad sobre complejidad. Repetir en voz alta ayuda a fijar ritmo y chunks.',
        },
        {
          type: 'phrases',
          title: 'Frases útiles para repasar',
          items: [
            { en: 'How would you say this in English?', es: '¿Cómo dirías esto en inglés?' },
            { en: 'Could you clarify what you mean?', es: '¿Podrías aclarar a qué te refieres?' },
            {
              en: 'I fixed the bug and pushed the changes.',
              es: 'Arreglé el bug y subí los cambios.',
            },
            {
              en: "The build failed, but I'm looking into it.",
              es: 'El build falló, pero lo estoy revisando.',
            },
            { en: "I mean, it's not a blocker.", es: 'O sea, no es un bloqueador.' },
            {
              en: 'Actually, the issue is in the frontend.',
              es: 'En realidad, el problema está en el frontend.',
            },
            {
              en: 'Can you review this PR when you have a minute?',
              es: '¿Puedes revisar este PR cuando tengas un minuto?',
            },
            {
              en: 'Do you have an ETA for the fix?',
              es: '¿Tienes una estimación para el arreglo?',
            },
          ],
        },
        {
          type: 'table',
          title: 'Repaso rápido: idea → inglés',
          columns: ['Quieres decir...', 'Puedes decir...'],
          rows: [
            ['Estoy trabajando en esto', "I'm working on it."],
            ['Ya lo arreglé', 'I fixed it.'],
            ['El deploy falló', 'The deployment failed.'],
            ['¿Puedes revisarlo?', 'Can you review it?'],
            ['En realidad es otro problema', "Actually, it's a different issue."],
            ['Básicamente falta un test', "Basically, we're missing a test."],
          ],
        },
        {
          type: 'vocab',
          title: 'Palabras y conectores clave',
          items: [
            { en: 'fix / fixed', es: 'arreglar / arreglé', example: 'I fixed the bug.' },
            {
              en: 'deploy / deployment',
              es: 'desplegar / despliegue',
              example: 'The deployment failed.',
            },
            { en: 'review', es: 'revisar / revisión', example: 'Can you review my PR?' },
            { en: 'merge', es: 'fusionar cambios', example: "Let's merge it after the review." },
            { en: 'I mean', es: 'o sea / quiero decir', example: 'I mean, we need more time.' },
            { en: 'actually', es: 'en realidad / de hecho', example: 'Actually, it works now.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm7-l5-e1',
          type: 'choice',
          prompt: "¿Cómo dirías: 'Estoy trabajando en el bug ahora'?",
          options: [
            'I work on the bug now.',
            "I'm working on the bug now.",
            'I worked on the bug now.',
            'I am work on the bug now.',
          ],
          answer: 1,
          explanation:
            "Para algo que estás haciendo en este momento, usa presente continuo: 'I'm working on...'.",
        },
        {
          id: 'm7-l5-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Arreglé el bug ayer.'",
          answer: 'I fixed the bug yesterday.',
          accept: ['I fixed the bug yesterday'],
          hint: "Pasado simple de 'fix' = 'fixed'.",
          explanation: "Acción terminada en el pasado: 'I fixed the bug yesterday.'",
        },
        {
          id: 'm7-l5-e3',
          type: 'choice',
          prompt: "¿Cómo dirías con claridad: '¿Puedes aclarar a qué te refieres?'",
          options: [
            'Can you clarify what you mean?',
            'You clarify what you mean?',
            'Can you clarifying what you mean?',
            'Do you can clarify what you mean?',
          ],
          answer: 0,
          explanation: "Pregunta educada y natural: 'Can you clarify what you mean?'.",
        },
        {
          id: 'm7-l5-e4',
          type: 'write',
          prompt: "Escríbelo en inglés: 'El despliegue falló, pero ya lo estoy revisando.'",
          answer: "The deployment failed, but I'm looking into it.",
          accept: [
            'The deployment failed, but I am looking into it.',
            "The deploy failed, but I'm looking into it.",
            'The deploy failed, but I am looking into it.',
          ],
          hint: "Usa 'failed' y 'I'm looking into it'.",
          explanation:
            "Combinas pasado simple (lo que pasó) con presente continuo (lo que haces ahora): 'failed, but I'm looking into it'.",
        },
        {
          id: 'm7-l5-e5',
          type: 'builder',
          prompt: "Construye: '¿Puedes revisar este PR cuando tengas un minuto?'",
          words: ['Can you review', 'this PR', 'when you have', 'a minute?'],
          answer: 'Can you review this PR when you have a minute?',
          explanation: "Petición amable y común en trabajo asíncrono: 'when you have a minute'.",
        },
        {
          id: 'm7-l5-e6',
          type: 'choice',
          prompt: 'Quieres corregir algo que dijiste antes. ¿Cuál suena más natural?',
          options: [
            'Actually, the issue is in the frontend.',
            'Currently, the issue is in the frontend.',
            'Yesterday, the issue is in the frontend.',
            'Maybe actually currently frontend.',
          ],
          answer: 0,
          explanation:
            "'Actually' corrige o aclara: 'en realidad, el problema está en el frontend'.",
        },
        {
          id: 'm7-l5-e7',
          type: 'write',
          prompt:
            "Escríbelo en inglés: 'O sea, no es un bloqueador, pero deberíamos arreglarlo pronto.'",
          answer: "I mean, it's not a blocker, but we should fix it soon.",
          accept: [
            'I mean, it is not a blocker, but we should fix it soon.',
            "I mean, it isn't a blocker, but we should fix it soon.",
            "I mean it isn't a blocker, but we should fix it soon.",
          ],
          hint: "Empieza con 'I mean,'.",
          explanation:
            "'I mean' reformula o suaviza la idea; 'we should fix it soon' propone el siguiente paso.",
        },
        {
          id: 'm7-l5-e8',
          type: 'builder',
          prompt: "Construye: 'Básicamente, necesitamos limpiar la caché.'",
          words: ['Basically,', 'we need', 'to clear', 'the cache.'],
          answer: 'Basically, we need to clear the cache.',
          explanation: "'Basically' resume la idea principal de forma simple.",
        },
        {
          id: 'm7-l5-e9',
          type: 'choice',
          prompt: 'En un daily, ¿cuál opción es clara y profesional?',
          options: [
            "Yesterday I fixed the login bug. Today I'm working on tests. I'm blocked by API access.",
            'Bug fixed. Tests. Blocked.',
            'I do things and maybe blocked.',
            'Yesterday today blocked yes.',
          ],
          answer: 0,
          explanation:
            'Una buena actualización dice qué hiciste, qué harás y si tienes un bloqueo, con frases completas y claras.',
        },
        {
          id: 'm7-l5-e10',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Tienes una estimación para el arreglo?'",
          answer: 'Do you have an ETA for the fix?',
          accept: ['Do you have an ETA for the fix', 'Do you have an ETA on the fix?'],
          hint: "Usa 'ETA for the fix'.",
          explanation:
            "'ETA' (estimated time of arrival/time) es muy común para pedir una estimación de tiempo.",
        },
        {
          id: 'm7-l5-e11',
          type: 'choice',
          prompt: "¿Cómo dirías: 'Hice push de los cambios y abrí un PR'?",
          options: [
            'I pushed the changes and opened a PR.',
            'I push the changes and open a PR yesterday.',
            'I pushing the changes and opened a PR.',
            'I have push the changes and opened a PR.',
          ],
          answer: 0,
          explanation: "Dos acciones completadas en pasado: 'pushed' y 'opened'.",
        },
        {
          id: 'm7-l5-e12',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Nunca subas secretos al repositorio.'",
          answer: 'Never commit secrets to the repository.',
          accept: [
            'Never commit secrets to the repo.',
            'Never push secrets to the repository.',
            'Never push secrets to the repo.',
          ],
          hint: "Imperativo negativo: 'Never commit...'.",
          explanation:
            "Regla de seguridad básica expresada con imperativo: 'Never commit secrets...'.",
        },
        {
          id: 'm7-l5-e13',
          type: 'builder',
          prompt: "Construye: 'Los tests pasan. Adelante, podemos hacer merge.'",
          words: ['The tests pass.', 'Ship it,', 'we can merge.'],
          answer: 'The tests pass. Ship it, we can merge.',
          explanation:
            'Repaso de revisión: confirmar que los tests pasan y dar luz verde para mergear.',
        },
        {
          id: 'm7-l5-e14',
          type: 'write',
          prompt: "Escríbelo en inglés: 'En otras palabras, el servicio no responde.'",
          answer: 'In other words, the service is not responding.',
          accept: [
            "In other words, the service isn't responding.",
            'In other words, the service is down.',
          ],
          hint: "Empieza con 'In other words,'.",
          explanation: "'In other words' reformula la idea para que sea más clara.",
        },
        {
          id: 'm7-l5-e15',
          type: 'choice',
          prompt: "¿Cómo dirías: 'Podemos volver a este tema después del standup'?",
          options: [
            'We can circle back after the standup.',
            'We can circle after the standup back.',
            'We can back circle after the standup.',
            'We can standup circle after.',
          ],
          answer: 0,
          explanation:
            "'Circle back' significa retomar un tema más tarde: frase muy común en equipos.",
        },
        {
          id: 'm7-l5-e16',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Para ser honesto, creo que deberíamos agregar más tests.'",
          answer: 'To be honest, I think we should add more tests.',
          accept: [
            'To be honest, I think we should add more tests',
            'Honestly, I think we should add more tests.',
          ],
          hint: "Empieza con 'To be honest,'.",
          explanation:
            "'To be honest' introduce una opinión directa de forma natural; 'we should add more tests' da una recomendación clara.",
        },
        {
          id: 'm7-l5-e17',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I will follow up with the details after the review.',
          hint: 'Cierre de una reunión.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l8',
      slug: 'prompts-ai-practica-enfocada',
      title: 'Práctica enfocada: prompts para AI agents',
      step: 'B1 · Paso 8.6 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar la práctica de m8-l7: contexto, restricción, revisión y frases nativas en prompts.',
      objectives: [
        'Aplicar la estructura contexto → objetivo → límites → formato en situaciones concretas.',
        'Usar chunks nativos ya vistos (walk me through, call out, sanity check, out of scope).',
        'Pedir revisiones y cambios sin ambigüedad.',
      ],
      pronunciation:
        "Here's the context. Keep the API the same, call out edge cases, and take another pass at the tests.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Completa primero 'Prompts y trabajo con AI agents' (m8-l7). Esta sesión separa la práctica en drills cortos usando solo el vocabulario y los chunks ya enseñados allí.",
        },
        {
          type: 'technique',
          name: 'Plantilla rápida de prompt',
          desc: "Contexto ('Here's the context...') + objetivo claro + restricción ('Keep the existing behavior the same' / 'out of scope') + revisión ('sanity check', 'call out edge cases').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo (ya vistos)',
          items: [
            { en: "Here's the context: ...", es: 'Aquí está el contexto: ...' },
            {
              en: 'Keep the existing behavior the same.',
              es: 'Mantén el comportamiento existente igual.',
            },
            { en: 'Call out any edge cases.', es: 'Señala cualquier caso límite.' },
            { en: 'Can you do a quick sanity check?', es: '¿Puedes hacer una revisión rápida?' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l8-e1',
          type: 'choice',
          prompt: 'Quieres pedir contexto y una explicación paso a paso. ¿Qué opción es más clara?',
          options: [
            'Fix.',
            "Here's the context: the login fails. Can you walk me through the fix?",
            'Explain fast.',
            'Do something about login.',
          ],
          answer: 1,
          explanation:
            "Da contexto y usa 'walk me through' (chunk ya visto en m8-l7) para pedir una explicación guiada.",
        },
        {
          id: 'm8-l8-e2',
          type: 'builder',
          prompt: "Construye: 'Mantén el comportamiento existente igual.'",
          words: ['Keep the', 'existing behavior', 'the same.'],
          answer: 'Keep the existing behavior the same.',
          explanation: 'Restricción clara para evitar regresiones (chunk de m8-l7).',
        },
        {
          id: 'm8-l8-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Haz una revisión rápida y señala cualquier caso borde.'",
          answer: 'Do a quick sanity check and call out any edge cases.',
          accept: ['Can you do a quick sanity check and call out any edge cases?'],
          hint: "Usa 'sanity check' y 'call out any edge cases'.",
          explanation: 'Pide revisión concreta con expresiones nativas ya practicadas.',
        },
        {
          id: 'm8-l8-e4',
          type: 'choice',
          prompt: 'Quieres dejar el refactor de base de datos para después. ¿Qué dices?',
          options: [
            'Do database refactor now.',
            'Refactoring the database is out of scope for now.',
            'Database is maybe later yes.',
            'No database ever.',
          ],
          answer: 1,
          explanation: "'Out of scope for now' delimita claramente el alcance (visto en m8-l7).",
        },
        {
          id: 'm8-l8-e5',
          type: 'builder',
          prompt: "Construye: 'Explícame tu razonamiento paso a paso.'",
          words: ['Walk me', 'through your', 'reasoning.'],
          answer: 'Walk me through your reasoning.',
          explanation: 'Pide una explicación guiada con un chunk nativo ya enseñado.',
        },
        {
          id: 'm8-l8-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Revísalo otra vez y mantenlo simple.'",
          answer: 'Take another pass and keep it simple.',
          accept: ['Can you take another pass and keep it simple?'],
          hint: "Usa 'take another pass' y 'keep it simple'.",
          explanation: 'Dos frases nativas de m8-l7 para pedir una mejora clara y sencilla.',
        },
        {
          id: 'm8-l8-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Keep the existing behavior the same and list any edge cases.',
          hint: 'Restricción para un agente.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l9',
      slug: 'repaso-final-comunicacion-entregas',
      title: 'Repaso final: comunicación y entregas',
      step: 'B1-B2 · Paso 8.7 · Repaso final',
      cefr: 'B1',
      summary:
        'Repaso separado y enfocado en comunicación diaria: tiempos básicos, PRs, actualizaciones, bloqueos y conectores.',
      objectives: [
        'Practicar updates claros con pasado/presente/futuro y siguiente paso.',
        'Reforzar frases de PR, bloqueos, estimaciones y conectores ya vistos.',
        'Ganar fluidez en mensajes cortos y profesionales.',
      ],
      pronunciation:
        "I fixed the bug, I'm testing it now, and I'll open a PR today. Actually, I'm blocked by API access.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Complementa el repaso final integrado (m7-l5) separando la práctica en comunicación y entregas. Usa solo estructuras y chunks ya trabajados en el curso (tiempos básicos, PR, async, conectores, estimaciones).',
        },
        {
          type: 'technique',
          name: 'Estructura de update corto',
          desc: 'Qué pasó (pasado) → qué haces ahora (presente continuo/estado) → siguiente paso (will/can/next step). Añade bloqueo o conector si hace falta.',
        },
        {
          type: 'phrases',
          title: 'Modelos de repaso',
          items: [
            { en: 'I fixed the bug and opened a PR.', es: 'Arreglé el bug y abrí un PR.' },
            { en: "I'm blocked by API access.", es: 'Estoy bloqueado por el acceso a la API.' },
            {
              en: 'Actually, the issue is in the frontend.',
              es: 'En realidad, el problema está en el frontend.',
            },
            {
              en: 'It will take two to three days, assuming the API is stable.',
              es: 'Tomará dos o tres días, suponiendo que la API sea estable.',
            },
          ],
        },
        {
          type: 'table',
          title: 'Marcos rápidos',
          columns: ['Situación', 'Marco'],
          rows: [
            ['Estado + siguiente paso', "I'm working on [tarea]. Next step: [acción]."],
            ['Bloqueo', "I'm blocked by [causa]."],
            ['Corrección', 'Actually, [hecho correcto].'],
            ['Estimación', 'It will take [rango], assuming [supuesto].'],
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l9-e1',
          type: 'builder',
          prompt: "Construye: 'Arreglé el bug y abrí un PR.'",
          words: ['I fixed', 'the bug', 'and opened', 'a PR.'],
          answer: 'I fixed the bug and opened a PR.',
          explanation: 'Dos acciones completadas en pasado simple: forma clara y común en updates.',
        },
        {
          id: 'm8-l9-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Estoy bloqueado por el acceso a la API.'",
          answer: "I'm blocked by API access.",
          accept: ['I am blocked by API access.', "I'm blocked by access to the API."],
          hint: "Usa 'I'm blocked by...'",
          explanation: 'Comunica bloqueo y causa de forma directa.',
        },
        {
          id: 'm8-l9-e3',
          type: 'choice',
          prompt: 'Quieres corregir un malentendido: el problema está en el frontend. ¿Qué dices?',
          options: [
            'Basically, backend.',
            'Actually, the issue is in the frontend.',
            'Anyway, issue frontend.',
            'Currently maybe backend.',
          ],
          answer: 1,
          explanation: "'Actually' corrige o aclara información previa.",
        },
        {
          id: 'm8-l9-e4',
          type: 'write',
          prompt:
            "Escríbelo en inglés: 'Tomará dos o tres días, suponiendo que la API sea estable.'",
          answer: 'It will take two to three days, assuming the API is stable.',
          accept: ["It'll take two to three days, assuming the API is stable."],
          hint: "Usa 'It will take...' y 'assuming...'",
          explanation: 'Estimación profesional con rango y supuesto explícito.',
        },
        {
          id: 'm8-l9-e5',
          type: 'builder',
          prompt: "Construye: 'Estoy trabajando en los tests. Próximo paso: abrir el PR.'",
          words: ["I'm working on", 'the tests.', 'Next step:', 'open the PR.'],
          answer: "I'm working on the tests. Next step: open the PR.",
          explanation: 'Update corto con estado actual y siguiente paso.',
        },
        {
          id: 'm8-l9-e6',
          type: 'choice',
          prompt: 'En un PR, los tests pasan y quieres dar luz verde. ¿Qué opción es adecuada?',
          options: ['Bad tests.', 'LGTM, we can merge.', 'No idea.', 'Ship never.'],
          answer: 1,
          explanation:
            "'LGTM' (visto en el curso) indica aprobación; combinarlo con el siguiente paso es claro.",
        },
        {
          id: 'm8-l9-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Could you give me actionable feedback on the RFC?',
          hint: 'Pedir feedback concreto.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l10',
      slug: 'repaso-final-tiempos-errores-acciones',
      title: 'Repaso final: tiempos, errores y acciones',
      step: 'B1-B2 · Paso 8.8 · Repaso final',
      cefr: 'B1',
      summary:
        'Repaso separado para practicar tiempos básicos, reportes de errores y acciones técnicas con frases cortas.',
      objectives: [
        "Usar presente continuo, pasado simple y 'will' en contexto técnico.",
        'Reportar un problema y decir qué haces o harás después.',
        'Reforzar imperativos y vocabulario de acciones ya vistos.',
      ],
      pronunciation:
        "The build failed, but I'm fixing it now. I'll push the fix after the tests pass.",
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Complementa el repaso integrado (m7-l5) y el repaso de comunicación (m8-l9) separando la práctica en tiempos, errores y acciones. Usa estructuras y vocabulario ya trabajados en M1–M5.',
        },
        {
          type: 'technique',
          name: 'Narrativa corta de un problema',
          desc: "Qué pasó (pasado): 'The build failed.' Qué haces ahora (continuo): 'I'm fixing it now.' Siguiente paso (futuro): 'I'll push the fix tomorrow.'",
        },
        {
          type: 'phrases',
          title: 'Modelos de repaso',
          items: [
            {
              en: "The build failed, but I'm fixing it now.",
              es: 'El build falló, pero lo estoy arreglando ahora.',
            },
            {
              en: 'I fixed the bug and pushed the changes.',
              es: 'Arreglé el bug y subí los cambios.',
            },
            {
              en: "I'll deploy the fix after the tests pass.",
              es: 'Desplegaré el arreglo cuando pasen los tests.',
            },
            {
              en: 'Never commit secrets to the repository.',
              es: 'Nunca subas secretos al repositorio.',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l10-e1',
          type: 'choice',
          prompt: '¿Cómo describes lo que estás haciendo ahora?',
          options: [
            'I fix the bug now.',
            "I'm fixing the bug now.",
            'I fixed the bug now.',
            'I will fixing the bug now.',
          ],
          answer: 1,
          explanation: "Acción en curso en este momento: presente continuo ('I'm fixing...').",
        },
        {
          id: 'm8-l10-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Arreglé el bug y subí los cambios.'",
          answer: 'I fixed the bug and pushed the changes.',
          accept: ['I fixed the bug and pushed the changes'],
          hint: 'Dos acciones terminadas en pasado simple.',
          explanation: "'Fixed' y 'pushed' son acciones completadas en el pasado.",
        },
        {
          id: 'm8-l10-e3',
          type: 'builder',
          prompt: "Construye: 'El build falló, pero lo estoy arreglando ahora.'",
          words: ['The build failed,', "but I'm fixing", 'it now.'],
          answer: "The build failed, but I'm fixing it now.",
          explanation: 'Combina pasado (lo que pasó) y presente continuo (lo que haces ahora).',
        },
        {
          id: 'm8-l10-e4',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Desplegaré el arreglo mañana.'",
          answer: "I'll deploy the fix tomorrow.",
          accept: ['I will deploy the fix tomorrow.'],
          hint: "Usa 'I'll deploy...' + 'tomorrow'.",
          explanation: "Futuro simple con 'will' para el siguiente paso.",
        },
        {
          id: 'm8-l10-e5',
          type: 'choice',
          prompt: 'Quieres dar una regla de seguridad clara. ¿Qué opción es correcta?',
          options: [
            'Never commit secrets to the repository.',
            'Sometimes commit secrets.',
            'Commit secrets now.',
            'Secrets are good in repo.',
          ],
          answer: 0,
          explanation: "Imperativo negativo para una regla: 'Never commit secrets...'",
        },
        {
          id: 'm8-l10-e6',
          type: 'builder',
          prompt: "Construye: 'Trae los últimos cambios y ejecuta los tests.'",
          words: ['Pull', 'the latest changes', 'and run', 'the tests.'],
          answer: 'Pull the latest changes and run the tests.',
          explanation: 'Secuencia de imperativos clara, muy común en trabajo técnico.',
        },
        {
          id: 'm8-l10-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'I have finished the fix and I will deploy it tomorrow.',
          hint: 'Presente perfecto + futuro.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l11',
      slug: 'practica-iterar-y-revisar-agente',
      title: 'Práctica: iterar y revisar con un AI agent',
      step: 'B1 · Paso 8.9 · Práctica guiada',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar la iteración con agentes: revisar, simplificar, acotar alcance y verificar.',
      objectives: [
        'Pedir otra revisión o simplificación con frases nativas ya vistas.',
        'Delimitar alcance y mantener el comportamiento existente.',
        'Solicitar revisiones rápidas y explicaciones claras.',
      ],
      pronunciation: 'Can you take another pass, keep it simple, and do a quick sanity check?',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: "Completa 'Prompts y trabajo con AI agents' (m8-l7) y, si puedes, la práctica enfocada (m8-l8). Aquí refuerzas iteración y revisión usando solo chunks ya enseñados.",
        },
        {
          type: 'technique',
          name: 'Iterar con claridad',
          desc: "Para mejorar una respuesta: 'take another pass', 'keep it simple', 'explain it in plain English'. Para controlar cambios: 'out of scope', 'keep the existing behavior the same'. Para verificar: 'sanity check', 'call out edge cases'.",
        },
        {
          type: 'phrases',
          title: 'Chunks de iteración (ya vistos)',
          items: [
            {
              en: 'Can you take another pass and keep it simple?',
              es: '¿Puedes revisarlo otra vez y mantenerlo simple?',
            },
            {
              en: "Let's keep this out of scope for now.",
              es: 'Dejemos esto fuera del alcance por ahora.',
            },
            { en: 'Do a quick sanity check.', es: 'Haz una revisión rápida.' },
            { en: 'Explain it in plain English.', es: 'Explícalo en inglés sencillo.' },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l11-e1',
          type: 'choice',
          prompt: 'Quieres que el agente mejore la respuesta sin complicarla. ¿Qué dices?',
          options: [
            'Make it harder.',
            'Can you take another pass and keep it simple?',
            'Do nothing.',
            'Change everything.',
          ],
          answer: 1,
          explanation:
            "'Take another pass' pide otra revisión y 'keep it simple' indica el estilo deseado (chunks de m8-l7).",
        },
        {
          id: 'm8-l11-e2',
          type: 'builder',
          prompt: "Construye: 'Dejemos esto fuera del alcance por ahora.'",
          words: ["Let's keep", 'this out of scope', 'for now.'],
          answer: "Let's keep this out of scope for now.",
          explanation: 'Delimitar alcance evita trabajo innecesario y mantiene el foco.',
        },
        {
          id: 'm8-l11-e3',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Haz una revisión rápida.'",
          answer: 'Do a quick sanity check.',
          accept: ['Can you do a quick sanity check?'],
          hint: "Usa 'sanity check'.",
          explanation: "'Sanity check' es una revisión rápida para ver si algo tiene sentido.",
        },
        {
          id: 'm8-l11-e4',
          type: 'choice',
          prompt: 'Quieres una explicación fácil de entender. ¿Qué frase es mejor?',
          options: [
            'Explain it in plain English.',
            'Explain it in complex English.',
            'No explain.',
            'Explain later never.',
          ],
          answer: 0,
          explanation: "'In plain English' pide una explicación simple y clara.",
        },
        {
          id: 'm8-l11-e5',
          type: 'builder',
          prompt: "Construye: 'Mantén el comportamiento existente igual.'",
          words: ['Keep the', 'existing behavior', 'the same.'],
          answer: 'Keep the existing behavior the same.',
          explanation: 'Restricción clave para evitar regresiones al iterar cambios.',
        },
        {
          id: 'm8-l11-e6',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Revísalo otra vez y mantenlo simple.'",
          answer: 'Take another pass and keep it simple.',
          accept: ['Can you take another pass and keep it simple?'],
          hint: "Usa 'take another pass' y 'keep it simple'.",
          explanation: 'Combinación nativa y clara para pedir una iteración mejor enfocada.',
        },
        {
          id: 'm8-l11-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'The agent hallucinated an API, so I verified the docs.',
          hint: 'Verificar trabajo de un agente.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
    {
      id: 'm8-l12',
      slug: 'repaso-final-lectura-y-aclaraciones',
      title: 'Repaso final: lectura, preguntas y aclaraciones',
      step: 'B1 · Paso 8.10 · Repaso final',
      cefr: 'B1',
      summary:
        'Sesión corta para separar y reforzar lectura rápida de docs y cómo pedir aclaraciones con frases ya conocidas.',
      objectives: [
        'Resumir requisitos o puntos clave de documentación.',
        'Pedir repetición, explicación o confirmación con cortesía.',
        'Verificar entendimiento antes de actuar.',
      ],
      pronunciation: 'In short, we must validate the input. Could you explain that again, please?',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Antes de esta lección',
          body: 'Repasa m1-l4 (preguntar y pedir aclaraciones) y m8-l1 (lectura rápida de docs y specs). Esta práctica usa solo frases y estructuras ya enseñadas en esas lecciones.',
        },
        {
          type: 'technique',
          name: 'Leer y aclarar antes de implementar',
          desc: "Docs: extrae lo clave ('In short...', 'According to the docs...', 'The main requirement is...'). Aclarar: pide repetición/explicación ('Could you explain that again?', 'Sorry, I didn't catch that.') y confirma ('Let me confirm...').",
        },
        {
          type: 'phrases',
          title: 'Chunks de apoyo',
          items: [
            {
              en: 'In short, we must send an API key.',
              es: 'En resumen, debemos enviar una clave de API.',
            },
            {
              en: 'According to the docs, this endpoint is deprecated.',
              es: 'Según la documentación, este endpoint está obsoleto.',
            },
            { en: 'Could you explain that again?', es: '¿Podrías explicarlo otra vez?' },
            {
              en: 'Let me confirm: we deploy on Friday, right?',
              es: 'Déjame confirmar: desplegamos el viernes, ¿verdad?',
            },
          ],
        },
      ],
      exercises: [
        {
          id: 'm8-l12-e1',
          type: 'choice',
          prompt: 'Quieres resumir un requisito de la documentación. ¿Qué opción es mejor?',
          options: [
            'In short, we must validate the input.',
            'Input maybe validate.',
            'Validate input now please short.',
            'Docs is input.',
          ],
          answer: 0,
          explanation: "'In short...' es una forma clara de resumir el punto principal (m8-l1).",
        },
        {
          id: 'm8-l12-e2',
          type: 'write',
          prompt: "Escríbelo en inglés: '¿Podrías explicarlo otra vez?'",
          answer: 'Could you explain that again?',
          accept: ['Could you explain that again, please?'],
          hint: "Usa 'Could you explain...' + 'again'.",
          explanation: 'Pedir explicación de nuevo es normal y profesional (m1-l4).',
        },
        {
          id: 'm8-l12-e3',
          type: 'builder',
          prompt: "Construye: 'Según la documentación, este endpoint está obsoleto.'",
          words: ['According to the docs,', 'this endpoint', 'is deprecated.'],
          answer: 'According to the docs, this endpoint is deprecated.',
          explanation: 'Citar la documentación da contexto claro al comunicar un estado técnico.',
        },
        {
          id: 'm8-l12-e4',
          type: 'choice',
          prompt: 'No entendiste lo que dijeron en una call. ¿Qué dices?',
          options: ["Sorry, I didn't catch that.", 'You speak bad.', 'No.', 'I ignore that.'],
          answer: 0,
          explanation:
            "'Sorry, I didn't catch that' es una forma educada de pedir que repitan (m1-l4).",
        },
        {
          id: 'm8-l12-e5',
          type: 'write',
          prompt: "Escríbelo en inglés: 'Déjame confirmar: desplegamos el viernes, ¿verdad?'",
          answer: 'Let me confirm: we deploy on Friday, right?',
          accept: ['Let me confirm: we deploy on Friday, right'],
          hint: "Usa 'Let me confirm: ... , right?'",
          explanation: 'Confirmar el entendimiento evita errores antes de actuar.',
        },
        {
          id: 'm8-l12-e6',
          type: 'builder',
          prompt: "Construye: 'El requisito principal es validar la entrada.'",
          words: ['The main requirement', 'is to validate', 'the input.'],
          answer: 'The main requirement is to validate the input.',
          explanation: 'Identificar el requisito principal ayuda a enfocarte al leer una spec.',
        },
        {
          id: 'm8-l12-e7',
          type: 'shadow',
          prompt: 'Escucha y repite en voz alta, con el mismo ritmo.',
          answer: 'Could you clarify what you mean by that requirement?',
          hint: 'Pedir aclaración precisa.',
          explanation: 'Repetir el chunk completo mejora el ritmo, la pronunciación y la memoria.',
        },
      ],
    },
  ],
}
