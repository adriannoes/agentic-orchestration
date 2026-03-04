/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { SettingsPanel } from "./settings-panel"

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: undefined,
    setTheme: vi.fn(),
    resolvedTheme: undefined,
    themes: ["light", "dark", "system"],
  }),
}))

describe("SettingsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("theme selector (Appearance)", () => {
    it("renders Settings heading and Appearance tab", () => {
      render(<SettingsPanel />)
      expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /Appearance/i })).toBeInTheDocument()
    })
  })

  describe("theme hydration guard", () => {
    it("renders without crashing when theme is undefined (SSR/mounted guard)", () => {
      expect(() => render(<SettingsPanel />)).not.toThrow()
      expect(screen.getByRole("tab", { name: /Appearance/i })).toBeInTheDocument()
    })
  })
})
