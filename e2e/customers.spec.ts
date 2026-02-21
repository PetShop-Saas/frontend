import { test, expect } from './fixtures/auth'

test.describe('Clientes', () => {
  test('deve listar página de clientes', async ({ authenticatedPage: page }) => {
    await page.goto('/customers')
    await expect(page.locator('h1:has-text("Clientes")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo cliente/i })).toBeVisible()
  })

  test('deve abrir modal e preencher formulário de novo cliente', async ({ authenticatedPage: page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo cliente/i }).click()
    await expect(page.getByLabel(/nome completo/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/nome completo/i).fill('Cliente E2E Test')
    await page.getByLabel(/cpf\/cnpj/i).fill('52998224725')
    await expect(page.getByRole('button', { name: /próximo/i })).toBeVisible()
  })
})
