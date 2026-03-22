# Code Review: PR #6

## 1. Executive Summary

| Category         | Status | Summary                                                                                                                                                  |
| :--------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tech Stack**   | ⚠️     | Next.js 15 migrations expose the `searchParams` Promise unawaited in Suspense, and NextAuth client functions behavior requires different error handling. |
| **Architecture** | ✅     | Cross-platform navigation and routing correctly decouple the auth domain via standard redirects.                                                         |
| **Security**     | ✅     | `auth-redirect.ts` safely prevents open-redirect vulnerability by strictly allowlisting the ASAP Protocol and `baseUrl`.                                 |
| **Tests**        | ⚠️     | E2E tests exhibit anti-patterns (flaky `.or()` chains) that give a false sense of security without isolated fixtures.                                    |

> **General Feedback:** The PR successfully completes the SSO routing, design alignment, and core component tests. However, critical resilience issues in the environment schema definition and deterministic E2E testing must be fixed before deploying.

## 2. Required Fixes (Must Address Before Merge)

_These issues block the PR from being "Production Ready"._

### 1. Zod Schema Boot Crash on Empty String Environment Variables

- **Location:** `src/lib/env-schema.ts:4`
- **Problem:** The zod validation chain `z.string().url().optional().default(...)` will fail parsing if `NEXT_PUBLIC_ASAP_PROTOCOL_URL=""` (empty string) is provided in `.env` or CI. `optional()` only permits `undefined`. This causes Next.js to crash at build time and on boot up in production.
- **Rationale (Expert View):** Environment variables are frequently parsed as empty strings in deployment systems when unset or intentionally disabled. A resilient app should treat an empty string URL as a fallback trigger rather than an immediate fatal application error.
- **Fix Suggestion:**
  ```typescript
  export const envSchema = z.object({
    NEXT_PUBLIC_ASAP_PROTOCOL_URL: z
      .string()
      // Transform empty string to undefined so .optional().default() works
      .transform((v) => (v === "" ? undefined : v))
      .pipe(z.string().url().optional().default("https://asap-protocol.vercel.app")),
  })
  ```

### 2. E2E Flakiness & Locator Strict Mode Violations

- **Location:** `e2e/marketplace.spec.ts:16-18`
- **Problem:**
  1. The `has search input` test fails due to a Playwright Strict Mode violation (`getByPlaceholder(/search agents/i)` matches two elements on the page).
  2. The `shows agent cards` test uses an `or()` chain assertion: `Showing \d+ agent` OR `No agents registered` OR `Failed to`.
- **Rationale (Expert View):** Tests with multiple fallback outcomes don't guarantee that the application behaves correctly under specific conditions. If the fetch request fails, the test passes. Also, broad locator expressions that resolve to multiple inputs (e.g., matching a mobile vs desktop search bar at the same time) will crash Playwright.
- **Fix Suggestion:**

  ```typescript
  test("has search input", async ({ page }) => {
    // Use .first() or a more precise locator if there are mobile/desktop variants
    await expect(page.getByPlaceholder(/search agents/i).first()).toBeVisible()
  })

  test("shows agent cards (mocked API)", async ({ page }) => {
    // Isolate tests using Playwright's network routing to return predictable fixtures
    await page.route("**/api/registry**", async (route) => {
      await route.fulfill({ json: { agents: [{ name: "MockAgent", version: "1.0.0" }] } })
    })
    await page.goto("/marketplace")
    await expect(page.getByText("MockAgent")).toBeVisible()
  })
  ```

## 3. Tech-Specific Bug Hunt (Deep Dive)

_Issues specific to Next.js/FastAPI/Pydantic/Asyncio._

- **Next.js 15: Server Components Blocking on `searchParams` Without Suspense**
  _In `src/app/login/page.tsx`:_ Awaiting `searchParams` at the top level of the Page component blocks the execution of the UI shell until the request fully evaluates. To increase server-side responsiveness, move `fromAsap` parsing to a Client Component using `useSearchParams` hook, and wrap that usage in a `<Suspense>` boundary. That allows Next.js 15 to stream the static `LoginPage` skeleton down immediately.
- **React + NextAuth: Effect Handling on `signIn`**
  _In `src/components/auth/login-form.tsx:18`:_ `await signIn("github", { callbackUrl: "/" })` triggers a full window navigation because the default NextAuth behavior redirects the browser. In case `signIn` fails, it sometimes resolves `{ error: "...", ok: false }` instead of rejecting/throwing. The `try/catch` might not trigger, causing `setIsLoading(false)` and `toast.error` to be skipped completely.

## 4. Improvements & Refactoring (Highly Recommended)

_Code is correct, but can be cleaner/faster/safer._

- [ ] **Optimization**: The `searchParams` prop logic in `LoginPage` creates a dynamic route. By moving this directly to the client (`const searchParams = useSearchParams(); const fromAsap = searchParams.get('from') === 'asap'`), Next.js can fully cache the page HTML at build time if there's no other dynamic IO.
- [ ] **Readability**: Extract the `fromAsap` contextual messages in `LoginForm` to a constant or dictionary at the top to keep markup concise and readable.

## 5. Verification Steps

_How should the developer verify the fixes?_

> Run: `NEXT_PUBLIC_ASAP_PROTOCOL_URL="" npm run build && npx vitest run tests/lib/env-schema.test.ts` to ensure empty strings don't crash.
> Run: `npx playwright test e2e/marketplace.spec.ts` after isolating the mock API calls to ensure it deterministically tests success and failure paths individually.
