import { test, expect } from '@playwright/test'

test.describe('Tools library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools')
  })

  test('shows Tools Library heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Tools Library/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Browse and explore available tools/i)).toBeVisible()
  })

  test('has search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search tools/i)).toBeVisible({ timeout: 8_000 })
  })

  test('has category tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /all|web|data|code|utility/i }).first()).toBeVisible()
  })

  test('shows tools list or loading state', async ({ page }) => {
    const content = page.getByText(/Loading tools/i).or(page.locator('[data-slot="card"]').first()).or(page.getByText(/No tools/i))
    await expect(content).toBeVisible({ timeout: 10_000 })
  })
})
