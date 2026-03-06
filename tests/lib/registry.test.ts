import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchRegistryAgents, getRegistryCategories } from "@/lib/registry"

const mockAgent1 = {
  id: "urn:asap:agent:user:agent-1",
  name: "Agent One",
  version: "1.0.0",
  description: "First test agent",
  category: "automation",
  tags: ["test"],
}

const mockAgent2 = {
  id: "urn:asap:agent:user:agent-2",
  name: "Agent Two",
  version: "2.0.0",
  description: "Second test agent",
  category: "analytics",
  tags: ["data"],
}

const mockRevokedAgent = {
  id: "urn:asap:agent:user:agent-revoked",
  name: "Revoked Agent",
  version: "0.1.0",
  description: "This agent is revoked",
  category: "automation",
}

function createFetchMock(registryResponse: unknown, revokedResponse: unknown) {
  let callCount = 0
  return vi.fn(() => {
    callCount++
    if (callCount === 1) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(registryResponse),
      })
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(revokedResponse),
    })
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("fetchRegistryAgents", () => {
  it("returns agents from valid registry response", async () => {
    const mockFetch = createFetchMock(
      { agents: [mockAgent1, mockAgent2] },
      { revoked_agents: [] }
    )
    vi.stubGlobal("fetch", mockFetch)

    const result = await fetchRegistryAgents()

    expect(result.agents).toHaveLength(2)
    expect(result.agents[0].name).toBe("Agent One")
    expect(result.agents[1].name).toBe("Agent Two")
    expect(result.error).toBeUndefined()
  })

  it("filters out revoked agents", async () => {
    const mockFetch = createFetchMock(
      { agents: [mockAgent1, mockRevokedAgent] },
      {
        revoked_agents: [
          {
            id: mockRevokedAgent.id,
            revoked_at: "2026-01-01T00:00:00Z",
            reason: "Violation",
          },
        ],
      }
    )
    vi.stubGlobal("fetch", mockFetch)

    const result = await fetchRegistryAgents()

    expect(result.agents).toHaveLength(1)
    expect(result.agents[0].name).toBe("Agent One")
  })

  it("returns empty array with error on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))))

    const result = await fetchRegistryAgents()

    expect(result.agents).toEqual([])
    expect(result.error).toBeDefined()
  })

  it("returns empty array with error on non-OK HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 500, statusText: "Internal Server Error" })
      )
    )

    const result = await fetchRegistryAgents()

    expect(result.agents).toEqual([])
    expect(result.error).toContain("500")
  })

  it("returns empty array with error on malformed JSON", async () => {
    const mockFetch = createFetchMock(
      { not_agents: "bad data" },
      { revoked_agents: [] }
    )
    vi.stubGlobal("fetch", mockFetch)

    const result = await fetchRegistryAgents()

    expect(result.agents).toEqual([])
    expect(result.error).toBeDefined()
  })

  it("returns all agents when revoked list fetch fails", async () => {
    let callCount = 0
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ agents: [mockAgent1] }),
          })
        }
        return Promise.reject(new Error("Revoked list unavailable"))
      })
    )

    const result = await fetchRegistryAgents()

    expect(result.agents).toHaveLength(1)
    expect(result.error).toBeUndefined()
  })

  it("returns empty agents for empty registry", async () => {
    const mockFetch = createFetchMock(
      { agents: [] },
      { revoked_agents: [] }
    )
    vi.stubGlobal("fetch", mockFetch)

    const result = await fetchRegistryAgents()

    expect(result.agents).toEqual([])
    expect(result.error).toBeUndefined()
  })
})

describe("getRegistryCategories", () => {
  it("extracts unique categories sorted alphabetically", () => {
    const categories = getRegistryCategories([
      mockAgent1,
      mockAgent2,
      { ...mockAgent1, id: "dup", category: "automation" },
    ] as any)

    expect(categories).toEqual(["analytics", "automation"])
  })

  it("excludes null/undefined categories", () => {
    const categories = getRegistryCategories([
      mockAgent1,
      { ...mockAgent2, category: null },
      { ...mockAgent1, id: "no-cat", category: undefined },
    ] as any)

    expect(categories).toEqual(["automation"])
  })

  it("returns empty array for no agents", () => {
    expect(getRegistryCategories([])).toEqual([])
  })
})
