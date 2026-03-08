/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import type { RegistryAgent } from "@/types/registry"
import { RegistryContent } from "./registry-content"

const mockAgents: RegistryAgent[] = [
  {
    id: "urn:asap:agent:test:agent-1",
    name: "Alpha Agent",
    version: "1.0.0",
    description: "First agent for testing",
    category: "automation",
    tags: ["alpha"],
  },
  {
    id: "urn:asap:agent:test:agent-2",
    name: "Beta Agent",
    version: "2.0.0",
    description: "Second agent for testing",
    category: "analytics",
    tags: ["beta"],
  },
  {
    id: "urn:asap:agent:test:agent-3",
    name: "Gamma Agent",
    version: "0.1.0",
    description: "Third agent in automation",
    category: "automation",
    tags: ["gamma"],
  },
]

const categories = ["automation", "analytics"]

describe("RegistryContent", () => {
  it("renders all agent cards when no filter is applied", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)

    expect(screen.getByText("Alpha Agent")).toBeInTheDocument()
    expect(screen.getByText("Beta Agent")).toBeInTheDocument()
    expect(screen.getByText("Gamma Agent")).toBeInTheDocument()
  })

  it("shows results count", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    expect(screen.getByText("Showing 3 agents")).toBeInTheDocument()
  })

  it("filters agents by search query", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)

    const searchInput = screen.getByPlaceholderText(/search agents/i)
    fireEvent.change(searchInput, { target: { value: "alpha" } })

    expect(screen.getByText("Alpha Agent")).toBeInTheDocument()
    expect(screen.queryByText("Beta Agent")).not.toBeInTheDocument()
    expect(screen.queryByText("Gamma Agent")).not.toBeInTheDocument()
    expect(screen.getByText("Showing 1 agent")).toBeInTheDocument()
  })

  it("renders category tabs", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)
    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /automation/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /analytics/i })).toBeInTheDocument()
  })

  it("shows no agents found when search has no matches", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)

    fireEvent.change(screen.getByPlaceholderText(/search agents/i), {
      target: { value: "nonexistent" },
    })

    expect(screen.getByText("No agents found")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search or filters")).toBeInTheDocument()
  })

  it("opens detail dialog when View Details is clicked", () => {
    render(<RegistryContent agents={mockAgents} categories={categories} />)

    fireEvent.click(screen.getAllByRole("button", { name: /view details/i })[0])

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toHaveTextContent("Alpha Agent")
    expect(screen.getByRole("dialog")).toHaveTextContent("First agent for testing")
  })
})
