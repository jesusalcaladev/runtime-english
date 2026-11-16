import { expect, test } from '@playwright/test'

test.describe('custom lessons', () => {
  test('imports a custom lesson from JSON and opens it', async ({ page }) => {
    await page.goto('/my-lessons.html')

    await expect(page.getByRole('heading', { name: 'Mis lecciones' })).toBeVisible()
    await page.getByRole('button', { name: 'Agregar lección' }).click()

    const lessonJson = JSON.stringify({
      title: 'Deploy basics',
      summary: 'Practica vocabulario de deploys.',
      cefr: 'A2',
      objectives: ['Usar vocabulario básico de deploys'],
      blocks: [
        {
          type: 'text',
          title: 'Intro',
          body: 'Aprende frases comunes para hablar de deploys.',
        },
      ],
      exercises: [
        {
          type: 'choice',
          id: 'ex-1',
          prompt: 'Choose the correct option',
          options: ['Deploy the app', 'Deploying the apped'],
          answer: 0,
          explanation: 'Usa la forma base en imperativos.',
        },
      ],
    })

    await page.getByPlaceholder(/Pega aquí SOLO el JSON/i).fill(lessonJson)
    await page.getByRole('button', { name: 'Guardar lección' }).click()

    await expect(page).toHaveURL(/\/my-lesson\.html\?id=/)
    await expect(page.getByText('Deploy basics')).toBeVisible()
    await expect(page.getByText('Practica vocabulario de deploys.')).toBeVisible()
  })
})
