import { fetchRegistryAgents, getRegistryCategories } from "@/lib/registry"
import { RegistryContent } from "@/components/registry/registry-content"

export default async function MarketplacePage() {
  const { agents, error } = await fetchRegistryAgents()
  const categories = getRegistryCategories(agents)

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ASAP Agent Registry</h1>
          <p className="text-muted-foreground mt-2">
            Discover agents registered on the ASAP Protocol network
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <a href="/marketplace" className="text-primary text-sm hover:underline">
              Try again
            </a>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No agents registered yet</p>
          </div>
        ) : (
          <RegistryContent agents={agents} categories={categories} />
        )}
      </div>
    </div>
  )
}
