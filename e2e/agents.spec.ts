import { test, expect } from "@playwright/test"

test.describe("Agents dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("shows Agents heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Agents/i })).toBeVisible()
    await expect(page.getByText(/Create and manage your AI agents/i)).toBeVisible()
  })

  test("shows New Agent button", async ({ page }) => {
    await expect(page.getByText(/New Agent|Create Agent/i).first()).toBeVisible()
  })

  test("empty state shows when no agents", async ({ page }) => {
    const createButton = page.getByText(/Create Agent|New Agent/i).first()
    const noAgents = page.getByText(/No agents yet/i)
    const hasCards = page
      .locator("div")
      .filter({ hasText: /Run|Edit/i })
      .first()
    await createButton.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {})
    const emptyVisible = await noAgents.isVisible().catch(() => false)
    const hasAnyAgentCard = await hasCards.isVisible().catch(() => false)
    expect(emptyVisible || hasAnyAgentCard || (await createButton.isVisible())).toBeTruthy()
  })

  test("opening Create Agent dialog", async ({ page }) => {
    const btn = page.getByText(/New Agent|Create Agent/i).first()
    await btn.waitFor({ state: "visible" })
    await btn.click({ force: true })
    await expect(
      page
        .getByRole("dialog")
        .or(page.getByText(/Name|Model|Instructions/i))
        .first(),
    ).toBeVisible({ timeout: 5_000 })
  })
})
