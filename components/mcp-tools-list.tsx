"use client"

import type { MCPTool } from "@/lib/mcp-client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench } from "lucide-react"

interface MCPToolsListProps {
  tools: MCPTool[]
}

export function MCPToolsList({ tools }: MCPToolsListProps) {
  if (tools.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No tools available</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tools.map((tool, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">{tool.name}</h4>
            </div>
            <Badge variant="secondary" className="text-xs">
              MCP Tool
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
          {tool.inputSchema && (
            <div className="mt-3 p-3 rounded-lg bg-muted">
              <p className="text-xs font-mono text-muted-foreground">
                {JSON.stringify(tool.inputSchema, null, 2).slice(0, 150)}
                {JSON.stringify(tool.inputSchema).length > 150 ? "..." : ""}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
