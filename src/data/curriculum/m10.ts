import type { Module } from '../../lib/types'
import { type AdvancedSessionSeed, makeAdvancedSession } from './advancedFactory'

const sessions: AdvancedSessionSeed[] = [
  {
    id: 'm10-l1',
    slug: 'debatir-arquitectura-con-matices',
    title: 'Debates de arquitectura con matices',
    step: 'C1 · Paso 10.1',
    cefr: 'C1',
    summary: 'Defiende una decisión técnica sin cerrarte: concede, matiza y aporta evidencia.',
    objectives: [
      'Matizar un desacuerdo sin sonar brusco.',
      'Usar concesiones y evidencia en un debate técnico.',
      'Explicar trade-offs con precisión y seguridad.',
    ],
    pronunciation:
      'I take your point about performance, but we should weigh it against maintainability.',
    prerequisite:
      'Requiere vocabulario de arquitectura y experiencia describiendo decisiones técnicas.',
    technique: {
      name: 'Concesión → matiz → evidencia',
      desc: 'Reconoce el mérito de la idea contraria, introduce tu reserva con "but / however / while" y cierra con un dato o criterio concreto.',
    },
    phrases: [
      {
        en: 'I see the appeal, but the migration cost is real.',
        es: 'Veo el atractivo, pero el coste de migración es real.',
      },
      {
        en: 'That holds until we hit real traffic.',
        es: 'Eso se sostiene hasta que recibimos tráfico real.',
      },
      {
        en: 'The trade-off is clarity versus raw speed.',
        es: 'El compromiso es claridad frente a velocidad bruta.',
      },
    ],
    choice: {
      prompt: '¿Cómo matizas un desacuerdo de forma profesional?',
      options: [
        'That idea is wrong and will not work.',
        'I see the reasoning, though I would weigh the operational cost more heavily.',
        'Whatever you think is fine.',
      ],
      answer: 1,
      explanation:
        '"Though I would weigh..." reconoce la idea y añade una reserva concreta sin imponer.',
    },
    fix: {
      prompt: 'Corrige la frase para que el contraste sea gramatical.',
      sentence: 'While I agree the newer stack is appealing, but the migration cost is high.',
      answer: 'While I agree the newer stack is appealing, the migration cost is high.',
      hint: 'Con "while" no hace falta "but": una sola conjunción de contraste.',
      explanation: 'Duplicar la conjunción rompe la estructura subordinada.',
    },
    write: {
      prompt: 'Argumenta a favor de event sourcing con un matiz',
      answer:
        'While event sourcing would improve auditability, the operational overhead may outweigh the benefits at our current scale.',
      hint: 'Empieza con while y termina con un criterio de escala.',
      explanation: 'La estructura concesiva suena razonada y evita una postura absoluta.',
    },
    speak: {
      prompt: 'Defiende una decisión técnica matizada',
      answer:
        'I take your point about performance, but we should weigh it against maintainability before committing.',
      hint: 'Usa "I take your point" y después "but we should...".',
      explanation: 'Es un patrón natural para disentir sin bloquear la conversación.',
    },
  },
  {
    id: 'm10-l2',
    slug: 'negociar-scope-y-plazos',
    title: 'Negociar scope y plazos',
    step: 'C1 · Paso 10.2',
    cefr: 'C1',
    summary: 'Replantea una fecha sin perder credibilidad ni cerrar la puerta a alternativas.',
    objectives: [
      'Condicionar un acuerdo sin sonar rígido.',
      'Reencuadrar una petición en términos de alcance.',
      'Proponer alternativas con consecuencias explícitas.',
    ],
    pronunciation: 'I can move the date, provided we freeze the scope today.',
    prerequisite:
      'Requiere vocabulario de planificación y haber practicado peticiones claras en niveles anteriores.',
    technique: {
      name: 'Cede poco, reencuadra mucho',
      desc: 'En lugar de decir "no", ofrece una condición: "I can..., provided that..." y explica el coste de cada opción.',
    },
    phrases: [
      {
        en: 'I can move the date, provided we freeze the scope.',
        es: 'Puedo mover la fecha, siempre que cerremos el alcance.',
      },
      {
        en: 'If we keep that requirement, the timeline slips by a week.',
        es: 'Si mantenemos ese requisito, el plazo se retrasa una semana.',
      },
      { en: 'Let me offer you two trade-offs.', es: 'Déjame ofrecerte dos compensaciones.' },
    ],
    choice: {
      prompt: '¿Qué respuesta negocia mejor un plazo?',
      options: [
        'No, that deadline is impossible.',
        'I can commit to Friday if we drop the export feature for this release.',
        'Maybe, we will see.',
      ],
      answer: 1,
      explanation:
        'Acepta el objetivo y pone una condición explícita: es una negociación, no un bloqueo.',
    },
    fix: {
      prompt: 'Corrige la preposición de tiempo.',
      sentence: 'We can deliver the reporting module until Friday if the data is ready.',
      answer: 'We can deliver the reporting module by Friday if the data is ready.',
      hint: 'Para una fecha límite se usa "by", no "until".',
      explanation: '"By Friday" significa "a más tardar el viernes".',
    },
    write: {
      prompt: 'Propón un recorte de alcance con condición',
      answer:
        'If we cut the reporting module, we can ship the core flow by the agreed date without compromising quality.',
      hint: 'Usa if + bundle condicional y cierra con "without compromising...".',
      explanation: 'Presenta la alternativa como una decisión, no como una excusa.',
    },
    speak: {
      prompt: 'Acepta un cambio con una condición clara',
      answer: 'I can move the date, provided we freeze the scope today and keep the review short.',
      hint: 'Usa "provided we..." para marcar la condición.',
      explanation: 'Es unaformula profesional y muy útil en negociación.',
    },
  },
  {
    id: 'm10-l3',
    slug: 'rfc-que-convence',
    title: 'RFCs que convencen',
    step: 'C1 · Paso 10.3',
    cefr: 'C1',
    summary:
      'Escribe un documento de decisión que explique el problema, las opciones y la recomendación.',
    objectives: [
      'Separar problema, opciones y recomendación.',
      'Justificar una recomendación con datos.',
      'Anticipar objeciones del lector.',
    ],
    pronunciation:
      'The recommendation is to adopt option B, mainly because it keeps the rollback path simple.',
    prerequisite:
      'Requiere haber leído documentación técnica extensa y escribir propuestas breves.',
    technique: {
      name: 'Problema → opciones → recomendación',
      desc: 'No empieces por la solución: describe el problema, compara dos alternativas y cierra con una recomendación y sus riesgos.',
    },
    phrases: [
      {
        en: 'The key constraint is operational, not technical.',
        es: 'La restricción clave es operativa, no técnica.',
      },
      {
        en: 'Option B is preferable because it keeps rollback simple.',
        es: 'La opción B es preferible porque mantiene simple la reversión.',
      },
      {
        en: 'This recommendation assumes we keep the current deploy process.',
        es: 'Esta recomendación asume que mantenemos el proceso de despliegue actual.',
      },
    ],
    choice: {
      prompt: '¿Qué hace convincente una recomendación en un RFC?',
      options: [
        'It uses the most popular technology.',
        'It compares options against explicit constraints and states the risks.',
        'It is the longest document in the thread.',
      ],
      answer: 1,
      explanation: 'La comparación con criterios y riesgos explícitos es lo que permite decidir.',
    },
    fix: {
      prompt: 'Sustituye una afirmación vaga por evidencia.',
      sentence: 'This approach is better because it is more modern.',
      answer: 'This approach is preferable because it reduces p95 latency by roughly 30%.',
      hint: 'Sustituye "more modern" por una métrica observable.',
      explanation: 'Una métrica hace que la recomendación sea verificable.',
    },
    write: {
      prompt: 'Justifica una recomendación con una objeción',
      answer:
        'Although the initial setup is heavier, the long-term maintenance cost is lower and the migration path is incremental.',
      hint: 'Usa although y dos razones concretas.',
      explanation: 'Admitir el coste inicial aumenta la credibilidad de la recomendación.',
    },
    speak: {
      prompt: 'Presenta una recomendación en voz alta',
      answer:
        'The recommendation is to adopt option B, mainly because it keeps the rollback path simple.',
      hint: 'Empieza con "The recommendation is..." y da una razón.',
      explanation: '_BLUF_: primero la conclusión, después el detalle.',
    },
  },
  {
    id: 'm10-l4',
    slug: 'liderazgo-en-code-review',
    title: 'Liderazgo en code review',
    step: 'C1 · Paso 10.4',
    cefr: 'C1',
    summary: 'Da feedback técnico preciso sin desanimar a quien escribió el código.',
    objectives: [
      'Formular observaciones como preguntas.',
      'Diferenciar preferencia de bloqueo.',
      'Cerrar una revisión con reconocimiento y next steps.',
    ],
    pronunciation: 'This reads well overall; I just have one question about the error path.',
    prerequisite:
      'Requiere experiencia en revisiones de código y vocabulario de calidad y errores.',
    technique: {
      name: 'Pregunta antes que afirmación',
      desc: 'Una pregunta abierta invita a explicar la decisión; una orden directa suele generar defensividad. Reserva "must" para bloqueos reales.',
    },
    phrases: [
      {
        en: 'Could we consider a more descriptive name here?',
        es: '¿Podríamos considerar un nombre más descriptivo aquí?',
      },
      { en: 'This is a suggestion, not a blocker.', es: 'Esto es una sugerencia, no un bloqueo.' },
      {
        en: 'Once this is addressed, I am happy to approve.',
        es: 'Una vez resuelto, puedo aprobar sin problema.',
      },
    ],
    choice: {
      prompt: '¿Cómo marcas un comentario como no bloqueante?',
      options: [
        'Fix this before merging, obviously.',
        'This is a suggestion, not a blocker — feel free to push back.',
        'I do not like it.',
      ],
      answer: 1,
      explanation: 'Hacer explícito el nivel de prioridad evita malentendidos.',
    },
    fix: {
      prompt: 'Suaviza una orden en feedback',
      sentence: 'You should rename this variable because it is wrong.',
      answer: 'Could we consider a more descriptive name for this variable?',
      hint: 'Convierte la orden en una pregunta con "could we".',
      explanation: 'La pregunta mantiene el estándar y respeta la autonomía.',
    },
    write: {
      prompt: 'Pide extraer una helper con tacto',
      answer:
        'Have we considered extracting this helper so the intent is clearer to the next reader?',
      hint: 'Empieza con "Have we considered..." y da una razón de legibilidad.',
      explanation: 'Centra el comentario en el lector futuro, no en el autor.',
    },
    speak: {
      prompt: 'Abre una revisión con tono constructivo',
      answer: 'This reads well overall; I just have one question about the error path.',
      hint: 'Reconoce el trabajo antes de señalar un punto.',
      explanation: 'El reconocimiento inicial baja la defensividad.',
    },
  },
  {
    id: 'm10-l5',
    slug: 'stakeholders-y-traduccion-tecnica',
    title: 'Stakeholders y traducción técnica',
    step: 'C1 · Paso 10.5',
    cefr: 'C1',
    summary: 'Convierte detalles de infraestructura en impacto de negocio sin perder precisión.',
    objectives: [
      'Empezar por el impacto, no por el mecanismo.',
      'Usar métricas que entienda un público no técnico.',
      'Evitar jerga innecesaria sin simplificar en exceso.',
    ],
    pronunciation: 'In business terms, this change reduces drop-off during peak traffic.',
    prerequisite:
      'Requiere métricas de rendimiento y vocabulario de producto y experiencia de usuario.',
    technique: {
      name: 'Impacto primero, mecanismo después',
      desc: 'Empieza con qué cambia para el usuario o el negocio; añade el detalle técnico solo si alguien lo pide.',
    },
    phrases: [
      { en: 'The short version: checkout is faster.', es: 'En resumen: el pago es más rápido.' },
      {
        en: 'In business terms, this reduces drop-off.',
        es: 'En términos de negocio, reduce el abandono.',
      },
      {
        en: 'Under the hood, we changed the cache strategy.',
        es: 'Por debajo, cambiamos la estrategia de caché.',
      },
    ],
    choice: {
      prompt: '¿Qué versión funciona mejor para un stakeholder no técnico?',
      options: [
        'We sharded the primary database and tuned the connection pool.',
        'Checkout is now about 30% faster at peak times.',
        'The p95 histogram improved after a config change.',
      ],
      answer: 1,
      explanation: 'Traduce la mejora a experiencia de usuario y usa una cifra comprensible.',
    },
    fix: {
      prompt: 'Corrige la estructura de la frase.',
      sentence: 'We migrated the database that latency improved.',
      answer: 'We migrated the database, which improved latency.',
      hint: 'Usa "which" con coma para añadir la consecuencia.',
      explanation: '"That" no funciona aquí como conector de resultado.',
    },
    write: {
      prompt: 'Explica una migración en términos de negocio',
      answer:
        'The migration cut p95 latency by 30%, which means checkout feels instant for most customers.',
      hint: 'Da la métrica y después su consecuencia con "which means".',
      explanation: 'Conecta datos técnicos con experiencia real.',
    },
    speak: {
      prompt: 'Resume el impacto para dirección',
      answer: 'In business terms, this change reduces drop-off during peak traffic.',
      hint: 'Usa "In business terms" para señalar el cambio de registro.',
      explanation: 'Es una frase puente muy útil en presentaciones.',
    },
  },
  {
    id: 'm10-l6',
    slug: 'mentoria-tecnica-avanzada',
    title: 'Mentoría técnica avanzada',
    step: 'C1 · Paso 10.6',
    cefr: 'C1',
    summary: 'Acompaña el razonamiento de otra persona en vez de darle la respuesta.',
    objectives: [
      'Hacer preguntas que guíen el análisis.',
      'Nombrar supuestos sin imponer una solución.',
      'Cerrar con autonomía para quien aprende.',
    ],
    pronunciation: 'What would happen if the queue were temporarily unavailable?',
    prerequisite:
      'Requiere vocabulario de debugging y haber practicado explicaciones técnicas claras.',
    technique: {
      name: 'Guía, no dictes',
      desc: 'Sustituye la respuesta por una pregunta sobre supuestos, límites o consecuencias. El objetivo es que la otra persona llegue al razonamiento.',
    },
    phrases: [
      { en: "Let's look at the edge case together.", es: 'Veamos juntos el caso límite.' },
      { en: 'What assumptions does this test make?', es: '¿Qué supuestos hace esta prueba?' },
      {
        en: "I'd rather ask you than give you the answer.",
        es: 'Prefiero preguntarte que darte la respuesta.',
      },
    ],
    choice: {
      prompt: '¿Cuál es una intervención de mentoría?',
      options: [
        'Just copy this snippet and move on.',
        'What would happen if the queue were temporarily unavailable?',
        'This is the third time you made that mistake.',
      ],
      answer: 1,
      explanation: 'La pregunta abre una exploración en lugar de cerrar la conversación.',
    },
    fix: {
      prompt: 'Reformula una crítica como invitación a explorar.',
      sentence: 'You did it wrong, do it like this.',
      answer: "Let's look at the edge case together and see what you would change.",
      hint: 'Usa "let\'s" y una pregunta abierta.',
      explanation: 'La colaboración mantiene la motivación y mejora el aprendizaje.',
    },
    write: {
      prompt: 'Guía a alguien sin dar la respuesta',
      answer:
        "Rather than giving you the answer, I'd ask what assumptions this test makes about empty input.",
      hint: 'Usa "rather than" y una pregunta indirecta.',
      explanation: 'Es un patrón de mentoría respetuoso y muy preciso.',
    },
    speak: {
      prompt: 'Haz una pregunta de mentoría en voz alta',
      answer: 'What would happen if the queue were temporarily unavailable?',
      hint: 'Usa un condicional con "would" para explorar un escenario.',
      explanation: 'El condicional invita a razonar sin juzgar.',
    },
  },
]

export const m10: Module = {
  id: 'm10',
  code: 'MOD 10',
  level: 'C1-C2',
  title: 'Comunicación profesional avanzada',
  shortTitle: 'Dominio C1',
  description:
    'Debate técnico, negociación, documentación persuasiva y liderazgo en revisiones con un registro C1 preciso y matizado.',
  sessions: sessions.map(makeAdvancedSession),
}
