// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { RegistryAgentCard } from "@/components/registry/registry-agent-card"
import type { RegistryAgent } from "@/types/registry"

const fullAgent: RegistryAgent = {
  id: "urn:asap:agent:user:test-agent",
  name: "Test Agent",
  version: "1.2.3",
  description: "A test agent for unit testing purposes",
  category: "automation",
  tags: ["tag1", "tag2", "tag3", "tag4"],
  auth: { schemes: ["bearer"] },
  capabilities: { skills: [{ id: "s1", description: "Skill one" }] },
  endpoints: { asap: "https://example.com/asap" },
  sla: { max_response_time_seconds: 5 },
  repository_url: "https://github.com/test/repo",
  documentation_url: null,
  built_with: "langchain",
}

const minimalAgent: RegistryAgent = {
  id: "urn:asap:agent:user:minimal",
  name: "Minimal Agent",
  version: "0.1.0",
  description: "Agent with only required fields",
}

describe("RegistryAgentCard", () => {
  it("renders agent name and version badge", () => {
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
    expect(screen.getByText("Test Agent")).toBeInTheDocument()
    expect(screen.getByText("v1.2.3")).toBeInTheDocument()
  })

  it("renders description", () => {
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
    expect(screen.getByText("A test agent for unit testing purposes")).toBeInTheDocument()
  })

  it("renders category badge when category is not null", () => {
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
    expect(screen.getByText("automation")).toBeInTheDocument()
  })

  it("does NOT render category badge when category is undefined", () => {
    render(<RegistryAgentCard agent={minimalAgent} onViewDetails={vi.fn()} />)
    expect(screen.queryByText("automation")).not.toBeInTheDocument()
  })

  it("renders up to 3 visible tags plus overflow count", () => {
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
    expect(screen.getByText("tag1")).toBeInTheDocument()
    expect(screen.getByText("tag2")).toBeInTheDocument()
    expect(screen.getByText("tag3")).toBeInTheDocument()
    expect(screen.getByText("+1")).toBeInTheDocument()
  })

  it("shows lock icon when auth schemes are present", () => {
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={vi.fn()} />)
    expect(screen.getByTestId("lock-icon")).toBeInTheDocument()
  })

  it("does not show lock icon when agent has no auth", () => {
    render(<RegistryAgentCard agent={minimalAgent} onViewDetails={vi.fn()} />)
    expect(screen.queryByTestId("lock-icon")).not.toBeInTheDocument()
  })

  it("shows +N badge when agent has more than 3 tags (e.g. 5 tags → +2)", () => {
    const agentWithFiveTags: RegistryAgent = {
      ...fullAgent,
      tags: ["a", "b", "c", "d", "e"],
    }
    render(<RegistryAgentCard agent={agentWithFiveTags} onViewDetails={vi.fn()} />)
    expect(screen.getByText("+2")).toBeInTheDocument()
  })

  it("calls onViewDetails when View Details button is clicked", () => {
    const onViewDetails = vi.fn()
    render(<RegistryAgentCard agent={fullAgent} onViewDetails={onViewDetails} />)
    fireEvent.click(screen.getByRole("button", { name: /view details/i }))
    expect(onViewDetails).toHaveBeenCalledWith(fullAgent)
  })

  it("shows asap_version in badge when version is undefined (fallback)", () => {
    const agentWithAsapVersionOnly: RegistryAgent = {
      ...minimalAgent,
      id: "urn:asap:agent:user:asap-only",
      name: "Asap Version Agent",
      version: undefined,
      asap_version: "2.0.0",
    }
    render(<RegistryAgentCard agent={agentWithAsapVersionOnly} onViewDetails={vi.fn()} />)
    expect(screen.getByText("v2.0.0")).toBeInTheDocument()
  })
})
