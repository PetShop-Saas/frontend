import { test, expect } from './fixtures/auth'

test.describe('Fornecedores', () => {
  test('deve listar página de fornecedores', async ({ authenticatedPage: page }) => {
    await page.goto('/suppliers')
    await expect(page.locator('h1:has-text("Fornecedores")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo fornecedor/i })).toBeVisible()
  })

  test('deve abrir modal e preencher formulário de novo fornecedor', async ({ authenticatedPage: page }) => {
    await page.goto('/suppliers')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo fornecedor/i }).click()
    await expect(page.getByLabel(/nome do fornecedor/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/nome do fornecedor/i).fill('Fornecedor E2E')
    await expect(page.getByRole('button', { name: /criar fornecedor/i })).toBeVisible()
  })
})
