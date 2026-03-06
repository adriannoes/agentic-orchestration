import type { RegistryAgent, FetchRegistryResult } from "@/types/registry"
import { registryResponseSchema, revokedResponseSchema } from "./registry-schema"

const REGISTRY_URL =
  process.env.NEXT_PUBLIC_REGISTRY_URL ??
  "https://raw.githubusercontent.com/adriannoes/asap-protocol/main/registry.json"

const REVOKED_URL =
  process.env.NEXT_PUBLIC_REVOKED_URL ??
  "https://raw.githubusercontent.com/adriannoes/asap-protocol/main/revoked_agents.json"

export async function fetchRegistryAgents(): Promise<FetchRegistryResult> {
  try {
    const registryRes = await fetch(REGISTRY_URL, {
      next: { revalidate: 60 },
    })

    if (!registryRes.ok) {
      console.error(`Registry fetch failed: ${registryRes.status} ${registryRes.statusText}`)
      return { agents: [], error: `Failed to fetch registry (HTTP ${registryRes.status})` }
    }

    const registryJson = await registryRes.json()
    const registryParsed = registryResponseSchema.safeParse(registryJson)

    if (!registryParsed.success) {
      console.error("Registry validation failed:", registryParsed.error.flatten())
      return { agents: [], error: "Invalid registry data format" }
    }

    let revokedIds: Set<string> = new Set()
    try {
      const revokedRes = await fetch(REVOKED_URL, {
        next: { revalidate: 60 },
      })
      if (revokedRes.ok) {
        const revokedJson = await revokedRes.json()
        const revokedParsed = revokedResponseSchema.safeParse(revokedJson)
        if (revokedParsed.success) {
          revokedIds = new Set(revokedParsed.data.revoked_agents.map((r) => r.id))
        }
      }
    } catch {
      console.warn("Failed to fetch revoked agents list — showing all agents")
    }

    const activeAgents = registryParsed.data.agents.filter(
      (agent) => !revokedIds.has(agent.id)
    )

    return { agents: activeAgents }
  } catch (error) {
    console.error("Registry fetch error:", error)
    return { agents: [], error: "Failed to connect to registry" }
  }
}

export function getRegistryCategories(agents: RegistryAgent[]): string[] {
  const categories = new Set<string>()
  for (const agent of agents) {
    if (agent.category) {
      categories.add(agent.category)
    }
  }
  return Array.from(categories).sort()
}
