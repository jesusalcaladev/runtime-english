import type { Module } from '../../lib/types'
import { type AdvancedSessionSeed, makeAdvancedSession } from './advancedFactory'

const sessions: AdvancedSessionSeed[] = [
  {
    id: 'm11-l1',
    slug: 'presentaciones-de-alto-nivel',
    title: 'Presentaciones de alto nivel',
    step: 'C2 · Paso 11.1',
    cefr: 'C2',
    summary: 'Abre con el resultado, sostén la atención y aterriza tres decisiones clave.',
    objectives: [
      'Anunciar el desenlace antes del detalle.',
      'Usar pausas y marcadores de estructura.',
      'Cerrar con una petición concreta.',
    ],
    pronunciation:
      "I'll begin with the outcome, then walk you through the three decisions that got us there.",
    prerequisite:
      'Requiere dominio de C1 y experiencia resumiendo incidentes o proyectos a audiencias mixtas.',
    technique: {
      name: 'Señala → sustenta → aterriza',
      desc: 'Primero el resultado, después dos o tres pruebas, y al final una petición o next step. Evita la cronología larga.',
    },
    phrases: [
      { en: "I'll begin with the outcome.", es: 'Empezaré por el resultado.' },
      {
        en: 'What matters here is the decision, not the tooling.',
        es: 'Lo importante aquí es la decisión, no la herramienta.',
      },
      { en: 'The ask is simple.', es: 'La petición es sencilla.' },
    ],
    choice: {
      prompt: '¿Cómo abrir una presentación ejecutiva?',
      options: [
        'First, let me walk you through the entire timeline.',
        'We cut incident recovery time in half. Here is how.',
        'This slides deck has thirty sections.',
      ],
      answer: 1,
      explanation: 'El resultado primero gana atención; el detalle llega después.',
    },
    fix: {
      prompt: 'Corrige la frase formal.',
      sentence: 'Despite of the outage, we recovered quickly.',
      answer: 'Despite the outage, we recovered quickly.',
      hint: '"Despite" no lleva "of"; "in spite of" sí.',
      explanation: 'Es un error frecuente incluso en registros avanzados.',
    },
    write: {
      prompt: 'Convierte un incidente en aprendizaje sistémico',
      answer:
        'What initially looked like an isolated incident exposed a systemic gap in our failover strategy.',
      hint: 'Usa "what initially looked like" y cierra con "exposed".',
      explanation: 'La estructura eleva el análisis de anecdota a patrón.',
    },
    speak: {
      prompt: 'Abre una presentación con estructura',
      answer:
        "I'll begin with the outcome, then walk you through the three decisions that got us there.",
      hint: 'Usa "I\'ll begin with..." y después "then walk you through".',
      explanation: 'Marca la estructura y reduce la carga cognitiva de la audiencia.',
    },
  },
  {
    id: 'm11-l2',
    slug: 'desacuerdo-matizado',
    title: 'Desacuerdo matizado',
    step: 'C2 · Paso 11.2',
    cefr: 'C2',
    summary: 'Construye la mejor versión del argumento ajeno antes de proponer una alternativa.',
    objectives: [
      'Reformular la postura contraria con justicia.',
      'Introducir una reserva sin invalidar al interlocutor.',
      'Mantener el desacuerdo en el plano de las ideas.',
    ],
    pronunciation:
      "I'm not convinced this is the right moment, though I fully support the direction.",
    prerequisite:
      'Requiere haber practicado concesiones en C1 y vocabulario de riesgo y madurez operativa.',
    technique: {
      name: 'Steelman antes que contraataque',
      desc: 'Explica la Postura ajena en su versión más fuerte; solo entonces presenta tu objeción con "yet / though / my concern is".',
    },
    phrases: [
      {
        en: 'That argument is compelling in theory.',
        es: 'Ese argumento es convincente en teoría.',
      },
      {
        en: 'My concern is the operational risk at scale.',
        es: 'Mi preocupación es el riesgo operativo a escala.',
      },
      {
        en: 'I am not convinced this is the right moment.',
        es: 'No estoy convencido de que sea el momento adecuado.',
      },
    ],
    choice: {
      prompt: '¿Qué reformula mejor un desacuerdo?',
      options: [
        'Your proposal is naive.',
        'Your proposal makes sense if uptime is the priority; my concern is cost at scale.',
        'I disagree, full stop.',
      ],
      answer: 1,
      explanation: 'Reconoce la lógica ajena y sitúa la objeción en un criterio distinto.',
    },
    fix: {
      prompt: 'Sustituye una crítica personal por una reserva técnica.',
      sentence: 'I disagree because your idea is risky.',
      answer: 'I see the logic in your proposal; my concern is the operational risk at scale.',
      hint: 'Separa la idea de la persona y nombra el riesgo.',
      explanation: 'El desacuerdo se vuelve evaluable en lugar de personal.',
    },
    write: {
      prompt: 'Disiente de un argumento sólido',
      answer:
        'That argument is compelling in theory, yet it assumes a level of observability we do not currently have.',
      hint: 'Usa "compelling in theory, yet..." y una suposición concreta.',
      explanation: 'La concesión precedes a una objeción precisa.',
    },
    speak: {
      prompt: 'Disiente sin cerrar la puerta',
      answer: "I'm not convinced this is the right moment, though I fully support the direction.",
      hint: 'Usa "though I fully support..." para conservar el acuerdo de fondo.',
      explanation: 'Permite disentir del timing sin rechazar la estrategia.',
    },
  },
  {
    id: 'm11-l3',
    slug: 'comunicacion-intercultural',
    title: 'Comunicación intercultural',
    step: 'C2 · Paso 11.3',
    cefr: 'C2',
    summary: 'Haz explícitas las expectativas y confirma la comprensión sin dar nada por supuesto.',
    objectives: [
      'Evitar ambigüedades en equipos distribuidos.',
      'Confirmar expectativas con preguntas concretas.',
      'Ajustar el registro según la cultura conversacional.',
    ],
    pronunciation: "Let me check I've understood your expectations before I commit to a timeline.",
    prerequisite:
      'Requiere haber trabajado con equipos distribuidos y dominar peticiones y disculpas formales.',
    technique: {
      name: 'Normas explícitas, comprobaciones suaves',
      desc: 'Di qué has entendido y qué asumes; después pregunta. Esto reduce fricción cuando el estilo directo o indirecto difiere.',
    },
    phrases: [
      {
        en: 'To avoid any ambiguity, I will confirm in writing.',
        es: 'Para evitar ambigüedad, confirmaré por escrito.',
      },
      {
        en: "Let me check I've understood correctly.",
        es: 'Déjame comprobar que he entendido bien.',
      },
      { en: 'Apologies for the delay in replying.', es: 'Disculpa la demora en responder.' },
    ],
    choice: {
      prompt: '¿Qué reduce mejor la ambigüedad en un equipo global?',
      options: [
        'Assuming everyone read the thread the same way.',
        'Confirming the decision in writing and naming the assumptions.',
        'Waiting for someone else to ask.',
      ],
      answer: 1,
      explanation: 'Hacer explícito lo acordado evita interpretaciones divergentes.',
    },
    fix: {
      prompt: 'Haz más profesional una disculpa por demora.',
      sentence: 'Sorry for the delay, I was in a meeting.',
      answer:
        'Apologies for the delay — I was tied up in a meeting and wanted to give you a considered answer.',
      hint: 'Usa "apologies" y explica por qué querías responder bien.',
      explanation: 'La versión formal explica sin sonar a excusa.',
    },
    write: {
      prompt: 'Confirma un acuerdo sin asumir nada',
      answer:
        "To avoid any ambiguity, I'll confirm the decision in writing and flag the assumptions we agreed on.",
      hint: 'Usa "to avoid any ambiguity" y "flag the assumptions".',
      explanation: 'Es una frase clave para trabajo asíncrono internacional.',
    },
    speak: {
      prompt: 'Comprueba expectativas antes de comprometerte',
      answer: "Let me check I've understood your expectations before I commit to a timeline.",
      hint: 'Usa "let me check" y "before I commit".',
      explanation: 'Muestra cautela y respeto sin sonar evasivo.',
    },
  },
  {
    id: 'm11-l4',
    slug: 'postmortems-y-crisis',
    title: 'Postmortems y crisis',
    step: 'C2 · Paso 11.4',
    cefr: 'C2',
    summary: 'Narra un incidente con precisión, sin buscar culpables y con acciones verificables.',
    objectives: [
      'Separar cronología de interpretación.',
      'Nombrar causas sistémicas sin señalar personas.',
      'Cerrar con acciones y responsables.',
    ],
    pronunciation:
      'We contained the impact in twelve minutes, and the follow-up actions are already tracked.',
    prerequisite:
      'Requiere manejo de incidencias, métricas y lenguaje de causa raíz de niveles B2/C1.',
    technique: {
      name: 'Cronología, no culpa',
      desc: 'Describe qué ocurrió y qué señales existieron; después analiza condiciones y barreras. Evita nombres propios en el análisis de causas.',
    },
    phrases: [
      {
        en: 'We contained the impact in twelve minutes.',
        es: 'Contuvimos el impacto en doce minutos.',
      },
      {
        en: 'The change bypassed the staging checks.',
        es: 'El cambio evitó las comprobaciones de staging.',
      },
      {
        en: 'Follow-up actions are already tracked.',
        es: 'Las acciones de seguimiento ya están registradas.',
      },
    ],
    choice: {
      prompt: '¿Qué pertenece a un postmortem sin culpa?',
      options: [
        'Who typed the wrong command.',
        'Which condition allowed the change to reach production unnoticed.',
        'Which team was slower to respond.',
      ],
      answer: 1,
      explanation: 'El foco está en el sistema y sus barreras, no en la persona.',
    },
    fix: {
      prompt: 'Elimina el lenguaje de culpa.',
      sentence: 'The bug was caused by John.',
      answer: 'The regression was introduced by a change that bypassed the staging checks.',
      hint: 'Sustituye la persona por el cambio y el mecanismo.',
      explanation: 'Permite analizar el fallo sin defensividad.',
    },
    write: {
      prompt: 'Replantea el análisis sin atribuir culpa',
      answer:
        'Rather than attributing fault, we focused on the conditions that allowed the change to reach production unnoticed.',
      hint: 'Usa "rather than" y "the conditions that allowed".',
      explanation: 'Es el registro estándar de un postmortem maduro.',
    },
    speak: {
      prompt: 'Cierra un incidente en voz alta',
      answer:
        'We contained the impact in twelve minutes, and the follow-up actions are already tracked.',
      hint: 'Da el tiempo de contención y el estado de las acciones.',
      explanation: 'Transmite control y cierra la narrativa.',
    },
  },
  {
    id: 'm11-l5',
    slug: 'escritura-ejecutiva',
    title: 'Escritura ejecutiva',
    step: 'C2 · Paso 11.5',
    cefr: 'C2',
    summary: 'Escribe con la conclusión primero y elimina relleno sin perder matices importantes.',
    objectives: [
      'Aplicar BLUF a un correo o propuesta.',
      'Recortar fórmulas vacías.',
      'Mantener la recomendación visible al final.',
    ],
    pronunciation:
      "The ask is simple: approve the pilot, and we'll report back in two weeks with data.",
    prerequisite: 'Requiere haber escrito RFCs en C1 y saber sintetizar decisiones.',
    technique: {
      name: 'BLUF: conclusión primero',
      desc: 'Escribe la recomendación en la primera frase; después los motivos y los riesgos. El lector no debería tener que buscar la petición.',
    },
    phrases: [
      { en: 'We recommend a phased rollout.', es: 'Recomendamos un despliegue por fases.' },
      { en: 'The ask is simple.', es: 'La petición es sencilla.' },
      {
        en: 'I would be happy to walk you through the details.',
        es: 'Encantado de repasar los detalles contigo.',
      },
    ],
    choice: {
      prompt: '¿Qué apertura es más ejecutiva?',
      options: [
        'After careful consideration of the various options available to us...',
        'We recommend a phased rollout. The rationale is below.',
        'I hope this message finds you well.',
      ],
      answer: 1,
      explanation: 'La recomendación va primero y el resto del texto la sostiene.',
    },
    fix: {
      prompt: 'Elimina relleno de una decisión.',
      sentence: 'After careful consideration of the various options we have decided.',
      answer: 'We have decided to proceed with option B after reviewing the alternatives.',
      hint: 'Pon la decisión en la primera parte de la frase.',
      explanation: 'El lector obtiene la conclusión sin esperar al final.',
    },
    write: {
      prompt: 'Recomienda un despliegue por fases',
      answer:
        'We recommend a phased rollout: it limits exposure, preserves optionality and gives us measurable checkpoints.',
      hint: 'Usa dos puntos y tres razones separadas por comas.',
      explanation: 'Compacto, argumentado y fácil de aprobar.',
    },
    speak: {
      prompt: 'Formula una petición ejecutiva',
      answer: "The ask is simple: approve the pilot, and we'll report back in two weeks with data.",
      hint: 'Usa "the ask is simple" y un plazo concreto.',
      explanation: 'Hace explícito qué se espera del interlocutor.',
    },
  },
  {
    id: 'm11-l6',
    slug: 'registro-idiomatico-y-slang-avanzado',
    title: 'Registro idiomático y slang avanzado',
    step: 'C2 · Paso 11.6',
    cefr: 'C2',
    summary: 'Elige el registro adecuado: idiomático sin forzado, directo sin brusco.',
    objectives: [
      'Distinguir lenguaje natural de modismos forzados.',
      'Usar expresiones idiomáticas con contexto.',
      'Alternar entre registro formal y de equipo.',
    ],
    pronunciation:
      'That fix is a bit of a band-aid; we should get to the root cause before the next release.',
    prerequisite:
      'Requiere dominio de registros C1 y familiaridad con slang técnico de niveles anteriores.',
    technique: {
      name: 'Registro con intención',
      desc: 'Un modismo solo aporta si encaja con la relación y el canal. En un postmortem, prefiere precisión; en una retro, un modismo breve puede humanizar el mensaje.',
    },
    phrases: [
      { en: "That's a bit of a band-aid.", es: 'Eso es un parche temporal.' },
      { en: 'Let us nip this in the bud.', es: 'Atajémoslo de raíz.' },
      {
        en: 'Let us revisit this after the metrics are in.',
        es: 'Volvamos a esto cuando tengamos métricas.',
      },
    ],
    choice: {
      prompt: '¿Dónde encaja mejor un modismo técnico?',
      options: [
        'En un informe de incidente para dirección.',
        'En una retro del equipo con confianza alta.',
        'En un contrato con un cliente nuevo.',
      ],
      answer: 1,
      explanation: 'El registro idiomático depende de la relación y del canal.',
    },
    fix: {
      prompt: 'Sustituye un modismo forzado por una frase natural.',
      sentence: "Let's circle back on this later maybe.",
      answer: 'Let us revisit this after the metrics are in.',
      hint: 'Usa "revisit" y una condición temporal concreta.',
      explanation: 'Suena profesional sin perder naturalidad.',
    },
    write: {
      prompt: 'Usa un modismo con intención en una retro',
      answer:
        'In the retro we agreed to nip risky shortcuts in the bud, without slowing the team down.',
      hint: 'Incluye "in the retro" para justificar el registro.',
      explanation: 'El contexto legitima la expresión idiomática.',
    },
    speak: {
      prompt: 'Señala una solución parche en voz alta',
      answer:
        'That fix is a bit of a band-aid; we should get to the root cause before the next release.',
      hint: 'Usa "band-aid" y después "root cause".',
      explanation: 'Combina lenguaje de equipo con precisión técnica.',
    },
  },
]

export const m11: Module = {
  id: 'm11',
  code: 'MOD 11',
  level: 'C1-C2',
  title: 'Maestría y liderazgo técnico',
  shortTitle: 'Maestría C2',
  description:
    'Presentaciones ejecutivas, desacuerdo de alto nivel, comunicación intercultural, postmortems y registro idiomático con precisión C2.',
  sessions: sessions.map(makeAdvancedSession),
}
