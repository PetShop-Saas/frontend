import { test, expect } from '@playwright/test'

test.describe('Landing e rotas públicas', () => {
  test('deve exibir a landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
  })

  test('deve ter link para login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /entrar|login/i })).toBeVisible()
  })

  test('deve ter link para criar conta', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Começar Agora' }).first()).toBeVisible()
  })
})

test.describe('Login', () => {
  test('deve exibir formulário de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/e-mail/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('deve redirecionar ao dashboard após login válido', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL || 'admin@petshop.com'
    const password = process.env.E2E_USER_PASSWORD || 'admin123'
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/e-mail/i).fill(email)
    await page.getByLabel(/senha/i).fill(password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Bem-vindo ao Dashboard' })).toBeVisible({ timeout: 5000 })
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/e-mail/i).fill('invalido@test.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/unauthorized|credenciais|inválid|erro/i)).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Rotas protegidas', () => {
  test('deve redirecionar /dashboard para /login quando não autenticado', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('deve redirecionar /customers para /login quando não autenticado', async ({ page }) => {
    await page.goto('/customers')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
