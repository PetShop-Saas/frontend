import { test, expect } from './fixtures/auth'

test.describe('Serviços', () => {
  test('deve listar página de serviços', async ({ authenticatedPage: page }) => {
    await page.goto('/services')
    await expect(page.locator('h1:has-text("Serviços")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo serviço/i })).toBeVisible()
  })

  test('deve criar novo serviço', async ({ authenticatedPage: page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo serviço/i }).click()
    await expect(page.getByLabel(/nome do serviço/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/nome do serviço/i).fill('Banho E2E')
    await page.getByLabel(/preço \(r\$\)/i).fill('50')
    await page.getByLabel(/duração \(minutos\)/i).fill('60')
    await page.getByRole('button', { name: /criar serviço/i }).click()
    await expect(page.getByText(/serviço criado com sucesso/i)).toBeVisible({ timeout: 8000 })
  })
})
