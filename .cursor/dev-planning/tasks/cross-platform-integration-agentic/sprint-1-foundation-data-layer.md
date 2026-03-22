# Sprint 1: Foundation — Data Layer

> **Roadmap**: [Cross-Platform Integration](../../../product-specs/roadmap/cross-platform-integration-agentic.md) · **PRD**: [prd-cross-platform-integration-agentic](../../../product-specs/prd-cross-platform-integration-agentic.md)
> **Branch**: `feat/cross-platform-data-layer`
> **PR Title**: `feat(registry): add data layer for ASAP Registry integration`
> **Depends on**: Nothing (first sprint)
> **Enables**: Sprint 2 (UI components import types and fetch functions from this sprint)

---

## Relevant Files

| File                                | Purpose                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `.env.example`                      | Cross-platform env vars: `NEXT_PUBLIC_ASAP_PROTOCOL_URL`, `NEXT_PUBLIC_REGISTRY_URL`, `NEXT_PUBLIC_REVOKED_URL` |
| `src/types/registry.d.ts`           | TypeScript types: `RegistryAgent`, `RevokedAgent`, `RegistryResponse`, `RevokedResponse`, `FetchRegistryResult` |
| `src/lib/registry-schema.ts`        | Zod schemas for registry and revoked responses (with `.passthrough()` for forward-compatibility)                |
| `src/lib/registry.ts`               | `fetchRegistryAgents()`, `getRegistryCategories()`; uses env URLs with fallbacks                                |
| `tests/lib/registry-schema.test.ts` | Unit tests for Zod schema validation                                                                            |
| `tests/lib/registry.test.ts`        | Unit tests for fetch and categories (mocked fetch)                                                              |

---

## Pre-flight Checklist

Before starting: clean branch, `npm install`, `npm run build`, `npx vitest run`.

---

## Task 1.0: Environment Variables & Configuration

**Trigger:** Manual setup — must happen first.
**Enables:** All other tasks (registry URLs, ASAP Protocol navigation, SSO).
**Depends on:** Nothing.

**Acceptance Criteria:**

- `.env.example` contains `NEXT_PUBLIC_ASAP_PROTOCOL_URL`, `NEXT_PUBLIC_REGISTRY_URL`, `NEXT_PUBLIC_REVOKED_URL`.
- `npm run build` succeeds with these env vars undefined (graceful fallback in consuming code).

---

- [x] 1.1 Add cross-platform environment variables to `.env.example`
  - **File**: `.env.example` (modify existing)
  - **What**: Append a new section at the end of the file with three environment variables.
  - **Why**: All cross-app URLs must come from env vars (ADR-26) — no hardcoded domains. This enables future custom domain migration with zero code changes.
  - **Pattern**: Follow existing format (comment above each var).
  - **Verify**: `grep "NEXT_PUBLIC_ASAP_PROTOCOL_URL" .env.example` returns a match.

  **Integration**: These env vars are consumed by:
  - `src/lib/registry.ts` (Task 2.3) — uses `NEXT_PUBLIC_REGISTRY_URL` and `NEXT_PUBLIC_REVOKED_URL`
  - `src/components/sidebar.tsx` (Sprint 2, Task 4.0) — uses `NEXT_PUBLIC_ASAP_PROTOCOL_URL`
  - `src/auth.ts` (Sprint 3, Task 6.0) — uses `NEXT_PUBLIC_ASAP_PROTOCOL_URL`

---

## Task 2.0: Registry Data Layer (Types, Schema, Fetch)

**Trigger:** Task 1.0 complete (env vars exist in `.env.example`).
**Enables:** Sprint 2, Task 3.0 (UI components consume these types and fetch functions).
**Depends on:** Task 1.0.

**Acceptance Criteria:**

- `RegistryAgent` type matches PRD §FR-1.3 schema.
- Zod schema validates valid registry JSON and rejects malformed data.
- `fetchRegistryAgents()` returns `RegistryAgent[]` excluding revoked agents.
- `fetchRegistryAgents()` returns `{ agents: [], error: "..." }` on network failure.
- `npx vitest run tests/lib/registry-schema.test.ts` passes.
- `npx vitest run tests/lib/registry.test.ts` passes.

---

- [x] 2.1 Create `RegistryAgent` TypeScript type definitions
  - **File**: `src/types/registry.d.ts` (create new)
  - **What**: Create type declarations for the ASAP Protocol's agent registry data.
  - **Why**: Single source of truth for the data contract. All UI components and fetch functions import from here.
  - **Pattern**: Follow `src/types/next-auth.d.ts` for `.d.ts` conventions in this project.
  - **Verify**: `npx tsc --noEmit` passes without errors referencing `RegistryAgent`.

  **Integration**: Imported by `src/lib/registry-schema.ts` (Task 2.2), `src/lib/registry.ts` (Task 2.3), and all `src/components/registry/*` components (Sprint 2).

---

- [x] 2.2 Create Zod validation schemas for registry data
  - **File**: `src/lib/registry-schema.ts` (create new)
  - **What**: Create Zod schemas that validate raw JSON from GitHub. Use `.passthrough()` on object schemas for forward-compatibility (new fields from ASAP Protocol won't break validation).
  - **Why**: Prevents malformed data from crashing the UI. If ASAP Protocol adds a new field, `.passthrough()` lets it through without failing validation.
  - **Pattern**: The project already has `zod` installed (check: `grep zod package.json`). Standard Zod schema pattern.
  - **Verify**: `npx vitest run tests/lib/registry-schema.test.ts` passes.

  **Integration**: Imported by `src/lib/registry.ts` (Task 2.3) to validate fetch responses.

---

- [x] 2.3 Create registry fetch functions
  - **File**: `src/lib/registry.ts` (create new)
  - **What**: Create async functions that fetch, validate, and filter registry data. Uses ISR with `revalidate: 60` for Next.js caching.
  - **Why**: Server-side data fetching for the registry page. Revoked agents must be filtered out. Errors must be handled gracefully (no page crash).
  - **Pattern**: Standard `fetch()` in Server Components. See `src/lib/db/agents.ts` for async function patterns in this project.
  - **Verify**: `npx vitest run tests/lib/registry.test.ts` passes.

  **Integration**: Called by `src/app/marketplace/page.tsx` (Sprint 2, Task 3.4) as a Server Component data source. The page calls `fetchRegistryAgents()` at the top level and passes `agents` to the client component.

---

- [x] 2.4 Write unit tests for registry schema
  - **File**: `tests/lib/registry-schema.test.ts` (create new)
  - **What**: Vitest tests for Zod schema validation with valid, invalid, and edge-case data.
  - **Why**: Schema validation is the first defense against ASAP Protocol changes breaking this app.
  - **Pattern**: Follow `tests/api/workflows.test.ts` for describe/it/expect structure.
  - **Verify**: `npx vitest run tests/lib/registry-schema.test.ts -v` — all tests pass.

  **IMPORTANT**: This test file does NOT need `// @vitest-environment jsdom` because it tests pure logic (no DOM).

---

- [x] 2.5 Write unit tests for registry fetch functions
  - **File**: `tests/lib/registry.test.ts` (create new)
  - **What**: Vitest tests that mock `fetch` globally and verify `fetchRegistryAgents()` and `getRegistryCategories()`.
  - **Why**: Verifies the data layer works before UI is built. Tests error handling and revocation filtering.
  - **Pattern**: Follow `tests/api/workflows.test.ts` for mocking patterns. Use `vi.stubGlobal()` to mock fetch.
  - **Verify**: `npx vitest run tests/lib/registry.test.ts -v` — all tests pass.

  **IMPORTANT**: This test file does NOT need `// @vitest-environment jsdom` because it tests pure logic (no DOM).

---

## Post-Sprint Verification

Run: `npx vitest run tests/lib/registry-schema.test.ts tests/lib/registry.test.ts -v && npx tsc --noEmit && npm run lint && npm run build && npx vitest run`. All must exit 0 before opening the PR.
