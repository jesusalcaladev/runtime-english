import { expect, type Locator, type Page, test } from '@playwright/test'

async function decodeQr(page: Page, qr: Locator): Promise<string> {
  await page.addScriptTag({ path: 'node_modules/jsqr/dist/jsQR.js' })
  const png = await qr.locator('svg').screenshot()
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.drawImage(image, 0, 0)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const jsQR = (
      window as unknown as {
        jsQR: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null
      }
    ).jsQR
    return jsQR(pixels.data, canvas.width, canvas.height)?.data ?? ''
  }, png.toString('base64'))
}

test('certificate shows a small, scannable verification QR in its corner', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('runtimeenglish_dev', '1'))
  await page.goto('/certificate.html?dev=1')

  const qr = page.locator('.certificate-sheet .qr-corner')
  await expect(qr).toBeVisible()
  await expect(qr.locator('svg')).toBeVisible()
  await expect(qr).toHaveAttribute('aria-label', /QR para verificar el certificado/)

  // 48 px en pantalla, sin padding: se captura tal como se ve y se decodifica.
  expect(await qr.boundingBox()).toMatchObject({ width: 48, height: 48 })
  const label = await qr.getAttribute('aria-label')
  const id = label?.split('certificado ')[1] ?? ''
  expect(id).toMatch(/^[A-Z0-9-]+$/)

  const decoded = await decodeQr(page, qr)
  const origin = await page.evaluate(() => window.location.origin)
  expect(decoded).toBe(`${origin}/verify.html?id=${id}`)
})

test('la URL del QR verifica el certificado completo (ID, nombre, nivel, fecha y estado)', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('runtimeenglish_dev', '1')
    localStorage.setItem('runtimeenglish_v3', JSON.stringify({ settings: { name: 'Ana Dev' } }))
  })
  await page.goto('/certificate.html?dev=1')

  const sheet = page.locator('#certificate')
  await expect(sheet.locator('h2')).toHaveText('Ana Dev')
  const qr = sheet.locator('.qr-corner')
  const url = await decodeQr(page, qr)
  const id = new URL(url).searchParams.get('id') ?? ''
  expect(id).toMatch(/^[A-Z0-9-]+$/)
  expect(url).toContain('/verify.html?id=')

  const consultedIds: unknown[] = []
  await page.route('**/rest/v1/rpc/verify_certificate', (route) => {
    const body = route.request().postDataJSON() as { cert_id?: string } | undefined
    consultedIds.push(body?.cert_id)
    const found = body?.cert_id === id
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        found
          ? [
              {
                id,
                name: 'Ana Dev',
                issued_at: '2026-01-10T12:00:00.000Z',
                program: 'RuntimeEnglish',
                level: 'A1-A2',
                status: 'valid',
                user_id: 'user-qr-test',
              },
            ]
          : [],
      ),
    })
  })

  // Se abre la URL leída del QR, sin reconstruirla a mano.
  await page.goto(url)

  await expect(page.getByText('Certificado verificado')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { name: 'Ana Dev' })).toBeVisible()
  await expect(page.getByLabel('Certificate ID')).toHaveValue(id)
  await expect(page.locator('dd').getByText(id, { exact: true })).toBeVisible()
  await expect(page.getByText('January 10, 2026')).toBeVisible()
  await expect(page.getByText(/RuntimeEnglish · A1-A2 · valid/)).toBeVisible()
  await expect(page.getByText(/vinculado a una cuenta verificada/)).toBeVisible()
  await expect(page.getByText(url, { exact: true })).toBeVisible()
  expect(consultedIds).toContain(id)

  // El mismo flujo rechaza un ID que no está en el registro.
  await page.getByLabel('Certificate ID').fill('NOEXISTE')
  await page.getByRole('button', { name: 'Verificar', exact: true }).click()
  await expect(page.getByText('No verificado')).toBeVisible()
  await expect(page.getByText(/No se encontró un certificado válido/)).toBeVisible()
})

test('en móvil la hoja crece con su contenido y no recorta el pie ni el QR', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('runtimeenglish_dev', '1'))
  await page.goto('/certificate.html?dev=1')

  const sheet = page.locator('#certificate')
  await expect(sheet.locator('h2')).toBeVisible()
  const sizes = await sheet.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }))
  expect(sizes.scrollHeight).toBeLessThanOrEqual(sizes.clientHeight + 1)
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1)
  await expect(sheet.getByText('ISSUED ON')).toBeVisible()
  await expect(sheet.locator('.qr-corner')).toBeVisible()
  await expect(sheet.locator('.seal-svg')).toBeHidden()
})
