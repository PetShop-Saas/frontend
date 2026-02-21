import { test, expect } from './fixtures/auth'

test.describe('Agendamentos', () => {
  test('deve listar página de agendamentos', async ({ authenticatedPage: page }) => {
    await page.goto('/appointments')
    await expect(page.getByRole('heading', { name: /agendamentos/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo agendamento/i })).toBeVisible()
  })

  test('deve abrir modal de novo agendamento', async ({ authenticatedPage: page }) => {
    await page.goto('/appointments')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo agendamento/i }).click()
    await expect(page.getByLabel(/cliente/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('dialog').getByLabel('Data')).toBeVisible()
    await expect(page.getByLabel(/serviço/i)).toBeVisible()
  })
})
