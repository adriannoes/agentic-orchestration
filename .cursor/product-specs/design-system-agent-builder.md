# Agent Builder Design System

## 1. Origin & Philosophy

- **Origin**: Adapted from ASAP Protocol's "Clean Architect" theme (v2.2.0). This document is self-contained; no reference to ASAP docs is required.
- **Theme Name**: "The Clean Architect"
- **Goal**: Provide a clean, modern, highly functional, and seamless user experience while preserving the complex interactive capabilities of the Agent Builder canvas.
- **Aesthetics**: Minimalist, high contrast (Zinc base + Indigo accents), focus on typography, fluid micro-interactions, and clear visual hierarchy without generic boilerplate styling.

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **Animation**: Framer Motion (`framer-motion`)
- **WebGL/3D**: Three.js (`three`) + React Three Fiber (`@react-three/fiber`) - _Used specifically for Authentication flows._
- **Icons**: `lucide-react` (Strict requirement: no custom SVGs unless absolutely necessary)
- **Class Merging**: `clsx`, `tailwind-merge` via `cn()` utility.

## 3. Typography

- **Sans-serif (Primary)**: Geist Sans (`var(--font-geist-sans)`)
- **Monospace (Code/Data)**: Geist Mono (`var(--font-geist-mono)`)
- **Leading**: Favor tighter line heights (`leading-snug` or `leading-tight` on headings) to maintain a dense, "dashboard-first" feel.

## 4. Color Palette (OKLCH Semantic Tokens)

The Agent Builder uses a strict Zinc neutral base with Indigo accents. Avoid mixing multiple primary colors.

### Light Mode

- **Background**: `oklch(1 0 0)` (Pure White)
- **Foreground**: `oklch(0.145 0 0)` (Near Black)
- **Primary**: `oklch(0.52 0.19 275)` (Indigo Accent)
- **Primary Foreground**: `oklch(0.985 0 0)`
- **Muted / Secondary / Accent**: `oklch(0.97 0 0)` (Zinc Neutral)
- **Border / Input**: `oklch(0.922 0 0)`
- **Ring**: `oklch(0.708 0 0)` (Neutral ring)

### Dark Mode

- **Background**: `oklch(0.145 0 0)` (Pure Near-Black Zinc, no purple tint)
- **Foreground**: `oklch(0.985 0 0)` (Pure White)
- **Primary**: `oklch(0.62 0.2 280)` (Indigo Accent)
- **Muted**: `oklch(0.269 0 0)` (Dark Zinc)
- **Border / Input**: `oklch(1 0 0 / 9%)`, `oklch(1 0 0 / 12%)` (Translucent White)
- **Ring**: `oklch(0.62 0.2 280)` (Indigo)

### Connector Brand Tokens (Light & Dark)

Connector cards use semantic tokens: `--connector-google`, `--connector-dropbox`, `--connector-openai`, `--connector-anthropic`, `--connector-slack`, `--connector-notion`, `--connector-github`, `--connector-postgres`, `--connector-mcp-filesystem`, `--connector-mcp-memory`. See `globals.css` for OKLCH values.

## 5. Spacing, Layout & Radii

- **Radii**: The core structural border-radius is `0.625rem` (10px). Derived via variables like `--radius-md`, `--radius-lg`.
- **Anti-Pattern**: Strictly avoid generic "pill-shape" (`rounded-full`) layouts for main content areas, buttons, and badges. `rounded-full` is reserved ONLY for Avatars and small status indicator dots.
- **Breakpoints**: Tailwind standard (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Sidebar (Mobile vs Desktop)**: Desktop uses a persistent/collapsible rail. Mobile (`< lg`) auto-hides the sidebar and uses a Hamburger trigger opening a Shadcn `<Sheet>`.

### 5.1. Mobile Strategy

- **Hover effects**: Scope with `@media (hover: hover)` so hover states only trigger with a mouse pointer. Avoid sticky hover on touch devices.
- **Touch feedback**: Use `active:scale-[0.98]` for press feedback on interactive elements (buttons, links, cards).
- **Sidebar**: Below `lg` breakpoint, sidebar is hidden; a fixed top bar with hamburger opens the navigation in a Sheet overlay.
- **Auth inputs**: Use `text-base` (16px) on inputs to prevent iOS auto-zoom on focus.

## 6. Premium Components & Micro-Interactions

To elevate the UI beyond standard templates, we implement specific, high-fidelity components:

### 6.1. BentoGrid & BentoCards

- **Usage**: Used for dashboards (Agents, Connectors, Templates) to present metrics and actionable entities.
- **The Lift**: Cards lift softly on hover using `-translate-y-0.5` combined with `will-change-transform` for 60fps smoothness.
  - _Touch Safe_: Hover states must be scoped in CSS with `@media (hover: hover)`. Mobile devices use `active:scale-[0.98]` press feedback instead.
- **Complex Reveals**: Use absolute `opacity-0` background layers containing radial grids (`bg-[radial-gradient(...)]`) or gradient "gleams" that transition to `opacity-100` on `group-hover`.

### 6.2. GlassContainer

- **Usage**: Encasing high-value forms (Login/Signup) or floating command palettes.
- **Structure**:
  - Outer Wrapper: Creates a 1px pseudo-border using `bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg`.
  - Inner Element: `bg-white/95 backdrop-blur-md` (light) or `bg-black/80` (dark).
- **Mobile**: Limit to `backdrop-blur-md` to avoid GPU frame drops on lower-end devices.

### 6.3. BackgroundPaths (Animated SVG)

- **Usage**: Placed behind major Hero sections (e.g., Registry Header, Dashboard Header) to add depth without WebGL overhead.
- **Animation**: 4 to 6 looping SVG paths drawing themselves via `strokeDashoffset` (Framer Motion). Uses `currentColor` at very low opacity (`0.03`).

### 6.4. Text Reveal (AnimatedText)

- **Usage**: Hero H1 tags or major page entry titles.
- **Physics**: Word-by-word reveal using Framer Motion `spring` physics (`stiffness: 150`, `damping: 25`).

### 6.5. EmptyState & Skeleton

- **EmptyState**: Used when lists or content areas are empty. Provides icon, title, description, and optional action.
- **Skeleton**: Loading placeholders using `bg-muted animate-pulse`. Use for async content (e.g., marketplace loading).

### 6.6. Immersive WebGL Authentication

- **Usage**: Exclusively for `/login` and `/signup` routes.
- **Implementation**: `<Canvas>` from React Three Fiber running a custom Fragment Shader (Dot-matrix/Particle flows).
- **Performance Constraints**: Must use `frameloop="demand"`, cap DPR on mobile `[1, 1]`, and implement `IntersectionObserver` to pause rendering when scrolled off-screen.
- **Ghost Inputs**: Form fields sitting over the WebGL canvas use `bg-transparent border-white/10` to let the 3D environment shine through.

## 7. Protected Zones

The Visual Builder route (`/builder`) and its sub-components (`src/components/builder/*`) represent a highly customized, complex interaction zone (drag-and-drop, canvas rendering).

- Do NOT refactor the builder canvas to fit standard Shadcn patterns.
- Do NOT remove existing custom CSS animations (like `.animate-flow-dash` or `.handle-active`) from `globals.css` as they govern the node logic.

## 8. Anti-Boilerplate Signatures (Checklist)

Before any PR merges, ensure:

1. [ ] No `shadow-lg`, `shadow-xl` on standard cards or containers. Use `border-border` micro-borders or subtle ambient `hover:shadow-sm`. (Shadows are permitted only on Modals, Dropdowns, and Overlays).
2. [ ] No `rounded-full` classes on Buttons, Badges, or inputs. Maximum standard is `rounded-xl` or derived `--radius-md`.
3. [ ] No hardcoded Hex (`#FFF`), `rgb()`, or generic Tailwind colors (`text-zinc-500`) used directly. _Always_ use semantic OKLCH variables (`bg-background`, `text-muted-foreground`).
4. [ ] No custom inline `<svg>` used where a `lucide-react` icon exists. Exception: decorative SVGs with no Lucide equivalent (e.g., BackgroundPaths) may use `currentColor` and accept `className`.
