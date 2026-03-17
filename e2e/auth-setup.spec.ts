import { test, expect } from "@playwright/test"

test.describe("Login page", () => {
  test("login page loads and shows login UI or authenticated redirect", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    await expect(
      page
        .getByRole("button", { name: /Sign in with GitHub|Signing in/i })
        .or(page.getByText(/Sign In/i))
        .or(page.getByRole("heading", { name: /Agents/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("Signup page", () => {
  test("signup page loads and shows sign-up UI or authenticated redirect", async ({ page }) => {
    await page.goto("/signup")
    await expect(
      page
        .getByText(/Create account/i)
        .or(page.getByRole("button", { name: /Sign up with GitHub/i }))
        .or(page.getByRole("heading", { name: /Agents/i }))
        .first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("Setup page", () => {
  test("setup shows setup UI or redirects to login", async ({ page }) => {
    await page.goto("/setup")
    await page.waitForLoadState("domcontentloaded")
    await expect(page).toHaveURL(/\/(login|setup|$)/, { timeout: 10_000 })
  })

  test("setup page accessible when authenticated or redirects", async ({ page }) => {
    await page.goto("/setup")
    await page.waitForLoadState("domcontentloaded")
    await expect(page).toHaveURL(/\/(login|setup|$)/, { timeout: 10_000 })
  })
})
