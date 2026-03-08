// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RegistryContent } from "@/components/registry/registry-content"
import type { RegistryAgent } from "@/types/registry"

const mockAgents: RegistryAgent[] = [
  {
    id: "urn:asap:agent:user:alpha",
    name: "Alpha Bot",
    version: "1.0.0",
    description: "An alpha automation agent",
    category: "automation",
    tags: ["ai"],
  },
  {
    id: "urn:asap:agent:user:beta",
    name: "Beta Analyzer",
    version: "2.0.0",
    description: "A beta analytics agent",
    category: "analytics",
    tags: ["data"],
  },
  {
    id: "urn:asap:agent:user:gamma",
    name: "Gamma Worker",
    version: "0.5.0",
    description: "A gamma automation worker",
    category: "automation",
    tags: ["worker"],
  },
]

const categories = ["analytics", "automation"]

describe("RegistryContent", () => {
  it("renders all agents when no search query", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
    expect(screen.getByText("Beta Analyzer")).toBeInTheDocument()
    expect(screen.getByText("Gamma Worker")).toBeInTheDocument()
    expect(screen.getByText("Showing 3 agents")).toBeInTheDocument()
  })

  it("filters agents by name (case-insensitive)", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    const input = screen.getByPlaceholderText(/search agents/i)
    fireEvent.change(input, { target: { value: "alpha" } })
    expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
    expect(screen.queryByText("Beta Analyzer")).not.toBeInTheDocument()
    expect(screen.getByText("Showing 1 agent")).toBeInTheDocument()
  })

  it("filters agents by description", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    const input = screen.getByPlaceholderText(/search agents/i)
    fireEvent.change(input, { target: { value: "analytics" } })
    expect(screen.getByText("Beta Analyzer")).toBeInTheDocument()
    expect(screen.queryByText("Alpha Bot")).not.toBeInTheDocument()
  })

  it("filters agents by tag (search by 'ai' shows only Alpha Bot)", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    const input = screen.getByPlaceholderText(/search agents/i)
    fireEvent.change(input, { target: { value: "ai" } })
    expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
    expect(screen.queryByText("Beta Analyzer")).not.toBeInTheDocument()
    expect(screen.queryByText("Gamma Worker")).not.toBeInTheDocument()
    expect(screen.getByText("Showing 1 agent")).toBeInTheDocument()
  })

  it("filters agents by category tab", async () => {
    const user = userEvent.setup()
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    const automationTab = screen.getByRole("tab", { name: "automation" })
    await user.click(automationTab)
    await waitFor(() => {
      expect(screen.getByText("Alpha Bot")).toBeInTheDocument()
      expect(screen.getByText("Gamma Worker")).toBeInTheDocument()
      expect(screen.queryByText("Beta Analyzer")).not.toBeInTheDocument()
    })
  })

  it("shows all agents when 'All' tab is selected", async () => {
    const user = userEvent.setup()
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    await user.click(screen.getByRole("tab", { name: /automation/i }))
    await user.click(screen.getByRole("tab", { name: /all/i }))
    expect(screen.getByText("Showing 3 agents")).toBeInTheDocument()
  })

  it("shows empty state when search yields no results", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    const input = screen.getByPlaceholderText(/search agents/i)
    fireEvent.change(input, { target: { value: "nonexistent agent xyz" } })
    expect(screen.getByText("No agents found")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search or filters")).toBeInTheDocument()
  })

  it("renders empty state when agents array is empty", () => {
    render(<RegistryContent agents={[]} categories={[]} />)
    expect(screen.getByText("No agents found")).toBeInTheDocument()
    expect(screen.getByText("Showing 0 agents")).toBeInTheDocument()
  })

  it("opens detail dialog when View Details is clicked", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    fireEvent.click(screen.getAllByRole("button", { name: /view details/i })[0])
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toHaveTextContent("Alpha Bot")
    expect(screen.getByRole("dialog")).toHaveTextContent("An alpha automation agent")
  })
})
