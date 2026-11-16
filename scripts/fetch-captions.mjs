/**
 * Descarga los subtítulos completos de un video de YouTube y genera un módulo TS
 * con los cues exactos (texto + marcas de tiempo reales).
 *
 * Uso: npm run captions:fetch -- <youtubeId> [nombreArchivo]
 *
 * La librería se usa solo en tiempo de autoría: el bundle de la app no la incluye.
 * Los archivos generados se versionan para que la app funcione sin depender de YouTube.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { YoutubeTranscript } from 'youtube-transcript'

const videoId = process.argv[2]
const fileName = process.argv[3] ?? videoId

if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
  console.error('Uso: npm run captions:fetch -- <youtubeId> [nombreArchivo]')
  process.exit(1)
}

const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
const headers = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

let durationSeconds
try {
  const html = await fetch(watchUrl, { headers }).then((response) => response.text())
  const match = html.match(/"lengthSeconds":"(\d+)"/)
  if (match) durationSeconds = Number(match[1])
} catch (error) {
  console.warn('No se pudo leer la duración del video:', error.message)
}

const lines = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
if (!lines.length) throw new Error('El video no tiene subtítulos en inglés')

const round = (value) => Math.round(value * 100) / 100
const normalize = (text) => text.replace(/\s+/g, ' ').trim()

const cues = lines
  .map((line) => ({
    start: round(line.offset / 1000),
    end: round((line.offset + line.duration) / 1000),
    en: normalize(line.text),
  }))
  .filter((cue) => cue.en.length > 0)
  .sort((a, b) => a.start - b.start)

// Algunos captions se solapan unos milisegundos; recortamos el anterior.
for (let i = 0; i < cues.length - 1; i += 1) {
  if (cues[i].end > cues[i + 1].start) cues[i].end = cues[i + 1].start
}

const outputDir = join(process.cwd(), 'src', 'data', 'videoTranscripts')
mkdirSync(outputDir, { recursive: true })
const outputPath = join(outputDir, `${fileName}.ts`)

const content = `import type { VideoCue } from '../learningResources'\n
/** Subtítulos originales de YouTube. Generado con \`npm run captions:fetch\`. */
export const durationSeconds = ${durationSeconds ?? 'null'}

export const cues: VideoCue[] = ${JSON.stringify(cues, null, 2)}
`
writeFileSync(outputPath, content)

console.log(`OK: ${cues.length} cues → ${outputPath}`)
console.log(`PRIMERO: ${cues[0].start}s · ${cues[0].en}`)
console.log(`ÚLTIMO: ${cues[cues.length - 1].end}s · ${cues[cues.length - 1].en}`)
