import { test, expect } from "@playwright/test"

test.describe("ASAP Agent Registry", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marketplace")
  })

  test("shows ASAP Agent Registry heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /ASAP Agent Registry/i })).toBeVisible()
  })

  test("shows registry description", async ({ page }) => {
    await expect(page.getByText(/Discover agents registered on the ASAP Protocol/i)).toBeVisible()
  })

  test("has search input", async ({ page }) => {
    await expect(page.getByPlaceholder(/search agents/i)).toBeVisible()
  })

  test("shows agent cards or empty state", async ({ page }) => {
    await expect(
      page
        .getByText(/Showing \d+ agent/i)
        .or(page.getByText(/No agents registered/i))
        .or(page.getByText(/Failed to/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("has category tabs with All tab", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /All/i })).toBeVisible()
  })
})

test.describe("Sidebar navigation", () => {
  test("shows ASAP Protocol link in sidebar", async ({ page }) => {
    await page.goto("/")
    const link = page.getByRole("link", { name: "Open ASAP Protocol" })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", /asap-protocol/)
  })

  test("shows Registry label in sidebar", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("Registry")).toBeVisible()
  })
})

test.describe("Login with ASAP context", () => {
  test("shows contextual message with ?from=asap", async ({ page }) => {
    await page.goto("/login?from=asap")
    await expect(
      page.getByText("Continue with GitHub to access Agent Builder from ASAP Protocol."),
    ).toBeVisible()
  })
})
