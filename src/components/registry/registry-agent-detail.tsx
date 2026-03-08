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
import { env } from "@/lib/env"

interface RegistryAgentDetailProps {
  agent: RegistryAgent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistryAgentDetail({ agent, open, onOpenChange }: RegistryAgentDetailProps) {
  if (!agent) return null

  const asapProtocolUrl = env.NEXT_PUBLIC_ASAP_PROTOCOL_URL
  const hasAuth = agent.auth?.schemes && agent.auth.schemes.length > 0
  const hasSkills = agent.capabilities?.skills && agent.capabilities.skills.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{agent.name}</DialogTitle>
            <Badge variant="secondary">v{agent.version || agent.asap_version || "1.0"}</Badge>
            {agent.category && <Badge variant="outline">{agent.category}</Badge>}
          </div>
          <DialogDescription>{agent.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {(hasSkills || (agent.skills && agent.skills.length > 0)) && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4" /> Capabilities
              </h3>
              <ul className="space-y-1.5">
                {(agent.capabilities?.skills ?? []).map((skill) => (
                  <li key={skill.id} className="text-muted-foreground text-sm">
                    <span className="text-foreground font-mono text-xs">{skill.id}</span>
                    {" — "}
                    {skill.description}
                  </li>
                ))}
                {(agent.skills ?? []).map((skill) => (
                  <li key={skill} className="text-muted-foreground text-sm">
                    <span className="text-foreground font-mono text-xs">{skill}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {agent.endpoints &&
            (agent.endpoints.asap ||
              agent.endpoints.ws ||
              agent.endpoints.http ||
              agent.endpoints.manifest) && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4" /> Endpoints
                </h3>
                <div className="text-muted-foreground space-y-1 text-sm">
                  {(agent.endpoints.asap || agent.endpoints.http) && (
                    <p>
                      <span className="text-foreground font-medium">HTTP:</span>{" "}
                      {agent.endpoints.asap || agent.endpoints.http}
                    </p>
                  )}
                  {agent.endpoints.ws && (
                    <p>
                      <span className="text-foreground font-medium">WebSocket:</span>{" "}
                      {agent.endpoints.ws}
                    </p>
                  )}
                  {agent.endpoints.manifest && (
                    <p>
                      <span className="text-foreground font-medium">Manifest:</span>{" "}
                      {agent.endpoints.manifest}
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
              <p className="text-muted-foreground text-sm">
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

          <div className="border-border flex flex-wrap gap-2 border-t pt-2">
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
            <p className="text-muted-foreground text-xs">
              Built with: <span className="font-medium">{agent.built_with}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
