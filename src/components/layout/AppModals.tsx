import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { CHANGELOG, type ChangelogRelease } from '../../data/changelog'
import { useProgress } from '../../hooks/useProgress'
import {
  APP_UPDATE_CHECK_EVENT,
  type AppUpdateInfo,
  checkForAppUpdateDetailed,
  dismissAppUpdate,
} from '../../lib/appUpdate'
import { getUnseenReleases, markChangelogSeen, SHOW_CHANGELOG_EVENT } from '../../lib/changelog'
import AppUpdateModal from './AppUpdateModal'
import ReleaseNotesModal from './ReleaseNotesModal'

/**
 * Single owner of the app-wide modals. The APK update notice has priority over
 * the release notes so the user never sees two stacked dialogs on first launch.
 */
export default function AppModals() {
  const state = useProgress()
  const onboarded = state.settings.onboarded
  const notesShownRef = useRef(false)
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesReleases, setNotesReleases] = useState<ChangelogRelease[]>([])
  const [notesMode, setNotesMode] = useState<'auto' | 'manual'>('auto')

  // "Qué cambió": once per version, but only after onboarding so it never
  // stacks on top of the welcome flow on a fresh install.
  useEffect(() => {
    if (!onboarded || notesShownRef.current) return
    const unseen = getUnseenReleases()
    if (unseen.length === 0) return
    notesShownRef.current = true
    setNotesReleases(unseen)
    setNotesMode('auto')
    setNotesOpen(true)
  }, [onboarded])

  useEffect(() => {
    let cancelled = false

    const runUpdateCheck = async (force = false) => {
      const result = await checkForAppUpdateDetailed({ force })
      if (!cancelled) setUpdate(result.info)
    }

    void runUpdateCheck(false)

    const onFocus = () => void runUpdateCheck(false)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void runUpdateCheck(false)
    }
    const onManualCheck = () => void runUpdateCheck(true)
    const onShowNotes = () => {
      setNotesReleases(CHANGELOG)
      setNotesMode('manual')
      setNotesOpen(true)
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener(APP_UPDATE_CHECK_EVENT, onManualCheck)
    window.addEventListener(SHOW_CHANGELOG_EVENT, onShowNotes)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(APP_UPDATE_CHECK_EVENT, onManualCheck)
      window.removeEventListener(SHOW_CHANGELOG_EVENT, onShowNotes)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const closeNotes = useCallback(() => {
    if (notesMode === 'auto') markChangelogSeen()
    setNotesOpen(false)
  }, [notesMode])

  const dismissUpdate = useCallback(() => {
    setUpdate((current) => {
      if (current) dismissAppUpdate(current.latestBuild)
      return null
    })
  }, [])

  return (
    <>
      <AppUpdateModal open={update !== null} update={update} onDismiss={dismissUpdate} />
      <ReleaseNotesModal
        open={notesOpen && update === null}
        releases={notesReleases}
        mode={notesMode}
        onClose={closeNotes}
      />
    </>
  )
}
