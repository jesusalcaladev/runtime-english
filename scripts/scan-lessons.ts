/**
 * Escáner de lecciones: imprime un informe de conectividad, integridad y
 * calidad del currículo. Ejecutar con `npm run scan:lessons`.
 */
import { type ScanIssue, scanCurriculum } from '../src/data/curriculum/scanner'

const report = scanCurriculum()
const { stats, issues } = report

const counts = (severity: ScanIssue['severity']) =>
  issues.filter((issue) => issue.severity === severity).length

console.log('=== RuntimeEnglish · escáner de lecciones ===')
console.log(
  `módulos ${stats.modules} · sesiones ${stats.sessions} · bloques ${stats.blocks} · ` +
    `ejercicios ${stats.exercises} · diálogos ${stats.dialogues} · ` +
    `diálogos ramificados ${stats.dialogueBranches}`,
)
console.log(
  `errores ${counts('error')} · avisos ${counts('warning')} · información ${counts('info')}`,
)

for (const severity of ['error', 'warning', 'info'] as const) {
  const group = issues.filter((issue) => issue.severity === severity)
  if (!group.length) continue
  console.log(`\n[${severity.toUpperCase()}]`)
  for (const issue of group) {
    console.log(`  ${issue.category.padEnd(13)} ${issue.id}: ${issue.message}`)
  }
}

if (counts('error') > 0) {
  console.error('\nEl currículo tiene errores. Corrígelos antes de publicar.')
  process.exitCode = 1
} else {
  console.log('\nSin errores: todas las lecciones están conectadas y son coherentes.')
}
