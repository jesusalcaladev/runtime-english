import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/RuntimeEnglish|Learn English|English/i)
  await expect(page.getByText('RuntimeEnglish').first()).toBeVisible()
})

test('search page renders search UI', async ({ page }) => {
  await page.goto('/search.html')
  await expect(page.getByRole('heading', { name: 'Encuentra lo que necesitas' })).toBeVisible()
  await expect(page.getByPlaceholder(/pull request, deployment, bug/i)).toBeVisible()
  await expect(page.getByText('Empieza a escribir para ver resultados.')).toBeVisible()
})

test('practice page renders practice controls', async ({ page }) => {
  await page.goto('/practice.html')
  await expect(page.getByRole('heading', { name: 'Entrena en modo fluido' })).toBeVisible()
  await expect(page.getByText('Práctica rápida')).toBeVisible()
  await expect(page.getByRole('button', { name: /Ronda/i })).toBeVisible()
})

test('settings hides Android-only permissions section on desktop web', async ({ page }) => {
  await page.goto('/settings.html')
  await expect(page.getByRole('heading', { name: 'Perfil y plan', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Permisos', level: 2 })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Permisos (móvil)', level: 2 })).toHaveCount(0)
})

test('dashboard skeleton reserves space so the footer is pushed below it', async ({ browser }) => {
  // With JS disabled the Preact island never mounts, so the skeleton stays in
  // the DOM: this is exactly the state where an absolutely-positioned overlay
  // used to cover the footer.
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/')
    const skeleton = page.locator('#dashboard-skeleton')
    await expect(skeleton).toBeVisible()
    const skeletonBox = await skeleton.boundingBox()
    const footerBox = await page.locator('footer').first().boundingBox()
    expect(skeletonBox).not.toBeNull()
    expect(footerBox).not.toBeNull()
    expect(footerBox!.y).toBeGreaterThanOrEqual(skeletonBox!.y + skeletonBox!.height - 1)
  } finally {
    await context.close()
  }
})

test('my lessons page renders import flow entry point', async ({ page }) => {
  await page.goto('/my-lessons.html')
  await expect(page.getByRole('heading', { name: 'Mis lecciones', level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Agregar lección' })).toBeVisible()
  await page.getByRole('button', { name: 'Agregar lección' }).click()
  await expect(page.getByText('1) Copia el prompt optimizado')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copiar prompt para IA' })).toBeVisible()
  await expect(page.getByPlaceholder(/Pega aquí SOLO el JSON/i)).toBeVisible()
})
