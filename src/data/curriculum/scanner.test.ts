import { describe, expect, it } from 'vitest'
import { scanCurriculum } from './scanner'

const report = scanCurriculum()
const errors = report.issues.filter((issue) => issue.severity === 'error')

describe('curriculum scanner', () => {
  it('scans the whole curriculum', () => {
    expect(report.stats.modules).toBeGreaterThan(0)
    expect(report.stats.sessions).toBeGreaterThan(0)
    expect(report.stats.exercises).toBeGreaterThan(0)
    expect(report.stats.dialogues).toBeGreaterThan(0)
  })

  it('finds no blocking issues (ids, connectivity, metadata, dialogue and exercise integrity)', () => {
    expect(errors.map((issue) => `${issue.category}/${issue.id}: ${issue.message}`)).toEqual([])
  })
})
