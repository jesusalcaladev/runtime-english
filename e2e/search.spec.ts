import { expect, test } from '@playwright/test'

test.describe('search experience', () => {
  test('searches real content and keeps internal links APK-compatible', async ({ page }) => {
    await page.goto('/search.html')

    const input = page.getByRole('searchbox', { name: 'Buscar en RuntimeEnglish' })
    await input.fill('pull request')

    await expect(page.getByRole('status', { name: 'Número de resultados' })).toContainText(
      /resultado/,
    )
    const firstResult = page.locator('a[href*="session/"]').first()
    await expect(firstResult).toBeVisible()
    expect(await firstResult.getAttribute('href')).toMatch(/\.html/)
  })

  test('filters by kind, clears the query and supports the "/" shortcut', async ({ page }) => {
    await page.goto('/search.html')
    const input = page.getByRole('searchbox', { name: 'Buscar en RuntimeEnglish' })

    await expect(page.getByText('Empieza a escribir para ver resultados.')).toBeVisible()

    await input.fill('deploy')
    await expect(page.getByRole('status', { name: 'Número de resultados' })).toContainText(
      /resultado/,
    )

    const slangChip = page.getByRole('button', { name: /^Slang/ })
    await slangChip.click()
    await expect(slangChip).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
    await expect(input).toHaveValue('')
    await expect(page.getByText('Empieza a escribir para ver resultados.')).toBeVisible()

    await page.locator('body').click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('/')
    await expect(input).toBeFocused()
  })

  test('all visible buttons have an accessible name', async ({ page }) => {
    await page.goto('/search.html')
    await page.getByRole('searchbox', { name: 'Buscar en RuntimeEnglish' }).fill('pull request')

    const unnamed = await page.locator('button').evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const label = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''
          return label.length === 0
        })
        .map((button) => button.outerHTML.slice(0, 120)),
    )
    expect(unnamed).toEqual([])
  })
})
