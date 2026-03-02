import { test as base } from "@playwright/test"
import type { Page } from "@playwright/test"

/**
 * Auth fixture: logs in before tests when E2E_TEST_EMAIL and E2E_TEST_PASSWORD are set.
 * Use for tests that require an authenticated session (e.g. builder canvas).
 * If credentials are not set, tests run unauthenticated (builder may show sign-in).
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.E2E_TEST_EMAIL
    const password = process.env.E2E_TEST_PASSWORD

    if (email && password) {
      await page.goto("/login")
      await page.getByLabel(/Email|email/i).fill(email)
      await page.getByLabel(/Password|password/i).fill(password)
      await page.getByRole("button", { name: /Sign in|Log in|Submit/i }).click()
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 })
    }

    await use(page)
  },
})

export { expect } from "@playwright/test"
