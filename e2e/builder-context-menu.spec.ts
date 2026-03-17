import { test, expect } from "@playwright/test"

test.describe("Builder Context Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder")
    const toolbar = page.getByTestId("builder-toolbar")
    const signInPrompt = page.getByText("Sign in to access the workflow builder")
    const loadingPrompt = page.getByText("Loading workflow")
    const canvasOrButton = page.locator(".react-flow").or(page.getByRole("button")).first()
    await expect(toolbar.or(signInPrompt).or(loadingPrompt).or(canvasOrButton).first()).toBeVisible(
      { timeout: 30_000 },
    )
    if (await signInPrompt.isVisible()) {
      test.skip(true, "Builder context menu tests require authenticated session")
    }
    const canvas = page.locator(".react-flow")
    try {
      await expect(canvas).toBeVisible({ timeout: 10_000 })
    } catch {
      test.skip(true, "Canvas not available (requires workflow data from database)")
    }
  })

  test("should show pane context menu on right-click", async ({ page }) => {
    const canvas = page.locator(".react-flow__pane")
    const box = await canvas.boundingBox()
    if (!box) throw new Error("Canvas not found")

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" })

    const pasteItem = page.getByRole("menuitem", { name: /Paste/i })
    await expect(pasteItem).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole("menuitem", { name: /Auto Layout/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /Add Frame/i })).toBeVisible()

    await page.mouse.click(10, 10)
    await expect(pasteItem).not.toBeVisible()
  })

  test("should show node context menu on right-click", async ({ page }) => {
    let node = page.locator(".react-flow__node").first()

    if (!(await node.isVisible())) {
      await page.getByText("Agent", { exact: true }).first().click()
      await expect(node).toBeVisible({ timeout: 10000 })
    }

    const nodeBox = await node.boundingBox()
    if (!nodeBox) throw new Error("Node found but no bounding box")

    await page.mouse.click(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2, {
      button: "right",
    })

    await expect(page.getByRole("menuitem", { name: /Duplicate/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole("menuitem", { name: /Copy/i })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /Delete/i })).toBeVisible()
  })

  test("should have no console errors when opening context menus", async ({ page }) => {
    const errors: string[] = []
    const knownErrors = ["Content Security Policy", "Connection closed", "THREE", "WebGL"]
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text()
        if (!knownErrors.some((k) => text.includes(k))) {
          errors.push(text)
        }
      }
    })
    page.on("pageerror", (error) => {
      if (!knownErrors.some((k) => error.message.includes(k))) {
        errors.push(error.message)
      }
    })

    await page.locator(".react-flow__pane").click({ button: "right" })

    const node = page.locator(".react-flow__node").first()
    if (await node.isVisible()) {
      await node.click({ button: "right" })
    }

    expect(errors).toEqual([])
  })
})
