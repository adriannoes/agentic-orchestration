"use client"

import type { Connector } from "@/lib/connector-types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plug, CheckCircle2, XCircle } from "lucide-react"

interface ConnectorCardProps {
  connector: Connector
  onConnect: (connector: Connector) => void
}

export function ConnectorCard({ connector, onConnect }: ConnectorCardProps) {
  const statusConfig = {
    connected: { icon: CheckCircle2, color: "text-green-500", label: "Connected" },
    disconnected: { icon: XCircle, color: "text-muted-foreground", label: "Not connected" },
    error: { icon: XCircle, color: "text-red-500", label: "Error" },
    pending: { icon: Plug, color: "text-orange-500", label: "Pending" },
  }

  const status = statusConfig[connector.status]
  const StatusIcon = status.icon

  return (
    <Card className="p-6 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${connector.color}15` }}
          >
            {connector.icon}
          </div>
          <div>
            <h3 className="font-semibold">{connector.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`w-3 h-3 ${status.color}`} />
              <span className={`text-xs ${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{connector.description}</p>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          {connector.category}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {connector.authType}
        </Badge>
        {connector.isOfficial && (
          <Badge variant="default" className="text-xs">
            Official
          </Badge>
        )}
        {connector.isPremium && (
          <Badge variant="default" className="text-xs bg-amber-500">
            Premium
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {connector.status === "connected" ? (
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            Manage
          </Button>
        ) : (
          <Button size="sm" className="flex-1" onClick={() => onConnect(connector)}>
            <Plug className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )}
        {connector.website && (
          <Button variant="ghost" size="icon" asChild>
            <a href={connector.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
