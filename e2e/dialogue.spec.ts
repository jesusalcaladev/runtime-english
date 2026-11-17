import { expect, test } from '@playwright/test'

const SESSION_URL = '/session/daily-standup.html'

test.beforeEach(async ({ page }) => {
  await page.goto(SESSION_URL)
  await expect(
    page.getByRole('heading', { name: 'Daily standup: tu turno en 60 segundos' }),
  ).toBeVisible()
})

test('renders the two avatars and the conversation lines', async ({ page }) => {
  await expect(page.getByText('Maya', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Leo', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Morning, Leo.')).toBeVisible()
  await expect(page.getByText('I finished the API integration and pushed the PR.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reproducir conversación' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Reproducir: Maya|Play: Maya/ }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Reproducir: Leo|Play: Leo/ }).first(),
  ).toBeVisible()
})

test('highlights the active line and can stop playback', async ({ page }) => {
  await page.getByRole('button', { name: 'Reproducir conversación' }).click()

  await expect(page.getByRole('button', { name: 'Detener conversación' })).toBeVisible()
  const activeBubbles = page.locator('[data-active="true"]')
  await expect(activeBubbles.first()).toBeVisible()

  await page.getByRole('button', { name: 'Detener conversación' }).click()
  await expect(page.getByRole('button', { name: 'Reproducir conversación' })).toBeVisible()
  await expect(page.locator('[data-active="true"]')).toHaveCount(0)
})

test('replays a single line and keeps the practice section available', async ({ page }) => {
  await page
    .getByRole('button', { name: /Reproducir: Leo|Play: Leo/ })
    .first()
    .click()
  const leoLine = page
    .locator('[data-active="true"]')
    .filter({ hasText: 'I finished the API integration and pushed the PR.' })
  await expect(leoLine).toBeVisible()

  await page.locator('#practica').scrollIntoViewIfNeeded()
  await expect(page.getByText('Ejercicios de la sesión')).toBeVisible()
  await expect(
    page.getByText('Un colega propone una arquitectura con la que no estás de acuerdo', {
      exact: false,
    }),
  ).toBeVisible()
})
