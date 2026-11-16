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

test('my lessons page renders import flow entry point', async ({ page }) => {
  await page.goto('/my-lessons.html')
  await expect(page.getByRole('heading', { name: 'Mis lecciones' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Agregar lección' })).toBeVisible()
  await page.getByRole('button', { name: 'Agregar lección' }).click()
  await expect(page.getByText('1) Copia el prompt optimizado')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copiar prompt para IA' })).toBeVisible()
  await expect(page.getByPlaceholder(/Pega aquí SOLO el JSON/i)).toBeVisible()
})
