import { test, expect } from "@playwright/test"

test.describe("ASAP Agent Registry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marketplace")
  })

  test("shows ASAP Agent Registry heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /ASAP Agent Registry/i })).toBeVisible()
    await expect(page.getByText(/Discover agents registered on the ASAP Protocol/i)).toBeVisible()
  })

  test("has category tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /All/i })).toBeVisible()
  })

  test("shows registry cards or empty state", async ({ page }) => {
    await expect(
      page
        .getByPlaceholder(/Search agents/i)
        .or(page.getByText(/No agents registered yet/i))
        .or(page.getByRole("button", { name: /View Details/i }))
        .first(),
    ).toBeVisible({ timeout: 8_000 })
  })
})
