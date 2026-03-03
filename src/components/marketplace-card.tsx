"use client"

import type { MarketplaceIntegration } from "@/lib/marketplace-types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Download, Check, Sparkles } from "lucide-react"

interface MarketplaceCardProps {
  integration: MarketplaceIntegration
  onViewDetails: (integration: MarketplaceIntegration) => void
  onInstall: (id: string) => void
  onUninstall: (id: string) => void
}

export function MarketplaceCard({ integration, onViewDetails, onInstall, onUninstall }: MarketplaceCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/80 p-6 transition-colors hover:border-primary/40">
      {integration.isNew && (
        <div className="absolute top-3 right-3">
          <Badge className="border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${integration.color}15` }}
        >
          {integration.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{integration.name}</h3>
            {integration.developer.verified && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{integration.developer.name}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{integration.description}</p>

      <div className="flex items-center gap-3 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-violet-300 text-violet-300" />
          <span className="font-medium">{integration.stats.rating}</span>
          <span className="text-muted-foreground">({integration.stats.reviews})</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Download className="w-4 h-4" />
          <span>{integration.stats.installs.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className={
            integration.pricing.type === "free"
              ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
              : integration.pricing.type === "freemium"
                ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
                : "border-border/80 bg-muted/30 text-foreground"
          }
        >
          {integration.pricing.type === "free"
            ? "Free"
            : integration.pricing.type === "freemium"
              ? "Freemium"
              : integration.pricing.price}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {integration.isInstalled ? (
          <>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
              <Check className="w-4 h-4 mr-2" />
              Installed
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onUninstall(integration.id)}>
              Remove
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" className="flex-1" onClick={() => onInstall(integration.id)}>
              Install
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewDetails(integration)} className="bg-transparent">
              Details
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
