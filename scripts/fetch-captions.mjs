/**
 * Descarga los subtítulos completos de un video de YouTube y genera un módulo TS
 * con los cues exactos (texto + marcas de tiempo reales).
 *
 * Uso: npm run captions:fetch -- <youtubeId> [nombreArchivo]
 *
 * La librería se usa solo en tiempo de autoría: el bundle de la app no la incluye.
 * Los archivos generados se versionan para que la app funcione sin depender de YouTube.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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

// YouTube publica la pista en inglés como `en`, `en-US` o `en-GB` según el canal.
let lines = []
let captionLang = null
for (const lang of ['en', 'en-US', 'en-GB', 'en-orig']) {
  try {
    lines = await YoutubeTranscript.fetchTranscript(videoId, { lang })
    if (lines.length) {
      captionLang = lang
      break
    }
  } catch {
    //Probamos la siguiente variante.
  }
}
if (!lines.length) throw new Error('El video no tiene subtítulos en inglés')
console.log(`Subtítulos: ${captionLang} · ${lines.length} líneas`)

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

/**
 * Tiempo exacto por palabra: los captions manuales de YouTube solo traen tiempos
 * por línea, pero la pista automática (`en-orig`, json3) incluye `tOffsetMs`
 * por palabra. La alineamos con nuestras líneas por tiempo. Requiere yt-dlp;
 * si no está disponible, el reproductor reparte el tiempo proporcionalmente.
 */
function addWordTimings(lines) {
  let dir
  try {
    dir = mkdtempSync(join(tmpdir(), 'runtimeenglish-asr-'))
    execFileSync(
      'yt-dlp',
      [
        '--skip-download',
        '--write-auto-subs',
        '--sub-langs',
        'en-orig',
        '--sub-format',
        'json3',
        '-o',
        join(dir, '%(id)s.%(ext)s'),
        watchUrl,
      ],
      { stdio: 'ignore', timeout: 120000 },
    )
    const path = join(dir, `${videoId}.en-orig.json3`)
    if (!existsSync(path)) return lines
    const data = JSON.parse(readFileSync(path, 'utf8'))
    const spoken = []
    for (const event of data.events ?? []) {
      for (const seg of event.segs ?? []) {
        const text = (seg.utf8 ?? '').trim()
        if (!text) continue
        spoken.push({ start: (event.tStartMs + (seg.tOffsetMs ?? 0)) / 1000 })
      }
    }
    spoken.sort((a, b) => a.start - b.start)
    if (!spoken.length) return lines

    let aligned = 0
    const withWords = lines.map((cue) => {
      const captionWords = cue.en.split(/\s+/).filter(Boolean)
      const inCue = spoken.filter(
        (word) => word.start >= cue.start - 0.25 && word.start < cue.end + 0.1,
      )
      if (!captionWords.length || !inCue.length) return cue

      let words
      if (inCue.length === captionWords.length) {
        words = inCue.map((word, index) => {
          const from = Math.max(cue.start, word.start)
          const to =
            index + 1 < inCue.length ? Math.max(from + 0.02, inCue[index + 1].start) : cue.end
          return { t: round(from - cue.start), d: round(Math.max(0.02, to - from)) }
        })
      } else {
        const from = Math.max(cue.start, inCue[0].start)
        const last = inCue[inCue.length - 1]
        const to = Math.min(cue.end, Math.max(from + 0.1, last.start + 0.25))
        const step = (to - from) / captionWords.length
        words = captionWords.map((_, index) => ({
          t: round(index * step + (from - cue.start)),
          d: round(step),
        }))
      }
      aligned += 1
      return { ...cue, words }
    })
    console.log(`Tiempos por palabra: ${aligned}/${lines.length} líneas`)
    return withWords
  } catch {
    console.warn('No se pudieron obtener tiempos por palabra (yt-dlp no disponible).')
    return lines
  } finally {
    if (dir) rmSync(dir, { recursive: true, force: true })
  }
}

const cuesWithWords = addWordTimings(cues)

const outputDir = join(process.cwd(), 'src', 'data', 'videoTranscripts')
mkdirSync(outputDir, { recursive: true })
const outputPath = join(outputDir, `${fileName}.ts`)

const content = `import type { VideoCue } from '../learningResources'\n
/** Subtítulos originales de YouTube. Generado con \`npm run captions:fetch\`. */
export const durationSeconds = ${durationSeconds ?? 'null'}

export const cues: VideoCue[] = ${JSON.stringify(cuesWithWords, null, 2)}
`
writeFileSync(outputPath, content)

console.log(`OK: ${cues.length} cues → ${outputPath}`)
console.log(`PRIMERO: ${cues[0].start}s · ${cues[0].en}`)
console.log(`ÚLTIMO: ${cues[cues.length - 1].end}s · ${cues[cues.length - 1].en}`)
