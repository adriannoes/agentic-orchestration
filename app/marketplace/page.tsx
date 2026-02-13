import { IntegrationMarketplace } from "@/components/integration-marketplace"

export default function MarketplacePage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Integration Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Discover and install integrations to extend your agent capabilities
          </p>
        </div>

        <IntegrationMarketplace />
      </div>
    </div>
  )
}
