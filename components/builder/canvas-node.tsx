"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Bot, Shield, GitBranch, Plug, UserCheck, FileSearch, Play, Square, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkflowNode, Position, NodeType } from "@/lib/workflow-types"
import { Button } from "@/components/ui/button"

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  start: Play,
  end: Square,
  agent: Bot,
  guardrail: Shield,
  condition: GitBranch,
  mcp: Plug,
  "user-approval": UserCheck,
  "file-search": FileSearch,
}

const NODE_COLORS: Record<NodeType, { bg: string; border: string; icon: string; glow: string }> = {
  start: {
    bg: "bg-emerald-950/50",
    border: "border-emerald-500",
    icon: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  end: { bg: "bg-rose-950/50", border: "border-rose-500", icon: "text-rose-400", glow: "shadow-rose-500/20" },
  agent: { bg: "bg-blue-950/50", border: "border-blue-500", icon: "text-blue-400", glow: "shadow-blue-500/20" },
  guardrail: { bg: "bg-amber-950/50", border: "border-amber-500", icon: "text-amber-400", glow: "shadow-amber-500/20" },
  condition: {
    bg: "bg-purple-950/50",
    border: "border-purple-500",
    icon: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  mcp: { bg: "bg-cyan-950/50", border: "border-cyan-500", icon: "text-cyan-400", glow: "shadow-cyan-500/20" },
  "user-approval": {
    bg: "bg-orange-950/50",
    border: "border-orange-500",
    icon: "text-orange-400",
    glow: "shadow-orange-500/20",
  },
  "file-search": { bg: "bg-teal-950/50", border: "border-teal-500", icon: "text-teal-400", glow: "shadow-teal-500/20" },
}

interface CanvasNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
  onDrag: (position: Position) => void
  onDelete: () => void
  onConnectionStart: (handle: string) => void
  onConnectionEnd: () => void
  isConnecting: boolean
  zoom: number
  isHighlighted?: boolean
}

export function CanvasNode({
  node,
  isSelected,
  onSelect,
  onDrag,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  isConnecting,
  zoom,
  isHighlighted,
}: CanvasNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })

  const Icon = NODE_ICONS[node.type]
  const colors = NODE_COLORS[node.type]

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.stopPropagation()

      onSelect()
      setIsDragging(true)

      const offset = {
        x: e.clientX / zoom - node.position.x,
        y: e.clientY / zoom - node.position.y,
      }
      dragOffsetRef.current = offset

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newPosition = {
          x: moveEvent.clientX / zoom - dragOffsetRef.current.x,
          y: moveEvent.clientY / zoom - dragOffsetRef.current.y,
        }
        onDrag(newPosition)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [node.position, onSelect, onDrag, zoom],
  )

  const handleOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onConnectionStart("output")
    },
    [onConnectionStart],
  )

  const handleInputMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (isConnecting) {
        onConnectionEnd()
      }
    },
    [isConnecting, onConnectionEnd],
  )

  const handleInputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
    },
    [],
  )

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute w-[300px] bg-card/98 backdrop-blur-md border-2 rounded-xl transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:-translate-y-0.5",
        colors.border,
        colors.glow,
        isSelected && "ring-2 ring-primary/60 shadow-2xl scale-[1.03] z-10",
        isHighlighted && "ring-4 ring-blue-400/60 animate-pulse shadow-blue-500/50",
        isDragging && "shadow-2xl scale-[1.05] cursor-grabbing z-20 rotate-1",
        !isDragging && "cursor-grab hover:border-opacity-80",
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Handle */}
      {node.type !== "start" && (
        <div
          className={cn(
            "absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 bg-card/95 backdrop-blur-sm z-30",
            "flex items-center justify-center transition-all duration-300 ease-out",
            "hover:scale-[1.35] hover:shadow-xl hover:-translate-x-0.5",
            isConnecting ? "cursor-cell" : "cursor-pointer",
            colors.border,
            isConnecting && "ring-4 ring-primary/40 scale-[1.35] animate-pulse shadow-primary/30",
            (isHovered || isConnecting) && "shadow-lg border-opacity-100",
          )}
          onMouseUp={handleInputMouseUp}
          onMouseDown={handleInputMouseDown}
        >
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-full transition-all duration-300",
              colors.icon.replace("text-", "bg-"),
              isConnecting && "scale-110 animate-pulse",
            )}
          />
        </div>
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-start gap-3 group">
          {/* Icon Container */}
          <div
            className={cn(
              "p-3 rounded-lg transition-all duration-300 ease-out relative overflow-hidden",
              colors.bg,
              "border border-transparent",
              isSelected && `ring-2 ring-current shadow-xl scale-110 ${colors.glow}`,
              isHovered && "scale-105 shadow-lg",
            )}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon
              className={cn(
                "w-5 h-5 transition-all duration-300 relative z-10",
                colors.icon,
                isDragging && "scale-125 rotate-12",
                isHovered && "scale-110",
              )}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate text-foreground">{node.data.label}</h3>
              {isHovered && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 animate-pulse" />}
            </div>
            {node.data.description && (
              <p className="text-xs text-muted-foreground/90 mt-1.5 line-clamp-2 leading-relaxed">
                {node.data.description}
              </p>
            )}
          </div>

          {/* Delete Button */}
          {(isSelected || isHovered) && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 -mr-1 -mt-1 text-muted-foreground hover:text-destructive transition-all duration-200",
                "hover:bg-destructive/10 hover:scale-110 opacity-0 group-hover:opacity-100",
                "hover:rotate-12",
              )}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Node-specific details */}
        {node.type === "agent" && node.data.model && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 transition-colors hover:bg-primary/15">
              {node.data.model}
            </span>
            {node.data.tools && node.data.tools.length > 0 && (
              <span className="text-muted-foreground/80 bg-muted/60 px-2 py-1 rounded-md">
                {node.data.tools.length} tools
              </span>
            )}
          </div>
        )}

        {node.type === "guardrail" && node.data.guardrailType && (
          <div className="mt-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 inline-block transition-all hover:bg-amber-500/25">
              {node.data.guardrailType}
            </span>
          </div>
        )}

        {node.type === "condition" && node.data.condition && (
          <div className="mt-3 text-xs text-muted-foreground font-mono bg-muted/80 px-3 py-2.5 rounded-lg border border-border/50 hover:border-border transition-colors">
            {node.data.condition}
          </div>
        )}
      </div>

      {/* Output Handle */}
      {node.type !== "end" && (
        <div
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 bg-card/95 backdrop-blur-sm z-30",
            "flex items-center justify-center cursor-crosshair transition-all duration-300 ease-out",
            "hover:scale-[1.35] hover:shadow-xl active:scale-110 hover:translate-x-0.5",
            colors.border,
            (isHovered || isDragging) && "shadow-lg scale-110 border-opacity-100",
          )}
          onMouseDown={handleOutputMouseDown}
        >
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-full transition-all duration-300",
              colors.icon.replace("text-", "bg-"),
              (isHovered || isDragging) && "scale-110",
            )}
          />
        </div>
      )}
    </div>
  )
}
