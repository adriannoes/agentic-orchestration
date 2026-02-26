import { test, expect } from '@playwright/test'

test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder')
  })

  test('builder toolbar with Save or Run Workflow is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save|Run Workflow/i }).first()).toBeVisible({ timeout: 12_000 })
  })

  test('canvas area is present', async ({ page }) => {
    const canvas = page.locator('.canvas-grid').or(page.locator('[data-slot="resizable-panel-group"]')).first()
    await expect(canvas).toBeVisible({ timeout: 10_000 })
  })

  test('node sidebar or node types are visible', async ({ page }) => {
    await expect(page.getByText(/Trigger|Agent|Tool|Node/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
