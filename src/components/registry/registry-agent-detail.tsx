"use client"

import type { RegistryAgent } from "@/types/registry"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Globe, Lock, Zap } from "lucide-react"

interface RegistryAgentDetailProps {
  agent: RegistryAgent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistryAgentDetail({ agent, open, onOpenChange }: RegistryAgentDetailProps) {
  if (!agent) return null

  const asapProtocolUrl =
    process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL ?? "https://asap-protocol.vercel.app"
  const hasAuth = agent.auth?.schemes && agent.auth.schemes.length > 0
  const hasSkills = agent.capabilities?.skills && agent.capabilities.skills.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{agent.name}</DialogTitle>
            <Badge variant="secondary">v{agent.version}</Badge>
            {agent.category && <Badge variant="outline">{agent.category}</Badge>}
          </div>
          <DialogDescription>{agent.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {hasSkills && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4" /> Capabilities
              </h3>
              <ul className="space-y-1.5">
                {(agent.capabilities?.skills ?? []).map((skill) => (
                  <li key={skill.id} className="text-sm text-muted-foreground">
                    <span className="font-mono text-xs text-foreground">{skill.id}</span>
                    {" — "}
                    {skill.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {agent.endpoints && (agent.endpoints.asap || agent.endpoints.ws) && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-4 w-4" /> Endpoints
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {agent.endpoints.asap && (
                  <p>
                    <span className="font-medium text-foreground">HTTP:</span> {agent.endpoints.asap}
                  </p>
                )}
                {agent.endpoints.ws && (
                  <p>
                    <span className="font-medium text-foreground">WebSocket:</span>{" "}
                    {agent.endpoints.ws}
                  </p>
                )}
              </div>
            </section>
          )}

          {hasAuth && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4" /> Authentication
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(agent.auth?.schemes ?? []).map((scheme) => (
                  <Badge key={scheme} variant="secondary">
                    {scheme}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {agent.sla?.max_response_time_seconds && (
            <section>
              <h3 className="mb-2 text-sm font-semibold">SLA</h3>
              <p className="text-sm text-muted-foreground">
                Max response time: {"< "}
                {agent.sla.max_response_time_seconds}s
              </p>
            </section>
          )}

          {agent.tags && agent.tags.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-2">
            {agent.repository_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={agent.repository_url} target="_blank" rel="noopener noreferrer">
                  Repository <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            {agent.documentation_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={agent.documentation_url} target="_blank" rel="noopener noreferrer">
                  Documentation <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a
                href={`${asapProtocolUrl}/agents/${agent.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in ASAP Registry <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>

          {agent.built_with && (
            <p className="text-xs text-muted-foreground">
              Built with: <span className="font-medium">{agent.built_with}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
