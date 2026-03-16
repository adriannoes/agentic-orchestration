import { describe, it, expect } from "vitest"
import { ghostAuthClassName, ghostCardClassName, authMountTransition } from "@/lib/auth-styles"

describe("auth-styles", () => {
  it("ghostAuthClassName includes transparent background and white borders", () => {
    expect(ghostAuthClassName).toContain("bg-transparent")
    expect(ghostAuthClassName).toContain("border-white/10")
    expect(ghostAuthClassName).toContain("focus:border-white/30")
  })

  it("ghostAuthClassName includes text-base to prevent iOS Safari auto-zoom", () => {
    expect(ghostAuthClassName).toContain("text-base")
  })

  it("ghostAuthClassName includes text and placeholder colors", () => {
    expect(ghostAuthClassName).toContain("text-white")
    expect(ghostAuthClassName).toContain("placeholder:text-white/40")
  })

  it("ghostCardClassName includes card layout and ghost styling", () => {
    expect(ghostCardClassName).toContain("w-full")
    expect(ghostCardClassName).toContain("max-w-md")
    expect(ghostCardClassName).toContain("border-white/10")
    expect(ghostCardClassName).toContain("bg-transparent")
  })

  it("authMountTransition has spring config", () => {
    expect(authMountTransition.type).toBe("spring")
    expect(authMountTransition.stiffness).toBe(150)
    expect(authMountTransition.damping).toBe(25)
  })
})
