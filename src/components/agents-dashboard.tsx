"use client"

import { useState, useEffect } from "react"
import { Plus, Bot, MoreHorizontal, Pencil, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/lib/types"
import { CreateAgentDialog } from "@/components/create-agent-dialog"
import { EditAgentDialog } from "@/components/edit-agent-dialog"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export function AgentsDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const router = useRouter()

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents")
      const data = await res.json()
      setAgents(data)
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" })
      setAgents(agents.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Failed to delete agent:", error)
    }
  }

  const handleRunAgent = (agentId: string) => {
    router.push(`/playground?agent=${agentId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground mt-1">Create and manage your AI agents</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground text-center mb-4">Create your first AI agent to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{agent.model}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRunAgent(agent.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Run
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingAgent(agent)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(agent.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">{agent.description}</CardDescription>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agent.tools.slice(0, 3).map((toolId) => (
                    <Badge key={toolId} variant="secondary" className="text-xs">
                      {toolId.replace("-", " ")}
                    </Badge>
                  ))}
                  {agent.tools.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.tools.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true })}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => handleRunAgent(agent.id)}>
                    <Play className="w-3 h-3 mr-1.5" />
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAgentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreated={fetchAgents} />

      {editingAgent && (
        <EditAgentDialog
          agent={editingAgent}
          open={!!editingAgent}
          onOpenChange={(open) => !open && setEditingAgent(null)}
          onUpdated={fetchAgents}
        />
      )}
    </div>
  )
}
