import { expect, test } from '@playwright/test'

test.describe('flujo por nivel', () => {
  test('el selector del sidebar cambia el panel de sesiones', async ({ page }) => {
    await page.goto('/index.html')
    await expect(page.locator('#roadmap h2')).toHaveText(/Sesiones · A1-A2/, { timeout: 10000 })

    await page.locator('#app-sidebar a[href*="level=B1-B2"]').click()

    await expect(page).toHaveURL(/level=B1-B2/)
    await expect(page.locator('#roadmap h2')).toHaveText(/Sesiones · B1-B2/)
    await expect(page.locator('#app-sidebar a[href*="level=B1-B2"]')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('la pista se muestra y se oculta bajo demanda', async ({ page }) => {
    await page.goto('/session/to-be-presente-pasado.html')
    const dots = page.locator('fieldset button')
    await expect(dots.first()).toBeVisible({ timeout: 10000 })
    const total = await dots.count()
    let found = false

    for (let i = 0; i < total; i++) {
      await dots.nth(i).click()
      const show = page.getByRole('button', { name: /Ver pista|Show hint/ }).first()
      if ((await show.count()) === 0) continue

      found = true
      await show.click()
      const hint = page.locator('p[role="status"]').first()
      await expect(hint).toBeVisible()
      expect((await hint.textContent())?.length).toBeGreaterThan(0)
      await page
        .getByRole('button', { name: /Ocultar pista|Hide hint/ })
        .first()
        .click()
      await expect(page.locator('p[role="status"]')).toHaveCount(0)
      break
    }

    expect(found).toBe(true)
  })

  test('el certificado muestra los tres niveles y C1-C2 es seleccionable', async ({ page }) => {
    await page.goto('/certificate.html')
    const tab = page.getByRole('button', { name: /C1-C2/ })
    await expect(tab).toBeEnabled({ timeout: 10000 })
    await tab.click()
    await expect(page).toHaveURL(/level=C1-C2/)
  })
})

test.describe('verificación pública', () => {
  test('muestra el nivel del certificado verificado', async ({ page }) => {
    await page.route('**/rest/v1/rpc/verify_certificate', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'TEST-A1A2',
            name: 'Ana Dev',
            issued_at: '2026-01-10T12:00:00.000Z',
            program: 'RuntimeEnglish',
            level: 'A1-A2',
            status: 'valid',
            user_id: null,
            completion_date: 'January 9, 2026',
          },
        ]),
      }),
    )

    await page.goto('/verify.html?id=TEST-A1A2')

    await expect(page.getByText('Certificado verificado')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Ana Dev')).toBeVisible()
    await expect(page.getByText(/RuntimeEnglish · A1-A2 · valid/)).toBeVisible()
  })
})
