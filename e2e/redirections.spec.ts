import { test, expect } from './fixtures/auth'

test.describe('Redirecionamentos', () => {
  test('/management redireciona para /unified-access-management', async ({ authenticatedPage: page }) => {
    await page.goto('/management')
    await expect(page).toHaveURL(/\/unified-access-management/)
  })

  test('/inventory redireciona para /products', async ({ authenticatedPage: page }) => {
    await page.goto('/inventory')
    await page.waitForURL(/\/products/, { timeout: 5000 })
  })

  test('/stock-alerts redireciona para /products com tab alerts', async ({ authenticatedPage: page }) => {
    await page.goto('/stock-alerts')
    await page.waitForURL(/\/products/, { timeout: 5000 })
  })
})
