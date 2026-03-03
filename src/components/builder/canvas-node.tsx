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

const NODE_COLORS: Record<NodeType, { bg: string; iconBg: string; border: string; icon: string; shadow: string; glow: string }> = {
  start: {
    bg: "bg-background/40",
    iconBg: "bg-emerald-500/10",
    border: "border-white/5",
    icon: "text-emerald-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  end: {
    bg: "bg-background/40",
    iconBg: "bg-rose-500/10",
    border: "border-white/5",
    icon: "text-rose-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]"
  },
  agent: {
    bg: "bg-background/40",
    iconBg: "bg-blue-500/10",
    border: "border-white/5",
    icon: "text-blue-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]"
  },
  guardrail: {
    bg: "bg-background/40",
    iconBg: "bg-amber-500/10",
    border: "border-white/5",
    icon: "text-amber-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]"
  },
  condition: {
    bg: "bg-background/40",
    iconBg: "bg-purple-500/10",
    border: "border-white/5",
    icon: "text-purple-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  mcp: {
    bg: "bg-background/40",
    iconBg: "bg-cyan-500/10",
    border: "border-white/5",
    icon: "text-cyan-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]"
  },
  "user-approval": {
    bg: "bg-background/40",
    iconBg: "bg-orange-500/10",
    border: "border-white/5",
    icon: "text-orange-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
  },
  "file-search": {
    bg: "bg-background/40",
    iconBg: "bg-teal-500/10",
    border: "border-white/5",
    icon: "text-teal-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.15)]"
  },
  frame: {
    bg: "bg-background/40",
    iconBg: "bg-zinc-500/10",
    border: "border-white/5",
    icon: "text-zinc-400",
    shadow: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.15)]",
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
        "border ring-1 ring-inset ring-white/5",
        colors.bg,
        colors.border,
        colors.shadow,
        "backdrop-blur-xl backdrop-saturate-150",
        "hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]",
        selected ? `ring-2 ring-white/20 ${colors.glow} scale-[1.02] z-10 border-transparent` : "hover:border-white/10",
        isHighlighted && "ring-2 ring-blue-500/50 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.3)]",
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
            selected || isHovered ? "!border-primary !scale-110 !shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "!border-muted-foreground/40",
          )}
        />
      )}

      {/* Node Content */}
      <div className="p-4 relative overflow-hidden rounded-2xl">
        {/* Subtle top glare effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-start gap-4 group">
          {/* Icon Container with glowing background */}
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-500 ease-out relative flex-shrink-0",
              colors.iconBg,
              "ring-1 ring-inset ring-white/10",
              selected ? "scale-110 shadow-lg" : "group-hover:scale-105",
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
              {isHovered && <GripVertical className="h-4 w-4 text-muted-foreground/40 transition-colors hover:text-foreground/80 flex-shrink-0" />}
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
                className="h-7 w-7 rounded-full bg-background/50 hover:bg-destructive/80 text-muted-foreground hover:text-white transition-all duration-200 nodrag nopan backdrop-blur-md border border-white/5 hover:border-destructive hover:scale-105"
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
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400/90 text-[11px] font-medium border border-blue-500/20 shadow-sm backdrop-blur-md">
              {data.model}
            </span>
            {data.tools && data.tools.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground/80 text-[11px] font-medium border border-white/5 shadow-sm">
                {data.tools.length} tool{data.tools.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {nodeType === "guardrail" && data?.guardrailType && (
          <div className="mt-4 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400/90 text-[11px] font-medium border border-amber-500/20 shadow-sm backdrop-blur-md inline-block">
              {data.guardrailType}
            </span>
          </div>
        )}

        {nodeType === "condition" && data?.condition && (
          <div className="mt-4 pt-1">
            <div className="px-3 py-2 rounded-xl bg-black/40 text-muted-foreground/90 font-mono text-[11px] border border-white/5 shadow-inner">
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
            selected || isHovered ? "!border-primary !scale-110 !shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "!border-muted-foreground/40",
            "cursor-crosshair",
          )}
        />
      )}
    </div>
  )
}
