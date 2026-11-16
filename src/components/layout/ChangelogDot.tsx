import { useEffect, useState } from 'preact/hooks'
import { CHANGELOG_SEEN_EVENT, getUnseenReleases, SHOW_CHANGELOG_EVENT } from '../../lib/changelog'

/** Small dot on the settings button while there are unseen release notes. */
export default function ChangelogDot() {
  const [hasNew, setHasNew] = useState(() => getUnseenReleases().length > 0)

  useEffect(() => {
    const update = () => setHasNew(getUnseenReleases().length > 0)
    const onShow = () => {
      // Wait until the modal has marked the version as seen.
      window.setTimeout(update, 0)
    }
    window.addEventListener(SHOW_CHANGELOG_EVENT, onShow)
    window.addEventListener(CHANGELOG_SEEN_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(SHOW_CHANGELOG_EVENT, onShow)
      window.removeEventListener(CHANGELOG_SEEN_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  if (!hasNew) return null

  return (
    <span
      class="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-base-100"
      aria-label="Hay novedades"
      role="status"
    />
  )
}
