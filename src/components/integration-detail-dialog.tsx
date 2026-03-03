"use client"

import type { MarketplaceIntegration } from "@/lib/marketplace-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Download, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface IntegrationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration: MarketplaceIntegration
  onInstall: (id: string) => void
  onUninstall: (id: string) => void
}

export function IntegrationDetailDialog({
  open,
  onOpenChange,
  integration,
  onInstall,
  onUninstall,
}: IntegrationDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${integration.color}15` }}
            >
              {integration.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{integration.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">by {integration.developer.name}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{integration.stats.rating}</span>
                  <span className="text-sm text-muted-foreground">({integration.stats.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">{integration.stats.installs.toLocaleString()} installs</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{integration.longDescription}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2">
              {integration.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Pricing</h3>
            <Badge
              variant="outline"
              className={`${
                integration.pricing.type === "free"
                  ? "text-green-500 border-green-500"
                  : integration.pricing.type === "freemium"
                    ? "text-blue-500 border-blue-500"
                    : "text-amber-500 border-amber-500"
              }`}
            >
              {integration.pricing.type === "free"
                ? "Free"
                : integration.pricing.type === "freemium"
                  ? `Freemium - ${integration.pricing.price}`
                  : integration.pricing.price}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {integration.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          {integration.isInstalled ? (
            <>
              <Button variant="outline" className="flex-1 bg-transparent" disabled>
                <Check className="w-4 h-4 mr-2" />
                Installed
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onUninstall(integration.id)
                  onOpenChange(false)
                }}
              >
                Uninstall
              </Button>
            </>
          ) : (
            <Button
              className="flex-1"
              onClick={() => {
                onInstall(integration.id)
                onOpenChange(false)
              }}
            >
              Install Integration
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
