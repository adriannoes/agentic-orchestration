import { fetchRegistryAgents, getRegistryCategories } from "@/lib/registry"
import { RegistryContent } from "@/components/registry/registry-content"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { AnimatedText } from "@/components/ui/animated-text"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertCircle, Globe } from "lucide-react"

export default async function MarketplacePage() {
  const { agents, error } = await fetchRegistryAgents()
  const categories = getRegistryCategories(agents)

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="relative mb-8 overflow-hidden py-8">
          <BackgroundPaths pathCount={4} className="opacity-50" />
          <div className="relative z-10">
            <AnimatedText
              text="ASAP Agent Registry"
              as="h1"
              className="text-3xl font-bold tracking-tight"
            />
            <p className="text-muted-foreground mt-2">
              Discover agents registered on the ASAP Protocol network
            </p>
          </div>
        </div>

        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Failed to load registry"
            description={error}
            actionLabel="Try again"
            actionHref="/marketplace"
          />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No agents registered yet"
            description="No agents are currently registered on the ASAP Protocol network."
          />
        ) : (
          <RegistryContent agents={agents} categories={categories} />
        )}
      </div>
    </div>
  )
}
