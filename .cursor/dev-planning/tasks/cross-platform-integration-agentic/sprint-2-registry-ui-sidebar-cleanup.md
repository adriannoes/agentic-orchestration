# Sprint 2: Registry UI + Sidebar + Cleanup

> **Roadmap**: [Cross-Platform Integration](../../../product-specs/roadmap/cross-platform-integration-agentic.md) · **PRD**: [prd-cross-platform-integration-agentic](../../../product-specs/prd-cross-platform-integration-agentic.md)
> **Branch**: `feat/registry-ui-navigation`
> **PR Title**: `feat(registry): replace marketplace with ASAP Registry; update sidebar navigation`
> **Depends on**: Sprint 1 (data layer: types, schema, fetch functions)
> **Enables**: Sprint 3 (components exist to test; old code is gone)

---

## Pre-flight Checklist

Before starting, verify: Sprint 1 merged to main, branch created, files exist, tests pass, build works.

---

## Task 3.0: Registry UI Components & Page Rewrite

**Trigger:** Sprint 1 complete (types, schema, fetch functions available).
**Enables:** Task 5.0 (old marketplace code can be deleted after new page works).
**Depends on:** Sprint 1 — `RegistryAgent` type from `src/types/registry.d.ts`, `fetchRegistryAgents()` from `src/lib/registry.ts`.

**Acceptance Criteria:**

- `/marketplace` route renders real ASAP agents from `registry.json`.
- Agent cards display: name, description, version, category, tags, auth lock icon.
- Search by name/description works (case-insensitive, client-side).
- Filter by category works (tab-based).
- Clicking a card opens a detail dialog with full agent info.
- Revoked agents are NOT displayed.
- Page handles errors gracefully (friendly message, no crash).

---

- [x] 3.1 Create `RegistryAgentCard` component
  - **File**: `src/components/registry/registry-agent-card.tsx`
  - **What**: Client component that renders a single agent card. Uses Shadcn `Card`, `Badge`, `Button`.
  - **Why**: Consistent agent presentation for the registry grid (PRD §6.2).
  - **Integration**: Rendered by `RegistryContent` (Task 3.3) inside a responsive grid.

---

- [x] 3.2 Create `RegistryAgentDetail` dialog component
  - **File**: `src/components/registry/registry-agent-detail.tsx`
  - **What**: Client component using Shadcn `Dialog` that displays full agent details.
  - **Why**: Users need to evaluate agents before integrating them (PRD §6.3).
  - **Integration**: Rendered by `RegistryContent` (Task 3.3). Receives `agent`, `open`, `onOpenChange` props.

---

- [x] 3.3 Create `RegistryContent` client component (search + filter + grid)
  - **File**: `src/components/registry/registry-content.tsx`
  - **What**: Client component that receives `agents` and `categories` as props and provides search, category filtering, and a grid of `RegistryAgentCard` components.
  - **Why**: Client-side filtering provides instant responsiveness (< 100ms target, PRD §7).
  - **Integration**: Rendered by `src/app/marketplace/page.tsx` (Task 3.4) with `agents` and `categories` props.

---

- [x] 3.4 Rewrite `marketplace/page.tsx` as Server Component
  - **File**: `src/app/marketplace/page.tsx`
  - **What**: Server Component that fetches data via `fetchRegistryAgents()` and `getRegistryCategories()`, passes to `RegistryContent`.
  - **Why**: Server Component with ISR ensures fresh data without client-side fetch overhead (PRD §FR-1.2).
  - **Integration**: Imports from Sprint 1. Renders `RegistryContent` from Task 3.3.

---

## Task 4.0: Sidebar & Bidirectional Navigation

**Trigger:** Can start in parallel with Task 3.0.
**Enables:** Users can navigate back to ASAP Protocol (PRD US-2).
**Depends on:** Sprint 1 (env var `NEXT_PUBLIC_ASAP_PROTOCOL_URL`).

**Acceptance Criteria:**

- Sidebar shows "Registry" (Globe icon) instead of "Marketplace" (Store icon).
- Sidebar shows "ASAP Protocol" link with ExternalLink icon, after Settings, before footer.
- "Powered by ASAP protocol." footer text is a clickable `<a>` link.
- All items are visible in both collapsed and expanded sidebar states.

---

- [x] 4.1 Replace "Marketplace" with "Registry" and add ASAP Protocol link
  - **File**: `src/components/sidebar.tsx`
  - **What**: (1) Swap Marketplace→Registry in nav items, (2) add ASAP Protocol link section, (3) make footer clickable. Replace `Store` with `Globe` and `ExternalLink` in imports.
  - **Why**: Marketplace replaced by ASAP Registry (PRD §FR-1.1). Bidirectional navigation (PRD §FR-2.1, §FR-2.2).

---

- [x] 4.2 Verify mobile navigation accessibility
  - **File**: `src/components/sidebar.tsx`
  - **What**: At 375px viewport, ASAP Protocol icon and Registry icon visible and tappable.
  - **Why**: Mobile users must access back-navigation (PRD §FR-2.3).

---

## Task 5.0: Remove Old Marketplace Code

**Trigger:** Tasks 3.0 and 4.0 complete (new registry page works, sidebar updated).
**Enables:** Clean codebase.
**Depends on:** Task 3.4 and Task 4.1.

**Acceptance Criteria:**

- All 9 old marketplace files deleted.
- No remaining imports to deleted files.
- `npm run build` succeeds.
- `npx tsc --noEmit` passes.

---

- [x] 5.1 Delete old marketplace files
  - **Deleted**: `integration-marketplace.tsx`, `marketplace-card.tsx`, `integration-detail-dialog.tsx`, `src/app/api/marketplace/`, `marketplace-store.ts`, `marketplace-types.ts`
  - **Why**: Dead code. Replaced by Sprint 1 data layer + Task 3.0 UI components.

---

## Post-Sprint Verification

Run: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npx vitest run tests/lib/registry-schema.test.ts tests/lib/registry.test.ts`. Manually verify `/marketplace`, sidebar Registry/ASAP Protocol, footer clickable.

All commands must exit with code 0 before opening the PR.
