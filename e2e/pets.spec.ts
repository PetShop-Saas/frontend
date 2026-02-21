import { test, expect } from './fixtures/auth'

test.describe('Pets', () => {
  test('deve listar página de pets', async ({ authenticatedPage: page }) => {
    await page.goto('/pets')
    await expect(page.getByRole('heading', { name: /pets/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo pet/i })).toBeVisible()
  })

  test('deve abrir modal de novo pet', async ({ authenticatedPage: page }) => {
    await page.goto('/pets')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo pet/i }).click()
    await expect(page.getByLabel(/nome do pet/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel(/espécie/i)).toBeVisible()
    await expect(page.getByLabel(/dono/i)).toBeVisible()
  })
})
