import { expect, test } from '@playwright/test'

test.describe('dashboard stability', () => {
  test('removes the loading skeleton and keeps the greeting stable', async ({ page }) => {
    await page.goto('/index.html')
    await expect(page.locator('#dashboard-skeleton')).toHaveCount(0)

    const greeting = page.getByText(/^(Hola|Hey)/).first()
    const before = await greeting.textContent()
    await page.waitForTimeout(1500)
    await expect(page.getByText(/^(Hola|Hey)/).first()).toHaveText(before ?? '')
  })
})

test.describe('video library', () => {
  test('opens a video and searches its transcript', async ({ page }) => {
    await page.goto('/learn.html')
    await expect(page.getByRole('heading', { name: 'Biblioteca de videos' })).toBeVisible()

    await page.getByRole('button', { name: /How to Speak So That People Want to Listen/ }).click()
    await expect(page.getByRole('button', { name: 'Volver a la biblioteca' })).toBeVisible()
    await expect(page.getByText(/Subtítulos originales de YouTube/)).toBeVisible()

    await page.getByRole('searchbox', { name: /Buscar en la transcripción/ }).fill('listen')
    await expect(page.getByText(/Ninguna línea coincide/)).toBeHidden()
  })
})

test.describe('player sync and accessibility', () => {
  test('highlights the active cue from the player time and seeks on click', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>
      w.__ytTime = 0
      w.__ytSeek = -1
      class FakePlayer {
        playVideo() {}
        pauseVideo() {}
        seekTo(seconds: number) {
          w.__ytSeek = seconds
        }
        getCurrentTime() {
          return Number(w.__ytTime ?? 0)
        }
        setPlaybackRate() {}
        destroy() {}
      }
      w.YT = { Player: FakePlayer }
    })

    await page.goto('/learn.html')
    await page.getByRole('button', { name: /How to Speak So That People Want to Listen/ }).click()

    await page.evaluate(() => {
      ;(window as unknown as Record<string, unknown>).__ytTime = 95
    })
    await expect(page.getByText('Well, this is the national art of the U.K.')).toBeVisible()

    await page.getByRole('button', { name: /Ir a 1:38/ }).click()
    const seek = await page.evaluate(() => (window as unknown as Record<string, unknown>).__ytSeek)
    expect(Number(seek)).toBeCloseTo(98.98, 1)
  })

  test('all visible buttons have an accessible name', async ({ page }) => {
    await page.goto('/learn.html')
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

test.describe('self-study and placement', () => {
  test('the resource directory filters and searches', async ({ page }) => {
    await page.goto('/learn.html')
    await expect(page.getByRole('heading', { name: /Aprende inglés rápido/ })).toBeVisible()

    await page.getByRole('button', { name: 'YouTube', exact: true }).click()
    await expect(page.getByText('BBC Learning English (YouTube)')).toBeVisible()
    await expect(page.getByText('YouGlish')).toBeHidden()

    await page.getByRole('button', { name: 'Todos', exact: true }).first().click()
    await page.getByRole('searchbox').fill('youglish')
    await expect(page.getByText('YouGlish')).toBeVisible()
  })

  test('the placement test recommends a level and a first session', async ({ page }) => {
    await page.goto('/placement.html')
    await expect(page.getByRole('heading', { name: 'Empieza por donde te toca' })).toBeVisible()

    for (let question = 0; question < 8; question += 1) {
      await page.getByRole('button', { name: /^B / }).first().click()
      await page.getByRole('button', { name: /Siguiente|Terminar/ }).click()
    }

    await page.getByRole('button', { name: 'Ver mi nivel' }).click()
    await expect(page.getByText('A1', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ir a mi sesión/ })).toBeVisible()
  })
})
