import { test, expect } from './fixtures/auth'

test.describe('Navegação principal', () => {
  test('deve acessar calendário', async ({ authenticatedPage: page }) => {
    await page.goto('/calendar')
    await expect(page).toHaveURL(/\/calendar/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar produtos', async ({ authenticatedPage: page }) => {
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar vendas', async ({ authenticatedPage: page }) => {
    await page.goto('/sales')
    await expect(page).toHaveURL(/\/sales/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar compras', async ({ authenticatedPage: page }) => {
    await page.goto('/purchases')
    await expect(page).toHaveURL(/\/purchases/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar histórico médico', async ({ authenticatedPage: page }) => {
    await page.goto('/medical-records')
    await expect(page).toHaveURL(/\/medical-records/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar fluxo de caixa', async ({ authenticatedPage: page }) => {
    await page.goto('/cash-flow')
    await expect(page).toHaveURL(/\/cash-flow/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar relatórios financeiros', async ({ authenticatedPage: page }) => {
    await page.goto('/financial-reports')
    await expect(page).toHaveURL(/\/financial-reports/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar comunicações', async ({ authenticatedPage: page }) => {
    await page.goto('/communications')
    await expect(page).toHaveURL(/\/communications/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar notificações', async ({ authenticatedPage: page }) => {
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/notifications/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar hotel', async ({ authenticatedPage: page }) => {
    await page.goto('/hotel')
    await expect(page).toHaveURL(/\/hotel/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar tickets', async ({ authenticatedPage: page }) => {
    await page.goto('/tickets')
    await expect(page).toHaveURL(/\/tickets/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar perfil', async ({ authenticatedPage: page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/profile/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar billing', async ({ authenticatedPage: page }) => {
    await page.goto('/billing')
    await expect(page).toHaveURL(/\/billing/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar configurações', async ({ authenticatedPage: page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve acessar usuários e permissões', async ({ authenticatedPage: page }) => {
    await page.goto('/unified-access-management')
    await expect(page).toHaveURL(/\/unified-access-management/)
    await expect(page.locator('body')).toBeVisible()
  })
})
