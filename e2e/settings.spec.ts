import { test, expect } from "@playwright/test"

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings")
  })

  test("shows Settings heading or panel", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 10_000 })
  })

  test("settings form or options are visible", async ({ page }) => {
    await expect(page.getByRole("switch").first()).toBeVisible({ timeout: 8_000 })
  })

  test.describe("theme selector (Appearance)", () => {
    test("opens Appearance tab and shows Theme selector", async ({ page }) => {
      await page.getByRole("tab", { name: /Appearance/i }).click()
      const appearancePanel = page.getByRole("tabpanel").filter({ has: page.getByText("Theme") })
      await expect(appearancePanel.getByRole("combobox")).toBeVisible({ timeout: 5_000 })
    })

    test("switching theme to Light applies light class to document", async ({ page }) => {
      await page.getByRole("tab", { name: /Appearance/i }).click()
      const appearancePanel = page.getByRole("tabpanel").filter({ has: page.getByText("Theme") })
      await appearancePanel.getByRole("combobox").click()
      await page.getByRole("option", { name: "Light" }).click()
      await expect(page.locator("html")).toHaveClass(/light/, { timeout: 5_000 })
    })

    test("switching theme to Dark applies dark class to document", async ({ page }) => {
      await page.getByRole("tab", { name: /Appearance/i }).click()
      const appearancePanel = page.getByRole("tabpanel").filter({ has: page.getByText("Theme") })
      await appearancePanel.getByRole("combobox").click()
      await page.getByRole("option", { name: "Dark" }).click()
      await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5_000 })
    })
  })
})
