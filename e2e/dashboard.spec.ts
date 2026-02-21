import { test, expect } from './fixtures/auth'

test.describe('Dashboard', () => {
  test('deve exibir o dashboard após login', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: 'Bem-vindo ao Dashboard' })).toBeVisible()
  })

  test('deve exibir cards de estatísticas', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/clientes|pets|agendamentos|vendas/i).first()).toBeVisible({ timeout: 10000 })
  })
})
