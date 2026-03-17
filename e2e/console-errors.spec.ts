import { test, expect } from "@playwright/test"

const ROUTES = [
  "/",
  "/builder",
  "/connectors",
  "/login",
  "/marketplace",
  "/mcp",
  "/runs",
  "/settings",
  "/setup",
  "/signup",
  "/templates",
  "/tools",
]

test.describe("Console Errors & Warnings", () => {
  for (const route of ROUTES) {
    test(`Route: ${route} should have no console errors`, async ({ page }) => {
      const errors: string[] = []
      const warnings: string[] = []

      const knownErrors = [
        "/_vercel/speed-insights/script.js",
        "/_vercel/insights/script.js",
        "THREE.WebGLRenderer",
        "WebGL context could not be created",
        "Error creating WebGL context",
        "BindToCurrentSequence",
        "Content Security Policy",
        "Connection closed",
      ]

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text()
          if (
            !text.includes("Failed to load resource") &&
            !knownErrors.some((k) => text.includes(k))
          ) {
            errors.push(text)
          }
        }
        if (msg.type() === "warning") warnings.push(msg.text())
      })

      page.on("pageerror", (error) => {
        const text = error.message
        const isKnownWebGLOrSequence =
          text.includes("WebGL context could not be created") ||
          text.includes("Error creating WebGL context") ||
          text.includes("THREE.WebGLRenderer") ||
          text.includes("BindToCurrentSequence")
        if (!knownErrors.some((k) => text.includes(k)) && !isKnownWebGLOrSequence) {
          errors.push(error.message)
        }
      })

      await page.goto(route)
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {})

      if (errors.length > 0 || warnings.length > 0) {
        console.log(`\n--- Route: ${route} ---`)
        if (errors.length > 0) console.log("ERRORS:", errors)
        if (warnings.length > 0) console.log("WARNINGS:", warnings)
      }

      expect(errors).toEqual([])
    })
  }
})
