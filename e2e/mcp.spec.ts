import { test, expect } from "@playwright/test"

test.describe("MCP Servers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mcp")
  })

  test("shows MCP Servers heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /MCP Servers/i })).toBeVisible()
    await expect(page.getByText(/Model Context Protocol/i)).toBeVisible()
  })

  test("MCP manager content is visible", async ({ page }) => {
    const content = page
      .getByText(/Add server|Server|Tools|Configure/i)
      .or(page.getByRole("button"))
      .first()
    await expect(content).toBeVisible({ timeout: 8_000 })
  })
})
