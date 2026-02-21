import { test, expect } from './fixtures/auth'

test.describe('Clientes', () => {
  test('deve listar página de clientes', async ({ authenticatedPage: page }) => {
    await page.goto('/customers')
    await expect(page.locator('h1:has-text("Clientes")')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /novo cliente/i })).toBeVisible()
  })

  test('deve criar cliente completo e exibir na lista', async ({ authenticatedPage: page }) => {
    const nomeUnico = `Cliente E2E ${Date.now()}`
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /novo cliente/i }).click()
    const nomeInput = page.getByLabel(/nome completo/i)
    await expect(nomeInput).toBeVisible({ timeout: 5000 })
    await nomeInput.fill(nomeUnico)
    await nomeInput.blur()
    await page.waitForTimeout(400)
    await page.getByLabel(/cpf\/cnpj/i).fill('111.444.777-35')
    await page.getByLabel(/gênero/i).click()
    await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'Masculino' }).first().click()
    await page.getByLabel(/e-mail/i).fill('cliente@e2e.test')
    await page.getByLabel(/telefone/i).fill('11999999999')
    // hasPet permanece false - não marcar "Cadastrar pet junto" - permite salvar sem pet
    await page.getByRole('button', { name: /próximo/i }).click()
    await expect(page.getByRole('button', { name: /salvar cliente/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /salvar cliente/i }).click()
    const sucesso = page.getByText(/cliente criado com sucesso/i)
    const erro = page.locator('.ant-message-error').first()
    await expect(sucesso.or(erro)).toBeVisible({ timeout: 10000 })
    await expect(erro).not.toBeVisible({ timeout: 1000 })
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(nomeUnico)).toBeVisible({ timeout: 8000 })
  })
})
