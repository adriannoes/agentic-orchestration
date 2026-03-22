# Sprint S2: Premium UI Components

> **Roadmap**: [Design System Revamp](./tasks-design-system-revamp-roadmap.md) · **Design System**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

> **Branch**: `feat/design-system-s2-premium-components`
> **PR Title**: `feat(design): add GlassContainer, BentoGrid, BackgroundPaths, AnimatedText, EmptyState components`
> **Depends on**: Sprint S1 (tokens aligned, Three.js installed, clean build)
> **Enables**: Sprint S3 (all page-level redesigns import these reusable components)

---

## Relevant Files

| File                                        | Purpose                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/components/ui/glass-container.tsx`     | **New** — Glassmorphism wrapper (gradient border + frosted glass inner)                 |
| `src/components/ui/bento-grid.tsx`          | **New** — BentoGrid container + BentoCard with hover lift, radial reveal, gleam overlay |
| `src/components/ui/background-paths.tsx`    | **New** — Animated SVG paths (Framer Motion) for hero/header backgrounds                |
| `src/components/ui/animated-text.tsx`       | **New** — Word-by-word staggered text reveal with spring physics                        |
| `src/components/ui/empty-state.tsx`         | **New** — Convenience wrapper over existing `empty.tsx` compositional components        |
| `src/components/ui/empty.tsx`               | **Existing** — Compositional Empty primitives (Empty, EmptyHeader, EmptyTitle, etc.)    |
| `tests/components/glass-container.test.tsx` | Unit tests for GlassContainer                                                           |
| `tests/components/bento-grid.test.tsx`      | Unit tests for BentoGrid + BentoCard                                                    |
| `tests/components/empty-state.test.tsx`     | Unit tests for EmptyState wrapper                                                       |
| `tests/components/background-paths.test.tsx`| Unit tests for BackgroundPaths                                                          |
| `tests/components/animated-text.test.tsx`   | Unit tests for AnimatedText                                                             |

### Notes

- All components are `"use client"` only when they use hooks or Framer Motion. Pure Tailwind components (GlassContainer, EmptyState) may remain server-renderable.
- All components accept a `className` prop for extensibility via `cn()` helper.
- Unit tests use `@testing-library/react` with `jsdom` environment.

---

## Task 1.0: GlassContainer Component

**Trigger:** Sprint S1 complete (OKLCH tokens aligned, clean build baseline).
**Enables:** Sprint S4 (auth pages wrap forms in GlassContainer), Sprint S3 (optional usage on CTA areas).
**Depends on:** Sprint S1.

**Acceptance Criteria:**

- `GlassContainer` renders a frosted glass wrapper in both light and dark modes.
- Outer container shows a 1px gradient pseudo-border via `p-px` padding technique.
- Inner container applies `backdrop-blur-md` with translucent background.
- Accepts `className` prop for internal content customization.
- `npx vitest run tests/components/glass-container.test.tsx` passes.

---

- [x] 1.1 Create GlassContainer component
  - **File**: `src/components/ui/glass-container.tsx` (create new)
  - **What**: Create a wrapper component implementing glassmorphism (design-system §8.1):
    - **Outer wrapper**: `bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg dark:from-white/10 dark:to-white/5` — creates a 1px gradient pseudo-border.
    - **Inner element**: `bg-white/95 backdrop-blur-md rounded-2xl dark:bg-black/80` — frosted glass content area.
    - Accepts `children: React.ReactNode` and `className?: string`.
    - Use `cn()` from `@/lib/utils` for class merging.
  - **Why**: Glassmorphism is a signature visual element of the Clean Architect theme. Used by auth pages (S4) to wrap forms over WebGL backgrounds, and optionally by CTA sections.
  - **Pattern**: Follow existing `src/components/ui/skeleton.tsx` for minimal component structure. The design spec is in the ASAP design system §8.1.
  - **Verify**: Import and render in storybook or a test page. Confirm it renders a translucent card-like container with a gradient edge in both light/dark modes.

  **Integration**: Consumed by `src/app/login/page.tsx` (Sprint S4, Task 3.0), `src/app/signup/` pages, and optionally by hero CTA buttons.

---

- [x] 1.2 Write unit tests for GlassContainer
  - **File**: `tests/components/glass-container.test.tsx` (create new)
  - **What**: Test that:
    1. Component renders children correctly.
    2. Component applies the outer gradient border classes.
    3. Component applies the inner frosted glass classes.
    4. Custom `className` is merged into the inner container.
  - **Why**: Validates the glass container renders correctly and accepts className extensions.
  - **Pattern**: Follow `src/components/settings-panel.test.tsx` for component testing patterns. Add `// @vitest-environment jsdom` at the top.
  - **Verify**: `npx vitest run tests/components/glass-container.test.tsx -v` — all tests pass.

---

## Task 2.0: BentoGrid & BentoCard Components

**Trigger:** Sprint S1 complete.
**Enables:** Sprint S3 (Agents dashboard metrics, Registry cards, all card-based pages).
**Depends on:** Sprint S1.

**Acceptance Criteria:**

- `BentoGrid` renders a responsive CSS grid (`1 col mobile → 2 col tablet → 3 col desktop`).
- `BentoCard` implements hover lift (`-translate-y-0.5`), radial grid reveal, gleam border overlay.
- Hover effects are scoped to pointer devices via `@media (hover: hover)`.
- Touch devices get `active:scale-[0.98]` press feedback.
- Cards accept `icon`, `title`, `description`, `value`, `className` props.
- `npx vitest run tests/components/bento-grid.test.tsx` passes.

---

- [x] 2.1 Create BentoGrid container component
  - **File**: `src/components/ui/bento-grid.tsx` (create new)
  - **What**: Create two sub-components in a single file (composition pattern):

    **BentoGrid**:

    ```tsx
    interface BentoGridProps {
      children: React.ReactNode
      className?: string
    }
    ```

    - Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`
    - Use `cn()` for className merging.

    **BentoCard**:

    ```tsx
    interface BentoCardProps {
      title: string
      description: string
      icon: LucideIcon
      value?: string | number
      className?: string
    }
    ```

    Visual rules (from design-system §8.2):
    1. **Base state**: `border border-border bg-card rounded-xl p-6 relative overflow-hidden group transition-all duration-300`.
    2. **Hover lift**: `hover:-translate-y-0.5 will-change-transform`. Scoped with `@media (hover: hover)` — add a custom Tailwind utility or use inline `@media` in className.
    3. **Ambient shadow**: `hover:shadow-sm` (Tailwind token, not arbitrary).
    4. **Radial grid reveal**: Absolute `div` child with `opacity-0 group-hover:opacity-100 transition-opacity duration-500` containing a radial dot pattern (`style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '4px 4px' }}`).
    5. **Gleam border overlay**: Secondary absolute `div` with `bg-gradient-to-br from-transparent via-muted to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`.
    6. **Icon wrapper**: `bg-muted rounded-lg p-2 mb-3 w-fit`.
    7. **Value display**: `text-3xl font-bold font-mono tracking-tight`.
    8. **Touch fallback**: `active:scale-[0.98]` for mobile press effect.

  - **Why**: The Bento grid is the core visual pattern for dashboards and feature areas. It replaces basic card grids with a premium, interactive feel.
  - **Pattern**: Reference ASAP's analysis-bento-grid.md (read during planning). The design should follow the composition pattern like Shadcn's `Card` + `CardHeader` + `CardContent`.
  - **Verify**: Render a `<BentoGrid>` with 3+ `<BentoCard>` items. Hover on desktop should trigger the lift + radial reveal. Mobile (or touch device emulation) should NOT trigger hover effects.

  **Integration**: Consumed by `src/components/agents-dashboard.tsx` (Sprint S3, Task 1.0), `src/components/registry/registry-agent-card.tsx` (Sprint S3, Task 2.0).

---

- [x] 2.2 Add touch-safe hover styles to `globals.css`
  - **File**: `src/app/globals.css` (modify existing)
  - **What**: Add a utility layer for hover-only effects:
    ```css
    @layer utilities {
      @media (hover: hover) {
        .hover-lift:hover {
          transform: translateY(-0.125rem);
        }
      }
      .hover-lift {
        will-change: transform;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }
      .hover-lift:active {
        transform: scale(0.98);
      }
    }
    ```
  - **Why**: The BentoCard hover lift must NOT trigger on touch devices (causes "sticky hover" bugs on iOS). This utility encapsulates the `@media (hover: hover)` pattern.
  - **Verify**: Use Chrome DevTools touch emulation. Hover on a BentoCard with mouse → lift. Tap on touch → no lift, only scale.

---

- [x] 2.3 Write unit tests for BentoGrid and BentoCard
  - **File**: `tests/components/bento-grid.test.tsx` (create new)
  - **What**: Test that:
    1. `BentoGrid` renders children in a grid layout.
    2. `BentoCard` renders icon, title, description, and value.
    3. `BentoCard` renders radial grid reveal div (opacity-0 by default).
    4. Custom `className` on `BentoCard` is applied (e.g., `md:col-span-2`).
  - **Pattern**: Follow `src/components/settings-panel.test.tsx`. Add `// @vitest-environment jsdom`.
  - **Verify**: `npx vitest run tests/components/bento-grid.test.tsx -v` — all tests pass.

---

## Task 3.0: BackgroundPaths Component

**Trigger:** Sprint S1 complete (`framer-motion` already installed).
**Enables:** Sprint S3 (Agents dashboard hero, Registry header backgrounds).
**Depends on:** Sprint S1.

**Acceptance Criteria:**

- `BackgroundPaths` renders 5–8 animated SVG paths with low-opacity strokes.
- Paths loop infinitely with staggered timing.
- `pathCount` prop controls number of paths (default: 6 desktop, 4 mobile).
- Component is theme-aware (uses `currentColor`).
- Component renders in `absolute inset-0 overflow-hidden -z-10` positioning.

---

- [x] 3.1 Create BackgroundPaths component
  - **File**: `src/components/ui/background-paths.tsx` (create new)
  - **Directive**: `"use client"` — uses Framer Motion `motion.path`.
  - **What**: Create a component that generates animated SVG `<path>` elements:
    ```tsx
    interface BackgroundPathsProps {
      className?: string
      pathCount?: number
    }
    ```
    Implementation:
    1. Generate `pathCount` SVG paths with organic bezier curves (use randomized control points seeded deterministically so they're consistent between renders).
    2. Each path: `stroke="currentColor"`, `opacity={0.03 + (i * 0.015)}`, `strokeWidth={0.5}`, `fill="none"`.
    3. Animate `strokeDashoffset` using Framer Motion:
       ```tsx
       <motion.path
         d={pathData}
         strokeDasharray="1000"
         initial={{ strokeDashoffset: 1000 }}
         animate={{ strokeDashoffset: 0 }}
         transition={{ duration: 20 + i * 5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
       />
       ```
    4. Container: `<div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>` wrapping an `<svg>` that fills the viewport.
    5. **Mobile responsiveness**: Use a media query check or `useMediaQuery` hook to reduce `pathCount` on mobile (`< 768px`) to limit SVG complexity. Default: `pathCount ?? (isMobile ? 4 : 6)`.
    6. **Theme-aware**: SVG container uses `className="text-foreground"` so strokes inherit the right color.
  - **Why**: Animated SVG backgrounds are a signature "Clean Architect" visual. They provide depth to hero sections without the GPU cost of WebGL.
  - **Pattern**: Reference ASAP's analysis-background-paths.md. The component is similar to the one used on ASAP Protocol's landing page.
  - **Verify**: Render `<BackgroundPaths />` in a relative container. Verify animated strokes appear and loop. Check mobile viewport shows fewer paths.

  **Integration**: Consumed by `src/components/agents-dashboard.tsx` (Sprint S3, Task 1.0) and `src/app/marketplace/page.tsx` (Sprint S3, Task 2.0).

---

## Task 4.0: AnimatedText Component

**Trigger:** Sprint S1 complete (`framer-motion` installed).
**Enables:** Sprint S3 (page headings use animated reveals).
**Depends on:** Sprint S1.

**Acceptance Criteria:**

- `AnimatedText` splits text into words and staggers their reveal.
- Spring physics: `stiffness: 150`, `damping: 25`.
- Accepts `as` prop (`h1`, `h2`, `h3`, `p`, `span`) for semantic HTML.
- Accepts `delay` prop for orchestrating multiple animated elements.
- Component is accessible (full text is rendered in DOM for screen readers).

---

- [x] 4.1 Create AnimatedText component
  - **File**: `src/components/ui/animated-text.tsx` (create new)
  - **Directive**: `"use client"` — uses Framer Motion `motion.span`.
  - **What**: Reusable component that splits text into words and staggers their reveal:
    ```tsx
    interface AnimatedTextProps {
      text: string
      className?: string
      as?: "h1" | "h2" | "h3" | "p" | "span"
      delay?: number
    }
    ```
    Implementation:
    1. Split `text` by spaces into words array.
    2. Render each word as `<motion.span>` with:
       - `initial={{ y: 20, opacity: 0 }}`
       - `animate={{ y: 0, opacity: 1 }}`
       - `transition={{ type: "spring", stiffness: 150, damping: 25, delay: delay + i * 0.05 }}`
       - `className="inline-block mr-[0.25em]"`
    3. Wrap all words in the semantic tag (`Tag = as || "h1"`).
    4. Accept `className` for the outer tag (for gradient text, sizing, etc.).
  - **Why**: Staggered text reveals are a premium UI pattern that elevates hero sections and page headings. The spring physics create a natural, satisfying entrance.
  - **Pattern**: Reference ASAP's analysis-background-paths.md §B (Typography Motion). The spring values match ASAP's AnimatedText.
  - **Verify**: Render `<AnimatedText text="Hello World" />`. Words should appear one by one with a spring animation. Inspect DOM — the `<h1>` semantic tag should be present.

  **Integration**: Consumed by `src/components/agents-dashboard.tsx` (Sprint S3, Task 1.0) and `src/app/marketplace/page.tsx` (Sprint S3, Task 2.0) for page headings.

---

## Task 5.0: EmptyState Component

**Trigger:** Sprint S1 complete.
**Enables:** Sprint S3 (all pages replace ad-hoc empty states with this component).
**Depends on:** Sprint S1.

**Acceptance Criteria:**

- `EmptyState` renders centered icon, title, description, and optional CTA button.
- Icon uses `text-muted-foreground opacity-50` styling.
- Title renders as an `<h2>` (for accessibility and E2E heading selectors).
- CTA button uses `<Link>` if `actionHref` provided, `<Button>` with `onClick` if `onAction` provided.
- `npx vitest run tests/components/empty-state.test.tsx` passes.

---

- [x] 5.1 Create EmptyState convenience wrapper
  - **File**: `src/components/ui/empty-state.tsx` (create new)
  - **What**: Create a convenience wrapper that provides a simple props-based API while internally composing the **existing** `empty.tsx` primitives (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`). The existing `empty.tsx` (95 lines) uses a Shadcn-style compositional pattern — do NOT modify it.

    API for the wrapper:

    ```tsx
    import { type LucideIcon } from "lucide-react"
    import {
      Empty,
      EmptyHeader,
      EmptyMedia,
      EmptyTitle,
      EmptyDescription,
      EmptyContent,
    } from "@/components/ui/empty"
    import { Button } from "@/components/ui/button"
    import Link from "next/link"

    interface EmptyStateProps {
      icon: LucideIcon
      title: string
      description: string
      actionLabel?: string
      actionHref?: string
      onAction?: () => void
    }

    export function EmptyState({
      icon: Icon,
      title,
      description,
      actionLabel,
      actionHref,
      onAction,
    }: EmptyStateProps) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>
              <h2 className="text-lg font-semibold">{title}</h2>
            </EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {actionLabel && (
            <EmptyContent>
              {actionHref ? (
                <Button asChild>
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : (
                <Button onClick={onAction}>{actionLabel}</Button>
              )}
            </EmptyContent>
          )}
        </Empty>
      )
    }
    ```

  - **Why**: The existing `empty.tsx` provides excellent composability (Shadcn pattern) but requires 6+ sub-components for every usage. The wrapper provides a one-liner API for common cases while preserving the ability to use the primitives directly for complex layouts.
  - **Pattern**: This is the "convenience wrapper" pattern — same as how Shadcn's `<Alert>` provides sub-components but many projects also create an `<AlertBanner>` simple wrapper.
  - **Verify**: Render `<EmptyState icon={Bot} title="No agents" description="Create your first agent" actionLabel="Create Agent" actionHref="/" />` — should show centered content with a CTA button using the existing `Empty` styling.

  **IMPORTANT**: Do NOT modify `src/components/ui/empty.tsx` — it's a Shadcn-generated file.

  **Integration**: Consumed by `src/components/agents-dashboard.tsx` (Sprint S3, Task 1.0), `src/app/marketplace/page.tsx` (Sprint S3, Task 2.0), `src/components/runs-history.tsx`, `src/components/templates-library.tsx`, etc.

---

- [x] 5.2 Write unit tests for EmptyState
  - **File**: `tests/components/empty-state.test.tsx` (create new)
  - **What**: Test that:
    1. Component renders icon, title, and description.
    2. Title renders as `<h2>` heading.
    3. CTA button renders when `actionLabel` and `actionHref` are provided.
    4. CTA button is absent when no action props are given.
    5. `onAction` callback fires when CTA is clicked.
  - **Pattern**: Follow `src/components/settings-panel.test.tsx`. Add `// @vitest-environment jsdom`.
  - **Verify**: `npx vitest run tests/components/empty-state.test.tsx -v` — all tests pass.

---

## Post-Sprint Verification

Run: `npm run build && npx vitest run && npx playwright test`. All must exit 0 before opening the PR.

**Manual check**: Each new component can be quickly verified by temporarily importing it into any existing page (e.g., `/settings`) and checking the render. Remove test imports before committing.
