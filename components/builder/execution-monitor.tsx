"use client"

import { useState } from "react"
import { Play, X, ChevronRight, Clock, CheckCircle2, XCircle, Pause, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { WorkflowExecution, ExecutionLog } from "@/lib/workflow-types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExecutionMonitorProps {
  workflowId: string
  isOpen: boolean
  onClose: () => void
  onNodeHighlight?: (nodeId: string | null) => void
}

export function ExecutionMonitor({ workflowId, isOpen, onClose, onNodeHighlight }: ExecutionMonitorProps) {
  const [input, setInput] = useState("")
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleRun = async () => {
    if (!input.trim()) return

    setIsExecuting(true)
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })

      const result = await response.json()
      setExecution(result)

      if (onNodeHighlight) {
        onNodeHighlight(null)
      }
    } catch (error) {
      console.error("Execution error:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getLogIcon = (type: ExecutionLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-rose-500" />
      case "info":
        return <ChevronRight className="h-4 w-4 text-blue-500" />
      case "tool-call":
        return <Play className="h-4 w-4 text-amber-500" />
      case "tool-result":
        return <CheckCircle2 className="h-4 w-4 text-cyan-500" />
    }
  }

  const getStatusBadge = (status: WorkflowExecution["status"]) => {
    switch (status) {
      case "running":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </div>
        )
      case "completed":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </div>
        )
      case "failed":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 text-rose-500 rounded text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Failed
          </div>
        )
      case "paused":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-medium">
            <Pause className="h-3 w-3" />
            Paused
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <h2 className="font-semibold">Execution Monitor</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input Message</label>
          <Input
            placeholder="Enter your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isExecuting && handleRun()}
          />
        </div>
        <Button className="w-full" onClick={handleRun} disabled={isExecuting || !input.trim()}>
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </>
          )}
        </Button>
      </div>

      {/* Execution Results */}
      {execution && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="p-4 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(execution.status)}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {execution.completedAt
                  ? `${Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000)}s`
                  : "In progress..."}
              </div>
              <div>{execution.logs.length} logs</div>
            </div>
          </div>

          {/* Logs */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {execution.logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3 rounded-lg border border-border space-y-1 cursor-pointer hover:bg-accent/50 transition-colors",
                    execution.currentNodeId === log.nodeId && "ring-2 ring-primary",
                  )}
                  onClick={() => onNodeHighlight?.(log.nodeId)}
                >
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{log.nodeId}</span>
                        {log.duration && <span>• {log.duration}ms</span>}
                      </div>
                      {log.data && (
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {!execution && !isExecuting && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Enter a message and click Run to start
        </div>
      )}
    </div>
  )
}
