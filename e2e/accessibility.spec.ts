import { expect, test } from '@playwright/test'

const PAGES = [
  '/index.html',
  '/session/daily-standup.html',
  '/search.html',
  '/practice.html',
  '/learn.html',
  '/slang.html',
  '/dictionary.html',
  '/achievements.html',
  '/certificate.html',
  '/settings.html',
  '/placement.html',
  '/my-lessons.html',
  '/verify.html',
]

/** Mirrors the browser-side part of the audit so it can be reused in the loop. */
async function unnamedElements(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const visible = (el: Element) => el.getClientRects().length > 0
    const named = (el: Element) => {
      const ariaLabel = el.getAttribute('aria-label')?.trim()
      const labelledBy = el.getAttribute('aria-labelledby')?.trim()
      const title = el.getAttribute('title')?.trim()
      const text = el.textContent?.trim()
      if (ariaLabel || labelledBy || title || text) return true
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      ) {
        const id = el.id
        if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return true
        if (el.closest('label')) return true
      }
      return false
    }

    const problems: string[] = []
    for (const el of document.querySelectorAll('button, a, input, select, textarea, img')) {
      if (!visible(el)) continue
      if (el instanceof HTMLImageElement) {
        // alt="" is intentional for decorative thumbnails inside a labelled button.
        if (!el.hasAttribute('alt')) problems.push(`img without alt: ${el.outerHTML.slice(0, 100)}`)
        continue
      }
      if (!named(el)) problems.push(`${el.tagName.toLowerCase()}: ${el.outerHTML.slice(0, 100)}`)
    }
    return problems
  })
}

for (const path of PAGES) {
  test(`${path} has accessible names for visible controls`, async ({ page }) => {
    await page.goto(path)
    expect(await unnamedElements(page)).toEqual([])
  })
}
