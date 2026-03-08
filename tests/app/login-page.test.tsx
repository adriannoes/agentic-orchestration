// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import LoginPage from "@/app/login/page"

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("passes fromAsap={true} to LoginForm when searchParams resolves to { from: 'asap' }", async () => {
    const component = await LoginPage({
      searchParams: Promise.resolve({ from: "asap" }),
    })
    render(component)

    expect(
      screen.getByText("Continue with GitHub to access Agent Builder from ASAP Protocol."),
    ).toBeInTheDocument()
  })

  it("passes fromAsap={false} to LoginForm when searchParams resolves to { from: 'other' }", async () => {
    const component = await LoginPage({
      searchParams: Promise.resolve({ from: "other" }),
    })
    render(component)

    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })

  it("passes fromAsap={false} to LoginForm when searchParams resolves to empty object", async () => {
    const component = await LoginPage({
      searchParams: Promise.resolve({}),
    })
    render(component)

    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })
})
