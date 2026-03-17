import { defineConfig, devices } from "@playwright/test"

// E2E_PORT: 3099 avoids conflict with dev on 3000. Set E2E_REUSE_SERVER=1 to reuse dev on 3000.
const E2E_PORT = process.env.E2E_REUSE_SERVER ? 3000 : Number(process.env.E2E_PORT) || 3099
const baseURL = `http://localhost:${E2E_PORT}`

process.env.AUTH_URL = baseURL
process.env.NEXT_PUBLIC_APP_URL = baseURL

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: "html",
  globalSetup: "./playwright.global-setup.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 15_000,
  },
  expect: {
    timeout: 10_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `PORT=${E2E_PORT} AUTH_URL=${baseURL} NEXT_PUBLIC_APP_URL=${baseURL} NODE_ENV=test PLAYWRIGHT_E2E=1 npm start`,
    url: baseURL,
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 60_000,
    env: (() => {
      const { NODE_OPTIONS: _, ...rest } = process.env
      return Object.fromEntries(
        Object.entries(rest).filter((entry): entry is [string, string] => entry[1] !== undefined),
      )
    })(),
  },
})
