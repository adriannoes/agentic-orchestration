// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CanvasBg } from "@/components/ui/canvas-bg"

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="r3f-canvas-mock" />,
  useThree: () => ({ invalidate: vi.fn() }),
  useFrame: () => {},
}))

describe("CanvasBg", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders container with data-testid canvas-bg", () => {
    render(<CanvasBg />)
    expect(screen.getByTestId("canvas-bg")).toBeInTheDocument()
  })

  it("accepts className prop", () => {
    const { container } = render(<CanvasBg className="custom-class" />)
    const wrapper = container.querySelector('[data-testid="canvas-bg"]')
    expect(wrapper).toHaveClass("custom-class")
  })

  it("accepts colorScheme prop", () => {
    render(<CanvasBg colorScheme="indigo" />)
    expect(screen.getByTestId("canvas-bg")).toBeInTheDocument()
  })
})
