"use client"

import type { RegistryAgent } from "@/types/registry"

const FLUID_BADGE = "bg-black/5 dark:bg-white/10 backdrop-blur-sm text-xs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface RegistryAgentCardProps {
  agent: RegistryAgent
  onViewDetails: (agent: RegistryAgent) => void
}

export function RegistryAgentCard({ agent, onViewDetails }: RegistryAgentCardProps) {
  const hasAuth = agent.auth?.schemes && agent.auth.schemes.length > 0
  const visibleTags = agent.tags?.slice(0, 3) ?? []
  const extraTagCount = (agent.tags?.length ?? 0) - 3

  return (
    <Card className="border-border/80 hover:border-primary/20 hover-lift flex flex-col transition-all duration-300 dark:border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
          <div className="flex items-center gap-2">
            {hasAuth && (
              <Lock className="text-muted-foreground h-3.5 w-3.5" data-testid="lock-icon" />
            )}
            <Badge variant="secondary" className={FLUID_BADGE}>
              v{agent.version || agent.asap_version || "1.0"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-muted-foreground line-clamp-2 text-sm">{agent.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.category && (
            <Badge variant="outline" className={FLUID_BADGE}>
              {agent.category}
            </Badge>
          )}
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary" className={FLUID_BADGE}>
              {tag}
            </Badge>
          ))}
          {extraTagCount > 0 && (
            <Badge variant="secondary" className={FLUID_BADGE}>
              +{extraTagCount}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetails(agent)}
          aria-label={`View details for ${agent.name}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
