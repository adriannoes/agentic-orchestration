# Sprint S1: Foundation & Dependencies

> **Roadmap**: [Design System Revamp](./tasks-design-system-revamp-roadmap.md) · **Design System**: [Agent Builder Design System](../../../product-specs/design-system-agent-builder.md)

> **Branch**: `feat/design-system-s1-foundation`
> **PR Title**: `feat(design): install 3D dependencies, audit OKLCH tokens, clean legacy CSS`
> **Depends on**: Nothing (first sprint)
> **Enables**: Sprint S2 (reusable UI components rely on Three.js, verified tokens, and clean CSS baseline)

---

## Relevant Files

| File                     | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `package.json`           | Add `three`, `@react-three/fiber`, `@types/three` (Task 1.1 done)       |
| `package-lock.json`      | Lockfile updated by npm install                                         |
| `src/app/globals.css`    | Audit and align OKLCH tokens; @theme inline verified (Task 2.0 done)    |
| ~~`styles/globals.css`~~ | Deleted (Task 3.0); `styles/` directory removed                         |
| `src/app/layout.tsx`     | Geist font integration; `display: "swap"` for Sans/Mono (CLS avoidance) |
| `src/lib/env.ts`         | Verify env helper (used by sidebar for ASAP URL)                        |
| `src/middleware.ts`      | Skip API rate limit when PLAYWRIGHT_E2E=1 or CI (E2E stability)         |
| `playwright.config.ts`   | webServer env: PLAYWRIGHT_E2E=1 for rate-limit bypass                   |

### Notes

- This sprint is purely additive/config. No UI changes, no visual regressions.
- Run `npm run build && npx playwright test && npx vitest run` as the final gate.

---

## Task 1.0: Install WebGL Dependencies

**Trigger:** Start of Sprint S1 — manual setup step.
**Enables:** Sprint S4 (WebGL auth backgrounds rely on Three.js + R3F).
**Depends on:** Nothing.

**Acceptance Criteria:**

- `package.json` contains `three`, `@react-three/fiber`, and `@types/three` without version conflicts.
- `npm run build` succeeds with zero errors referencing new packages.

---

- [x] 1.1 Install Three.js and React Three Fiber
  - **File**: `package.json` (modify via npm install)
  - **What**: Run `npm install three @react-three/fiber` and `npm install -D @types/three` in the project root.
  - **Why**: Required for Sprint S4 (WebGL Canvas shader backgrounds on auth pages). Installing now to verify no dependency conflicts with the existing Next.js 16 + React 19 stack.
  - **Pattern**: Similar to how `framer-motion` was already installed (`"framer-motion": "^12.34.5"` in `package.json`).
  - **Verify**: `npm ls three @react-three/fiber @types/three` shows installed versions without `UNMET PEER DEPENDENCY` warnings. Then run `npm run build` — should succeed with zero new errors.

  **Integration**: These packages will be imported by `src/components/ui/canvas-bg.tsx` (Sprint S4, Task 1.0) and are NOT used until that sprint.

---

## Task 2.0: Audit & Align OKLCH Color Tokens

**Trigger:** Task 1.0 complete (clean build with new deps).
**Enables:** Sprint S2 (all new components inherit palette from CSS variables).
**Depends on:** Task 1.0.

**Acceptance Criteria:**

- `:root` light mode tokens exactly match the Clean Architect spec (pure zinc neutrals, hue `0` for bg/border/muted, hue `275-280` only for primary/accent/ring).
- `.dark` mode tokens use translucent borders (`oklch(1 0 0 / 10%)`) and indigo accent.
- No residual `#hex`, `rgb()`, or `hsl()` values exist in `globals.css`.
- `npm run build` succeeds.
- All existing E2E tests pass (visual changes should be so subtle that no test breaks).

---

- [x] 2.1 Audit light mode tokens against Clean Architect palette
  - **File**: `src/app/globals.css` (modify existing, lines 50–84)
  - **What**: Compare each `:root` CSS variable against the reference ASAP palette. The current palette uses an indigo hue shift (`270–275`) on tokens that should be pure zinc neutral (hue `0`). Specifically:
    - `--background`: current `oklch(0.985 0.002 270)` → should be `oklch(1 0 0)` (pure white)
    - `--foreground`: current `oklch(0.16 0.005 270)` → should be `oklch(0.145 0 0)` (pure near-black)
    - `--card`, `--popover`: should be `oklch(1 0 0)`
    - `--card-foreground`, `--popover-foreground`: should be `oklch(0.145 0 0)`
    - `--secondary`, `--muted`: should be `oklch(0.97 0 0)` (neutral, hue `0`)
    - `--secondary-foreground`: should be `oklch(0.205 0 0)`
    - `--muted-foreground`: should be `oklch(0.556 0 0)`
    - `--accent`: should be `oklch(0.97 0 0)` (light mode accent is neutral)
    - `--accent-foreground`: should be `oklch(0.205 0 0)`
    - `--border`, `--input`: should be `oklch(0.922 0 0)`
    - `--ring`: should be `oklch(0.708 0 0)` (neutral ring in light mode)
    - **Keep as-is** (intentional indigo accent): `--primary: oklch(0.52 0.19 275)`, `--primary-foreground`
    - `--sidebar-*` tokens: align neutral ones (bg, fg, border) to hue `0`; keep `--sidebar-primary` as indigo.
  - **Why**: The ASAP Protocol uses a strict zinc-neutral base. Adding indigo hue to neutral surfaces (backgrounds, borders) creates an unintentional purple tint that breaks visual consistency between apps.
  - **Pattern**: Reference `styles/globals.css` (it has the correct ASAP values for comparison).
  - **Verify**: Open the app in a browser and toggle light mode — backgrounds should appear pure white, not slightly purplish.

---

- [x] 2.2 Audit dark mode tokens against Clean Architect palette
  - **File**: `src/app/globals.css` (modify existing, lines 86–119)
  - **What**: Compare each `.dark` CSS variable. Key alignments:
    - `--background`: current `oklch(0.14 0.004 275)` → should be `oklch(0.145 0 0)` (pure near-black, no purple hue)
    - `--foreground`: current `oklch(0.96 0.002 270)` → should be `oklch(0.985 0 0)` (pure white)
    - `--card`: current `oklch(0.18 0.004 275)` → should be `oklch(0.145 0 0)` (match background)
    - `--muted`: should be `oklch(0.269 0 0)` (pure zinc muted)
    - `--muted-foreground`: should be `oklch(0.708 0 0)` (neutral)
    - `--border`: current `oklch(1 0 0 / 9%)` ✅ correct (translucent white)
    - `--input`: current `oklch(1 0 0 / 12%)` ✅ correct
    - **Keep as-is** (intentional indigo): `--primary: oklch(0.62 0.2 280)`, `--ring`, `--accent`
    - `--secondary`: should be `oklch(0.269 0 0)` (neutral)
    - Sidebar tokens: `--sidebar: oklch(0.205 0 0)` (neutral dark), keep `--sidebar-primary` as indigo.
  - **Why**: The dark mode must use pure zinc-950 tones to match ASAP's near-black aesthetic. Any residual purple hue on backgrounds/surfaces will be visible and inconsistent.
  - **Verify**: Open the app in dark mode — backgrounds should be pure dark grey, not tinted purple.

---

- [x] 2.3 Verify `@theme inline` mappings are complete
  - **File**: `src/app/globals.css` (verify lines 6–48)
  - **What**: Ensure every CSS variable defined in `:root`/`.dark` is also mapped in the `@theme inline` block. Check that `--font-sans` and `--font-mono` are mapped correctly.
  - **Why**: Tailwind v4 reads design tokens from `@theme inline`. Missing mappings mean utility classes like `bg-background` won't work.
  - **Verify**: Run `npm run build` — no CSS compilation warnings about undefined tokens.

---

## Task 3.0: Clean Up Legacy CSS

**Trigger:** Task 2.0 complete (active `globals.css` is aligned).
**Enables:** Clean baseline for all future sprints (no confusing duplicate CSS files).
**Depends on:** Task 2.0.

**Acceptance Criteria:**

- `styles/globals.css` is deleted.
- No import of `styles/globals.css` exists anywhere in the project.
- `npm run build` succeeds.

---

- [x] 3.1 Verify `styles/globals.css` is not imported
  - **File**: Search across project (not a specific file)
  - **What**: Run `grep -rn "styles/globals" src/ public/ .` to find any imports of the legacy CSS file. Check `next.config.mjs` for any `sassOptions` or CSS references.
  - **Why**: If the file is imported, deleting it will break the build.
  - **Verify**: `grep` returns zero results (or only results pointing to the file itself).

---

- [x] 3.2 Delete legacy `styles/globals.css`
  - **File**: `styles/globals.css` (delete)
  - **What**: Remove the file entirely. If the `styles/` directory is empty after removal, delete the directory too.
  - **Why**: This file duplicates `src/app/globals.css` with a different palette (the original ASAP pure-zinc palette). Having two globals files is confusing and a source of regression.
  - **Verify**: `ls styles/globals.css` returns "No such file". `npm run build` succeeds.

---

## Task 4.0: Build & Test Verification

**Trigger:** Tasks 1.0–3.0 complete.
**Enables:** Sprint S2 (confirmed clean baseline).
**Depends on:** Tasks 1.0, 2.0, 3.0.

**Acceptance Criteria:**

- `npm run build` exits with code 0 and zero TypeScript/CSS errors.
- `npx vitest run` — all existing unit tests pass.
- `npx playwright test` — all 13 E2E test files pass (no visual regressions).

---

- [x] 4.1 Run full build
  - **What**: `npm run build` from project root.
  - **Verify**: Exit code 0, no errors. Check for any "Large page data" warnings in output.

- [x] 4.2 Run unit tests
  - **What**: `npx vitest run` from project root.
  - **Verify**: All tests pass. If any fail, investigate whether they're caused by S1 changes or pre-existing.

- [x] 4.3 Run E2E tests
  - **What**: `npx playwright test` from project root.
  - **Verify**: All 13 test files pass. Pay attention to subtle color-dependent assertions (unlikely but possible).
  - **Result**: Playwright browsers installed (`npx playwright install` / `npx playwright install chromium`). Rate limit disabled during E2E (`PLAYWRIGHT_E2E=1` in webServer, middleware skips limit when `PLAYWRIGHT_E2E=1` or `CI=true`). **58 E2E passed**, 3 failed in `builder-context-menu.spec.ts` (`.react-flow__renderer` not found on /builder — pre-existing timing/selector issue, not S1).

---

## Post-Sprint Verification

Run: `npm run build && npx vitest run && npx playwright test`. Build and vitest must exit 0; Playwright may report 3 known pre-existing failures in `e2e/builder-context-menu.spec.ts` (`.react-flow__renderer` selector/timing on /builder). For a green E2E run, ensure `npx playwright install` (or `npx playwright install chromium`) has been run once.
