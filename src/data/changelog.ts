/**
 * Release notes shown to users in the "Novedades" modal.
 *
 * The first entry is the current app version. When you publish a release, add a
 * new entry at the top and keep `version` aligned with `package.json` and the
 * Android `versionName` (see RELEASING.md).
 */
export type ChangeKind = 'feature' | 'improvement' | 'fix'

export interface ChangelogEntry {
  kind: ChangeKind
  text: string
}

export interface ChangelogRelease {
  version: string
  title: string
  date?: string
  entries: ChangelogEntry[]
}

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.2.9',
    title: 'Conversaciones con contexto y voz siempre lista',
    entries: [
      {
        kind: 'improvement',
        text: 'Los diálogos son ahora escenas reales: ves dónde ocurren y qué se quiere lograr, y las frases siguen un hilo lógico en vez de ser ejemplos sueltos.',
      },
      {
        kind: 'improvement',
        text: 'La voz de las próximas líneas se prepara en segundo plano para que las conversaciones fluyan sin pausas con Google, Kokoro, Piper o la voz del sistema.',
      },
      {
        kind: 'fix',
        text: 'Micrófono más fiable en Android: si el reconocimiento directo falla, se abre el cuadro de voz del sistema, con errores claros y acceso a ajustes.',
      },
      {
        kind: 'feature',
        text: 'Los ejercicios de diálogo ramificado muestran la escena antes de elegir la respuesta.',
      },
    ],
  },
  {
    version: '1.2.8',
    title: 'Voces que funcionan y más videos',
    entries: [
      {
        kind: 'feature',
        text: 'Voz online gratuita e instantánea: si tu navegador no tiene voces (Brave), Piper falla o Kokoro tarda, la app usa Google automáticamente.',
      },
      {
        kind: 'feature',
        text: 'Tres videos nuevos: gestión del tiempo, comunicación clara y correos profesionales, con traducción por frase y resaltado palabra por palabra.',
      },
      {
        kind: 'improvement',
        text: 'La mascota cambia de frase más despacio para una experiencia más tranquila.',
      },
    ],
  },
  {
    version: '1.2.7',
    title: 'Release firmado',
    entries: [
      {
        kind: 'improvement',
        text: 'APK de release firmado con la misma identidad de la app para poder seguir recibiendo actualizaciones.',
      },
      {
        kind: 'improvement',
        text: 'Incluye todas las mejoras de VideoLab y voz de la versión 1.2.6.',
      },
    ],
  },
  {
    version: '1.2.6',
    title: 'VideoLab aún más claro y preciso',
    entries: [
      {
        kind: 'feature',
        text: 'Cinco videos nuevos de internet, la web, algoritmos, presentaciones y hábitos de sueño, con subtítulos y ejercicios.',
      },
      {
        kind: 'feature',
        text: 'Traducción española de cada frase y resaltado de la palabra exacta que se está diciendo, con tiempos reales de YouTube.',
      },
      {
        kind: 'feature',
        text: 'Reproductor propio sin controles de YouTube, pantalla completa a pantalla llena, escucha activa y práctica de huecos por línea.',
      },
      {
        kind: 'improvement',
        text: 'Biblioteca con búsqueda, filtros por nivel, estadísticas y reanudación; resultados del quiz guardados y sincronizados.',
      },
      {
        kind: 'improvement',
        text: 'Estudio de voz unificado con Piper, ajustes de tono y voz, y sesiones más ligeras y consistentes.',
      },
    ],
  },
  {
    version: '1.2.5',
    title: 'Aprende con videos y práctica a tu medida',
    entries: [
      {
        kind: 'feature',
        text: 'VideoLab profesional: biblioteca de videos con miniaturas, subtítulos completos sincronizados, búsqueda, shadowing por línea y comprensión.',
      },
      {
        kind: 'feature',
        text: 'Nuevos ejercicios de emparejamiento, respuesta múltiple, shadowing y diálogos en los que tus respuestas cambian la conversación.',
      },
      {
        kind: 'feature',
        text: 'Test de nivel inicial que recomienda tu primera sesión y configura tu plan de estudio.',
      },
      {
        kind: 'improvement',
        text: 'Repasos rápidos adaptados a tus errores y guardado de frases de los videos en tu diccionario con repetición espaciada.',
      },
      {
        kind: 'improvement',
        text: 'Más de 60 phrasal verbs de uso real y ejercicios de habla en todas las sesiones.',
      },
    ],
  },
  {
    version: '1.2.4',
    title: 'Conversaciones y voces más naturales',
    entries: [
      {
        kind: 'feature',
        text: 'Diálogos tipo Duolingo en las sesiones principales: dos personajes, reproduce la escena completa o repite cada línea.',
      },
      {
        kind: 'improvement',
        text: 'Practica pronunciación con el micrófono y responde preguntas de comprensión después de cada conversación.',
      },
      {
        kind: 'improvement',
        text: 'Cada personaje tiene una voz distinta y las voces se preparan desde el inicio para sonar al instante.',
      },
      {
        kind: 'improvement',
        text: 'Ajuste de “Permisos” visible solo en Android.',
      },
    ],
  },
  {
    version: '1.2.3',
    title: 'Encuentra y practica más rápido',
    entries: [
      {
        kind: 'feature',
        text: 'Búsqueda global de sesiones, bloques, ejercicios y slang.',
      },
      {
        kind: 'feature',
        text: 'Práctica rápida con rondas mixtas: repaso, contenidos nuevos o todo junto.',
      },
      {
        kind: 'improvement',
        text: 'Insights básicos en el inicio: precisión e intentos de un vistazo.',
      },
    ],
  },
  {
    version: '1.2.2',
    title: 'Tus propias lecciones',
    entries: [
      {
        kind: 'feature',
        text: 'Crea lecciones personalizadas con IA desde “Mis lecciones”: pega el JSON, valídalo y practícalo.',
      },
      {
        kind: 'improvement',
        text: 'Prompt optimizado y validación de los ejercicios importados.',
      },
    ],
  },
  {
    version: '1.2.1',
    title: 'Aprende con videos reales',
    entries: [
      {
        kind: 'feature',
        text: 'VideoLab: videos de YouTube con transcripciones adaptadas y sincronizadas.',
      },
      {
        kind: 'feature',
        text: 'Directorio de recursos externos filtrables y con búsqueda.',
      },
    ],
  },
]

/** Current version = newest changelog entry. Keep in sync with package.json. */
export const CURRENT_APP_VERSION = CHANGELOG[0]?.version ?? '0.0.0'
