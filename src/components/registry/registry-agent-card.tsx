"use client"

import type { RegistryAgent } from "@/types/registry"
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
    <Card className="flex flex-col transition-colors hover:border-indigo-500/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{agent.name}</CardTitle>
          <div className="flex items-center gap-2">
            {hasAuth && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            <Badge variant="secondary" className="text-xs">
              v{agent.version}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.category && (
            <Badge variant="outline" className="text-xs">
              {agent.category}
            </Badge>
          )}
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {extraTagCount > 0 && (
            <Badge variant="secondary" className="text-xs">
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
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
