import { test, expect } from './fixtures/auth'

test.describe('Pets', () => {
  test('deve listar página de pets', async ({ authenticatedPage: page }) => {
    await page.goto('/pets')
    await expect(page.locator('h1:has-text("Pets")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo pet/i })).toBeVisible()
  })

  test('deve criar pet vinculado a cliente existente', async ({ authenticatedPage: page }) => {
    await page.goto('/pets')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo pet/i }).click()
    await expect(page.getByLabel(/nome do pet/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/dono/i).click()
    await page.locator('.ant-select-item').first().click()
    await page.getByLabel(/nome do pet/i).fill(`Pet E2E ${Date.now()}`)
    await page.getByLabel(/espécie/i).click()
    await page.locator('.ant-select-item').filter({ hasText: /cachorro/i }).click()
    await page.getByRole('button', { name: /criar pet/i }).click()
    await expect(page.getByText(/pet criado com sucesso/i)).toBeVisible({ timeout: 10000 })
  })
})
