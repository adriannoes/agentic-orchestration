"use client"

import { useState } from "react"
import { formatDistanceToNow, format } from "date-fns"
import {
  History,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Clock,
  MessageSquare,
  Wrench,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Run } from "@/lib/types"
import { cn } from "@/lib/utils"

// Sample run data for demonstration
const sampleRuns: Run[] = [
  {
    id: "run-1",
    agentId: "research-agent",
    agentName: "Research Assistant",
    status: "completed",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
    messages: [
      { id: "m1", role: "user", content: "What is the latest news about AI?", timestamp: new Date() },
      {
        id: "m2",
        role: "assistant",
        content: "I'll search for the latest AI news for you...",
        timestamp: new Date(),
      },
    ],
    toolCalls: [
      {
        id: "tc1",
        toolName: "web_search",
        input: { query: "latest AI news 2024" },
        output: { results: [{ title: "AI Advances in 2024" }] },
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ],
  },
  {
    id: "run-2",
    agentId: "code-agent",
    agentName: "Code Helper",
    status: "completed",
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 120000),
    messages: [
      { id: "m1", role: "user", content: "Calculate 2^10 for me", timestamp: new Date() },
      { id: "m2", role: "assistant", content: "2^10 equals 1024.", timestamp: new Date() },
    ],
    toolCalls: [
      {
        id: "tc1",
        toolName: "calculate",
        input: { expression: "2**10" },
        output: { result: 1024 },
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ],
  },
  {
    id: "run-3",
    agentId: "research-agent",
    agentName: "Research Assistant",
    status: "failed",
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5000),
    messages: [{ id: "m1", role: "user", content: "Search for quantum computing papers", timestamp: new Date() }],
    toolCalls: [
      {
        id: "tc1",
        toolName: "file_search",
        input: { query: "quantum computing" },
        status: "failed",
        error: "No files uploaded",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ],
  },
]

export function RunsHistory() {
  const [runs, setRuns] = useState<Run[]>(sampleRuns)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)

  const filteredRuns = runs.filter((run) => {
    const matchesSearch = run.agentName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Run["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: Run["status"]) => {
    const variants: Record<Run["status"], string> = {
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
      running: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    }
    return variants[status]
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Run History</h1>
        <p className="text-muted-foreground">View past agent runs and their execution logs</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by agent name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRuns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No runs found</h3>
            <p className="text-muted-foreground text-center">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Run an agent from the Playground to see history here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRuns.map((run) => (
            <Card
              key={run.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedRun(run)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{run.agentName}</h3>
                        <Badge variant="outline" className={cn("text-xs", getStatusBadge(run.status))}>
                          {run.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {run.messages.length}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-4 h-4" />
                        {run.toolCalls.length}
                      </div>
                      {run.completedAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}
                          s
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRun && getStatusIcon(selectedRun.status)}
              Run Details
            </DialogTitle>
          </DialogHeader>
          {selectedRun && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Agent</p>
                    <p className="font-medium">{selectedRun.agentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={cn("mt-1", getStatusBadge(selectedRun.status))}>
                      {selectedRun.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">{format(new Date(selectedRun.startedAt), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {selectedRun.completedAt
                        ? `${Math.round((new Date(selectedRun.completedAt).getTime() - new Date(selectedRun.startedAt).getTime()) / 1000)}s`
                        : "Running..."}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Messages</h4>
                  <div className="space-y-2">
                    {selectedRun.messages.map((msg) => (
                      <div key={msg.id} className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground capitalize mb-1">{msg.role}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Tool Calls</h4>
                  <div className="space-y-2">
                    {selectedRun.toolCalls.map((tc) => (
                      <Card key={tc.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{tc.toolName}</Badge>
                              {tc.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {tc.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Input</p>
                              <pre className="text-xs bg-muted p-2 rounded mt-1">
                                {JSON.stringify(tc.input, null, 2)}
                              </pre>
                            </div>
                            {tc.output && (
                              <div>
                                <p className="text-xs text-muted-foreground">Output</p>
                                <pre className="text-xs bg-muted p-2 rounded mt-1">
                                  {JSON.stringify(tc.output, null, 2)}
                                </pre>
                              </div>
                            )}
                            {tc.error && (
                              <div>
                                <p className="text-xs text-red-500">Error: {tc.error}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
