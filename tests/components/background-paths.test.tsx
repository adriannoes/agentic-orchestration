// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { BackgroundPaths } from "@/components/ui/background-paths"

describe("BackgroundPaths", () => {
  it("renders SVG with aria-hidden", () => {
    const { container } = render(<BackgroundPaths />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute("aria-hidden", "true")
  })

  it("renders default 6 path elements", () => {
    const { container } = render(<BackgroundPaths />)
    const paths = container.querySelectorAll("svg path")
    expect(paths.length).toBe(6)
  })

  it("renders pathCount when provided", () => {
    const { container } = render(<BackgroundPaths pathCount={4} />)
    const paths = container.querySelectorAll("svg path")
    expect(paths.length).toBe(4)
  })

  it("each path has valid d attribute (SVG path data)", () => {
    const { container } = render(<BackgroundPaths pathCount={2} />)
    const paths = container.querySelectorAll("svg path")
    paths.forEach((path) => {
      const d = path.getAttribute("d")
      expect(d).toBeTruthy()
      expect(d).toMatch(/^M\s+[\d.]+\s+[\d.]+/)
    })
  })
})
