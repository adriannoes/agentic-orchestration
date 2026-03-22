# Design System Revamp — Agent Builder (v1.1.0)

## Goal

Align the Agent Builder's visual identity with the ASAP Protocol's **"Clean Architect"** design system. Create a consistent cross-platform experience with glassmorphism, Bento grids, WebGL auth flows, hero animations, and strict anti-boilerplate standards.

> **Source of Truth**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

## Execution Strategy

5 sequential sprints, each representing a single atomic Pull Request. Sprint order is strict — each builds on the previous.

## Sprints

1. **[Sprint S1: Foundation & Dependencies](./sprint-S1-foundation-dependencies.md)**
   - Install Three.js/R3F, audit OKLCH tokens, clean up legacy CSS, verify build baseline.

2. **[Sprint S2: Premium UI Components](./sprint-S2-premium-ui-components.md)**
   - Create reusable `GlassContainer`, `BentoGrid`/`BentoCard`, `BackgroundPaths`, `AnimatedText`, and `EmptyState` components.

3. **[Sprint S3: Page-Level Redesign](./sprint-S3-page-level-redesign.md)**
   - Apply new components to Agents dashboard, Registry, Settings, Runs, Connectors, Templates, Tools, MCP, and Sidebar.

4. **[Sprint S4: Auth Flow (WebGL)](./sprint-S4-auth-webgl.md)**
   - Replace static login/signup with immersive 3D Canvas backgrounds, GlassContainer forms, ghost inputs, and mount animations.

5. **[Sprint S5: Polish & Anti-Boilerplate QA](./sprint-S5-polish-anti-boilerplate.md)**
   - Global sweep (rounded-full, shadows, hardcoded colors), icon audit, mobile responsiveness, ASAP docs cleanup, Agent Builder design system doc, full regression.

## Technical Rules

- **Protected zone**: `/builder` page and `src/components/builder/` are **untouchable** — optimized canvas interactions must not be modified.
- **Anti-boilerplate**: Strict monochromatic discipline (Zinc/Indigo only). No generic pill-shapes or heavy neon glows.
- **Testing**: Run `npm run build && npx playwright test && npx vitest run` after each sprint.
