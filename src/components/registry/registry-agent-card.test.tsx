/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import type { RegistryAgent } from "@/types/registry"
import { RegistryAgentCard } from "./registry-agent-card"

const mockAgent: RegistryAgent = {
  id: "urn:asap:agent:test:agent-1",
  name: "Test Agent",
  version: "1.0.0",
  description: "A test agent for unit testing",
  category: "automation",
  tags: ["test", "ai", "automation"],
}

const mockAgentWithAuth: RegistryAgent = {
  ...mockAgent,
  id: "urn:asap:agent:test:agent-2",
  name: "Auth Agent",
  auth: { schemes: ["bearer", "api-key"] },
}

describe("RegistryAgentCard", () => {
  it("renders agent name, version, and description", () => {
    const onViewDetails = vi.fn()
    render(<RegistryAgentCard agent={mockAgent} onViewDetails={onViewDetails} />)

    expect(screen.getByText("Test Agent")).toBeInTheDocument()
    expect(screen.getByText("v1.0.0")).toBeInTheDocument()
    expect(screen.getByText("A test agent for unit testing")).toBeInTheDocument()
  })

  it("renders category and tags", () => {
    render(<RegistryAgentCard agent={mockAgent} onViewDetails={vi.fn()} />)

    expect(screen.getAllByText("automation").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("test")).toBeInTheDocument()
    expect(screen.getByText("ai")).toBeInTheDocument()
  })

  it("shows lock icon when agent has auth schemes", () => {
    render(<RegistryAgentCard agent={mockAgentWithAuth} onViewDetails={vi.fn()} />)
    const lockIcon = document.querySelector('[class*="lucide-lock"]')
    expect(lockIcon).toBeInTheDocument()
  })

  it("does not show lock icon when agent has no auth", () => {
    render(<RegistryAgentCard agent={mockAgent} onViewDetails={vi.fn()} />)
    const lockIcon = document.querySelector('[class*="lucide-lock"]')
    expect(lockIcon).not.toBeInTheDocument()
  })

  it("calls onViewDetails when View Details button is clicked", () => {
    const onViewDetails = vi.fn()
    render(<RegistryAgentCard agent={mockAgent} onViewDetails={onViewDetails} />)

    fireEvent.click(screen.getByRole("button", { name: /view details/i }))

    expect(onViewDetails).toHaveBeenCalledTimes(1)
    expect(onViewDetails).toHaveBeenCalledWith(mockAgent)
  })

  it("shows +N badge when agent has more than 3 tags", () => {
    const agentWithManyTags: RegistryAgent = {
      ...mockAgent,
      tags: ["a", "b", "c", "d", "e"],
    }
    render(<RegistryAgentCard agent={agentWithManyTags} onViewDetails={vi.fn()} />)

    expect(screen.getByText("+2")).toBeInTheDocument()
  })
})
