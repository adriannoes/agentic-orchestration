import { test, expect } from '@playwright/test'

test.describe('Connector Registry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connectors')
  })

  test('shows Connector Registry heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Connector Registry/i })).toBeVisible()
    await expect(page.getByText(/Manage all your data and tool connections/i)).toBeVisible()
  })

  test('shows stats cards (Connected, Available, Attention)', async ({ page }) => {
    await expect(page.getByText(/Connected|Available|Attention/i).first()).toBeVisible()
  })

  test('has search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search connectors/i)).toBeVisible()
  })

  test('has category tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /All|AI|Storage|MCP/i }).first()).toBeVisible()
  })

  test('shows connector grid or empty state', async ({ page }) => {
    await expect(
      page.getByText(/No connectors found/i).or(page.locator('[data-slot="card"]')).or(page.getByRole('button', { name: /Connect/i })).first(),
    ).toBeVisible({ timeout: 8_000 })
  })
})
