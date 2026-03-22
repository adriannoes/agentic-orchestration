# Sprint S4: Auth Flow (WebGL)

> **Roadmap**: [Design System Revamp](./tasks-design-system-revamp-roadmap.md) · **Design System**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

> **Branch**: `feat/design-system-s4-auth-webgl`
> **PR Title**: `feat(design): WebGL canvas backgrounds, GlassContainer forms, ghost inputs on auth pages`
> **Depends on**: Sprint S2 (GlassContainer exists), Sprint S1 (Three.js installed)
> **Enables**: Sprint S5 (polish sweep includes auth pages)

---

## Relevant Files

| File                                  | Purpose                                                         |
| ------------------------------------- | --------------------------------------------------------------- |
| `src/components/ui/canvas-bg.tsx`     | **New** — WebGL shader background via React Three Fiber         |
| `src/hooks/use-canvas-visibility.ts`  | **New** — IntersectionObserver hook for off-screen Canvas pause |
| `src/test/setup.ts`                   | **Modify** — IntersectionObserver polyfill for jsdom tests       |
| `tests/components/canvas-bg.test.tsx` | **New** — Unit tests for CanvasBg component                      |
| `tests/lib/auth-styles.test.ts`      | **New** — Unit tests for ghostInputClassName                     |
| `src/app/login/page.tsx`              | **Modify** — Add CanvasBg + GlassContainer + mount animation    |
| `src/app/signup/`                     | **Modify** — Same pattern as login                              |
| `src/lib/auth-styles.ts`             | **New** — ghostInputClassName constant for auth pages            |
| `src/components/auth/login-form.tsx`  | **Modify** — Ghost input styling, Framer Motion mount animation |
| `src/components/auth/signup-form.tsx` | **Modify** — Ghost input styling                                |
| `e2e/marketplace.spec.ts`             | **Verify** — Login with `?from=asap` test still passes          |
| `e2e/console-errors.spec.ts`         | **Modify** — Exclude WebGL context errors in headless CI        |

### Notes

- WebGL is GPU-intensive. All implementations MUST include: `frameloop="demand"`, DPR limits, mobile reduction, and CSS gradient fallback.
- **PROTECTED**: The `?from=asap` contextual message logic in `login-form.tsx` must remain intact.

---

## Task 1.0: WebGL Canvas Infrastructure

**Trigger:** User visits `/login` or `/signup`.
**Enables:** Immersive auth experience matching ASAP Protocol's premium sign-in flow.
**Depends on:** Sprint S1 (Three.js + R3F installed).

**Acceptance Criteria:**

- `CanvasBg` renders an animated dot-matrix shader background.
- Canvas uses `frameloop="demand"` and pauses when off-screen.
- DPR is `[1, 1.5]` on desktop, `[1, 1]` on mobile.
- If WebGL fails (old browsers), a CSS gradient fallback renders instead.
- No console errors related to WebGL context.

---

- [x] 1.1 Create CanvasBg component with dot-matrix shader
  - **File**: `src/components/ui/canvas-bg.tsx` (create new)
  - **Directive**: `"use client"` — uses React Three Fiber hooks, `useFrame`, `useRef`, browser WebGL.
  - **What**: Create a full-screen WebGL background component:
    ```tsx
    interface CanvasBgProps {
      className?: string
      colorScheme?: "indigo" | "zinc"
    }
    ```
    Implementation:
    1. Import `Canvas` from `@react-three/fiber`, `useFrame`, `useRef` from React, `useMemo` from React.
    2. Create a `DotMatrixScene` inner component using `ShaderMaterial` with a custom Fragment Shader:
       - The shader renders a subtle repeating dot pattern with slow animation driven by `uTime` uniform.
       - Colors: low-opacity zinc/indigo tones (match the theme).
       - Update `uTime` in `useFrame((_, delta) => { materialRef.current.uniforms.uTime.value += delta * 0.3; })`.
    3. Wrap in the outer component:
       ```tsx
       <div className={cn("absolute inset-0 -z-10", className)} data-testid="canvas-bg">
         <Canvas
           frameloop="demand"
           dpr={isMobile ? [1, 1] : [1, 1.5]}
           gl={{ antialias: false, alpha: true }}
         >
           <DotMatrixScene colorScheme={colorScheme} />
         </Canvas>
       </div>
       ```
    4. **Mobile detection**: `const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;`
    5. **WebGL fallback**: Wrap Canvas in try/catch or use R3F's error boundary. On failure, render:
       ```tsx
       <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-indigo-950/20 to-zinc-950" />
       ```
    6. Integrate `useCanvasVisibility` hook (Task 1.2) to pause/resume rendering.
  - **Why**: WebGL auth backgrounds are the highest visual-impact element of the Clean Architect theme. They create a memorable first impression.
  - **Pattern**: Reference ASAP's analysis-sign-in-3d.md for shader design guidance. The shader should be subtle — NOT distracting flashy effects.
  - **Verify**: Render `<CanvasBg />` in a test component. Verify animated dots appear. Check mobile viewport uses lower DPR. Simulate WebGL failure — CSS gradient should render.

  **Integration**: Consumed by `src/app/login/page.tsx` (Task 3.0), `src/app/signup/` (Task 4.0).

---

- [x] 1.2 Create useCanvasVisibility hook
  - **File**: `src/hooks/use-canvas-visibility.ts` (create new)
  - **What**: Custom hook using `IntersectionObserver`:

    ```tsx
    import { useState, useEffect, type RefObject } from "react"

    export function useCanvasVisibility(ref: RefObject<HTMLElement | null>) {
      const [isVisible, setIsVisible] = useState(true)
      useEffect(() => {
        if (!ref.current) return
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
          threshold: 0.1,
        })
        observer.observe(ref.current)
        return () => observer.disconnect()
      }, [ref])
      return isVisible
    }
    ```

  - **Why**: Canvas should pause rendering when scrolled off-screen (saves GPU/battery on mobile).
  - **Verify**: Scroll the auth page so the canvas leaves the viewport — shader animation should pause (check via console log in `useFrame`).

---

## Task 2.0: Ghost Input Styling

**Trigger:** Canvas background exists (Task 1.0).
**Enables:** Inputs on auth pages become transparent, showing the Canvas behind them.
**Depends on:** Task 1.0.

**Acceptance Criteria:**

- Auth page inputs have transparent backgrounds (`bg-transparent`).
- Input borders are `border-white/10`, focus state is `border-white/30`.
- Font size is `text-base` (16px) to prevent iOS Safari auto-zoom.
- Ghost styling is LOCAL to auth pages only — global `<Input>` component is NOT modified.

---

- [x] 2.1 Create auth input style utility
  - **File**: `src/lib/auth-styles.ts` (create new)
  - **What**: Create a shared className constant for ghost inputs:
    ```tsx
    export const ghostInputClassName = [
      "bg-transparent",
      "border-white/10",
      "text-white",
      "placeholder:text-white/40",
      "focus:border-white/30",
      "focus:ring-0",
      "transition-colors",
      "text-base", // Prevents iOS Safari auto-zoom on focus
    ].join(" ")
    ```
  - **Why**: Centralizes the ghost input styling so it's consistent across login and signup pages. Using a constant avoids duplication.
  - **Pattern**: Similar to how ASAP's Sprint M4 defined `auth-input-styles.ts`.
  - **Verify**: Import in login form and confirm styling applies correctly.

  **IMPORTANT**: Do NOT modify `src/components/ui/input.tsx` — ghost styling must only apply to auth pages.

---

## Task 3.0: Login Page WebGL Upgrade

**Trigger:** User visits `/login`.
**Enables:** Premium sign-in experience for users arriving from ASAP Protocol.
**Depends on:** Tasks 1.0 and 2.0 (Canvas + ghost styles).

**Acceptance Criteria:**

- Login page renders WebGL canvas background behind the form.
- Form is wrapped in GlassContainer (frosted glass).
- Form has a mount animation (fade-up with spring physics).
- `?from=asap` contextual message still works.
- Ghost input styling applied to the GitHub sign-in button area.
- `npx playwright test e2e/marketplace.spec.ts` (login test) passes.

---

- [x] 3.1 Add CanvasBg and GlassContainer to login page
  - **File**: `src/app/login/page.tsx` (modify)
  - **What**: Replace the current simple centered layout:

    ```tsx
    // BEFORE:
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <LoginFormWithParams />
    </div>

    // AFTER:
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <CanvasBg />
      <div className="relative z-10 w-full max-w-md">
        <GlassContainer className="p-0">
          <LoginFormWithParams />
        </GlassContainer>
      </div>
    </div>
    ```

    Import `CanvasBg` from `@/components/ui/canvas-bg` and `GlassContainer` from `@/components/ui/glass-container`.

  - **Why**: The login page is the first impression for users arriving from ASAP Protocol. A premium 3D background creates a cohesive cross-platform feel.
  - **Verify**: Navigate to `/login` — WebGL dots visible behind a frosted glass card containing the sign-in form. Dark mode should look natural (dark glass over dark canvas).

  **IMPORTANT**: Verify `?from=asap` still works: `http://localhost:3000/login?from=asap` should show "Continue with GitHub to access Agent Builder from ASAP Protocol."

---

- [x] 3.2 Add Framer Motion mount animation to login form
  - **File**: `src/components/auth/login-form.tsx` (modify)
  - **What**: Wrap the `<Card>` in a Framer Motion `motion.div` with a mount animation:
    ```tsx
    import { motion } from "framer-motion"
    // ...
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 25 }}
      >
        <Card className="w-full max-w-md border-white/10 bg-transparent">
          {/* existing card content */}
        </Card>
      </motion.div>
    )
    ```
    Also update the Card styling to be semi-transparent: `border-white/10 bg-transparent` (or `bg-white/5`) so the glass container shows through.
  - **Why**: A spring mount animation creates a satisfying entrance effect that matches the premium auth UX.
  - **Verify**: Reload `/login` — the card should fade up with a spring effect.

---

## Task 4.0: Signup Page WebGL Upgrade

**Trigger:** User visits `/signup`.
**Enables:** Consistent premium auth experience across both flows.
**Depends on:** Tasks 1.0, 2.0, 3.0 (same pattern as login).

**Acceptance Criteria:**

- Signup page renders WebGL canvas background.
- Form wrapped in GlassContainer.
- Mount animation present.

---

- [x] 4.1 Apply CanvasBg + GlassContainer to signup page
  - **File**: `src/app/signup/page.tsx` (modify existing — 10 lines, imports `SignupForm` from `@/components/auth/signup-form`)
  - **What**: Replace the current simple layout:

    ```tsx
    // BEFORE:
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <SignupForm />
    </div>

    // AFTER:
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <CanvasBg />
      <div className="relative z-10 w-full max-w-md">
        <GlassContainer className="p-0">
          <SignupForm />
        </GlassContainer>
      </div>
    </div>
    ```

    Also add Framer Motion mount animation to `src/components/auth/signup-form.tsx` (same pattern as Task 3.2 for login).

  - **Why**: Visual consistency between login and signup — both should have the same premium WebGL experience.
  - **Verify**: Navigate to `/signup` — WebGL dots visible behind frosted glass card, form animates in with spring.

---

## Post-Sprint Verification

Run: `npm run build && npx vitest run && npx playwright test`. All must exit 0 before opening the PR.

**Critical E2E checks**:

- `e2e/marketplace.spec.ts` — the "Login with ASAP context" test (`?from=asap`) must pass.
- `e2e/auth-setup.spec.ts` — any auth-related E2E tests pass.
- No WebGL console errors in any browser (Chromium, Firefox, WebKit).

**Manual check**: Test on mobile viewport (375×812) — Canvas uses `dpr=[1,1]`, lower GPU load. Inputs do not trigger iOS auto-zoom.
