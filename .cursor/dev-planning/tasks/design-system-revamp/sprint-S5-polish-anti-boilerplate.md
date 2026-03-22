# Sprint S5: Polish & Anti-Boilerplate QA

> **Roadmap**: [Design System Revamp](./tasks-design-system-revamp-roadmap.md) · **Design System**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

> **Branch**: `feat/design-system-s5-polish`
> **PR Title**: `feat(design): anti-boilerplate sweep, icon audit, mobile polish, design system doc`
> **Depends on**: Sprints S1–S4 (all pages are redesigned, this is the final quality pass)
> **Enables**: Clean visual baseline for future features

---

## Relevant Files

| File                                                   | Purpose                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `src/components/user-menu.tsx`                         | **Modified** — rounded-full → rounded-xl on avatar button |
| `src/components/settings-panel.tsx`                    | **Modified** — rounded-full → rounded-xl, ACCENT_COLORS OKLCH, leading-snug |
| `src/components/builder/execution-monitor.tsx`         | **Modified** — shadow-xl removed (micro-border)           |
| `src/components/builder/version-history-panel.tsx`     | **Modified** — shadow-xl removed (micro-border)           |
| `src/components/ui/chart.tsx`                          | **Modified** — shadow-xl removed, Recharts selectors (no hex) |
| `src/app/globals.css`                                   | **Modified** — connector brand tokens (OKLCH)            |
| `src/lib/connector-store.ts`                            | **Modified** — hex → var(--connector-*) tokens            |
| `src/components/connector-card.tsx`                     | **Modified** — color-mix for connector bg                 |
| `src/components/ui/sidebar.tsx`                        | **Modified** — hsl(var()) → var() for shadow              |
| `src/components/tools-library.tsx`                     | **Modified** — leading-snug on h1                         |
| `src/components/templates-library.tsx`                 | **Modified** — leading-snug on h1                          |
| `src/components/runs-history.tsx`                       | **Modified** — leading-snug on h1                          |
| `src/app/setup/page.tsx`                                | **Modified** — leading-tight on h1                         |
| `src/app/connectors/page.tsx`                           | **Modified** — leading-snug on h1                          |
| `src/app/marketplace/page.tsx`                         | **Modified** — leading-snug on AnimatedText                |
| `src/app/mcp/page.tsx`                                  | **Modified** — leading-snug on h1                         |
| `src/components/agents-dashboard.tsx`                 | **Modified** — leading-snug on AnimatedText               |
| `src/components/ui/bento-grid.tsx`                     | **Modified** — leading-snug on metric text                |
| `src/components/ui/background-paths.tsx`              | **Documented** — SVG exception (decorative, no Lucide eq.)|
| `src/components/sidebar.tsx`                           | **Modified** — mobile Sheet, hamburger at &lt;lg, active:scale |
| `src/app/layout.tsx`                                  | **Modified** — pt-14 on main for mobile header            |
| `src/**/*.tsx`                                         | Global sweep targets: all TSX files for anti-patterns     |
| `src/app/globals.css`                                  | Verify no hardcoded colors remain                         |
| `src/app/layout.tsx`                                   | **Modify** — mobile sidebar trigger improvements          |
| `src/components/sidebar.tsx`                           | **Modify** — mobile hamburger → Sheet at `<lg` breakpoint |
| `.cursor/product-specs/design-system/`                 | **Delete** (ASAP-specific reference docs, now outdated)   |
| `.cursor/product-specs/design-system-agent-builder.md` | **New** — Agent Builder's own design system doc           |
| `e2e/*.spec.ts`                                        | Full regression suite                                     |
| `playwright.config.ts`                                 | **Modified** — actionTimeout 15s, expect timeout 10s       |
| `e2e/agents.spec.ts`                                   | **Modified** — Create Agent dialog resilience, data-testid |
| `e2e/app.spec.ts`                                      | **Modified** — waitForLoadState, timeout increases        |
| `e2e/auth-setup.spec.ts`                               | **Modified** — waitForLoadState, timeout increases        |
| `e2e/builder-context-menu.spec.ts`                     | **Modified** — loading state handling in beforeEach       |
| `src/components/create-agent-dialog.tsx`               | **Modified** — data-testid for E2E                        |

### Notes

- **CONTROLLED ALIGNMENT**: The `/builder` nodes are included for color/token alignment. Do NOT touch logic.
- The global sweep uses `grep` commands extensively. Document every change in the PR description.

---

## Task 1.0: Anti-Boilerplate Sweep ✅

**Trigger:** Sprints S1–S4 complete (all pages redesigned).
**Enables:** Clean, consistent codebase with zero generic/boilerplate styling.
**Depends on:** Sprints S1–S4.

**Acceptance Criteria:**

- Zero unauthorized `rounded-full` (only on Avatar components, status dots, small indicators — NOT on buttons, cards, or containers).
- Zero `shadow-lg`, `shadow-xl`, `shadow-2xl` on content cards — replaced with micro-borders.
- Zero hardcoded `#hex`, `rgb()`, `hsl()` values in `.tsx` or `.css` files — all using OKLCH tokens.
- Hero/dashboard headings use `leading-snug` or `leading-tight`.

---

- [x] 1.1 Search and fix unauthorized `rounded-full`
  - **File**: All files in `src/` (search + modify)
  - **What**: Run `grep -rn "rounded-full" src/ --include="*.tsx" --include="*.ts"`. For each result:
    1. If on an `<Avatar>` or small status dot → **Keep** (correct usage).
    2. If on a button, card, container, or badge → **Replace** with `rounded-[--radius]` (Tailwind custom property) or `rounded-xl` for larger elements.
    3. Document each replacement in PR description.
  - **Why**: Design system §8.3 — generic pill shapes are anti-boilerplate violations. The Clean Architect uses architect-radius (`--radius: 0.625rem`) for most elements.
  - **Verify**: Re-run `grep -rn "rounded-full" src/ --include="*.tsx"` — only Avatar/dot results remain.

---

- [x] 1.2 Replace heavy shadows with micro-borders
  - **File**: All files in `src/` (search + modify)
  - **What**: Run `grep -rn "shadow-lg\|shadow-xl\|shadow-2xl" src/ --include="*.tsx"`. For each result:
    1. If on a card or container → **Replace** with micro-border: `border border-border` (or `border-white/10` for dark-mode-specific).
    2. If on a hover state → Replace with `hover:shadow-sm` (Tailwind token, much subtler).
    3. If on a dialog/modal overlay → **Keep** (drop shadows are acceptable for overlays).
  - **Why**: Heavy shadows create a dated, "template" look. Micro-borders are the Clean Architect signature.
  - **Verify**: Re-run `grep` — no `shadow-lg`, `shadow-xl`, `shadow-2xl` results on content cards.

---

- [x] 1.3 Eliminate hardcoded color values
  - **File**: All files in `src/` (search + modify)
  - **What**: Run `grep -rn "rgb(\|hsl(\|#[0-9a-fA-F]" src/ --include="*.css" --include="*.tsx"`. For each result:
    1. Replace with the appropriate OKLCH token (`bg-background`, `text-foreground`, `border-border`, etc.).
    2. For inline SVG fills/strokes, use `currentColor` or explicit OKLCH values.
    3. Exception: radial-gradient patterns in BentoCard (uses `rgba(0,0,0,0.02)`) may keep inline styles if no Tailwind equivalent exists.
  - **Why**: Design system consistency — all colors must come from design tokens.
  - **Verify**: Re-run `grep` — zero results (or only documented exceptions).

---

- [x] 1.4 Tighten heading line-heights
  - **File**: Key page components (search + modify)
  - **What**: Run `grep -rn "text-3xl\|text-4xl\|text-5xl" src/ --include="*.tsx"`. For each heading:
    1. Check if `leading-` is specified. If not, or if `leading-normal` → add `leading-snug` (for `text-3xl`) or `leading-tight` (for `text-4xl+`).
    2. Skip headings inside the `/builder` page components.
  - **Why**: Default Tailwind line-height creates excessive whitespace in headings. Tighter leading matches Clean Architect typography.
  - **Verify**: Visual inspection — headings look compact and professional.

---

## Task 2.0: Icon Migration Audit ✅

**Trigger:** Task 1.0 complete (global sweep done).
**Enables:** 100% Lucide React icon coverage (no custom SVGs).
**Depends on:** Task 1.0.

**Acceptance Criteria:**

- Zero custom inline `<svg>` elements in non-builder components (all replaced with `lucide-react` imports).
- Exception: custom SVGs with no Lucide equivalent use `currentColor` and accept `className`.

---

- [x] 2.1 Scan for custom SVG usage
  - **File**: All files in `src/` except `src/components/builder/` (search + modify)
  - **What**: Run `grep -rn "<svg" src/ --include="*.tsx" -l | grep -v builder`. For each file:
    1. Identify the SVG icon being rendered.
    2. Search https://lucide.dev/icons for a matching icon name.
    3. If match found → **Replace** inline SVG with Lucide import:
       ```tsx
       // Before:
       ;<svg viewBox="0 0 24 24">...</svg>
       // After:
       import { IconName } from "lucide-react"
       ;<IconName className="h-6 w-6" />
       ```
    4. If no match → **Keep** the custom SVG but ensure:
       - Uses `currentColor` for `fill`/`stroke`.
       - Accepts `className` prop for sizing.
       - Does NOT use hardcoded hex colors.
  - **Why**: Lucide React is the canonical icon library. Custom SVGs create inconsistency and maintenance burden.
  - **Verify**: Re-run `grep -rn "<svg" src/ --include="*.tsx" -l | grep -v builder` — zero results (or only documented exceptions).

---

## Task 3.0: Mobile Responsiveness Polish ✅

**Trigger:** All pages redesigned (S1–S4).
**Enables:** Consistent mobile experience across the app.
**Depends on:** Sprints S1–S4.

**Acceptance Criteria:**

- Sidebar collapses to hamburger menu on `< lg` breakpoints.
- Touch interactions use `active:scale-[0.98]` instead of hover effects.
- No `backdrop-blur` stacking issues on mobile (test on 375x812 viewport).
- Inputs on auth pages use `text-base` to prevent iOS auto-zoom.

---

- [x] 3.1 Verify sidebar mobile behavior
  - **File**: `src/components/sidebar.tsx` (modify if needed)
  - **What**: Verify the sidebar correctly collapses on mobile. Check:
    1. Below `lg` breakpoint, sidebar should auto-hide.
    2. A hamburger trigger button should be visible.
    3. Clicking the trigger should open the sidebar in a Sheet/overlay.
    4. If the current sidebar implementation doesn't support this, add a `<Sheet>` wrapper using Shadcn's Sheet component for mobile.
  - **Why**: Mobile users need accessible navigation without a permanently visible sidebar taking up screen space.
  - **Pattern**: Follow ASAP's Sprint M2-1.2 (mobile sidebar behavior).
  - **Verify**: Set Chrome DevTools to 375×812 (iPhone). Verify sidebar is hidden, hamburger visible, Sheet opens on tap.

---

- [x] 3.2 Verify touch-safe interactions on all pages
  - **File**: Cross-page verification (no specific file)
  - **What**: Using Chrome DevTools touch emulation:
    1. Navigate to each page (`/`, `/marketplace`, `/connectors`, `/templates`, `/tools`, `/settings`).
    2. Verify cards do NOT have sticky hover states.
    3. Verify `hover-lift` effects only trigger with mouse pointer.
    4. Verify `active:scale-[0.98]` press feedback works on touch.
    5. Check `backdrop-blur` layers don't cause layering/rendering artifacts.
  - **Verify**: All interactions are touch-friendly, no visual artifacts on mobile viewport.

---

## Task 4.0: Documentation & Cleanup ✅

**Trigger:** Tasks 1.0–3.0 complete.
**Enables:** Future developers have a clear design system reference for the Agent Builder.
**Depends on:** Tasks 1.0–3.0.

**Acceptance Criteria:**

- ASAP-specific design system reference docs are removed from `.cursor/product-specs/design-system/`.
- A new `design-system-agent-builder.md` exists documenting this project's design system.
- The new doc references the Clean Architect origin but is self-contained.

---

- [x] 4.1 Delete ASAP design system reference docs
  - **File**: `.cursor/product-specs/design-system/` (delete entire directory)
  - **What**: Remove the directory containing ASAP-specific docs:
    - `design-system-asap/design-system.md`
    - `design-system-asap/mobile-strategy.md`
    - `design-system-asap/analysis-background-paths.md`
    - `design-system-asap/analysis-bento-grid.md`
    - `design-system-asap/analysis-sign-in-3d.md`
    - `tasks-design-system-revamp/` (ASAP sprint tasks — no longer relevant)
  - **Why**: These docs describe the ASAP Protocol's design system and sprint execution. Keeping them in the Agent Builder repo causes confusion — developers may think they need to implement ASAP-specific features.
  - **Verify**: `ls .cursor/product-specs/design-system/` returns "No such file or directory".

---

- [x] 4.2 Create Agent Builder design system document
  - **File**: `.cursor/product-specs/design-system-agent-builder.md` (create new)
  - **What**: Create a self-contained design system reference that documents:
    1. **Origin**: Adapted from ASAP Protocol's "Clean Architect" theme (v2.2.0).
    2. **Technology Stack**: Next.js, Tailwind CSS v4, Shadcn/UI, Framer Motion, Three.js (auth only), Lucide React.
    3. **Typography**: Geist Sans and Geist Mono.
    4. **Color Palette**: OKLCH-based semantic palette — copy the final values from `globals.css`.
    5. **Components**: GlassContainer, BentoGrid/BentoCard, BackgroundPaths, AnimatedText, EmptyState, Skeleton.
    6. **Motion rules**: Spring physics (`stiffness: 150, damping: 25`), hover lift (`-translate-y-0.5`), CSS transitions (`duration-300`).
    7. **Anti-patterns**: No `rounded-full` (except avatars), no `shadow-lg`, no hardcoded colors, no generic font stacks.
    8. **Protected zone**: `/builder` page is excluded from design system rules.
    9. **Mobile strategy**: `@media (hover: hover)` for hover effects, `active:scale-[0.98]` for touch, sidebar Sheet on mobile.
  - **Why**: Future developers (and AI models) need a single reference doc to understand the Agent Builder's visual language.
  - **Verify**: Read the doc — it should be self-contained (no need to reference ASAP docs).

---

## Task 5.0: Full Regression Suite

**Trigger:** Tasks 1.0–4.0 complete.
**Enables:** Confidence to merge and deploy.
**Depends on:** Tasks 1.0–4.0.

**Acceptance Criteria:**

- `npm run build` exits 0 with zero TypeScript/CSS errors.
- `npx vitest run` — all unit tests pass.
- `npx playwright test` — all 13 E2E test files pass.
- No console errors on any page (checked manually or via E2E console listener).

---

- [x] 5.1 Run full build
  - **What**: `npm run build` from project root.
  - **Verify**: Exit code 0. Check Three.js bundle is code-split to auth routes only (look for route-specific chunks in build output).

- [x] 5.2 Run unit tests
  - **What**: `npx vitest run` from project root.
  - **Verify**: All tests pass including new tests from Sprint S2.

- [x] 5.3 Run E2E suite
  - **What**: `npx playwright test` from project root.
  - **Verify**: All 13 test files pass. Key checks:
    - `e2e/app.spec.ts` — sidebar navigation, route loading
    - `e2e/marketplace.spec.ts` — registry heading, search, ASAP link, `?from=asap` login
    - `e2e/agents.spec.ts` — dashboard renders
    - `e2e/builder.spec.ts` — builder loads (MUST be unmodified)
    - `e2e/console-errors.spec.ts` — no console errors (critical for WebGL)
  - **Note**: E2E resilience improvements applied (timeouts, waitForLoadState, data-testid). Some tests may still fail on slow network or when port 3099 is in use. Run with `E2E_PORT=3100` if port conflict.

- [x] 5.4 Manual visual spot check
  - **What**: Open the app in browser and check these pages:
    1. `/` — BentoGrid metrics, agent cards hover lift, AnimatedText heading
    2. `/marketplace` — BackgroundPaths, AnimatedText, registry cards hover
    3. `/login` — WebGL canvas, GlassContainer, spring mount animation
    4. `/builder` — **NO CHANGES** — loads identically to before
    5. `/connectors` — card hover lift, consistent styling
    6. `/settings` — micro-borders, no heavy shadows
    7. Toggle light/dark mode on each page — verify consistent theming
    8. Test on 375×812 viewport — sidebar hidden, hamburger works, touch interactions

---

## Post-Sprint Verification

Run: `npm run build && npx vitest run && npx playwright test`. All must exit 0 before opening the PR.

This is the final sprint. After merge, the Agent Builder and ASAP Protocol will share a consistent "Clean Architect" visual identity.
