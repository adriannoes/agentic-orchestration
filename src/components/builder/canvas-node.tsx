"use client"

import type React from "react"

import { useState } from "react"
import { Bot, Shield, GitBranch, Plug, UserCheck, FileSearch, Play, Square, Frame, Trash2, GripVertical } from "lucide-react"
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
  frame: Frame,
}

const NODE_COLORS: Record<NodeType, { bg: string; iconBg: string; border: string; icon: string }> = {
  start: {
    bg: "bg-card/95",
    iconBg: "bg-indigo-500/10",
    border: "border-border/80",
    icon: "text-indigo-300",
  },
  end: {
    bg: "bg-card/95",
    iconBg: "bg-violet-500/10",
    border: "border-border/80",
    icon: "text-violet-300",
  },
  agent: {
    bg: "bg-card/95",
    iconBg: "bg-indigo-500/10",
    border: "border-border/80",
    icon: "text-indigo-300",
  },
  guardrail: {
    bg: "bg-card/95",
    iconBg: "bg-zinc-500/10",
    border: "border-border/80",
    icon: "text-zinc-300",
  },
  condition: {
    bg: "bg-card/95",
    iconBg: "bg-violet-500/10",
    border: "border-border/80",
    icon: "text-violet-300",
  },
  mcp: {
    bg: "bg-card/95",
    iconBg: "bg-indigo-500/10",
    border: "border-border/80",
    icon: "text-indigo-300",
  },
  "user-approval": {
    bg: "bg-card/95",
    iconBg: "bg-zinc-500/10",
    border: "border-border/80",
    icon: "text-zinc-300",
  },
  "file-search": {
    bg: "bg-card/95",
    iconBg: "bg-violet-500/10",
    border: "border-border/80",
    icon: "text-violet-300",
  },
  frame: {
    bg: "bg-card/95",
    iconBg: "bg-zinc-500/10",
    border: "border-border/80",
    icon: "text-zinc-300",
  },
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
        "w-[320px] rounded-2xl transition-all duration-300 ease-out",
        "border",
        colors.bg,
        colors.border,
        "hover:-translate-y-0.5 hover:border-primary/40",
        selected ? "ring-2 ring-primary/40 z-10" : "",
        isHighlighted && "ring-2 ring-primary/60",
        "cursor-grab active:cursor-grabbing",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Input Handle */}
      {nodeType !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className={cn(
            "!w-5 !h-5 !-left-2.5 !rounded-full !border-[3px] !bg-background !transition-all !duration-300 !z-30",
            selected || isHovered ? "!border-primary !scale-110" : "!border-muted-foreground/40",
          )}
        />
      )}

      {/* Node Content */}
      <div className="p-4 relative overflow-hidden rounded-2xl">
        <div className="flex items-start gap-4 group">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-500 ease-out relative flex-shrink-0",
              colors.iconBg,
              "ring-1 ring-inset ring-border/80",
              selected ? "scale-105" : "group-hover:scale-105",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-transform duration-500",
                colors.icon,
                selected ? "scale-110" : "group-hover:scale-110",
              )}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-medium text-sm tracking-tight text-foreground truncate">{data?.label ?? "Node"}</h3>
              {isHovered && <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-colors hover:text-foreground/80" />}
            </div>
            {data?.description && (
              <p className="text-[13px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed font-light">
                {data.description}
              </p>
            )}
          </div>

          {/* Delete Button */}
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {(selected || isHovered) && (
              <Button
                variant="ghost"
                size="icon"
                className="nodrag nopan h-7 w-7 rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-destructive hover:bg-destructive/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                aria-label="Delete node"
                title="Delete node"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Node-specific details */}
        {nodeType === "agent" && data?.model && (
          <div className="mt-4 flex items-center gap-2 pt-1">
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
              {data.model}
            </span>
            {data.tools && data.tools.length > 0 && (
              <span className="rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/80">
                {data.tools.length} tool{data.tools.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {nodeType === "guardrail" && data?.guardrailType && (
          <div className="mt-4 pt-1">
            <span className="inline-block rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {data.guardrailType}
            </span>
          </div>
        )}

        {nodeType === "condition" && data?.condition && (
          <div className="mt-4 pt-1">
            <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2 font-mono text-[11px] text-muted-foreground/90">
              {data.condition}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {nodeType !== "end" && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className={cn(
            "!w-5 !h-5 !-right-2.5 !rounded-full !border-[3px] !bg-background !transition-all !duration-300 !z-30",
            selected || isHovered ? "!border-primary !scale-110" : "!border-muted-foreground/40",
            "cursor-crosshair",
          )}
        />
      )}
    </div>
  )
}
