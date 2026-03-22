# Cross-Platform Integration — Agent Builder — Roadmap

> **Source PRD**: [prd-cross-platform-integration-agentic.md](../prd-cross-platform-integration-agentic.md)
> **Sprint docs**: [.cursor/dev-planning/tasks/cross-platform-integration-agentic/](../../dev-planning/tasks/cross-platform-integration-agentic/)
> **Generated**: 2026-03-06
> **Execution Context**: Step 1 of cross-repo integration (this repo deploys BEFORE asap-protocol)

---

## Sprint Overview

| Sprint | Branch                           | Scope                                           | Files                     | Est. Lines Changed       | PR Description                                                    |
| ------ | -------------------------------- | ----------------------------------------------- | ------------------------- | ------------------------ | ----------------------------------------------------------------- |
| **1**  | `feat/cross-platform-data-layer` | Env vars + Types + Schema + Fetch + Unit Tests  | 6 new/modified            | ~250 added               | Foundation: data layer for ASAP Registry integration              |
| **2**  | `feat/registry-ui-navigation`    | Registry UI + Sidebar + Delete old marketplace  | 5 new/modified, 9 deleted | ~300 added, ~500 deleted | Replace Marketplace with ASAP Registry; update sidebar navigation |
| **3**  | `feat/sso-design-tests`          | SSO auth + Design audit + Component tests + E2E | 7 new/modified            | ~300 added               | SSO cross-app auth, design alignment, full test coverage          |

---

## Dependencies Between Sprints

```
Sprint 1 (Data Layer)
  │
  ├──► Sprint 2 (Registry UI + Sidebar + Cleanup)
  │       Needs: RegistryAgent type, fetchRegistryAgents(), Zod schema
  │
  └──► Sprint 3 (Auth + Design + Tests)
          Needs: env vars (NEXT_PUBLIC_ASAP_PROTOCOL_URL)
          Needs: Sprint 2 complete (components exist to test)
```

- **Sprint 1 → Sprint 2**: Sprint 2 imports types and fetch functions created in Sprint 1.
- **Sprint 1 → Sprint 3**: Sprint 3 uses env vars defined in Sprint 1.
- **Sprint 2 → Sprint 3**: Sprint 3 tests components created in Sprint 2, and applies design tweaks.
- **Sprint 3 is the final gate** before deploying to Vercel (Step 1.10 in PRD §11).

---

## Sprint Files

1. [Sprint 1: Foundation — Data Layer](../../dev-planning/tasks/cross-platform-integration-agentic/sprint-1-foundation-data-layer.md)
   - Tasks 1.0, 2.0
2. [Sprint 2: Registry UI + Sidebar + Cleanup](../../dev-planning/tasks/cross-platform-integration-agentic/sprint-2-registry-ui-sidebar-cleanup.md)
   - Tasks 3.0, 4.0, 5.0
3. [Sprint 3: Auth + Design + Tests](../../dev-planning/tasks/cross-platform-integration-agentic/sprint-3-auth-design-tests.md)
   - Tasks 6.0, 7.0, 8.0

---

## Full File Inventory

### Files to Create

| File                                                | Sprint | Description                        |
| --------------------------------------------------- | ------ | ---------------------------------- |
| `src/types/registry.d.ts`                           | 1      | TypeScript types for RegistryAgent |
| `src/lib/registry-schema.ts`                        | 1      | Zod validation schemas             |
| `src/lib/registry.ts`                               | 1      | Fetch functions for registry data  |
| `tests/lib/registry-schema.test.ts`                 | 1      | Unit tests for Zod schemas         |
| `tests/lib/registry.test.ts`                        | 1      | Unit tests for fetch functions     |
| `src/components/registry/registry-agent-card.tsx`   | 2      | Agent card component               |
| `src/components/registry/registry-agent-detail.tsx` | 2      | Agent detail dialog                |
| `src/components/registry/registry-content.tsx`      | 2      | Search/filter/grid container       |
| `tests/components/registry-agent-card.test.tsx`     | 3      | Unit tests for agent card          |
| `tests/components/registry-content.test.tsx`        | 3      | Unit tests for search/filter       |
| `tests/components/sidebar.test.tsx`                 | 3      | Unit tests for sidebar changes     |

### Files to Modify

| File                                 | Sprint | Change                                             |
| ------------------------------------ | ------ | -------------------------------------------------- |
| `.env.example`                       | 1      | Add 3 cross-platform env vars                      |
| `src/app/marketplace/page.tsx`       | 2      | Full rewrite → Server Component                    |
| `src/components/sidebar.tsx`         | 2      | Marketplace → Registry, add ASAP link, footer link |
| `src/auth.ts`                        | 3      | Add `redirect` callback                            |
| `src/app/login/page.tsx`             | 3      | Handle `?from=asap` param                          |
| `src/components/auth/login-form.tsx` | 3      | Contextual ASAP message                            |
| `e2e/marketplace.spec.ts`            | 3      | Rewrite for registry                               |

### Files to Delete (Sprint 2)

| File                                                           | Reason                                              |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `src/components/integration-marketplace.tsx`                   | Replaced by `registry-content.tsx`                  |
| `src/components/marketplace-card.tsx`                          | Replaced by `registry-agent-card.tsx`               |
| `src/components/integration-detail-dialog.tsx`                 | Replaced by `registry-agent-detail.tsx`             |
| `src/lib/marketplace-store.ts`                                 | In-memory store (Salesforce, etc.) no longer needed |
| `src/lib/marketplace-types.ts`                                 | Replaced by `src/types/registry.d.ts`               |
| `src/app/api/marketplace/integrations/route.ts`                | API route obsolete                                  |
| `src/app/api/marketplace/integrations/[id]/route.ts`           | API route obsolete                                  |
| `src/app/api/marketplace/integrations/[id]/install/route.ts`   | API route obsolete                                  |
| `src/app/api/marketplace/integrations/[id]/uninstall/route.ts` | API route obsolete                                  |

---

## CRITICAL CONSTRAINTS

1. **DO NOT modify** `/builder` page or anything under `src/components/builder/`.
2. All cross-app URLs come from **environment variables** (ADR-26). No hardcoded domains.
3. This repo **MUST deploy before** asap-protocol ships its changes (cross-repo Step 1 → Step 2).
4. Test framework: **Vitest** (unit) + **Playwright** (E2E). Both already installed.
5. Component tests need `// @vitest-environment jsdom` at the top (vitest.config.ts defaults to `node`).
