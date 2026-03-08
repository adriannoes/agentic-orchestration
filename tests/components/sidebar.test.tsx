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

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("@/lib/auth/actions", () => ({
  signOut: vi.fn(),
}))

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_ASAP_PROTOCOL_URL: "https://asap-protocol.vercel.app",
  },
}))

describe("Sidebar", () => {
  it("shows 'Registry' label instead of 'Marketplace'", () => {
    render(<Sidebar />)
    expect(screen.getByText("Registry")).toBeInTheDocument()
    expect(screen.queryByText("Marketplace")).not.toBeInTheDocument()
  })

  it("has ASAP Protocol external link", () => {
    render(<Sidebar />)
    const link = screen.getByRole("link", { name: "Open ASAP Protocol" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href")
    expect(link.getAttribute("href")).toContain("asap-protocol")
  })

  it("has clickable footer 'Powered by ASAP protocol.'", () => {
    render(<Sidebar />)
    const footerLink = screen.getByText("Powered by ASAP protocol.")
    expect(footerLink.tagName.toLowerCase()).toBe("a")
    expect(footerLink).toHaveAttribute("href")
  })
})
