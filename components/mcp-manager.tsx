"use client"

import { useState, useEffect } from "react"
import type { MCPServer, MCPTool } from "@/lib/mcp-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Server, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { AddMCPServerDialog } from "./add-mcp-server-dialog"
import { MCPToolsList } from "./mcp-tools-list"

export function MCPManager() {
  const [servers, setServers] = useState<MCPServer[]>([])
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
    const res = await fetch("/api/mcp/servers")
    const data = await res.json()
    setServers(data)
  }

  const fetchTools = async (serverId: string) => {
    const res = await fetch(`/api/mcp/servers/${serverId}/tools`)
    const data = await res.json()
    setTools(data)
  }

  const handleAddServer = async (config: { name: string; url: string; protocol: "stdio" | "http" }) => {
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
            <Plus className="w-4 h-4 mr-2" />
            Add MCP Server
          </Button>
          <Button variant="outline" onClick={fetchServers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connected Servers</h2>
          {servers.length === 0 ? (
            <Card className="p-12 text-center">
              <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No MCP servers connected</p>
              <Button className="mt-4 bg-transparent" variant="outline" onClick={() => setDialogOpen(true)}>
                Add Your First Server
              </Button>
            </Card>
          ) : (
            servers.map((server) => {
              const isSelected = selectedServer?.id === server.id
              const StatusIcon = server.status === "connected" ? CheckCircle2 : XCircle

              return (
                <Card
                  key={server.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-accent" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedServer(server)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{server.url}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <StatusIcon
                            className={`w-3 h-3 ${server.status === "connected" ? "text-green-500" : "text-red-500"}`}
                          />
                          <span
                            className={`text-xs ${server.status === "connected" ? "text-green-500" : "text-red-500"}`}
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
                      <Trash2 className="w-4 h-4 text-destructive" />
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

      <AddMCPServerDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAddServer} loading={loading} />
    </div>
  )
}
