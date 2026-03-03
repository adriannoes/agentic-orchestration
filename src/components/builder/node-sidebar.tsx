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
        "relative border-r border-white/5 bg-background/40 backdrop-blur-2xl transition-all duration-300 z-40",
        isOpen ? "w-72" : "w-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -right-4 top-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-muted-foreground",
          "hover:scale-110 hover:text-foreground transition-all duration-300",
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-semibold text-lg mb-4 tracking-tight">Add Nodes</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search nodes..."
                className="pl-9 h-10 bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner placeholder:text-muted-foreground/50 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search nodes"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-3 pl-1">
                  {category.name}
                </h3>
                <div className="space-y-2.5">
                  {category.nodes.map((node) => {
                    const colors = COLOR_CLASSES[node.color]
                    const isHovered = hoveredNode === node.type
                    return (
                      <button
                        key={node.type}
                        draggable
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 ease-out",
                          "border border-white/5",
                          "bg-white/[0.02] hover:bg-white/[0.04]",
                          "cursor-grab active:cursor-grabbing",
                          isHovered && "scale-[1.02] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5)]",
                          "active:scale-[0.98]",
                        )}
                        onClick={() => onAddNode(node.type)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({ type: node.type, label: node.label }),
                          )
                          e.dataTransfer.effectAllowed = "move"
                        }}
                        onMouseEnter={() => setHoveredNode(node.type)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-all duration-500 ease-out ring-1 ring-inset ring-white/10 flex-shrink-0",
                            colors.bg,
                            isHovered && "scale-110 shadow-lg",
                          )}
                        >
                          <node.icon className={cn("h-4 w-4 transition-transform duration-500", colors.icon, isHovered && "scale-110")} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm font-medium block text-foreground tracking-tight">{node.label}</span>
                          {node.description && (
                            <span className="text-[11px] text-muted-foreground/70 block mt-0.5 truncate">{node.description}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-white/5 bg-black/20 backdrop-blur-md">
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-light">
              Click to add at center, or drag to drop at a specific position. Connect nodes by dragging from output to input handles.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
