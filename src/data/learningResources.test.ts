import { describe, expect, it } from 'vitest'
import { getActiveCueIndex, LEARNING_RESOURCES, VIDEO_LESSONS } from './learningResources'

describe('learning resources', () => {
  it('has unique ids and safe external links', () => {
    const ids = LEARNING_RESOURCES.map((resource) => resource.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const resource of LEARNING_RESOURCES) {
      expect(resource.url.startsWith('https://')).toBe(true)
      expect(resource.tip.trim().length).toBeGreaterThan(0)
      expect(resource.focus.length).toBeGreaterThan(0)
    }
  })

  it('ships video lessons with valid YouTube ids and ordered cues', () => {
    const ids = VIDEO_LESSONS.map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const lesson of VIDEO_LESSONS) {
      expect(lesson.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/)
      expect(lesson.cues.length).toBeGreaterThanOrEqual(5)
      expect(lesson.durationSeconds).toBeGreaterThan(60)
      const lastCue = lesson.cues[lesson.cues.length - 1]
      expect(lastCue.end).toBeLessThanOrEqual(lesson.durationSeconds)
      // Algunos canales de subtítulos terminan antes de los aplausos finales.
      expect(lastCue.end).toBeGreaterThan(lesson.durationSeconds - 90)
      let previousEnd = -1
      for (const cue of lesson.cues) {
        expect(cue.start).toBeGreaterThanOrEqual(0)
        expect(cue.end).toBeGreaterThan(cue.start)
        expect(cue.start).toBeGreaterThanOrEqual(previousEnd)
        expect(cue.en.trim().length).toBeGreaterThan(0)
        previousEnd = cue.end
      }
    }
  })

  it('uses real caption timings (not placeholder zero-based cues)', () => {
    const treasure = VIDEO_LESSONS.find((lesson) => lesson.id === 'speak-so-people-listen')
    const urban = VIDEO_LESSONS.find((lesson) => lesson.id === 'master-procrastinator')
    expect(treasure?.cues[0].start).toBeGreaterThan(10)
    expect(treasure?.cues[0].en).toContain('human voice')
    expect(urban?.cues[0].start).toBeGreaterThan(10)
    expect(urban?.cues[0].en).toContain('So in college')
    expect(urban?.cues[1].en).toContain('government major')
  })

  it('keeps optional Spanish help clean when present', () => {
    for (const lesson of VIDEO_LESSONS) {
      for (const cue of lesson.cues) {
        if (cue.es !== undefined) expect(cue.es.trim().length).toBeGreaterThan(0)
      }
    }
    expect(VIDEO_LESSONS.some((lesson) => lesson.cues.every((cue) => cue.es))).toBe(true)
  })

  it('ships valid comprehension questions for every video', () => {
    for (const lesson of VIDEO_LESSONS) {
      expect(lesson.questions.length).toBeGreaterThanOrEqual(3)
      const ids = lesson.questions.map((question) => question.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const question of lesson.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(2)
        expect(question.answer).toBeGreaterThanOrEqual(0)
        expect(question.answer).toBeLessThan(question.options.length)
        expect(question.explanation.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('finds the active cue by time', () => {
    const cues = VIDEO_LESSONS[0].cues
    expect(getActiveCueIndex(cues, 0)).toBe(-1)
    expect(getActiveCueIndex(cues, cues[0].start)).toBe(0)
    expect(getActiveCueIndex(cues, cues[1].start)).toBe(1)
    expect(getActiveCueIndex(cues, cues[cues.length - 1].end + 100)).toBe(cues.length - 1)
  })
})
