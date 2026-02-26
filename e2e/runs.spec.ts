import { test, expect } from '@playwright/test'

test.describe('Runs history', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/runs')
  })

  test('shows Run History heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Run History/i })).toBeVisible({ timeout: 10_000 })
  })

  test('has run list or filters', async ({ page }) => {
    await expect(
      page.getByText(/Completed|Failed|Running|Status|Agent/i).or(page.locator('[data-slot="card"]')).or(page.getByRole('combobox')).first(),
    ).toBeVisible({ timeout: 8_000 })
  })
})
