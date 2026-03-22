# Sprint 3: Auth + Design + Tests

> **Roadmap**: [Cross-Platform Integration](../../../product-specs/roadmap/cross-platform-integration-agentic.md) · **PRD**: [prd-cross-platform-integration-agentic](../../../product-specs/prd-cross-platform-integration-agentic.md)
> **Branch**: `feat/sso-design-tests`
> **PR Title**: `feat(auth): add SSO cross-app redirect, design alignment, and test coverage`
> **Depends on**: Sprint 1 (env vars, data layer) + Sprint 2 (registry UI, sidebar, old code removed)
> **Enables**: Deployment to Vercel (Step 1.10 in PRD §11). After deploy, asap-protocol can ship its changes.

---

## Pre-flight Checklist

Before starting, verify:

```bash
# 1. Sprint 2 branch is merged to main
git checkout main && git pull

# 2. Create Sprint 3 branch
git checkout -b feat/sso-design-tests

# 3. Sprint 1+2 files exist
ls src/types/registry.d.ts src/lib/registry.ts src/components/registry/registry-content.tsx

# 4. Old marketplace files are gone
ls src/components/integration-marketplace.tsx 2>&1 | grep "No such file"

# 5. Build works
npm run build

# 6. Existing tests pass
npx vitest run
```

---

## Task 6.0: SSO & Auth Configuration

**Trigger:** Can start immediately (independent of Sprint 2 UI).
**Enables:** Cross-app SSO from ASAP Protocol to Agent Builder. Required before ASAP Protocol ships its "Agent Builder" CTA.
**Depends on:** Sprint 1 (env var `NEXT_PUBLIC_ASAP_PROTOCOL_URL`).

**Acceptance Criteria:**

- `src/auth.ts` has a `redirect` callback that allows `NEXT_PUBLIC_ASAP_PROTOCOL_URL` as valid redirect.
- `/login?from=asap` shows contextual message: "Continue with GitHub to access Agent Builder from ASAP Protocol."
- `/login` (without param) shows default message unchanged.
- Login redirects to `/` after successful GitHub sign-in.

---

- [x] 6.1 Add `redirect` callback to `src/auth.ts`
  - **File**: `src/auth.ts` (modify existing)
  - **What**: Add a `redirect` callback to the existing `callbacks` object. This allows NextAuth to redirect to the ASAP Protocol URL when it's provided as a `callbackUrl`.
  - **Why**: By default, NextAuth only allows redirects to the same origin. The ASAP Protocol is on a different domain, so we need to explicitly allowlist it (PRD §FR-3.3).
  - **Pattern**: NextAuth v5 `redirect` callback. Add as a sibling to existing `jwt` and `session` callbacks.
  - **Verify**: After sign-in, calling `signOut({ callbackUrl: "https://asap-protocol.vercel.app" })` redirects to ASAP (not blocked).

  **Current file** (full content — `src/auth.ts`, 37 lines):

  ```typescript
  import NextAuth from "next-auth"
  import GitHub from "next-auth/providers/github"

  export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID ?? "",
        clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
        authorization: { params: { scope: "read:user" } },
      }),
    ],
    trustHost: true,
    callbacks: {
      jwt({ token, user, profile }) {
        if (user) {
          token.id = user.id
          if (profile && typeof profile === "object" && "login" in profile) {
            token.username = profile.login
          }
        }
        return token
      },
      async session({ session, token }) {
        if (typeof token.id === "string" && session.user) {
          session.user.id = token.id
        }
        if (typeof token.username === "string" && session.user) {
          ;(session.user as { username?: string }).username = token.username
        }
        return session
      },
    },
    pages: {
      signIn: "/login",
    },
  })
  ```

  **Change**: Add `redirect` callback BEFORE the `jwt` callback (inside the `callbacks` object, line 13):

  Find this exact block:

  ```typescript
    callbacks: {
      jwt({ token, user, profile }) {
  ```

  Replace with:

  ```typescript
    callbacks: {
      redirect({ url, baseUrl }) {
        const asapUrl = process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL
        if (asapUrl && url.startsWith(asapUrl)) {
          return url
        }
        if (url.startsWith(baseUrl)) return url
        return baseUrl
      },
      jwt({ token, user, profile }) {
  ```

  **Key points for the LLM executor**:
  - Do NOT remove or modify the existing `jwt` and `session` callbacks.
  - The `redirect` callback is a NEW callback added as the FIRST entry in `callbacks`.
  - `process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL` is a server-side env var here (auth.ts runs server-side).
  - The callback allows redirect to ASAP Protocol URL OR same-origin. Everything else falls back to `baseUrl`.

---

- [x] 6.2 Handle `?from=asap` on login page
  - **File**: `src/app/login/page.tsx` (modify existing)
  - **What**: Extract the `from` query parameter from the URL and pass it to `LoginForm`.
  - **Why**: Users arriving from ASAP Protocol need contextual messaging (PRD §FR-3.2).
  - **Pattern**: Next.js App Router `searchParams` (available as async prop in page components).
  - **Verify**: Navigate to `/login?from=asap` → `LoginForm` receives `fromAsap={true}`.

  **Current file** (full content — `src/app/login/page.tsx`, 9 lines):

  ```typescript
  import { LoginForm } from "@/components/auth/login-form"

  export default function LoginPage() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
    )
  }
  ```

  **Replace with this exact content**:

  ```typescript
  import { LoginForm } from "@/components/auth/login-form"

  interface LoginPageProps {
    searchParams: Promise<{ from?: string }>
  }

  export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams
    const fromAsap = params?.from === "asap"

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoginForm fromAsap={fromAsap} />
      </div>
    )
  }
  ```

  **Key points for the LLM executor**:
  - The page becomes `async` because `searchParams` is a `Promise` in Next.js 16 App Router.
  - The `LoginPageProps` interface types the `searchParams` prop.
  - Only the `from` param is extracted; any other params are ignored.

  **Integration**: `LoginForm` (Task 6.3) receives the new `fromAsap` prop.

---

- [x] 6.3 Show contextual message in `LoginForm` for ASAP users
  - **File**: `src/components/auth/login-form.tsx` (modify existing)
  - **What**: Add optional `fromAsap` prop. When true, change the subtitle text to provide ASAP context.
  - **Why**: Reduces confusion for users redirected from ASAP Protocol (PRD §FR-3.2).
  - **Pattern**: Conditional rendering based on prop. Follow existing component structure.
  - **Verify**: `/login?from=asap` → shows "Continue with GitHub to access Agent Builder from ASAP Protocol." `/login` → shows "Sign in with GitHub to access your account".

  **Current file** (full content — `src/components/auth/login-form.tsx`, 54 lines):

  ```typescript
  "use client"

  import { useState } from "react"
  import { signIn } from "next-auth/react"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
  import { toast } from "sonner"
  import { Github } from "lucide-react"

  export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleGitHubSignIn() {
      setIsLoading(true)
      try {
        await signIn("github", { callbackUrl: "/" })
      } catch {
        toast.error("Failed to sign in with GitHub")
        setIsLoading(false)
      }
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Sign in with GitHub to access your account</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleGitHubSignIn()
          }}
        >
          <CardContent>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to use your GitHub account for authentication.
            </p>
          </CardFooter>
        </form>
      </Card>
    )
  }
  ```

  **Apply these changes**:

  **Change 1** — Add `fromAsap` prop to function signature:

  Find:

  ```typescript
  export function LoginForm() {
  ```

  Replace with:

  ```typescript
  interface LoginFormProps {
    fromAsap?: boolean
  }

  export function LoginForm({ fromAsap }: LoginFormProps) {
  ```

  **Change 2** — Update `CardDescription` to be conditional:

  Find:

  ```typescript
          <CardDescription>Sign in with GitHub to access your account</CardDescription>
  ```

  Replace with:

  ```typescript
          <CardDescription>
            {fromAsap
              ? "Continue with GitHub to access Agent Builder from ASAP Protocol."
              : "Sign in with GitHub to access your account"}
          </CardDescription>
  ```

  **Change 3** (optional but recommended) — Add "Back to ASAP Protocol" link in the footer when `fromAsap` is true:

  Find:

  ```typescript
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to use your GitHub account for authentication.
            </p>
          </CardFooter>
  ```

  Replace with:

  ```typescript
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to use your GitHub account for authentication.
            </p>
            {fromAsap && (
              <a
                href={process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL ?? "https://asap-protocol.vercel.app"}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to ASAP Protocol
              </a>
            )}
          </CardFooter>
  ```

---

### Relevant Files (Task 6.0)

| File                                 | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `src/auth.ts`                        | Added `redirect` callback to allow ASAP Protocol URL as valid redirect |
| `src/app/login/page.tsx`             | Extract `?from=asap` and pass `fromAsap` to LoginForm                  |
| `src/components/auth/login-form.tsx` | Contextual message and "Back to ASAP Protocol" link when `fromAsap`    |

---

## Task 7.0: Design Alignment (P1 — non-builder pages)

**Trigger:** Sprint 2 complete (registry page exists).
**Enables:** Visual consistency between ASAP Protocol and Agent Builder (PRD US-4).
**Depends on:** Sprint 2 (components to style exist).

**Acceptance Criteria:**

- CSS variables reviewed and confirmed to map to ASAP's palette.
- Registry components use indigo accents where appropriate.
- `/builder` page and `src/components/builder/*` are NOT modified.

---

- [x] 7.1 Audit CSS variables — verify ASAP palette alignment
  - **File**: `src/app/globals.css` (review — modify only if needed)
  - **What**: Compare the current dark theme CSS variables with ASAP Protocol's palette.
  - **Why**: Visual consistency between apps (PRD §FR-5.1).
  - **Verify**: Visual comparison between both apps' pages.

  **Current dark theme** (lines 86-119 of `src/app/globals.css`):

  ```css
  .dark {
    --background: oklch(0.14 0.004 275); /* ≈ zinc-950 ✓ */
    --foreground: oklch(0.96 0.002 270); /* ≈ white/zinc-100 ✓ */
    --card: oklch(0.18 0.004 275); /* ≈ zinc-900 ✓ */
    --primary: oklch(0.62 0.2 280); /* ≈ indigo-500 ✓ */
    --muted-foreground: oklch(0.72 0.01 270); /* ≈ zinc-400 ✓ */
    --accent: oklch(0.26 0.02 285); /* ≈ indigo-tinted zinc ✓ */
    --border: oklch(1 0 0 / 9%); /* ≈ white/9% — subtle border ✓ */
  }
  ```

  **ASAP Protocol target palette**:
  - Background: `zinc-950` (#09090b) → oklch ≈ 0.13-0.15 — **Current: 0.14 ✓ Match**
  - Card: `zinc-950/80` with backdrop-blur → **Current: 0.18 is slightly lighter (zinc-900). Acceptable difference.**
  - Borders: `zinc-800` (#27272a) → **Current: white/9% is similar. Acceptable.**
  - Text primary: white → **Current: 0.96 ✓ Match**
  - Text muted: `zinc-400`/`zinc-500` → **Current: 0.72 ≈ zinc-400 ✓ Match**
  - Accent: `indigo-400`/`indigo-500` → **Current primary hue 280 is indigo ✓ Match**

  **Assessment**: The current dark theme already uses the indigo/zinc palette (hue 275-280). The "Clean Architect" design aesthetic in this project aligns with ASAP Protocol's dark zinc/indigo palette. **Likely no CSS variable changes needed.**

  If you determine changes are needed, modify ONLY the `.dark` selector in `src/app/globals.css`. DO NOT touch the `:root` (light theme) or any `@keyframes` / `@layer utilities` sections (those are for the builder canvas).

---

- [x] 7.2 Ensure indigo accents on registry components
  - **File**: `src/components/registry/registry-agent-card.tsx` (review — modify if needed)
  - **File**: `src/components/registry/registry-content.tsx` (review — modify if needed)
  - **What**: Check if registry components already have indigo accents through the theme's `--primary` (which is indigo at hue 280). If Shadcn components inherit from `--primary`, no changes needed. If explicit indigo classes are desired, add:
    - Card hover: `hover:border-indigo-500/50` (already in Task 3.1 template)
    - Active tab: should inherit from Shadcn `TabsTrigger` active state
    - Badges: `variant="secondary"` already uses the theme's secondary color
  - **Why**: Indigo is ASAP Protocol's signature accent (PRD §FR-5.1).
  - **Verify**: Registry page has visible indigo accents on hover/active states. No changes to `/builder`.

  **Assessment**: Since the theme's `--primary` is already indigo (oklch hue 280), Shadcn components (Button, Badge, TabsTrigger) will naturally use indigo. The card template in Task 3.1 already includes `hover:border-indigo-500/50`. **Likely minimal or no changes needed.**

---

### Relevant Files (Task 7.0)

| File                                              | Purpose                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `src/app/globals.css`                             | Audited — no changes needed (dark theme already matches ASAP palette) |
| `src/components/registry/registry-agent-card.tsx` | Audited — already has `hover:border-indigo-500/50`                    |
| `src/components/registry/registry-content.tsx`    | Audited — TabsTrigger/Badges inherit theme indigo                     |

---

## Task 8.0: Tests (Unit + E2E)

**Trigger:** Tasks 3.0-6.0 complete (code to test exists).
**Enables:** Deployment confidence. Final gate before Vercel deploy.
**Depends on:** Sprint 2 (components exist) + Task 6.0 (auth changes exist).

**Acceptance Criteria:**

- All unit tests pass: `npx vitest run --reporter=verbose`.
- E2E tests pass: `npx playwright test e2e/marketplace.spec.ts`.
- No regressions: `npx vitest run` and `npx playwright test`.

---

- [x] 8.1 Write unit tests for `RegistryAgentCard`
  - **File**: `tests/components/registry-agent-card.test.tsx` (create new)
  - **What**: Vitest + Testing Library tests for the agent card component.
  - **Why**: Validates card renders correctly for all data configurations (PRD §8.1).
  - **Pattern**: Use `render()` from `@testing-library/react`, `screen`, `fireEvent`.
  - **Verify**: `npx vitest run tests/components/registry-agent-card.test.tsx -v` — all pass.

  **IMPORTANT**: Add `// @vitest-environment jsdom` at the top of the file. This overrides vitest.config.ts's default `environment: 'node'` so Testing Library can access the DOM.

  **Create this file with this exact content**:

  ```typescript
  // @vitest-environment jsdom
  import { describe, it, expect, vi } from "vitest"
  import { render, screen, fireEvent } from "@testing-library/react"
  import { RegistryAgentCard } from "@/components/registry/registry-agent-card"
  import type { RegistryAgent } from "@/types/registry"

  const fullAgent: RegistryAgent = {
    id: "urn:asap:agent:user:test-agent",
    name: "Test Agent",
    version: "1.2.3",
    description: "A test agent for unit testing purposes",
    category: "automation",
    tags: ["tag1", "tag2", "tag3", "tag4"],
    auth: { schemes: ["bearer"] },
    capabilities: { skills: [{ id: "s1", description: "Skill one" }] },
    endpoints: { asap: "https://example.com/asap" },
    sla: { max_response_time_seconds: 5 },
    repository_url: "https://github.com/test/repo",
    documentation_url: null,
    built_with: "langchain",
  }

  const minimalAgent: RegistryAgent = {
    id: "urn:asap:agent:user:minimal",
    name: "Minimal Agent",
    version: "0.1.0",
    description: "Agent with only required fields",
  }

  describe("RegistryAgentCard", () => {
    it("renders agent name and version badge", () => {
      render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
      expect(screen.getByText("Test Agent")).toBeInTheDocument()
      expect(screen.getByText("v1.2.3")).toBeInTheDocument()
    })

    it("renders description", () => {
      render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
      expect(screen.getByText("A test agent for unit testing purposes")).toBeInTheDocument()
    })

    it("renders category badge when category is not null", () => {
      render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
      expect(screen.getByText("automation")).toBeInTheDocument()
    })

    it("does NOT render category badge when category is undefined", () => {
      render(<RegistryAgentCard agent={minimalAgent} onViewDetails={vi.fn()} />)
      expect(screen.queryByText("automation")).not.toBeInTheDocument()
    })

    it("renders up to 3 visible tags plus overflow count", () => {
      render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
      expect(screen.getByText("tag1")).toBeInTheDocument()
      expect(screen.getByText("tag2")).toBeInTheDocument()
      expect(screen.getByText("tag3")).toBeInTheDocument()
      expect(screen.getByText("+1")).toBeInTheDocument()
    })

    it("shows lock icon when auth schemes are present", () => {
      const { container } = render(
        <RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />
      )
      const lockIcon = container.querySelector("[class*='lucide-lock']") ??
        container.querySelector("svg")
      expect(lockIcon).toBeTruthy()
    })

    it("calls onViewDetails when View Details button is clicked", () => {
      const onViewDetails = vi.fn()
      render(<RegistryAgentCard agent={fullAgent} onViewDetails={onViewDetails} />)
      fireEvent.click(screen.getByRole("button", { name: /view details/i }))
      expect(onViewDetails).toHaveBeenCalledWith(fullAgent)
    })
  })
  ```

---

- [x] 8.2 Write unit tests for `RegistryContent` search and filter
  - **File**: `tests/components/registry-content.test.tsx` (create new)
  - **What**: Tests for search and category filtering logic.
  - **Why**: Validates search/filter works correctly (PRD §8.1).
  - **Pattern**: Render `RegistryContent` with mock agents, type into search input, click tabs.
  - **Verify**: `npx vitest run tests/components/registry-content.test.tsx -v` — all pass.

  **IMPORTANT**: Add `// @vitest-environment jsdom` at the top.

  **Create this file with this exact content**:

  ```typescript
  // @vitest-environment jsdom
  import { describe, it, expect } from "vitest"
  import { render, screen, fireEvent } from "@testing-library/react"
  import { RegistryContent } from "@/components/registry/registry-content"
  import type { RegistryAgent } from "@/types/registry"

  const mockAgents: RegistryAgent[] = [
    {
      id: "urn:asap:agent:user:alpha",
      name: "Alpha Bot",
      version: "1.0.0",
      description: "An alpha automation agent",
      category: "automation",
      tags: ["ai"],
    },
    {
      id: "urn:asap:agent:user:beta",
      name: "Beta Analyzer",
      version: "2.0.0",
      description: "A beta analytics agent",
      category: "analytics",
      tags: ["data"],
    },
    {
      id: "urn:asap:agent:user:gamma",
      name: "Gamma Worker",
      version: "0.5.0",
      description: "A gamma automation worker",
      category: "automation",
      tags: ["worker"],
    },
  ]

  const categories = ["analytics", "automation"]

  describe("RegistryContent", () => {
    it("renders all agents when no search query", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
      expect(screen.getByText("Beta Analyzer")).toBeInTheDocument()
      expect(screen.getByText("Gamma Worker")).toBeInTheDocument()
      expect(screen.getByText("Showing 3 agents")).toBeInTheDocument()
    })

    it("filters agents by name (case-insensitive)", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      const input = screen.getByPlaceholderText(/search agents/i)
      fireEvent.change(input, { target: { value: "alpha" } })
      expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
      expect(screen.queryByText("Beta Analyzer")).not.toBeInTheDocument()
      expect(screen.getByText("Showing 1 agent")).toBeInTheDocument()
    })

    it("filters agents by description", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      const input = screen.getByPlaceholderText(/search agents/i)
      fireEvent.change(input, { target: { value: "analytics" } })
      expect(screen.getByText("Beta Analyzer")).toBeInTheDocument()
      expect(screen.queryByText("Alpha Bot")).not.toBeInTheDocument()
    })

    it("filters agents by category tab", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      fireEvent.click(screen.getByRole("tab", { name: /automation/i }))
      expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
      expect(screen.getByText("Gamma Worker")).toBeInTheDocument()
      expect(screen.queryByText("Beta Analyzer")).not.toBeInTheDocument()
    })

    it("shows all agents when 'All' tab is selected", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      fireEvent.click(screen.getByRole("tab", { name: /automation/i }))
      fireEvent.click(screen.getByRole("tab", { name: /all/i }))
      expect(screen.getByText("Showing 3 agents")).toBeInTheDocument()
    })

    it("shows empty state when search yields no results", () => {
      render(<RegistryContent agents={mockAgents} categories={categories} />)
      const input = screen.getByPlaceholderText(/search agents/i)
      fireEvent.change(input, { target: { value: "nonexistent agent xyz" } })
      expect(screen.getByText("No agents found")).toBeInTheDocument()
    })
  })
  ```

---

- [x] 8.3 Write unit tests for sidebar changes
  - **File**: `tests/components/sidebar.test.tsx` (create new)
  - **What**: Tests for sidebar nav items, ASAP Protocol link, and footer link.
  - **Why**: Validates navigation changes are correct (PRD §8.1).
  - **Pattern**: Mock `usePathname` and `useSession`, then render `Sidebar`.
  - **Verify**: `npx vitest run tests/components/sidebar.test.tsx -v` — all pass.

  **IMPORTANT**: Add `// @vitest-environment jsdom` at the top.

  **Create this file with this exact content**:

  ```typescript
  // @vitest-environment jsdom
  import { describe, it, expect, vi } from "vitest"
  import { render, screen } from "@testing-library/react"
  import { Sidebar } from "@/components/sidebar"

  vi.mock("next/navigation", () => ({
    usePathname: () => "/",
  }))

  vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: null, status: "unauthenticated" }),
  }))

  describe("Sidebar", () => {
    it("shows 'Registry' label instead of 'Marketplace'", () => {
      render(<Sidebar />)
      expect(screen.getByText("Registry")).toBeInTheDocument()
      expect(screen.queryByText("Marketplace")).not.toBeInTheDocument()
    })

    it("has ASAP Protocol external link", () => {
      render(<Sidebar />)
      expect(screen.getByText("ASAP Protocol")).toBeInTheDocument()
      const link = screen.getByText("ASAP Protocol").closest("a")
      expect(link).toHaveAttribute("href")
      expect(link?.getAttribute("href")).toContain("asap-protocol")
    })

    it("has clickable footer 'Powered by ASAP protocol.'", () => {
      render(<Sidebar />)
      const footerLink = screen.getByText("Powered by ASAP protocol.")
      expect(footerLink.tagName.toLowerCase()).toBe("a")
      expect(footerLink).toHaveAttribute("href")
    })
  })
  ```

---

- [x] 8.4 Rewrite E2E tests for registry page
  - **File**: `e2e/marketplace.spec.ts` (modify existing — full rewrite)
  - **What**: Replace old marketplace E2E tests with registry-focused tests.
  - **Why**: Old tests reference "Integration Marketplace" heading and "Install" buttons that no longer exist (PRD §8.3).
  - **Pattern**: Follow existing Playwright structure. Use `test.describe`, `page.goto`, `expect`.
  - **Verify**: `npx playwright test e2e/marketplace.spec.ts --headed` — all pass.

  **Current file** (full content — `e2e/marketplace.spec.ts`, 25 lines):

  ```typescript
  import { test, expect } from "@playwright/test"

  test.describe("Integration Marketplace", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/marketplace")
    })

    test("shows Integration Marketplace heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /Integration Marketplace/i })).toBeVisible()
    })

    test("shows Total Installs or stats", async ({ page }) => {
      await expect(page.getByText(/Total Installs|Discover and install/i).first()).toBeVisible()
    })

    test("has category tabs", async ({ page }) => {
      await expect(
        page.getByRole("tab", { name: /All|Featured|CRM|Marketing|Support/i }).first(),
      ).toBeVisible()
    })

    test("shows integration cards or list", async ({ page }) => {
      await expect(
        page
          .getByPlaceholder(/Search/i)
          .or(page.getByRole("button", { name: /Install/i }))
          .or(page.getByText(/No integrations/i))
          .first(),
      ).toBeVisible({ timeout: 8_000 })
    })
  })
  ```

  **Replace with this exact content**:

  ```typescript
  import { test, expect } from "@playwright/test"

  test.describe("ASAP Agent Registry", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/marketplace")
    })

    test("shows ASAP Agent Registry heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /ASAP Agent Registry/i })).toBeVisible()
    })

    test("shows registry description", async ({ page }) => {
      await expect(page.getByText(/Discover agents registered on the ASAP Protocol/i)).toBeVisible()
    })

    test("has search input", async ({ page }) => {
      await expect(page.getByPlaceholderText(/search agents/i)).toBeVisible()
    })

    test("shows agent cards or empty state", async ({ page }) => {
      await expect(
        page
          .getByText(/Showing \d+ agent/i)
          .or(page.getByText(/No agents registered/i))
          .or(page.getByText(/Failed to/i))
          .first(),
      ).toBeVisible({ timeout: 10_000 })
    })

    test("has category tabs with All tab", async ({ page }) => {
      await expect(page.getByRole("tab", { name: /All/i })).toBeVisible()
    })
  })

  test.describe("Sidebar navigation", () => {
    test("shows ASAP Protocol link in sidebar", async ({ page }) => {
      await page.goto("/")
      await expect(page.getByText("ASAP Protocol")).toBeVisible()
      const link = page.getByText("ASAP Protocol").locator("xpath=ancestor::a")
      await expect(link).toHaveAttribute("href", /asap-protocol/)
    })

    test("shows Registry label in sidebar", async ({ page }) => {
      await page.goto("/")
      await expect(page.getByText("Registry")).toBeVisible()
    })
  })

  test.describe("Login with ASAP context", () => {
    test("shows contextual message with ?from=asap", async ({ page }) => {
      await page.goto("/login?from=asap")
      await expect(page.getByText(/ASAP Protocol/i)).toBeVisible()
    })
  })
  ```

---

- [x] 8.5 Run full test suite and verify no regressions
  - **File**: (no file — verification step)
  - **What**: Run the complete verification suite.
  - **Why**: Final gate before deployment.
  - **Verify**: All commands exit with code 0.

  **Run these exact commands in order**:

  ```bash
  # 1. All unit tests
  npx vitest run --reporter=verbose

  # 2. E2E tests
  npx playwright test

  # 3. Type checking
  npx tsc --noEmit

  # 4. Linting
  npm run lint

  # 5. Build
  npm run build
  ```

  **If any command fails**:
  - Read the error output carefully.
  - Fix only the specific failing test or code.
  - Re-run only the failing command to verify the fix.
  - Then re-run the full suite from step 1.

---

### Relevant Files (Task 8.0)

| File                                            | Purpose                                                  |
| ----------------------------------------------- | -------------------------------------------------------- |
| `tests/components/registry-agent-card.test.tsx` | Unit tests for RegistryAgentCard                         |
| `tests/components/registry-content.test.tsx`    | Unit tests for RegistryContent search/filter             |
| `tests/components/sidebar.test.tsx`             | Unit tests for Sidebar (Registry, ASAP link, footer)     |
| `e2e/marketplace.spec.ts`                       | E2E tests for registry, sidebar, login with ASAP context |
| `src/test/setup.ts`                             | PointerEvent polyfills for Radix UI in jsdom             |

---

## Post-Sprint Verification (All 3 Sprints Complete)

After merging Sprint 3, run this final end-to-end check:

```bash
# Full verification on main
git checkout main && git pull
npm install
npm run build
npm run dev

# Manual checks:
# 1. /marketplace → agent cards from registry.json
# 2. Search → filters correctly
# 3. Click card → detail dialog opens
# 4. Sidebar → "Registry" with Globe icon
# 5. Sidebar → "ASAP Protocol" link visible
# 6. Footer → "Powered by ASAP protocol." is clickable
# 7. /login?from=asap → contextual message
# 8. /login → default message
# 9. /builder → UNCHANGED (critical)
```

After all checks pass → **deploy to Vercel** (Step 1.10 in PRD §11). This unblocks the asap-protocol repo to ship its changes (Step 2).
