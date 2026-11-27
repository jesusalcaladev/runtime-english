import { expect, test } from '@playwright/test'

test('web TTS downloads the MP3 without sending a Referer', async ({ page }) => {
  const audioRequests: { status: number; referer: string }[] = []
  page.on('response', (response) => {
    if (response.url().includes('translate.google.com/translate_tts')) {
      audioRequests.push({
        status: response.status(),
        referer: response.request().headers().referer ?? '',
      })
    }
  })

  await page.addInitScript(() => {
    localStorage.setItem(
      'runtimeenglish_v3',
      JSON.stringify({ state: { settings: { ttsEnabled: true, ttsEngine: 'google' } } }),
    )
  })
  await page.goto('/settings.html')
  await page.getByRole('button', { name: /Audio y recordatorios/ }).click()
  await page.getByRole('button', { name: 'Probar esta voz' }).click()

  await expect.poll(() => audioRequests.length, { timeout: 20_000 }).toBeGreaterThan(0)
  expect(audioRequests[0].status).toBe(200)
  expect(audioRequests[0].referer).toBe('')
})
