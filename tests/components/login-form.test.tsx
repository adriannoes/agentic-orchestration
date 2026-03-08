// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { LoginForm } from "@/components/auth/login-form"

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows contextual message when fromAsap is true", () => {
    render(<LoginForm fromAsap={true} />)
    expect(
      screen.getByText("Continue with GitHub to access Agent Builder from ASAP Protocol."),
    ).toBeInTheDocument()
  })

  it("shows default message when fromAsap is false", () => {
    render(<LoginForm fromAsap={false} />)
    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })

  it("shows default message when fromAsap is undefined", () => {
    render(<LoginForm />)
    expect(screen.getByText("Sign in with GitHub to access your account")).toBeInTheDocument()
  })

  it("shows Back to ASAP Protocol link only when fromAsap is true", () => {
    const { rerender } = render(<LoginForm fromAsap={false} />)
    expect(screen.queryByText(/Back to ASAP Protocol/)).not.toBeInTheDocument()

    rerender(<LoginForm fromAsap={true} />)
    expect(screen.getByText(/Back to ASAP Protocol/)).toBeInTheDocument()
  })

  it("disables button and shows Signing in... during loading", async () => {
    let resolveSignIn: () => void
    vi.mocked(signIn).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignIn = resolve
      }) as unknown as ReturnType<typeof signIn>,
    )

    const user = userEvent.setup()
    render(<LoginForm />)

    const button = screen.getByRole("button", { name: /sign in with github/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled()
    })

    resolveSignIn!()
  })

  it("calls toast.error when signIn rejects", async () => {
    vi.mocked(signIn).mockRejectedValue(new Error("Auth failed"))

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /sign in with github/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to sign in with GitHub")
    })
  })

  it("calls toast.error when signIn returns ok: false", async () => {
    vi.mocked(signIn).mockResolvedValue({
      ok: false,
      error: "OAuthError",
      status: 403,
      url: null,
      code: undefined,
    } as import("next-auth/react").SignInResponse)

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /sign in with github/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to sign in with GitHub")
    })
  })
})
