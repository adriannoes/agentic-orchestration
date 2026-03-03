"use client"

import { useState, useEffect } from "react"
import type { MarketplaceIntegration } from "@/lib/marketplace-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Star } from "lucide-react"
import { MarketplaceCard } from "./marketplace-card"
import { IntegrationDetailDialog } from "./integration-detail-dialog"

const categories = [
  { value: "all", label: "All Integrations" },
  { value: "featured", label: "Featured" },
  { value: "crm", label: "CRM" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
  { value: "productivity", label: "Productivity" },
  { value: "communication", label: "Communication" },
  { value: "ecommerce", label: "E-commerce" },
]

export function IntegrationMarketplace() {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([])
  const [filteredIntegrations, setFilteredIntegrations] = useState<MarketplaceIntegration[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIntegration, setSelectedIntegration] = useState<MarketplaceIntegration | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    fetchIntegrations()
  }, [selectedCategory])

  useEffect(() => {
    filterIntegrations()
  }, [integrations, searchQuery])

  const fetchIntegrations = async () => {
    const params = new URLSearchParams()
    if (selectedCategory === "featured") {
      params.append("featured", "true")
    } else if (selectedCategory !== "all") {
      params.append("category", selectedCategory)
    }

    const res = await fetch(`/api/marketplace/integrations?${params}`)
    const data = await res.json()
    setIntegrations(data)
  }

  const filterIntegrations = () => {
    if (!searchQuery) {
      setFilteredIntegrations(integrations)
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const filtered = integrations.filter(
      (i) =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery) ||
        i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
    setFilteredIntegrations(filtered)
  }

  const handleViewDetails = (integration: MarketplaceIntegration) => {
    setSelectedIntegration(integration)
    setDetailDialogOpen(true)
  }

  const handleInstall = async (id: string) => {
    await fetch(`/api/marketplace/integrations/${id}/install`, { method: "POST" })
    fetchIntegrations()
  }

  const handleUninstall = async (id: string) => {
    await fetch(`/api/marketplace/integrations/${id}/uninstall`, { method: "POST" })
    fetchIntegrations()
  }

  const totalInstalls = integrations.reduce((sum, i) => sum + i.stats.installs, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Installs</p>
              <p className="text-2xl font-bold">{totalInstalls.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">
                {(integrations.reduce((sum, i) => sum + i.stats.rating, 0) / integrations.length || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Search className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">{integrations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredIntegrations.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No integrations found</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <MarketplaceCard
                  key={integration.id}
                  integration={integration}
                  onViewDetails={handleViewDetails}
                  onInstall={handleInstall}
                  onUninstall={handleUninstall}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedIntegration && (
        <IntegrationDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          integration={selectedIntegration}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
        />
      )}
    </div>
  )
}
