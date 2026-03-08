/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import type { RegistryAgent } from "@/types/registry"
import { RegistryAgentDetail } from "./registry-agent-detail"

const mockAgent: RegistryAgent = {
  id: "urn:asap:agent:test:agent-1",
  name: "Test Agent",
  version: "1.0.0",
  description: "A test agent for unit testing",
  capabilities: {
    skills: [
      { id: "skill-1", description: "First skill" },
      { id: "skill-2", description: "Second skill" },
    ],
  },
  endpoints: {
    asap: "https://api.example.com/asap",
    ws: "wss://api.example.com/ws",
  },
  auth: { schemes: ["bearer"] },
  sla: { max_response_time_seconds: 5 },
  repository_url: "https://github.com/test/repo",
  documentation_url: "https://docs.example.com",
  built_with: "langchain",
  category: "automation",
  tags: ["test", "ai"],
}

describe("RegistryAgentDetail", () => {
  it("returns null when agent is null", () => {
    const { container } = render(
      <RegistryAgentDetail agent={null} open={true} onOpenChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders agent name, version, and description when open", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText("Test Agent")).toBeInTheDocument()
    expect(screen.getByText("v1.0.0")).toBeInTheDocument()
    expect(screen.getByText("A test agent for unit testing")).toBeInTheDocument()
  })

  it("renders capabilities section when agent has skills", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText("Capabilities")).toBeInTheDocument()
    expect(screen.getByText("skill-1")).toBeInTheDocument()
    expect(screen.getByText(/First skill/)).toBeInTheDocument()
    expect(screen.getByText("skill-2")).toBeInTheDocument()
  })

  it("renders endpoints section", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText("Endpoints")).toBeInTheDocument()
    expect(screen.getByText(/HTTP:/)).toBeInTheDocument()
    expect(screen.getByText(/WebSocket:/)).toBeInTheDocument()
  })

  it("renders authentication section when agent has auth", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText("Authentication")).toBeInTheDocument()
    expect(screen.getByText("bearer")).toBeInTheDocument()
  })

  it("renders SLA section when agent has sla", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText("SLA")).toBeInTheDocument()
    expect(screen.getByText(/Max response time/)).toBeInTheDocument()
  })

  it("renders repository and documentation links", () => {
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={vi.fn()} />)

    const repoLink = screen.getByRole("link", { name: /repository/i })
    const docLink = screen.getByRole("link", { name: /documentation/i })

    expect(repoLink).toHaveAttribute("href", "https://github.com/test/repo")
    expect(docLink).toHaveAttribute("href", "https://docs.example.com")
  })

  it("calls onOpenChange when dialog is closed", () => {
    const onOpenChange = vi.fn()
    render(<RegistryAgentDetail agent={mockAgent} open={true} onOpenChange={onOpenChange} />)

    const closeButton = screen.getByRole("button", { name: /close/i })
    fireEvent.click(closeButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
