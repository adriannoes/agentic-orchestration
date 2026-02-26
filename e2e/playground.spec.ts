import { test, expect } from '@playwright/test'

test.describe('Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground')
  })

  test('shows agent selector or placeholder', async ({ page }) => {
    await expect(page.getByText(/Select an agent|agent|Chat|Playground/i).first()).toBeVisible({ timeout: 12_000 })
  })

  test('has New Chat button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /New Chat/i })).toBeVisible({ timeout: 10_000 })
  })

  test('has message input or send area', async ({ page }) => {
    const input = page.getByPlaceholder(/Message|Type a message|Send/i).or(page.getByRole('textbox'))
    await expect(input.first()).toBeVisible({ timeout: 10_000 })
  })
})
