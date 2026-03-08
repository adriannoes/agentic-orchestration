import { test, expect } from "@playwright/test"

test.describe("Builder Context Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder")
    await page.waitForLoadState("networkidle")
    // Wait for ReactFlow to be ready
    await expect(page.locator(".react-flow__renderer")).toBeVisible()
  })

  test("should show pane context menu on right-click", async ({ page }) => {
    // Get the bounding box of the canvas to click in the middle
    const canvas = page.locator(".react-flow__pane")
    const box = await canvas.boundingBox()
    if (!box) throw new Error("Canvas not found")

    // Right click in the middle of the canvas using mouse coordinates
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" })

    // Wait for menu to be visible (no hardcoded timeout)
    const pasteItem = page.getByRole("menuitem", { name: /Paste/i })
    await expect(pasteItem).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole("menuitem", { name: /Auto Layout/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /Add Frame/i })).toBeVisible()

    // Click outside to close
    await page.mouse.click(10, 10)
    await expect(pasteItem).not.toBeVisible()
  })

  test("should show node context menu on right-click", async ({ page }) => {
    // Ensure a node exists.
    let node = page.locator(".react-flow__node").first()

    if (!(await node.isVisible())) {
      // Click the "Agent" card in the sidebar to add one
      // Based on screenshot, "Agent" is visible in "Add Nodes"
      await page.getByText("Agent", { exact: true }).first().click()
      await expect(node).toBeVisible({ timeout: 10000 })
    }

    const nodeBox = await node.boundingBox()
    if (!nodeBox) throw new Error("Node found but no bounding box")

    // Right click on the node using mouse coordinates
    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2, {
      button: "right",
    })

    // Check if node context menu items are visible
    await expect(page.getByRole("menuitem", { name: /Duplicate/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole("menuitem", { name: /Copy/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /Delete/i })).toBeVisible()
  })

  test("should have no console errors when opening context menus", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (error) => {
      errors.push(error.message)
    })

    // Trigger pane menu
    await page.locator(".react-flow__pane").click({ button: "right" })

    // Trigger node menu
    const node = page.locator(".react-flow__node").first()
    if (await node.isVisible()) {
      await node.click({ button: "right" })
    }

    expect(errors).toEqual([])
  })
})
