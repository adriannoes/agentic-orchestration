# Code Review: PR #4

## 1. Executive Summary

| Category         | Status | Summary                                                                                                 |
| :--------------- | :----- | :------------------------------------------------------------------------------------------------------ |
| **Tech Stack**   | ✅     | Well aligned with Next.js 15 data fetching standards (ISR).                                             |
| **Architecture** | ⚠️     | Solid data layer, but fail-open behavior on the revocation list introduces potential security risks.    |
| **Security**     | ⚠️     | "Fail Open" on revocation list fetch failure. Missing fetch timeouts could lead to resource exhaustion. |
| **Tests**        | ✅     | Excellent coverage of the unhappy paths and Zod schemas. Clean use of fixtures.                         |

> **General Feedback:** Excellent foundation for the ASAP Registry data layer. The use of Zod with `.passthrough()` is a great practice for forward compatibility. The test coverage is comprehensive. However, we need to address the fail-open security mechanism on the revocation list and add fetch timeouts before this goes to production.

## 2. Required Fixes (Must Address Before Merge)

_These issues block the PR from being "Production Ready"._

### Fail Open on Revocation List

- **Location:** `src/lib/registry.ts:39`
- **Problem:** If the `fetch(REVOKED_URL)` fails, the catch block logs a warning and proceeds with an empty `revokedIds` set. This "fails open", meaning revoked (potentially malicious) agents will be surfaced to users if the revocation endpoint is temporarily unreachable.
- **Rationale (Expert View):** In high-security systems, a failure to fetch a revocation list must "fail closed" (block access to all items or throw an error). Displaying revoked agents could compromise the ASAP Protocol's integrity. If high availability is preferred over strict security, document the risk. Otherwise, fail the entire request.
- **Fix Suggestion:**
  ```typescript
  } catch (error) {
    console.error("Failed to fetch revoked agents list", error)
    return { agents: [], error: "Security restriction: Unable to verify revocation list." }
  }
  ```

### Missing Fetch Timeouts (Blocking I/O)

- **Location:** `src/lib/registry.ts:14` and `src/lib/registry.ts:33`
- **Problem:** The `fetch` calls to external URLs (`raw.githubusercontent.com`) lack timeouts.
- **Rationale (Expert View):** In Next.js server components, a hanging external request will block the server-side render until the platform's maximum timeout (e.g., 10s-60s on Vercel). This leads to terrible UX and potential server thread exhaustion. Use `AbortSignal.timeout()`.
- **Fix Suggestion:**
  ```typescript
  const registryRes = await fetch(REGISTRY_URL, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(5000), // 5 second timeout
  })
  ```

## 3. Tech-Specific Bug Hunt (Deep Dive)

- **Next.js 15 Caching:** Explicitly bringing `next: { revalidate: 60 }` is correct for Next.js 15, as `fetch` is no longer cached by default. Great job avoiding that trap!
- **React 19 / Suspense:** Since this PR only introduces the data layer, Suspense boundaries are not yet implemented. **Actionable note for Sprint 2:** Ensure `fetchRegistryAgents` is wrapped in a `<Suspense>` boundary in `src/app/marketplace/page.tsx` so the whole page doesn't block while fetching.

## 4. Improvements & Refactoring (Highly Recommended)

- [ ] **Typing**: `tests/lib/registry.test.ts:151` uses `] as any)`. You can define the partial mock properly with `] as unknown as RegistryAgent[])` or just test with objects that include all minimally required fields to maintain 100% strict TypeScript.
- [ ] **Readability**: In `src/lib/registry.ts:36`, `revokedIds = new Set(revokedParsed.data.revoked_agents.map((r) => r.id))` is fine, but checking `!revokedRes.ok` early and returning/throwing would reduce nesting in the `try/catch` block.

## 5. Verification Steps

_How should the developer verify the fixes?_

> Run: `npm run lint && npx tsc --noEmit && npx vitest run tests/lib/registry.test.ts`
