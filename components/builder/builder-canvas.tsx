"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Play, ZoomIn, ZoomOut, Maximize2, Save, Undo, Redo, History, ArrowDownUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WorkflowNode, Position, NodeType, CanvasState, Workflow } from "@/lib/workflow-types"
import { NodeSidebar } from "./node-sidebar"
import { CanvasNode } from "./canvas-node"
import { NodePropertiesPanel } from "./node-properties-panel"
import useSWR, { mutate } from "swr"
import { ExecutionMonitor } from "./execution-monitor"
import { VersionHistoryPanel } from "./version-history-panel"
import { ExportImportDialog } from "./export-import-dialog"
import { getHistoryManager } from "@/lib/history-manager"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const GRID_SIZE = 20
const MIN_ZOOM = 0.25
const MAX_ZOOM = 2

export function BuilderCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [workflowId, setWorkflowId] = useState<string>("default-workflow")
  const { toast } = useToast()

  const { data: workflow, isLoading } = useSWR<Workflow>(`/api/workflows/${workflowId}`, fetcher)
  const { data: historyStatus } = useSWR(`/api/workflows/${workflowId}/history/status`, fetcher, {
    refreshInterval: 500,
  })

  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNodeId: null,
    selectedConnectionId: null,
    isDragging: false,
    isConnecting: false,
    connectionStart: null,
  })

  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const panStartRef = useRef<Position>({ x: 0, y: 0 })
  const [showSidebar, setShowSidebar] = useState(true)
  const [showProperties, setShowProperties] = useState(true)
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 })
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  const saveToHistory = useCallback(() => {
    if (workflow) {
      const historyManager = getHistoryManager(workflowId)
      historyManager.saveState(workflow)
    }
  }, [workflow, workflowId])

  const handleZoom = useCallback((delta: number) => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom + delta)),
    }))
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta)
      }
    },
    [handleZoom],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const startPan = () => {
        const start = { x: e.clientX - canvasState.pan.x, y: e.clientY - canvasState.pan.y }
        setIsPanning(true)
        setPanStart(start)
        isPanningRef.current = true
        panStartRef.current = start
      }

      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault()
        startPan()
      } else if (e.button === 0) {
        const target = e.target as HTMLElement
        const isCanvasArea =
          target === canvasRef.current ||
          target.classList.contains("canvas-grid") ||
          target.tagName === "svg" ||
          target.closest(".canvas-grid")
        if (isCanvasArea) {
          setCanvasState((prev) => ({ ...prev, selectedNodeId: null, selectedConnectionId: null }))
          startPan()
        }
      }
    },
    [canvasState.pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom,
          y: (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom,
        })
      }

      if (isPanningRef.current) {
        setCanvasState((prev) => ({
          ...prev,
          pan: {
            x: e.clientX - panStartRef.current.x,
            y: e.clientY - panStartRef.current.y,
          },
        }))
      }
    },
    [canvasState.zoom, canvasState.pan],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    isPanningRef.current = false
    // Only reset connecting state if the mouseUp happened on the canvas background,
    // not on an input handle (which stops propagation). Use requestAnimationFrame
    // to allow the input handle's onMouseUp to fire first.
    requestAnimationFrame(() => {
      setCanvasState((prev) => {
        // If connectionStart was already cleared by a successful connection, don't override
        if (!prev.connectionStart) return prev
        return { ...prev, isConnecting: false, connectionStart: null }
      })
    })
  }, [])

  const handleNodeSelect = useCallback((nodeId: string) => {
    setCanvasState((prev) => ({ ...prev, selectedNodeId: nodeId, selectedConnectionId: null }))
  }, [])

  const handleNodeDrag = useCallback(
    async (nodeId: string, position: Position) => {
      saveToHistory()

      const snappedPosition = {
        x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
      }

      await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: snappedPosition }),
      })
      mutate(`/api/workflows/${workflowId}`)
    },
    [workflowId, saveToHistory],
  )

  const handleConnectionStart = useCallback((nodeId: string, handle: string) => {
    setCanvasState((prev) => ({
      ...prev,
      isConnecting: true,
      connectionStart: { nodeId, handle },
    }))
  }, [])

  const handleConnectionEnd = useCallback(
    async (targetNodeId: string) => {
      if (!canvasState.connectionStart || canvasState.connectionStart.nodeId === targetNodeId) {
        return
      }

      saveToHistory()

      await fetch(`/api/workflows/${workflowId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: canvasState.connectionStart.nodeId,
          targetId: targetNodeId,
        }),
      })
      mutate(`/api/workflows/${workflowId}`)
      setCanvasState((prev) => ({ ...prev, isConnecting: false, connectionStart: null }))
    },
    [canvasState.connectionStart, workflowId, saveToHistory],
  )

  const handleNodeDelete = useCallback(
    async (nodeId: string) => {
      saveToHistory()

      await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}`, { method: "DELETE" })
      mutate(`/api/workflows/${workflowId}`)
      setCanvasState((prev) => ({ ...prev, selectedNodeId: null }))
    },
    [workflowId, saveToHistory],
  )

  const handleAddNode = useCallback(
    async (type: NodeType) => {
      saveToHistory()

      const centerX = (window.innerWidth / 2 - canvasState.pan.x) / canvasState.zoom
      const centerY = (window.innerHeight / 2 - canvasState.pan.y) / canvasState.zoom

      const position = {
        x: Math.round(centerX / GRID_SIZE) * GRID_SIZE,
        y: Math.round(centerY / GRID_SIZE) * GRID_SIZE,
      }

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
    [workflowId, canvasState.pan, canvasState.zoom, saveToHistory],
  )

  const handleUndo = useCallback(async () => {
    await fetch(`/api/workflows/${workflowId}/undo`, { method: "POST" })
    mutate(`/api/workflows/${workflowId}`)
    mutate(`/api/workflows/${workflowId}/history/status`)
  }, [workflowId])

  const handleRedo = useCallback(async () => {
    await fetch(`/api/workflows/${workflowId}/redo`, { method: "POST" })
    mutate(`/api/workflows/${workflowId}`)
    mutate(`/api/workflows/${workflowId}/history/status`)
  }, [workflowId])

  const handleCopy = useCallback(async () => {
    if (!canvasState.selectedNodeId) return

    const response = await fetch(`/api/workflows/${workflowId}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeIds: [canvasState.selectedNodeId] }),
    })

    if (response.ok) {
      toast({ title: "Node copied to clipboard" })
    }
  }, [canvasState.selectedNodeId, workflowId, toast])

  const handlePaste = useCallback(async () => {
    saveToHistory()

    const response = await fetch(`/api/workflows/${workflowId}/paste`, {
      method: "POST",
    })

    if (response.ok) {
      const result = await response.json()
      mutate(`/api/workflows/${workflowId}`)
      toast({ title: `Pasted ${result.nodeIds.length} node(s)` })
    } else {
      toast({ title: "Nothing to paste", variant: "destructive" })
    }
  }, [workflowId, saveToHistory, toast])

  const handleDuplicate = useCallback(async () => {
    if (!canvasState.selectedNodeId) return

    saveToHistory()

    await fetch(`/api/workflows/${workflowId}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeIds: [canvasState.selectedNodeId] }),
    })

    await fetch(`/api/workflows/${workflowId}/paste`, {
      method: "POST",
    })

    mutate(`/api/workflows/${workflowId}`)
    toast({ title: "Node duplicated" })
  }, [canvasState.selectedNodeId, workflowId, saveToHistory, toast])

  const handleSelectAll = useCallback(() => {
    if (workflow?.nodes.length) {
      setCanvasState((prev) => ({ ...prev, selectedNodeId: workflow.nodes[0].id }))
    }
  }, [workflow])

  const handleAutoLayout = useCallback(async () => {
    saveToHistory()

    const response = await fetch(`/api/workflows/${workflowId}/auto-layout`, {
      method: "POST",
    })

    if (response.ok) {
      mutate(`/api/workflows/${workflowId}`)
      toast({ title: "Layout applied successfully" })
    } else {
      toast({ title: "Failed to apply layout", variant: "destructive" })
    }
  }, [workflowId, saveToHistory, toast])

  const handleResetView = useCallback(() => {
    setCanvasState((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))
  }, [])

  const NODE_WIDTH = 300
  const NODE_HANDLE_OFFSET = 16 // -right-4 / -left-4 = 16px

  const getConnectionPath = (source: WorkflowNode, target: WorkflowNode) => {
    const sourceX = source.position.x + NODE_WIDTH + NODE_HANDLE_OFFSET
    const sourceY = source.position.y + 44 // approximate vertical center of node
    const targetX = target.position.x - NODE_HANDLE_OFFSET
    const targetY = target.position.y + 44

    const dx = Math.abs(targetX - sourceX)
    const controlPointOffset = Math.max(Math.min(dx / 2, 150), 50)

    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`
  }

  const selectedNode = workflow?.nodes.find((n) => n.id === canvasState.selectedNodeId)

  const [showExecutionMonitor, setShowExecutionMonitor] = useState(false)
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)

  const handleSaveVersion = useCallback(async () => {
    await fetch(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Manual save" }),
    })
  }, [workflowId])

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
      } else if ((e.key === "Delete" || e.key === "Backspace") && canvasState.selectedNodeId) {
        e.preventDefault()
        handleNodeDelete(canvasState.selectedNodeId)
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSaveVersion()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault()
        handleZoom(0.1)
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault()
        handleZoom(-0.1)
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
    handleZoom,
    handleResetView,
    handleAutoLayout,
    canvasState.selectedNodeId,
  ])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NodeSidebar isOpen={showSidebar} onToggle={() => setShowSidebar(!showSidebar)} onAddNode={handleAddNode} />

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">{workflow?.name || "Untitled Workflow"}</h1>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              v{workflow?.version || 1}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ExportImportDialog
              workflowId={workflowId}
              onImportSuccess={() => mutate(`/api/workflows/${workflowId}`)}
            />
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleUndo}
              disabled={!historyStatus?.canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRedo}
              disabled={!historyStatus?.canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAutoLayout} title="Auto Layout">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {Math.round(canvasState.zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 bg-transparent"
              onClick={() => setShowExecutionMonitor(!showExecutionMonitor)}
            >
              <Play className="h-3.5 w-3.5" />
              {showExecutionMonitor ? "Close Monitor" : "Run Workflow"}
            </Button>
            <Button size="sm" className="h-8 gap-2" onClick={handleSaveVersion}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 select-none"
          style={{ cursor: canvasState.isConnecting ? "crosshair" : isPanning ? "grabbing" : "default" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="canvas-grid absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, hsl(var(--muted-foreground) / 0.15) 1.5px, transparent 1.5px),
                radial-gradient(circle at center, hsl(var(--muted-foreground) / 0.08) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE * canvasState.zoom * 5}px ${GRID_SIZE * canvasState.zoom * 5}px, ${GRID_SIZE * canvasState.zoom}px ${GRID_SIZE * canvasState.zoom}px`,
              backgroundPosition: `${canvasState.pan.x}px ${canvasState.pan.y}px`,
            }}
          />

          <div
            className="absolute"
            style={{
              transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px) scale(${canvasState.zoom})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: "10000px", height: "10000px", overflow: "visible" }}
            >
              <defs>
                {/* Enhanced arrowheads with gradients */}
                <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto">
                  <polygon
                    points="0 0, 14 5, 0 10"
                    fill="hsl(var(--muted-foreground) / 0.6)"
                    className="transition-all duration-200"
                  />
                </marker>
                <marker id="arrowhead-primary" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto">
                  <polygon points="0 0, 14 5, 0 10" fill="hsl(var(--primary))" />
                </marker>
                <marker id="arrowhead-hover" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto">
                  <polygon points="0 0, 14 5, 0 10" fill="hsl(var(--primary) / 0.8)" />
                </marker>

                {/* Gradient for connections */}
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
                  <stop offset="50%" stopColor="hsl(var(--primary) / 0.6)" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>

                {/* Glow filter for active connections */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {workflow?.connections.map((connection) => {
                const sourceNode = workflow.nodes.find((n) => n.id === connection.sourceId)
                const targetNode = workflow.nodes.find((n) => n.id === connection.targetId)
                if (!sourceNode || !targetNode) return null

                const isSelected = canvasState.selectedConnectionId === connection.id

                return (
                  <g key={connection.id} className="connection-group">
                    {/* Shadow/glow layer */}
                    <path
                      d={getConnectionPath(sourceNode, targetNode)}
                      fill="none"
                      stroke="hsl(var(--primary) / 0.15)"
                      strokeWidth={isSelected ? 12 : 8}
                      className="pointer-events-none transition-all duration-300"
                    />
                    {/* Main connection line */}
                    <path
                      d={getConnectionPath(sourceNode, targetNode)}
                      fill="none"
                      stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"}
                      strokeWidth={isSelected ? 3 : 2.5}
                      markerEnd={isSelected ? "url(#arrowhead-primary)" : "url(#arrowhead)"}
                      className={cn(
                        "transition-all duration-200 cursor-pointer",
                        "hover:stroke-primary hover:stroke-[3.5px]",
                      )}
                      style={{ filter: isSelected ? "url(#glow)" : "none" }}
                    />
                  </g>
                )
              })}

              {canvasState.isConnecting && canvasState.connectionStart && (
                <g className="active-connection">
                  {/* Glow effect */}
                  <path
                    d={(() => {
                      const sourceNode = workflow?.nodes.find((n) => n.id === canvasState.connectionStart?.nodeId)
                      if (!sourceNode) return ""
                      const sourceX = sourceNode.position.x + NODE_WIDTH + NODE_HANDLE_OFFSET
                      const sourceY = sourceNode.position.y + 44
                      const dx = Math.abs(mousePos.x - sourceX)
                      const controlPointOffset = Math.max(Math.min(dx / 2, 150), 50)
                      return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePos.x - controlPointOffset} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`
                    })()}
                    fill="none"
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth={12}
                    className="pointer-events-none"
                  />
                  {/* Main line */}
                  <path
                    d={(() => {
                      const sourceNode = workflow?.nodes.find((n) => n.id === canvasState.connectionStart?.nodeId)
                      if (!sourceNode) return ""
                      const sourceX = sourceNode.position.x + NODE_WIDTH + NODE_HANDLE_OFFSET
                      const sourceY = sourceNode.position.y + 44
                      const dx = Math.abs(mousePos.x - sourceX)
                      const controlPointOffset = Math.max(Math.min(dx / 2, 150), 50)
                      return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePos.x - controlPointOffset} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`
                    })()}
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth={3.5}
                    strokeDasharray="12,6"
                    strokeLinecap="round"
                    className="pointer-events-none"
                    style={{
                      animation: "dashOffset 1s linear infinite",
                      filter: "url(#glow)",
                    }}
                  />
                  {/* Target indicator circle */}
                  <circle
                    cx={mousePos.x}
                    cy={mousePos.y}
                    r={8}
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    className="pointer-events-none animate-pulse"
                  />
                  <circle
                    cx={mousePos.x}
                    cy={mousePos.y}
                    r={4}
                    fill="hsl(var(--primary))"
                    className="pointer-events-none"
                  />
                </g>
              )}
            </svg>

            {workflow?.nodes.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                isSelected={canvasState.selectedNodeId === node.id}
                onSelect={() => handleNodeSelect(node.id)}
                onDrag={(pos) => handleNodeDrag(node.id, pos)}
                onDelete={() => handleNodeDelete(node.id)}
                onConnectionStart={(handle) => handleConnectionStart(node.id, handle)}
                onConnectionEnd={() => handleConnectionEnd(node.id)}
                isConnecting={canvasState.isConnecting}
                zoom={canvasState.zoom}
                isHighlighted={highlightedNodeId === node.id}
              />
            ))}
          </div>

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
