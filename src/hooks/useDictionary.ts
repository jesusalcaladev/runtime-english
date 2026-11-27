import MiniSearch from 'minisearch'
import { useEffect, useMemo, useState } from 'preact/hooks'
import {
  getDuePhraseEntries,
  getWeakPhraseEntries,
  type PhrasebookEntry,
  progressStore,
} from '../lib/progress'
import { useProgress } from '../lib/useProgress'

export type ReviewMode = 'none' | 'due' | 'weak' | 'all'

export function useDictionary() {
  const state = useProgress()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'saved' | 'learned' | 'hard'>('all')
  const [manualEn, setManualEn] = useState('')
  const [manualEs, setManualEs] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [reviewMode, setReviewMode] = useState<ReviewMode>('none')
  const [reviewIndex, setReviewIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [reviewQueue, setReviewQueue] = useState<PhrasebookEntry[]>([])
  const [showAdd, setShowAdd] = useState(false)

  const entries = useMemo(() => {
    return (Object.values(state.phrasebook ?? {}) as PhrasebookEntry[]).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    )
  }, [state.phrasebook])

  const dueEntries = useMemo(() => getDuePhraseEntries(state), [state.phrasebook])

  const searchIndex = useMemo(() => {
    const mini = new MiniSearch({
      fields: ['en', 'es', 'source', 'notes', 'userExample', 'tagsText'],
      storeFields: ['id'],
      searchOptions: { prefix: true, fuzzy: 0.2, combineWith: 'AND' },
    })
    mini.addAll(
      entries.map((e) => ({
        id: e.id,
        en: e.en,
        es: e.es,
        source: e.source || '',
        notes: e.notes || '',
        userExample: e.userExample || '',
        tagsText: (e.tags || []).join(' '),
      })),
    )
    return mini
  }, [entries])

  const filtered = useMemo(() => {
    const q = query.trim()
    const base = entries.filter((e: PhrasebookEntry) => {
      if (filter === 'saved' && !e.saved) return false
      if (filter === 'learned' && e.correct <= 0) return false
      if (filter === 'hard' && e.difficulty !== 'hard') return false
      return true
    })
    if (!q) return base

    let ids: Set<string> | null = null
    try {
      const results = searchIndex.search(q, { prefix: true, fuzzy: 0.2, combineWith: 'AND' })
      ids = new Set(results.map((r) => String(r.id)))
    } catch {
      ids = null
    }
    if (ids) {
      const idSet = ids
      return base.filter((e) => idSet.has(e.id))
    }

    const ql = q.toLowerCase()
    return base.filter((e) => {
      const hay =
        `${e.en} ${e.es} ${e.source} ${e.notes || ''} ${e.userExample || ''} ${(e.tags || []).join(' ')}`.toLowerCase()
      return hay.includes(ql)
    })
  }, [entries, query, filter, searchIndex])

  const total = entries.length
  const learned = entries.filter((e) => e.correct > 0).length
  const saved = entries.filter((e) => e.saved).length
  const mastered = entries.filter((e) => e.correct >= 3).length
  const hard = entries.filter((e) => e.difficulty === 'hard').length
  const progressPct = total === 0 ? 0 : Math.round((mastered / Math.max(total, 1)) * 100)

  function addManual() {
    const en = manualEn.trim()
    const es = manualEs.trim()
    if (!en) return
    progressStore.savePhrase(en, es, 'Manual')
    setManualEn('')
    setManualEs('')
  }

  function startReview(mode: ReviewMode) {
    const now = Date.now()
    let queue: PhrasebookEntry[] = []
    if (mode === 'due') queue = getDuePhraseEntries(progressStore.getState(), now)
    else if (mode === 'weak') queue = getWeakPhraseEntries(progressStore.getState(), 30)
    else if (mode === 'all')
      queue = [...Object.values(progressStore.getState().phrasebook ?? {})].sort(
        (a, b) => a.due - b.due || a.correct - b.correct,
      )
    if (queue.length === 0 && mode === 'due')
      queue = getWeakPhraseEntries(progressStore.getState(), 20)
    setReviewQueue(queue.slice(0, 20))
    setReviewMode(mode)
    setReviewIndex(0)
    setRevealed(false)
    setReviewedCount(0)
  }

  function answerReview(correct: boolean, struggled = false) {
    const card = reviewQueue[reviewIndex]
    if (!card) return
    progressStore.reviewPhrase(card.id, correct, { struggled })
    setReviewedCount((c) => c + 1)
    const next = reviewIndex + 1
    if (next >= reviewQueue.length) {
      setReviewMode('none')
      setReviewQueue([])
      setReviewIndex(0)
      setRevealed(false)
      return
    }
    setReviewIndex(next)
    setRevealed(false)
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('review') === '1') startReview('due')
      const f = params.get('filter')
      if (f === 'hard' || f === 'saved' || f === 'learned') setFilter(f)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const card = reviewMode !== 'none' ? reviewQueue[reviewIndex] : null

  return {
    state,
    query,
    setQuery,
    filter,
    setFilter,
    manualEn,
    setManualEn,
    manualEs,
    setManualEs,
    editingId,
    setEditingId,
    reviewMode,
    setReviewMode,
    reviewIndex,
    revealed,
    setRevealed,
    reviewedCount,
    reviewQueue,
    setReviewQueue,
    showAdd,
    setShowAdd,
    entries,
    dueEntries,
    filtered,
    total,
    learned,
    saved,
    mastered,
    hard,
    progressPct,
    addManual,
    startReview,
    answerReview,
    card,
  }
}
