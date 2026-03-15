"use client"

import { useState, useEffect } from "react"
import type { MCPServer, MCPTool } from "@/lib/mcp-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Plus, Server, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { AddMCPServerDialog } from "./add-mcp-server-dialog"
import { MCPToolsList } from "./mcp-tools-list"

export function MCPManager() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [serversLoading, setServersLoading] = useState(true)
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [tools, setTools] = useState<MCPTool[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServers()
  }, [])

  useEffect(() => {
    if (selectedServer) {
      fetchTools(selectedServer.id)
    }
  }, [selectedServer])

  const fetchServers = async () => {
    setServersLoading(true)
    try {
      const res = await fetch("/api/mcp/servers")
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      setServers(data)
    } finally {
      setServersLoading(false)
    }
  }

  const fetchTools = async (serverId: string) => {
    const res = await fetch(`/api/mcp/servers/${serverId}/tools`)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const data = await res.json()
    setTools(data)
  }

  const handleAddServer = async (config: {
    name: string
    url: string
    protocol: "stdio" | "http"
  }) => {
    setLoading(true)
    try {
      const res = await fetch("/api/mcp/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        await fetchServers()
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to add MCP server:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm("Are you sure you want to disconnect this MCP server?")) return

    try {
      await fetch(`/api/mcp/servers/${serverId}`, { method: "DELETE" })
      await fetchServers()
      if (selectedServer?.id === serverId) {
        setSelectedServer(null)
        setTools([])
      }
    } catch (error) {
      console.error("Failed to delete server:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add MCP Server
          </Button>
          <Button variant="outline" onClick={fetchServers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connected Servers</h2>
          {serversLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <EmptyState
              icon={Server}
              title="No MCP servers"
              description="Add an MCP server to extend agent capabilities."
              actionLabel="Add MCP Server"
              onAction={() => setDialogOpen(true)}
            />
          ) : (
            servers.map((server) => {
              const isSelected = selectedServer?.id === server.id
              const StatusIcon = server.status === "connected" ? CheckCircle2 : XCircle

              return (
                <Card
                  key={server.id}
                  className={`cursor-pointer p-4 transition-colors ${
                    isSelected ? "border-primary/60 bg-accent/40" : "hover:border-primary/40"
                  }`}
                  onClick={() => setSelectedServer(server)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2">
                        <Server className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{server.url}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <StatusIcon
                            className={`h-3 w-3 ${server.status === "connected" ? "text-indigo-300" : "text-destructive"}`}
                          />
                          <span
                            className={`text-xs ${server.status === "connected" ? "text-indigo-300" : "text-destructive"}`}
                          >
                            {server.status}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {server.protocol}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteServer(server.id)
                      }}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {server.capabilities.map((cap) => (
                      <Badge key={cap.type} variant="outline" className="text-xs">
                        {cap.type}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {selectedServer ? `Tools - ${selectedServer.name}` : "Server Tools"}
          </h2>
          {selectedServer ? (
            <MCPToolsList tools={tools} />
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Select a server to view its tools</p>
            </Card>
          )}
        </div>
      </div>

      <AddMCPServerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddServer}
        loading={loading}
      />
    </div>
  )
}
