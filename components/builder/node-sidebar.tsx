"use client"

import {
  Bot,
  Shield,
  GitBranch,
  Plug,
  UserCheck,
  FileSearch,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { NodeType } from "@/lib/workflow-types"
import { useState } from "react"

interface NodeSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onAddNode: (type: NodeType) => void
}

const NODE_CATEGORIES = [
  {
    name: "Flow",
    nodes: [
      {
        type: "start" as NodeType,
        label: "Start",
        icon: Play,
        color: "emerald",
        description: "Entry point of workflow",
      },
      { type: "end" as NodeType, label: "End", icon: Square, color: "rose", description: "Terminal node" },
    ],
  },
  {
    name: "Core",
    nodes: [
      { type: "agent" as NodeType, label: "Agent", icon: Bot, color: "blue", description: "AI agent with tools" },
      {
        type: "condition" as NodeType,
        label: "Condition",
        icon: GitBranch,
        color: "purple",
        description: "Branch workflow logic",
      },
    ],
  },
  {
    name: "Safety",
    nodes: [
      {
        type: "guardrail" as NodeType,
        label: "Guardrail",
        icon: Shield,
        color: "amber",
        description: "Content moderation",
      },
      {
        type: "user-approval" as NodeType,
        label: "User Approval",
        icon: UserCheck,
        color: "orange",
        description: "Manual approval gate",
      },
    ],
  },
  {
    name: "Integrations",
    nodes: [
      { type: "mcp" as NodeType, label: "MCP Server", icon: Plug, color: "cyan", description: "External tool server" },
      {
        type: "file-search" as NodeType,
        label: "File Search",
        icon: FileSearch,
        color: "teal",
        description: "Search documents",
      },
    ],
  },
]

const COLOR_CLASSES: Record<string, { bg: string; icon: string; hover: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-950/40",
    icon: "text-emerald-400",
    hover: "hover:bg-emerald-950/60",
    border: "border-emerald-500/30",
  },
  rose: { bg: "bg-rose-950/40", icon: "text-rose-400", hover: "hover:bg-rose-950/60", border: "border-rose-500/30" },
  blue: { bg: "bg-blue-950/40", icon: "text-blue-400", hover: "hover:bg-blue-950/60", border: "border-blue-500/30" },
  purple: {
    bg: "bg-purple-950/40",
    icon: "text-purple-400",
    hover: "hover:bg-purple-950/60",
    border: "border-purple-500/30",
  },
  amber: {
    bg: "bg-amber-950/40",
    icon: "text-amber-400",
    hover: "hover:bg-amber-950/60",
    border: "border-amber-500/30",
  },
  orange: {
    bg: "bg-orange-950/40",
    icon: "text-orange-400",
    hover: "hover:bg-orange-950/60",
    border: "border-orange-500/30",
  },
  cyan: { bg: "bg-cyan-950/40", icon: "text-cyan-400", hover: "hover:bg-cyan-950/60", border: "border-cyan-500/30" },
  teal: { bg: "bg-teal-950/40", icon: "text-teal-400", hover: "hover:bg-teal-950/60", border: "border-teal-500/30" },
}

export function NodeSidebar({ isOpen, onToggle, onAddNode }: NodeSidebarProps) {
  const [search, setSearch] = useState("")
  const [hoveredNode, setHoveredNode] = useState<NodeType | null>(null)

  const filteredCategories = NODE_CATEGORIES.map((category) => ({
    ...category,
    nodes: category.nodes.filter((node) => node.label.toLowerCase().includes(search.toLowerCase())),
  })).filter((category) => category.nodes.length > 0)

  return (
    <div
      className={cn(
        "relative border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        isOpen ? "w-72" : "w-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -right-4 top-4 z-10 h-8 w-8 rounded-full bg-card border shadow-lg",
          "hover:scale-110 transition-transform",
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg mb-3">Add Nodes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                className="pl-9 h-10 bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.nodes.map((node) => {
                    const colors = COLOR_CLASSES[node.color]
                    const isHovered = hoveredNode === node.type
                    return (
                      <button
                        key={node.type}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                          "border",
                          colors.bg,
                          colors.hover,
                          colors.border,
                          "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                        )}
                        onClick={() => onAddNode(node.type)}
                        onMouseEnter={() => setHoveredNode(node.type)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <div
                          className={cn("p-1.5 rounded-md transition-transform", colors.bg, isHovered && "scale-110")}
                        >
                          <node.icon className={cn("h-4 w-4", colors.icon)} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-medium block">{node.label}</span>
                          {node.description && (
                            <span className="text-xs text-muted-foreground">{node.description}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click a node to add it to the center of the canvas. Connect nodes by dragging from output to input
              handles.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
