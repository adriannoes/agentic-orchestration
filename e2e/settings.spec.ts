import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('shows Settings heading or panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10_000 })
  })

  test('settings form or options are visible', async ({ page }) => {
    await expect(page.getByRole('switch').first()).toBeVisible({ timeout: 8_000 })
  })
})
