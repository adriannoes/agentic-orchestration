"use client"

import type React from "react"

import { useState } from "react"
import { Bot, Shield, GitBranch, Plug, UserCheck, FileSearch, Play, Square, Trash2, GripVertical } from "lucide-react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { NodeType, NodeData } from "@/lib/workflow-types"
import { Button } from "@/components/ui/button"

export type WorkflowNodeData = NodeData & { isHighlighted?: boolean; customOnDelete?: () => void }
export type WorkflowNodeType = Node<WorkflowNodeData, NodeType>

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

export type WorkflowNodeProps = NodeProps<WorkflowNodeType>

export function CanvasNode({ data, selected, id, type: nodeTypeProp }: WorkflowNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const nodeType = (nodeTypeProp ?? "agent") as NodeType

  const handleDelete = () => data?.customOnDelete?.()
  const Icon = NODE_ICONS[nodeType]
  const colors = NODE_COLORS[nodeType]
  const isHighlighted = data?.isHighlighted ?? false

  return (
    <div
      className={cn(
        "w-[300px] bg-card/98 backdrop-blur-md border-2 rounded-xl transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:-translate-y-0.5",
        colors.border,
        colors.glow,
        selected && "ring-2 ring-primary/60 shadow-2xl scale-[1.03] z-10",
        isHighlighted && "ring-4 ring-blue-400/60 animate-pulse shadow-blue-500/50",
        "cursor-grab hover:border-opacity-80",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Handle - left side, except for start node */}
      {nodeType !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className={cn(
            "!w-8 !h-8 !-left-4 !rounded-full !border-2 !bg-card/95 !backdrop-blur-sm !z-30",
            "flex items-center justify-center transition-all duration-300 ease-out",
            colors.border,
            (isHovered || selected) && "!shadow-lg !border-opacity-100",
          )}
        >
          <div className={cn("w-3.5 h-3.5 rounded-full", colors.icon.replace("text-", "bg-"))} />
        </Handle>
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
              selected && `ring-2 ring-current shadow-xl scale-110 ${colors.glow}`,
              isHovered && "scale-105 shadow-lg",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon
              className={cn(
                "w-5 h-5 transition-all duration-300 relative z-10",
                colors.icon,
                isHovered && "scale-110",
              )}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate text-foreground">{data?.label ?? "Node"}</h3>
              {isHovered && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 animate-pulse" />}
            </div>
            {data?.description && (
              <p className="text-xs text-muted-foreground/90 mt-1.5 line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          {/* Delete Button */}
          {(selected || isHovered) && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 -mr-1 -mt-1 text-muted-foreground hover:text-destructive transition-all duration-200 nodrag nopan",
                "hover:bg-destructive/10 hover:scale-110 opacity-0 group-hover:opacity-100",
              )}
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Node-specific details */}
        {nodeType === "agent" && data?.model && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 transition-colors hover:bg-primary/15">
              {data.model}
            </span>
            {data.tools && data.tools.length > 0 && (
              <span className="text-muted-foreground/80 bg-muted/60 px-2 py-1 rounded-md">
                {data.tools.length} tools
              </span>
            )}
          </div>
        )}

        {nodeType === "guardrail" && data?.guardrailType && (
          <div className="mt-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 inline-block transition-all hover:bg-amber-500/25">
              {data.guardrailType}
            </span>
          </div>
        )}

        {nodeType === "condition" && data?.condition && (
          <div className="mt-3 text-xs text-muted-foreground font-mono bg-muted/80 px-3 py-2.5 rounded-lg border border-border/50 hover:border-border transition-colors">
            {data.condition}
          </div>
        )}
      </div>

      {/* Output Handle - right side, except for end node */}
      {nodeType !== "end" && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className={cn(
            "!w-8 !h-8 !-right-4 !rounded-full !border-2 !bg-card/95 !backdrop-blur-sm !z-30",
            "flex items-center justify-center cursor-crosshair transition-all duration-300 ease-out",
            colors.border,
            (isHovered || selected) && "!shadow-lg !scale-110 !border-opacity-100",
          )}
        >
          <div className={cn("w-3.5 h-3.5 rounded-full", colors.icon.replace("text-", "bg-"))} />
        </Handle>
      )}
    </div>
  )
}
