import { test, expect } from './fixtures/auth'

test.describe('Fornecedores', () => {
  test('deve listar página de fornecedores', async ({ authenticatedPage: page }) => {
    await page.goto('/suppliers')
    await expect(page.locator('h1:has-text("Fornecedores")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo fornecedor/i })).toBeVisible()
  })

  test('deve criar fornecedor e exibir sucesso', async ({ authenticatedPage: page }) => {
    const nomeUnico = `Fornecedor E2E ${Date.now()}`
    await page.goto('/suppliers')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo fornecedor/i }).click()
    await expect(page.getByLabel(/nome do fornecedor/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/nome do fornecedor/i).fill(nomeUnico)
    await page.getByRole('button', { name: /criar fornecedor/i }).click()
    const errMsg = page.locator('.ant-message-error')
    const okMsg = page.getByText(/fornecedor criado com sucesso/i)
    await expect(okMsg.or(errMsg)).toBeVisible({ timeout: 10000 })
    await expect(errMsg).not.toBeVisible()
    await page.waitForTimeout(2000)
    if (await page.getByRole('dialog').isVisible()) {
      await page.getByRole('button', { name: /cancelar/i }).click()
      await page.waitForTimeout(500)
    }
    const reloadBtn = page.getByRole('button', { name: /atualizar/i }).first()
    await reloadBtn.click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(nomeUnico)).toBeVisible({ timeout: 15000 })
  })
})
