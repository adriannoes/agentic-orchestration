# Code Review: Sprint S4 — Auth Flow (WebGL)

> **Branch**: `feat/design-system-s4-auth-webgl`
> **Diff**: 28 files changed, +72 / −113 lines
> **Sprint Spec**: `.cursor/dev-planning/tasks/design-system-revamp/sprint-S4-auth-webgl.md`
> **Design System**: `.cursor/product-specs/design-system-agent-builder.md`

---

## 1. Executive Summary

| Category | Status | Summary |
| :--- | :--- | :--- |
| **Tech Stack** | ⚠️ | Three.js/R3F correctly used; missing `next/dynamic` for bundle splitting; reinvents existing `useIsMobile` hook |
| **Architecture** | ⚠️ | Core auth WebGL pattern is sound; PR intentionally includes slop removal (redundant comment cleanup across codebase) |
| **Security** | ✅ | No secrets exposed; `?from=asap` logic preserved; auth redirect utility intact |
| **Tests** | ⚠️ | New tests exist for `CanvasBg` and `ghostInputClassName`, but no test for `WebGLErrorBoundary` fallback path or `RenderTrigger` lifecycle |

> **General Feedback:** The Sprint S4 implementation follows the design spec well: `CanvasBg`, `useCanvasVisibility`, ghost inputs, GlassContainer integration, and Framer Motion animations are correctly wired. The PR also includes intentional slop removal (redundant inline comments) across the codebase. Remaining items to address: the `RenderTrigger` component creates a full-speed rAF loop that undermines `frameloop="demand"`, and the Three.js bundle is eagerly loaded without code-splitting.

---

## 2. Required Fixes (Must Address Before Merge)

### 2.1 Missing `next/dynamic` for Three.js Code-Splitting

- **Location:** `src/app/login/page.tsx:2`, `src/app/signup/page.tsx:2`
- **Problem:** `CanvasBg` (which imports `three`, `@react-three/fiber`) is eagerly imported via a static `import`. This means the entire Three.js library (~150KB+ gzip) is included in the initial JS bundle for login/signup pages, severely impacting First Contentful Paint and Time to Interactive.
- **Rationale (Expert View):** The design spec §6.5 mandates performance constraints. Login/signup are entry-point pages where load time directly impacts user conversion. Three.js is the largest dependency in the project and should be lazy-loaded.
- **Fix Suggestion:**

  ```tsx
  // src/app/login/page.tsx
  import dynamic from "next/dynamic"
  import { GlassContainer } from "@/components/ui/glass-container"
  import { LoginFormWithParams } from "@/components/auth/login-form-with-params"

  const CanvasBg = dynamic(
    () => import("@/components/ui/canvas-bg").then((m) => ({ default: m.CanvasBg })),
    { ssr: false },
  )
  ```

  Apply the same pattern to `signup/page.tsx`. The `ssr: false` also avoids SSR issues with WebGL context.

### 2.2 RenderTrigger Creates Full-Speed rAF Loop

- **Location:** `src/components/ui/canvas-bg.tsx:82-101`
- **Problem:** The `RenderTrigger` component runs `requestAnimationFrame` in a continuous loop calling `invalidate()` on every single frame when the canvas is visible. This negates the entire purpose of `frameloop="demand"` — the shader animation runs at 60fps constantly, burning CPU/GPU cycles for a subtle dot-matrix pulse effect that doesn't need high frame rates.
- **Rationale (Expert View):** The design spec §6.5 explicitly requires `frameloop="demand"` to save GPU/battery on mobile. A full-speed rAF loop turns this into `frameloop="always"` in practice. For a slow-pulsing dot-matrix (period ~15s at `uTime * 0.3`), 30fps or even 15fps is indistinguishable to the human eye.
- **Fix Suggestion:**

  ```tsx
  function RenderTrigger({ isVisible }: RenderTriggerProps) {
    const invalidate = useThree((s) => s.invalidate)
    const isActiveRef = useRef(isVisible)
    isActiveRef.current = isVisible

    useEffect(() => {
      if (!isVisible) return
      let frameId: ReturnType<typeof setTimeout>
      const TARGET_FPS = 20
      const INTERVAL = 1000 / TARGET_FPS

      const loop = () => {
        if (isActiveRef.current) {
          invalidate()
        }
        frameId = setTimeout(loop, INTERVAL)
      }
      frameId = setTimeout(loop, INTERVAL)
      return () => clearTimeout(frameId)
    }, [isVisible, invalidate])

    return null
  }
  ```

  This reduces GPU utilization by ~67% while maintaining smooth-looking animation.

### 2.3 Duplicate Mobile Detection — Existing `useIsMobile` Hook Ignored

- **Location:** `src/components/ui/canvas-bg.tsx:132-138`
- **Problem:** The component reinvents mobile detection with `window.innerWidth < 768` + a `resize` event listener. The project already has `src/hooks/use-mobile.ts` (`useIsMobile`) which uses `matchMedia` — a more robust and battery-efficient approach. This violates DRY.
- **Rationale (Expert View):** `matchMedia` fires only on threshold crossing (one event), while `resize` fires continuously during drag (hundreds of events). The existing hook also handles the `undefined` initial state for SSR safety.
- **Fix Suggestion:**

  ```tsx
  import { useIsMobile } from "@/hooks/use-mobile"

  function CanvasBgInner({ className, colorScheme }: CanvasBgProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isVisible = useCanvasVisibility(containerRef)
    const isMobile = useIsMobile()

    const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]
    // ... rest of component
  }
  ```

  Delete the custom `useEffect` + `window.addEventListener("resize")` block entirely.

### 2.4 `catch (err: any)` — TypeScript `any` Bypass

- **Location:** `src/components/auth/login-form.tsx:42`
- **Problem:** Uses `any` type in the catch clause, bypassing TypeScript strict mode. The error message `"Failed to sign in catch: "` also reads like debug output left in production code.
- **Rationale (Expert View):** `any` is a type-safety escape hatch that should be flagged per project standards. The user-facing error message should be polished.
- **Fix Suggestion:**

  ```tsx
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    toast.error(`Failed to sign in: ${message}`)
    setIsLoading(false)
  }
  ```

---

## 3. Tech-Specific Bug Hunt (Deep Dive)

- [ ] **No `Suspense` Boundary for WebGL Canvas**: `CanvasBg` renders immediately with no loading state. While the `WebGLErrorBoundary` handles runtime errors, there's no `Suspense` boundary for the async Three.js initialization. Users on slow connections see a blank area before the shader compiles. Wrap with `<Suspense fallback={<div className={WEBGL_FALLBACK_CLASS} />}>` or use the CSS gradient as a placeholder.

- [ ] **WebGLErrorBoundary Not Tested**: `tests/components/canvas-bg.test.tsx` only tests the happy path (mock Canvas renders). There's no test that verifies the fallback CSS gradient renders when `WebGLErrorBoundary` catches an error. This is the critical resilience path for older browsers.

  ```tsx
  it("renders CSS gradient fallback when Canvas fails", () => {
    vi.mock("@react-three/fiber", () => ({
      Canvas: () => { throw new Error("WebGL not supported") },
      useThree: () => ({ invalidate: vi.fn() }),
      useFrame: () => {},
    }))
    render(<CanvasBg />)
    expect(screen.getByTestId("canvas-bg-fallback")).toBeInTheDocument()
  })
  ```

- [ ] **E2E WebGL Error Suppression Is Overly Broad**: In `e2e/console-errors.spec.ts:47-49`, the `pageerror` handler suppresses ALL errors containing `"WebGL"` or `"BindToCurrentSequence"`. This could mask legitimate Three.js errors (e.g., shader compilation failures, missing uniforms). Use more specific patterns:

  ```typescript
  !text.includes("WebGL context could not be created") &&
  !text.includes("THREE.WebGLRenderer") &&
  !text.includes("BindToCurrentSequence")
  ```

- [ ] **Indentation Inconsistency in Auth Forms**: Both `login-form.tsx` (lines 55-91) and `signup-form.tsx` (lines 41-71) have misaligned JSX after the `motion.div` wrapper was added. The `<CardHeader>`, `<form>`, and inner elements are at inconsistent indentation levels. The `<Card>` opens at 6-space indent but `<CardHeader>` drops to 8-space, then `</Card>` closes at 4-space. Run Prettier/ESLint auto-fix.

- [ ] **`ghostInputClassName` Applied to `<Button>`, Not Just Inputs**: The `ghostInputClassName` constant (name implies inputs) is applied to the GitHub sign-in `<Button>` in both forms. The `text-base` class (for preventing iOS Safari auto-zoom on `<input>`) is irrelevant on buttons. Consider renaming to `ghostAuthClassName` or splitting button/input variants.

- [ ] **Login Page Lost `bg-background` Fallback**: The old login page had `bg-background` which provided a theme-aware background color while loading. The new page relies entirely on `CanvasBg` for background. If `CanvasBg` is lazy-loaded (per Fix 2.1), there's a flash of no background. Add `bg-background` or `bg-zinc-950` to the outer div.

---

## 4. Improvements & Refactoring (Highly Recommended)

- [ ] **Optimization — DPR Tuple Type Safety**: `canvas-bg.tsx:140` declares `dpr` as `number[]`, but `<Canvas dpr>` expects `[number, number]` or `number`. Add explicit typing: `const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]`.

- [ ] **Readability — Extract Spring Config Constant**: The same spring transition `{ type: "spring", stiffness: 150, damping: 25 }` is duplicated in `login-form.tsx:52` and `signup-form.tsx:38`. Extract to `src/lib/auth-styles.ts`:

  ```typescript
  export const authMountTransition = {
    type: "spring" as const,
    stiffness: 150,
    damping: 25,
  }
  ```

- [ ] **Readability — Extract Card Ghost Classes**: The card class `"w-full max-w-md border-white/10 bg-transparent"` is duplicated in both forms. Add to `auth-styles.ts`:

  ```typescript
  export const ghostCardClassName = "w-full max-w-md border-white/10 bg-transparent"
  ```

- [ ] **Typing — `WebGLErrorBoundary` State Interface**: The error boundary uses `{ hasError: boolean }` inline in the class generic. Extract to a named interface for clarity:

  ```typescript
  interface WebGLErrorBoundaryState {
    hasError: boolean
  }
  ```

- [ ] **Auth-redirect JSDoc**: The `resolveRedirectUrl` function in `src/lib/auth-redirect.ts` had a JSDoc explaining security-relevant behavior (ASAP Protocol URL redirect allowlisting). Consider restoring it for maintainability if slop removal touched that file.

---

## 5. Verification Steps

After applying fixes, verify with:

```bash
# 1. Type-check
npx tsc --noEmit

# 2. Unit + Component tests (includes new canvas-bg and auth-styles tests)
npx vitest run

# 3. Lint + Format
npm run check

# 4. Build (verifies dynamic imports resolve correctly)
npm run build

# 5. E2E — Critical auth flow test
npx playwright test e2e/marketplace.spec.ts

# 6. E2E — Console errors (verify WebGL exclusions work)
npx playwright test e2e/console-errors.spec.ts

# 7. Manual — Login with ASAP context
# Navigate to http://localhost:3000/login?from=asap
# Verify contextual message: "Continue with GitHub to access Agent Builder from ASAP Protocol."

# 8. Manual — Mobile viewport (375×812)
# Verify Canvas uses dpr=[1,1], inputs don't trigger iOS auto-zoom
```

---

## 6. File-Level Summary

### ✅ In-Scope (Sprint S4) — 11 Files

| File | Verdict | Notes |
| :--- | :--- | :--- |
| `src/components/ui/canvas-bg.tsx` | ⚠️ Fix 2.2, 2.3 | rAF loop + duplicate useIsMobile |
| `src/hooks/use-canvas-visibility.ts` | ✅ | Clean IntersectionObserver pattern |
| `src/lib/auth-styles.ts` | ✅ | Naming nit (§4 Improvements) |
| `src/app/login/page.tsx` | ⚠️ Fix 2.1 | Missing dynamic import |
| `src/app/signup/page.tsx` | ⚠️ Fix 2.1 | Missing dynamic import |
| `src/components/auth/login-form.tsx` | ⚠️ Fix 2.4 | `any` type, indentation |
| `src/components/auth/signup-form.tsx` | ⚠️ | Indentation (same pattern as login) |
| `src/test/setup.ts` | ✅ | IntersectionObserver polyfill is correct |
| `e2e/console-errors.spec.ts` | ⚠️ | Overly broad error suppression |
| `tests/components/canvas-bg.test.tsx` | ⚠️ | Missing fallback test |
| `tests/lib/auth-styles.test.ts` | ✅ | Good coverage of ghost input classes |

### Slop Removal (Intentional in This PR)

Comment-only removals across API routes, libs, sidebar, builder, and UI components are **intentional** slop cleanup in this PR (e.g. `src/app/api/**`, `src/lib/*`, `src/components/ui/sidebar.tsx`, `src/components/builder/builder-canvas.tsx`, etc.). No separate PR required.
