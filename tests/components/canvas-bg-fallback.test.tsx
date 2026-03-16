// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CanvasBg } from "@/components/ui/canvas-bg"

vi.mock("@react-three/fiber", () => ({
  Canvas: () => {
    throw new Error("WebGL not supported")
  },
  useThree: () => ({ invalidate: vi.fn() }),
  useFrame: () => {},
}))

describe("CanvasBg WebGLErrorBoundary fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders CSS gradient fallback when Canvas/WebGL fails", () => {
    render(<CanvasBg />)
    expect(screen.getByTestId("canvas-bg-fallback")).toBeInTheDocument()
  })
})
