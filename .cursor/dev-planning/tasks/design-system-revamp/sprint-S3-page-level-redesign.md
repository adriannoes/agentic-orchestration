# Sprint S3: Page-Level Redesign

> **Roadmap**: [Design System Revamp](./tasks-design-system-revamp-roadmap.md) · **Design System**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

> **Branch**: `feat/design-system-s3-page-redesign`
> **PR Title**: `feat(design): apply premium components to Agents, Registry, Settings, and secondary pages`
> **Depends on**: Sprint S2 (GlassContainer, BentoGrid, BackgroundPaths, AnimatedText, EmptyState components exist)
> **Enables**: Sprint S4 (auth pages), Sprint S5 (anti-boilerplate sweep builds on consistent pages)

---

## Relevant Files

| File                                              | Purpose                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/components/agents-dashboard.tsx`             | **Modified** — BentoGrid metrics, Skeleton loading, EmptyState, AnimatedText, hover-lift    |
| `src/app/marketplace/page.tsx`                    | **Modified** — BackgroundPaths header, AnimatedText heading, EmptyState for empty/error   |
| `src/components/registry/registry-agent-card.tsx` | **Modified** — hover-lift, fluid badges, micro-borders, transition-all                      |
| `src/components/registry/registry-content.tsx`    | **Modify** — improved grid styling                                                          |
| `src/components/sidebar.tsx`                      | **Modified** — transition-all duration-200, border-l-2 border-primary active indicator      |
| `src/components/settings-panel.tsx`               | **Modified** — micro-borders, leading-snug headings                                         |
| `src/components/runs-history.tsx`                 | **Modified** — EmptyState, hover:bg-muted/50 row hover                                      |
| `src/components/connector-registry.tsx`           | **Modified** — Skeleton loading                                                             |
| `src/components/connector-card.tsx`               | **Modified** — hover-lift, micro-borders, transition-all duration-300                        |
| `src/components/templates-library.tsx`            | **Modified** — hover-lift, Skeleton, EmptyState                                              |
| `src/components/tools-library.tsx`                | **Modified** — hover-lift, Skeleton loading                                                  |
| `src/components/mcp-manager.tsx`                  | **Modified** — Skeleton loading, EmptyState                                                 |
| `e2e/app.spec.ts`                                 | **Verify** — existing E2E tests still pass after redesign                                   |
| `e2e/marketplace.spec.ts`                         | **Verify** — registry tests still pass                                                      |
| `e2e/agents.spec.ts`                              | **Verify** — agent dashboard tests still pass                                               |
| `src/components/builder/node-sidebar.tsx`         | **Modified** — bg-card/90, backdrop-blur-md, leading-snug                                     |
| `src/components/builder/node-properties-panel.tsx`| **Modified** — bg-card/90, backdrop-blur-md, leading-snug                                    |
| `src/components/builder/builder-canvas.tsx`      | **Modified** — GlassContainer toolbar                                                         |
| `src/components/builder/builder-command-palette.tsx` | **Modified** — bg-background/80, backdrop-blur-lg                                         |
| `src/components/builder/builder-context-menu.tsx` | **Modified** — micro-borders border-white/10                                                 |
| `src/components/builder/execution-monitor.tsx`    | **Modified** — bg-card/95, EmptyState, backdrop-blur-md                                      |
| `src/components/builder/version-history-panel.tsx`| **Modified** — bg-card/95, EmptyState, backdrop-blur-md                                      |

### Notes

- **CONTROLLED ALIGNMENT**: The `/builder` shell (panels and toolbar) is now included for visual alignment. Use standard tokens only.
- All changes are visual refinements — no functional logic changes, no API changes, no new routes.

- Preserve existing `data-testid` attributes and heading text so E2E tests pass.

---

## Task 1.0: Agents Dashboard Redesign ✅

**Trigger:** User visits `/` (Agents dashboard).
**Enables:** A premium first impression for all users of the Agent Builder.
**Depends on:** Sprint S2 (BentoGrid, BackgroundPaths, AnimatedText, EmptyState).

**Acceptance Criteria:**

- Dashboard shows BentoGrid metrics section (Total Agents, Latest Activity) above agent list.
- Page heading uses AnimatedText with spring animation.
- Loading state shows Skeleton grid (6 cards) instead of "Loading agents..." text.
- Empty state uses EmptyState component with icon, title, description, and CTA.
- Agent cards have hover lift (`-translate-y-0.5`) and micro-border styling.
- `npx playwright test e2e/agents.spec.ts` passes.

---

- [x] 1.1 Replace loading state with Skeleton grid
  - **File**: `src/components/agents-dashboard.tsx` (modify, lines 50–56)
  - **What**: Replace the current loading block:
    ```tsx
    // BEFORE:
    <div className="text-muted-foreground animate-pulse">Loading agents...</div>
    // AFTER:
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
      ))}
    </div>
    ```
    Import `Skeleton` from `@/components/ui/skeleton`.
  - **Why**: Design system §7.4 — never use text-based loading, always use shape-mapped Skeletons.
  - **Pattern**: Follow the pattern from ASAP's Sprint M2-2.3 skeleton specification.
  - **Verify**: Temporarily add `await new Promise(r => setTimeout(r, 3000))` in `fetchAgents` — verify skeleton grid appears on page load.

---

- [x] 1.2 Replace empty state with EmptyState component
  - **File**: `src/components/agents-dashboard.tsx` (modify, lines 71–84)
  - **What**: Replace the current inline empty state with:
    ```tsx
    <EmptyState
      icon={Bot}
      title="No agents yet"
      description="Create your first AI agent to get started"
      actionLabel="Create Agent"
      onAction={() => setCreateDialogOpen(true)}
    />
    ```
    Import `EmptyState` from `@/components/ui/empty-state`.
  - **Why**: Standardize empty states across all pages.
  - **Pattern**: The EmptyState component from Sprint S2.
  - **Verify**: Delete all agents (or mock an empty response) — verify the new EmptyState renders with the Bot icon and CTA button.

  **IMPORTANT**: The existing E2E test `e2e/agents.spec.ts` may assert on the "No agents yet" heading text. The EmptyState must render the title as `<h2>` to maintain heading semantics.

---

- [x] 1.3 Add AnimatedText to page heading
  - **File**: `src/components/agents-dashboard.tsx` (modify, line 62)
  - **What**: Replace `<h1 className="text-3xl font-bold">Agents</h1>` with:
    ```tsx
    <AnimatedText text="Agents" as="h1" className="text-3xl font-bold tracking-tight" />
    ```
    Import `AnimatedText` from `@/components/ui/animated-text`.
  - **Why**: Premium text reveals on page headings create a polished first impression.
  - **Verify**: Reload the page — the "Agents" heading should animate word-by-word (single word, so it's a simple fade-up-in).

---

- [x] 1.4 Add BentoGrid metrics section
  - **File**: `src/components/agents-dashboard.tsx` (modify, insert after heading block)
  - **What**: Add a metrics section between the heading and the agent list:
    ```tsx
    <BentoGrid className="mb-8">
      <BentoCard
        icon={Bot}
        title="Total Agents"
        value={agents.length}
        description="Configured agents in your workspace"
        className="md:col-span-2"
      />
      <BentoCard
        icon={History}
        title="Latest Activity"
        value={
          agents.length > 0
            ? formatDistanceToNow(new Date(agents[0].updatedAt), { addSuffix: true })
            : "—"
        }
        description="Most recent agent update"
      />
    </BentoGrid>
    ```
    Import `BentoGrid`, `BentoCard` from `@/components/ui/bento-grid`.
  - **Why**: Bento metrics add visual hierarchy and surface key information at a glance.
  - **Verify**: Agents dashboard shows 2 metric cards above the agent list. Hover on desktop triggers lift effect.

---

- [x] 1.5 Enhance agent cards with hover effects
  - **File**: `src/components/agents-dashboard.tsx` (modify, lines 86–151)
  - **What**: Update the `<Card>` component for each agent:
    1. Add `hover-lift` class (defined in S2, Task 2.2).
    2. Replace `hover:border-primary/40` with `hover:border-primary/20` (subtler).
    3. Add `transition-all duration-300` to the Card.
    4. Ensure badges use fluid badge styling: `bg-black/5 dark:bg-white/10 backdrop-blur-sm`.
  - **Why**: Agent cards should feel interactive and premium, matching the BentoCard pattern.
  - **Verify**: Hover on agent cards — subtle lift and border highlight. No heavy shadow.

---

## Task 2.0: Registry Page Redesign ✅

**Trigger:** User visits `/marketplace` (Registry page).
**Enables:** Consistent premium feel when browsing ASAP agents.
**Depends on:** Sprint S2 (AnimatedText, BackgroundPaths, EmptyState).

**Acceptance Criteria:**

- Registry page header has BackgroundPaths behind the heading.
- Registry heading uses AnimatedText.
- Empty/error states use EmptyState component.
- `npx playwright test e2e/marketplace.spec.ts` passes (heading text, search, tabs preserved).

---

- [x] 2.1 Add BackgroundPaths to Registry header
  - **File**: `src/app/marketplace/page.tsx` (modify, lines 10–17)
  - **What**: Wrap the header area in a `relative overflow-hidden` container and inject `<BackgroundPaths pathCount={4} />`:
    ```tsx
    <div className="relative mb-8 overflow-hidden py-8">
      <BackgroundPaths pathCount={4} className="opacity-50" />
      <div className="relative z-10">
        <AnimatedText
          text="ASAP Agent Registry"
          as="h1"
          className="text-3xl font-bold tracking-tight"
        />
        <p className="text-muted-foreground mt-2">
          Discover agents registered on the ASAP Protocol network
        </p>
      </div>
    </div>
    ```
  - **Why**: BackgroundPaths adds visual depth to the Registry page, matching the ASAP Protocol's browse page aesthetic.
  - **Verify**: Navigate to `/marketplace` — animated SVG paths appear behind the heading. Heading still reads "ASAP Agent Registry".

  **IMPORTANT**: The E2E test in `e2e/marketplace.spec.ts` checks for `getByRole("heading", { name: /ASAP Agent Registry/i })`. The heading text must remain identical.

---

- [x] 2.2 Replace error/empty states with EmptyState
  - **File**: `src/app/marketplace/page.tsx` (modify, lines 19–31)
  - **What**: Replace the inline error and empty divs with EmptyState:
    ```tsx
    // Error state:
    <EmptyState icon={AlertCircle} title="Failed to load registry" description={error} actionLabel="Try again" actionHref="/marketplace" />
    // Empty state:
    <EmptyState icon={Globe} title="No agents registered" description="No agents are currently registered on the ASAP Protocol network." />
    ```
  - **Why**: Consistent empty states across the app.
  - **Verify**: Check both states render correctly.

---

- [x] 2.3 Enhance registry agent cards with hover physics
  - **File**: `src/components/registry/registry-agent-card.tsx` (modify)
  - **What**: Add BentoCard-style hover effects to each agent card:
    1. Add `hover-lift` class to the root card.
    2. Add micro-border: `border-white/10 dark:border-white/10` (replace any heavy borders).
    3. Use fluid badges for category/tags: `bg-black/5 dark:bg-white/10 backdrop-blur-sm text-xs`.
    4. Add `transition-all duration-300`.
  - **Why**: Registry cards should match the premium card pattern used across all pages.
  - **Verify**: Hover on agent cards in the registry — subtle lift, no heavy shadow.

---

## Task 3.0: Sidebar Refinement ✅

**Trigger:** Sprint S2 complete.
**Enables:** Consistent navigation feel across the app.
**Depends on:** Sprint S2.

**Acceptance Criteria:**

- Sidebar nav items have smooth `transition-all duration-200`.
- Active state uses subtle indigo accent indicator.
- ASAP Protocol link has consistent styling.
- `npx playwright test e2e/app.spec.ts` passes (all sidebar navigation tests).

---

- [x] 3.1 Improve sidebar hover transitions
  - **File**: `src/components/sidebar.tsx` (modify, lines 77–91)
  - **What**: Update nav item Link styling:
    1. Change `transition-colors` to `transition-all duration-200`.
    2. Add subtle left-border indicator for active state: when `isActive`, add `border-l-2 border-primary` (or a pseudo-element).
    3. Ensure the ASAP Protocol link (lines 95–108) has matching transition styles.
  - **Why**: Transitions should feel smooth and consistent, not abrupt.
  - **Verify**: Navigate between sidebar items — transitions are smooth, active indicator visible.

---

## Task 4.0: Secondary Pages (Runs, Connectors, Templates, Tools, MCP) ✅

**Trigger:** Sprint S2 complete.
**Enables:** Full visual consistency across all non-builder pages.
**Depends on:** Sprint S2 (EmptyState, Skeleton, hover-lift utilities).

**Acceptance Criteria:**

- All secondary pages show Skeleton loading instead of text-based loaders.
- All secondary pages use EmptyState component when empty.
- Card-based pages (Connectors, Templates, Tools) have hover lift effects.
- Table-based pages (Runs) have `hover:bg-muted/50` row hover.
- `npx playwright test` (full suite) passes.

---

- [x] 4.1 Runs History: skeleton loading, empty state, row hover
  - **File**: `src/components/runs-history.tsx` (modify)
  - **What**:
    1. Replace any loading spinner/text with Skeleton rows:
       ```tsx
       Array.from({ length: 5 }).map((_, i) => (
         <Skeleton key={i} className="h-16 w-full rounded-lg" />
       ))
       ```
    2. Replace empty state with: `<EmptyState icon={History} title="No runs yet" description="Run an agent to see execution history here." />`
    3. Add `hover:bg-muted/50 transition-colors` to table rows.
  - **Verify**: Check loading, empty, and hover states.

- [x] 4.2 Connector Registry: card hover, skeleton loading
  - **File**: `src/components/connector-registry.tsx` and `src/components/connector-card.tsx` (modify)
  - **What**:
    1. Add `hover-lift` class to connector cards.
    2. Replace loading state with Skeleton grid.
    3. Add `transition-all duration-300` to cards.
    4. Use micro-border styling: `border-white/10`.
  - **Verify**: Navigate to `/connectors` — cards hover with lift effect, loading shows skeletons.

- [x] 4.3 Templates Library: card hover, skeleton, empty state
  - **File**: `src/components/templates-library.tsx` (modify)
  - **What**:
    1. Add `hover-lift` class to template cards.
    2. Replace loading with Skeleton grid.
    3. Replace empty with: `<EmptyState icon={LayoutTemplate} title="No templates" description="Templates will appear here when available." />`
  - **Verify**: Navigate to `/templates` — premium card hover and consistent empty state.

- [x] 4.4 Tools Library: card hover, skeleton
  - **File**: `src/components/tools-library.tsx` (modify)
  - **What**:
    1. Add `hover-lift` class to tool cards.
    2. Replace loading with Skeleton grid.
    3. Add `transition-all duration-300`.
  - **Verify**: Navigate to `/tools` — hover lift on tool cards.

- [x] 4.5 MCP Manager: skeleton, empty state
  - **File**: `src/components/mcp-manager.tsx` (modify)
  - **What**:
    1. Replace loading with Skeleton grid.
    2. Replace empty with: `<EmptyState icon={Server} title="No MCP servers" description="Add an MCP server to extend agent capabilities." />`
  - **Verify**: Navigate to `/mcp` — consistent loading and empty states.

- [x] 4.6 Settings Panel: skeleton, micro-borders, leading-snug
  - **File**: `src/components/settings-panel.tsx` (modify)
  - **What**:
    1. Replace any loading spinners with Skeleton patterns.
    2. Ensure card sections use micro-borders (`border-white/10`).
    3. Update section headings to use `leading-snug` or `leading-tight`.
  - **Verify**: Navigate to `/settings` — consistent styling, no heavy shadows.

---

## Task 5.0: Builder Shell Visual Alignment ✅

**Trigger:** Sprint S2 complete.
**Enables:** Visual consistency for the most complex page.
**Depends on:** Sprint S2 (GlassContainer).

**Acceptance Criteria:**

- Builder sidebar and properties panel use standard background/border tokens.
- Top toolbar uses `GlassContainer` for a floating visual effect.
- `npx playwright test e2e/builder.spec.ts` passes.

---

- [x] 5.1 Align Builder Sidebar and Properties Panel
  - **Files**: `src/components/builder/node-sidebar.tsx`, `src/components/builder/node-properties-panel.tsx`
  - **What**:
    1. Replace any hardcoded backgrounds with `bg-card/90` and `backdrop-blur-md`.
    2. Replace borders with `border-border/80`.
    3. Ensure headings use the new typography tokens (`Geist Sans`, `leading-snug`).
  - **Verify**: Open `/builder` and check the side panels.

- [x] 5.2 Apply GlassContainer to Builder Toolbar
  - **File**: `src/components/builder/builder-canvas.tsx` (lines 751–754)
  - **What**: Replace the ad-hoc toolbar div with `GlassContainer`:
    ```tsx
    <div className="absolute top-4 right-4 left-4 z-50">
      <GlassContainer className="flex items-center gap-3 px-3 py-2 shadow-sm">
        {/* toolbar content */}
      </GlassContainer>
    </div>
    ```
  - **Verify**: Toolbar appears with a frosted glass effect and subtle gradient border.

- [x] 5.3 Align Overlays: Command Palette & Context Menus
  - **Files**: `src/components/builder/builder-command-palette.tsx`, `src/components/builder/builder-context-menu.tsx`
  - **What**:
    1. Update Command Palette to use `bg-background/80` and `backdrop-blur-lg`.
    2. Align Context Menu styles: remove generic shadows, use micro-borders (`border-white/10`).
  - **Verify**: Check `Cmd+K` in builder and right-click on nodes/canvas.

- [x] 5.4 Align Monitoring Panels
  - **Files**: `src/components/builder/execution-monitor.tsx`, `src/components/builder/version-history-panel.tsx`
  - **What**:
    1. Update background tokens to `bg-card/95`.
    2. Ensure empty states in these panels use the new `EmptyState` component wrapper.
    3. Update any Lucide icon colors to use `text-muted-foreground` or `text-primary`.
  - **Verify**: Open Execution Monitor and Version History from the toolbar.

---

## Post-Sprint Verification

Run: `npm run build && npx vitest run && npx playwright test`. All must exit 0 before opening the PR.

**Critical E2E checks**:

- `e2e/app.spec.ts` — all sidebar nav tests pass (heading text preserved)
- `e2e/marketplace.spec.ts` — registry heading, search, tabs, ASAP link all pass
- `e2e/agents.spec.ts` — agents dashboard renders correctly
- `e2e/connectors.spec.ts` — connector registry loads
- `e2e/settings.spec.ts` — settings panel loads
