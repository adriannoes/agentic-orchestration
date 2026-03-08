// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { useSearchParams } from "next/navigation"
import { LoginFormWithParams } from "@/components/auth/login-form-with-params"

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe("LoginPage (LoginFormWithParams)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows fromAsap message when searchParams has from=asap", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "from" ? "asap" : null),
    } as unknown as ReturnType<typeof useSearchParams>)
    render(<LoginFormWithParams />)

    expect(
      screen.getByText("Continue with GitHub to access Agent Builder from ASAP Protocol."),
    ).toBeInTheDocument()
  })

  it("shows default message when searchParams has from=other", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "from" ? "other" : null),
    } as unknown as ReturnType<typeof useSearchParams>)
    render(<LoginFormWithParams />)

    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })

  it("shows default message when searchParams has no from", () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as unknown as ReturnType<typeof useSearchParams>)
    render(<LoginFormWithParams />)

    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })
})
