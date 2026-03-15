// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GlassContainer } from "@/components/ui/glass-container"

describe("GlassContainer", () => {
  it("renders children correctly", () => {
    render(
      <GlassContainer>
        <span>Test content</span>
      </GlassContainer>,
    )
    expect(screen.getByText("Test content")).toBeInTheDocument()
  })

  it("applies outer gradient border classes", () => {
    const { container } = render(
      <GlassContainer>
        <span>Content</span>
      </GlassContainer>,
    )
    const outer = container.querySelector('[data-slot="glass-container"]')
    expect(outer).toBeInTheDocument()
    expect(outer).toHaveClass("bg-gradient-to-b")
    expect(outer).toHaveClass("from-black/10")
    expect(outer).toHaveClass("to-white/10")
    expect(outer).toHaveClass("p-px")
    expect(outer).toHaveClass("rounded-2xl")
    expect(outer).toHaveClass("backdrop-blur-lg")
    expect(outer).toHaveClass("dark:from-white/10")
    expect(outer).toHaveClass("dark:to-white/5")
  })

  it("applies inner frosted glass classes", () => {
    const { container } = render(
      <GlassContainer>
        <span>Content</span>
      </GlassContainer>,
    )
    const outer = container.querySelector('[data-slot="glass-container"]')
    const inner = outer?.firstElementChild
    expect(inner).toBeInTheDocument()
    expect(inner).toHaveClass("bg-white/95")
    expect(inner).toHaveClass("backdrop-blur-md")
    expect(inner).toHaveClass("rounded-2xl")
    expect(inner).toHaveClass("dark:bg-black/80")
  })

  it("merges className into the outer wrapper (layout control)", () => {
    const { container } = render(
      <GlassContainer className="mx-auto max-w-md">
        <span>Content</span>
      </GlassContainer>,
    )
    const outer = container.querySelector('[data-slot="glass-container"]')
    expect(outer).toHaveClass("mx-auto")
    expect(outer).toHaveClass("max-w-md")
  })

  it("merges innerClassName into the inner container", () => {
    const { container } = render(
      <GlassContainer innerClassName="p-8 text-center">
        <span>Content</span>
      </GlassContainer>,
    )
    const outer = container.querySelector('[data-slot="glass-container"]')
    const inner = outer?.firstElementChild
    expect(inner).toHaveClass("p-8")
    expect(inner).toHaveClass("text-center")
  })
})
