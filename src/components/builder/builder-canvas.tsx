"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type NodeChange,
  type EdgeChange,
  type Connection as ReactFlowConnection,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Play, ZoomIn, ZoomOut, Maximize2, Save, Undo, Redo, History, ArrowDownUp, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WorkflowNode, Position, NodeType, Workflow, Connection } from "@/lib/workflow-types"
import { NodeSidebar } from "./node-sidebar"
import { CanvasNode } from "./canvas-node"
import { NodePropertiesPanel } from "./node-properties-panel"
import useSWR, { mutate } from "swr"
import { ExecutionMonitor } from "./execution-monitor"
import { VersionHistoryPanel } from "./version-history-panel"
import { ExportImportDialog } from "./export-import-dialog"
import { getHistoryManager } from "@/lib/history-manager"
import { useToast } from "@/hooks/use-toast"
import {
  workflowNodesToReactFlow,
  workflowConnectionsToEdges,
  reactFlowNodesToWorkflow,
  reactFlowEdgesToConnections,
} from "@/lib/builder/workflow-to-reactflow"
import type { WorkflowNodeData } from "./canvas-node"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const GRID_SIZE = 20
const NODE_TYPES = [
  "agent",
  "start",
  "end",
  "guardrail",
  "condition",
  "mcp",
  "user-approval",
  "file-search",
] as const

const nodeTypes = Object.fromEntries(
  NODE_TYPES.map((t) => [t, CanvasNode]),
) as any

function BuilderCanvasInner() {
  const clipboardRef = useRef<{ nodes: WorkflowNode[]; connections: Connection[] } | null>(null)
  const { toast } = useToast()
  const { screenToFlowPosition, getViewport } = useReactFlow()

  const [workflowId, setWorkflowId] = useState<string | null>(null)

  const { data: workflows, isLoading: isLoadingWorkflows, error: workflowsError } = useSWR<Workflow[]>(
    "/api/workflows",
    fetcher,
    { revalidateOnFocus: false },
  )

  const isUnauthorized = workflowsError?.message === "UNAUTHORIZED"

  useEffect(() => {
    if (isLoadingWorkflows || isUnauthorized) return
    if (workflows && Array.isArray(workflows)) {
      if (workflows.length === 0 && !workflowId) {
        fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Untitled Workflow", description: "", nodes: [], connections: [] }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((created) => {
            if (created?.id) {
              setWorkflowId(created.id)
              mutate("/api/workflows")
            }
          })
          .catch(() => { })
      } else if (workflows.length > 0 && !workflowId) {
        setWorkflowId(workflows[0].id)
      }
    }
  }, [workflows, isLoadingWorkflows, isUnauthorized, workflowId])

  const { data: workflow, isLoading } = useSWR<Workflow | null>(
    workflowId ? `/api/workflows/${workflowId}` : null,
    fetcher,
  )
  const { data: historyStatus } = useSWR(
    workflowId ? `/api/workflows/${workflowId}/history/status` : null,
    fetcher,
    { refreshInterval: 500 },
  )

  const [showSidebar, setShowSidebar] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showExecutionMonitor, setShowExecutionMonitor] = useState(false)
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)

  const saveToHistory = useCallback(() => {
    if (workflow && workflowId) {
      const historyManager = getHistoryManager(workflowId)
      historyManager.saveState(workflow)
    }
  }, [workflow, workflowId])

  const handleNodeDeleteById = useCallback(
    async (nodeId: string) => {
      if (!workflowId) return
      saveToHistory()
      await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}`, { method: "DELETE" })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, saveToHistory],
  )

  const initialNodes = workflow
    ? workflowNodesToReactFlow(workflow.nodes).map((n) => ({
      ...n,
      data: {
        ...n.data,
        isHighlighted: n.id === highlightedNodeId,
        customOnDelete: () => handleNodeDeleteById(n.id),
      } as WorkflowNodeData & { customOnDelete?: () => void },
    }))
    : []
  const initialEdges = workflow ? workflowConnectionsToEdges(workflow.connections) : []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (workflow) {
      const flowNodes = workflowNodesToReactFlow(workflow.nodes).map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === highlightedNodeId,
          customOnDelete: () => handleNodeDeleteById(n.id),
        } as WorkflowNodeData & { customOnDelete?: () => void },
      }))
      setNodes(flowNodes)
      setEdges(workflowConnectionsToEdges(workflow.connections))
    }
  }, [workflow?.id, workflow?.nodes, workflow?.connections, highlightedNodeId, handleNodeDeleteById])



  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<WorkflowNodeData, NodeType>>[]) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes)
      const removeChanges = changes.filter((c) => c.type === "remove") as { id: string }[]
      if (removeChanges.length > 0 && workflowId) {
        saveToHistory()
        const updatedEdges = edges.filter((e) => !removeChanges.some((r) => r.id === e.id))
        fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connections: reactFlowEdgesToConnections(updatedEdges) }),
        }).then(() => mutate(`/api/workflows/${workflowId}`))
      }
    },
    [onEdgesChange, edges, workflowId, saveToHistory],
  )

  const handleConnect = useCallback(
    async (connection: ReactFlowConnection) => {
      if (!workflowId || !connection.source || !connection.target) return
      saveToHistory()
      await fetch(`/api/workflows/${workflowId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: connection.source,
          targetId: connection.target,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
        }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, saveToHistory],
  )

  const handleNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node<WorkflowNodeData, NodeType>) => {
      if (!workflowId) return
      const snappedPosition = {
        x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
      }
      saveToHistory()
      await fetch(`/api/workflows/${workflowId}/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: snappedPosition }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, saveToHistory],
  )

  const handleAddNode = useCallback(
    async (type: NodeType) => {
      if (!workflowId) return
      saveToHistory()

      const center = screenToFlowPosition({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
      })

      let posX = Math.round(center.x / GRID_SIZE) * GRID_SIZE
      let posY = Math.round(center.y / GRID_SIZE) * GRID_SIZE

      while (
        workflow?.nodes.some((n) => Math.abs(n.position.x - posX) < 10 && Math.abs(n.position.y - posY) < 10)
      ) {
        posX += GRID_SIZE * 2
        posY += GRID_SIZE * 2
      }

      const position = { x: posX, y: posY }
      const labels: Record<NodeType, string> = {
        start: "Start",
        end: "End",
        agent: "New Agent",
        guardrail: "Guardrail",
        condition: "Condition",
        mcp: "MCP Server",
        "user-approval": "User Approval",
        "file-search": "File Search",
      }

      await fetch(`/api/workflows/${workflowId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          position,
          data: { label: labels[type] },
        }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, workflow?.nodes, saveToHistory, screenToFlowPosition],
  )

  const selectedNodeId = nodes.find((n) => n.selected)?.id ?? null
  const selectedNode = workflow?.nodes?.find((n) => n.id === selectedNodeId)

  const handleUndo = useCallback(async () => {
    if (!workflowId) return
    await fetch(`/api/workflows/${workflowId}/undo`, { method: "POST" })
    mutate(`/api/workflows/${workflowId}`)
    mutate(`/api/workflows/${workflowId}/history/status`)
  }, [workflowId])

  const handleRedo = useCallback(async () => {
    if (!workflowId) return
    await fetch(`/api/workflows/${workflowId}/redo`, { method: "POST" })
    mutate(`/api/workflows/${workflowId}`)
    mutate(`/api/workflows/${workflowId}/history/status`)
  }, [workflowId])

  const handleCopy = useCallback(async () => {
    if (!selectedNodeId || !workflowId) return
    const response = await fetch(`/api/workflows/${workflowId}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeIds: [selectedNodeId] }),
    })
    if (response.ok) {
      const result = await response.json()
      clipboardRef.current = { nodes: result.nodes ?? [], connections: result.connections ?? [] }
      toast({ title: "Node copied to clipboard" })
    }
  }, [selectedNodeId, workflowId, toast])

  const handlePaste = useCallback(async () => {
    if (!workflowId) return
    const clipboard = clipboardRef.current
    if (!clipboard?.nodes?.length) {
      toast({ title: "Nothing to paste", variant: "destructive" })
      return
    }
    saveToHistory()
    const response = await fetch(`/api/workflows/${workflowId}/paste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: clipboard.nodes, connections: clipboard.connections }),
    })
    if (response.ok) {
      const result = await response.json()
      mutate(`/api/workflows/${workflowId}`)
      toast({ title: `Pasted ${result.nodeIds?.length ?? 0} node(s)` })
    } else {
      toast({ title: "Nothing to paste", variant: "destructive" })
    }
  }, [workflowId, saveToHistory, toast])

  const handleDuplicate = useCallback(async () => {
    if (!selectedNodeId || !workflowId) return
    saveToHistory()
    const copyRes = await fetch(`/api/workflows/${workflowId}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeIds: [selectedNodeId] }),
    })
    if (!copyRes.ok) return
    const copyResult = await copyRes.json()
    clipboardRef.current = { nodes: copyResult.nodes ?? [], connections: copyResult.connections ?? [] }
    const pasteRes = await fetch(`/api/workflows/${workflowId}/paste`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: copyResult.nodes ?? [], connections: copyResult.connections ?? [] }),
    })
    if (pasteRes.ok) {
      mutate(`/api/workflows/${workflowId}`)
      toast({ title: "Node duplicated" })
    }
  }, [selectedNodeId, workflowId, saveToHistory, toast])

  const handleSelectAll = useCallback(() => {
    if (workflow?.nodes.length) {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === workflow.nodes[0].id })),
      )
    }
  }, [workflow, setNodes])

  const handleAutoLayout = useCallback(async () => {
    if (!workflowId) return
    saveToHistory()
    const response = await fetch(`/api/workflows/${workflowId}/auto-layout`, { method: "POST" })
    if (response.ok) {
      mutate(`/api/workflows/${workflowId}`)
      toast({ title: "Layout applied successfully" })
    } else {
      toast({ title: "Failed to apply layout", variant: "destructive" })
    }
  }, [workflowId, saveToHistory, toast])

  const handleNodeDelete = useCallback(async () => {
    if (!selectedNodeId || !workflowId) return
    saveToHistory()
    await fetch(`/api/workflows/${workflowId}/nodes/${selectedNodeId}`, { method: "DELETE" })
    mutate(`/api/workflows/${workflowId}`)
  }, [selectedNodeId, workflowId, saveToHistory])

  const handleSaveVersion = useCallback(async () => {
    if (!workflowId) return
    await fetch(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Manual save" }),
    })
  }, [workflowId])

  const { setViewport, zoomIn, zoomOut, fitView } = useReactFlow()

  const handleZoomIn = useCallback(() => zoomIn(), [zoomIn])
  const handleZoomOut = useCallback(() => zoomOut(), [zoomOut])
  const handleResetView = useCallback(() => fitView({ padding: 0.2 }), [fitView])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        handleCopy()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        handlePaste()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        handleDuplicate()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault()
        handleSelectAll()
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault()
        handleNodeDelete()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSaveVersion()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault()
        handleZoomIn()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault()
        handleZoomOut()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault()
        handleResetView()
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault()
        handleAutoLayout()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleSelectAll,
    handleNodeDelete,
    handleSaveVersion,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleAutoLayout,
    selectedNodeId,
  ])

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <LogIn className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in to access the workflow builder</p>
        <Button asChild>
          <a href="/login">Sign in</a>
        </Button>
      </div>
    )
  }

  if (isLoadingWorkflows || !workflowId || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    )
  }

  const viewport = getViewport()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NodeSidebar isOpen={showSidebar} onToggle={() => setShowSidebar(!showSidebar)} onAddNode={handleAddNode} />

      <div className="flex-1 flex flex-col relative">
        {/* Floating Toolbar */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 h-14 bg-background/60 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between px-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] min-w-[600px] w-auto"
          data-testid="builder-toolbar"
        >
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm tracking-tight">{workflow?.name || "Untitled Workflow"}</h1>
            <span className="text-[10px] font-medium text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              v{workflow?.version || 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.02] p-1 rounded-full border border-white/5 ml-6">
            <ExportImportDialog
              workflowId={workflowId}
              onImportSuccess={(newWorkflow) => {
                mutate("/api/workflows")
                if (newWorkflow?.id) {
                  setWorkflowId(newWorkflow.id)
                  mutate(`/api/workflows/${newWorkflow.id}`)
                } else {
                  mutate(`/api/workflows/${workflowId}`)
                }
              }}
            />
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={handleUndo}
              disabled={!historyStatus?.canUndo}
              aria-label="Undo"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={handleRedo}
              disabled={!historyStatus?.canRedo}
              aria-label="Redo"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={handleAutoLayout} title="Auto Layout" aria-label="Auto Layout">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={handleZoomOut} aria-label="Zoom out" title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground w-10 text-center select-none" aria-live="polite">
              {Math.round((viewport?.zoom ?? 1) * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={handleZoomIn} aria-label="Zoom in" title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={handleResetView} aria-label="Fit view" title="Fit view">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              aria-label="Version history"
              title="Version history"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 ml-1 rounded-full bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
              onClick={() => setShowExecutionMonitor(!showExecutionMonitor)}
            >
              <Play className="h-3.5 w-3.5" />
              {showExecutionMonitor ? "Close" : "Run"}
            </Button>
            <Button size="sm" className="h-8 gap-2 rounded-full bg-primary/90 hover:bg-primary shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors" onClick={handleSaveVersion}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        <div
          className="flex-1 relative bg-[#0a0a0a]"
          data-testid="builder-canvas"
        >
          {/* Subtle radial ambient glow behind the grid */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_100%)] z-0" />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            snapToGrid
            snapGrid={[GRID_SIZE, GRID_SIZE]}
            fitView
            minZoom={0.25}
            maxZoom={2}
            panOnDrag={[1, 2]}
            panOnScroll
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick={false}
            selectNodesOnDrag={false}
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={GRID_SIZE} size={1} color="rgba(255,255,255,0.05)" />
            <Controls showInteractive={false} />

            <div className="absolute bottom-4 right-4 w-48 h-32 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
              <div className="text-xs space-y-1.5">
                <div className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Keyboard Shortcuts
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-muted-foreground">
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Z</kbd> Undo
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Y</kbd> Redo
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+C</kbd> Copy
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+V</kbd> Paste
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+D</kbd> Duplicate
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Del</kbd> Delete
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+S</kbd> Save
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+Shift+L</kbd> Layout
                  </div>
                </div>
              </div>
            </div>
          </ReactFlow>
        </div>
      </div>

      <NodePropertiesPanel
        isOpen={showProperties}
        onToggle={() => setShowProperties(!showProperties)}
        node={selectedNode}
        workflowId={workflowId}
        onUpdate={() => mutate(`/api/workflows/${workflowId}`)}
      />

      <VersionHistoryPanel
        workflowId={workflowId}
        isOpen={showVersionHistory}
        onToggle={() => setShowVersionHistory(!showVersionHistory)}
        onRestoreVersion={(version) => {
          console.log("Restoring version:", version)
        }}
      />

      <ExecutionMonitor
        workflowId={workflowId}
        isOpen={showExecutionMonitor}
        onClose={() => setShowExecutionMonitor(false)}
        onNodeHighlight={setHighlightedNodeId}
      />
    </div>
  )
}

export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasInner />
    </ReactFlowProvider>
  )
}
