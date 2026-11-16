/**
 * Converts internal routes to navigable URLs in the APK (Capacitor).
 *
 * Capacitor serves extensionless routes as index.html in html5 mode, which
 * breaks navigation with Astro ClientRouter. That is why we generate .html pages
 * and every internal link must go through this function.
 */
export function route(path: string): string {
  if (!path) return path

  // External URLs, schemes (mailto:, tel:, data:), and protocol-relative
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) {
    return path
  }

  // Relative paths or pure anchors: leave unchanged
  if (!path.startsWith('/')) {
    return path
  }

  const hashIndex = path.indexOf('#')
  const queryIndex = path.indexOf('?')
  const cut =
    hashIndex === -1 ? queryIndex : queryIndex === -1 ? hashIndex : Math.min(hashIndex, queryIndex)
  const pathname = cut === -1 ? path : path.slice(0, cut)
  const suffix = cut === -1 ? '' : path.slice(cut)

  if (pathname === '/') {
    return `/${suffix}`
  }

  // Already has an extension (.html, .svg, .xml, etc.)
  if (/\/[^/]+\.[^/]+$/.test(pathname)) {
    return path
  }

  // Directory with trailing slash (not root)
  if (pathname.endsWith('/')) {
    return `${pathname}index.html${suffix}`
  }

  return `${pathname}.html${suffix}`
}
