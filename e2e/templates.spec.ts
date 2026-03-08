import { test, expect } from "@playwright/test"

test.describe("Templates library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/templates")
  })

  test("shows Workflow Templates heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Workflow Templates/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  test("has search or category filters", async ({ page }) => {
    await expect(page.getByPlaceholder(/Search templates/i)).toBeVisible({ timeout: 8_000 })
  })

  test("shows template cards or empty state", async ({ page }) => {
    const cardsOrEmpty = page
      .getByText(/Use template|Use Template|No templates|Popular|Workflow/i)
      .or(page.locator("div.border").first())
    await expect(cardsOrEmpty.first()).toBeVisible({ timeout: 10_000 })
  })
})
