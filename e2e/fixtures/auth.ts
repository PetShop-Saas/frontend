import { test as base, Page } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_USER_EMAIL || 'admin@petshop.com'
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD || 'admin123'

export async function doLogin(page: Page, email = E2E_EMAIL, password = E2E_PASSWORD) {
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')
  const emailInput = page.getByLabel(/e-mail/i)
  await emailInput.waitFor({ state: 'visible', timeout: 15000 })
  await emailInput.scrollIntoViewIfNeeded()
  await emailInput.fill(email)
  await page.getByLabel(/senha/i).fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await doLogin(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
