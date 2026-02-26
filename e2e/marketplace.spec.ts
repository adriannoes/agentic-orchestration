import { test, expect } from '@playwright/test'

test.describe('Integration Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace')
  })

  test('shows Integration Marketplace heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Integration Marketplace/i })).toBeVisible()
  })

  test('shows Total Installs or stats', async ({ page }) => {
    await expect(page.getByText(/Total Installs|Discover and install/i).first()).toBeVisible()
  })

  test('has category tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /All|Featured|CRM|Marketing|Support/i }).first()).toBeVisible()
  })

  test('shows integration cards or list', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/Search/i).or(page.getByRole('button', { name: /Install/i })).or(page.getByText(/No integrations/i)).first(),
    ).toBeVisible({ timeout: 8_000 })
  })
})
