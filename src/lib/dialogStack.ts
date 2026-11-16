/**
 * Registry of the currently open app-wide dialogs.
 *
 * The native Android back button is handled globally in BaseLayout.astro; it
 * asks here first so a back press closes the visible sheet/dialog instead of
 * navigating away or exiting the app.
 */
interface DialogEntry {
  id: number
  close: () => void
}

const stack: DialogEntry[] = []
let nextId = 0

/** Register an open dialog's close handler. Call the returned fn on unmount. */
export function registerDialog(close: () => void): () => void {
  const entry: DialogEntry = { id: ++nextId, close }
  stack.push(entry)

  return () => {
    const index = stack.findIndex((item) => item.id === entry.id)
    if (index !== -1) stack.splice(index, 1)
  }
}

/** Close the topmost dialog. Returns true when a dialog consumed the back press. */
export function closeTopDialog(): boolean {
  const top = stack[stack.length - 1]
  if (!top) return false
  top.close()
  return true
}

export function hasOpenDialog(): boolean {
  return stack.length > 0
}
