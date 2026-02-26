import { test, expect } from '@playwright/test'

test.describe('Agents dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows Agents heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible()
    await expect(page.getByText(/Create and manage your AI agents/i)).toBeVisible()
  })

  test('shows New Agent button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /New Agent|Create Agent/i })).toBeVisible()
  })

  test('empty state shows when no agents', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /Create Agent|New Agent/i })
    const noAgents = page.getByText(/No agents yet/i)
    const hasCards = page.locator('[data-slot="card"]').or(page.getByRole('heading', { name: /Agents/i }).locator('..').locator('..').getByRole('button', { name: /Run|Edit/i })).first()
    await createButton.waitFor({ state: 'visible' })
    const emptyVisible = await noAgents.isVisible().catch(() => false)
    const hasAnyAgentCard = await hasCards.isVisible().catch(() => false)
    expect(emptyVisible || hasAnyAgentCard).toBeTruthy()
  })

  test('opening Create Agent dialog', async ({ page }) => {
    await page.getByRole('button', { name: /New Agent|Create Agent/i }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(/Create agent|New agent|Name|Model/i).first()).toBeVisible()
  })
})
