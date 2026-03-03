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
    bg: "bg-indigo-500/10",
    icon: "text-indigo-300",
    hover: "hover:bg-indigo-500/20",
    border: "border-indigo-500/20",
  },
  rose: { bg: "bg-violet-500/10", icon: "text-violet-300", hover: "hover:bg-violet-500/20", border: "border-violet-500/20" },
  blue: { bg: "bg-indigo-500/10", icon: "text-indigo-300", hover: "hover:bg-indigo-500/20", border: "border-indigo-500/20" },
  purple: {
    bg: "bg-violet-500/10",
    icon: "text-violet-300",
    hover: "hover:bg-violet-500/20",
    border: "border-violet-500/20",
  },
  amber: {
    bg: "bg-zinc-500/10",
    icon: "text-zinc-300",
    hover: "hover:bg-zinc-500/20",
    border: "border-zinc-500/20",
  },
  orange: {
    bg: "bg-zinc-500/10",
    icon: "text-zinc-300",
    hover: "hover:bg-zinc-500/20",
    border: "border-zinc-500/20",
  },
  cyan: { bg: "bg-indigo-500/10", icon: "text-indigo-300", hover: "hover:bg-indigo-500/20", border: "border-indigo-500/20" },
  teal: { bg: "bg-violet-500/10", icon: "text-violet-300", hover: "hover:bg-violet-500/20", border: "border-violet-500/20" },
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
        "relative z-40 border-r border-border/80 bg-card/80 transition-all duration-300",
        isOpen ? "w-72" : "w-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -right-4 top-4 z-50 h-8 w-8 rounded-full border border-border/80 bg-card text-muted-foreground",
          "hover:scale-110 hover:text-foreground transition-all duration-300",
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          <div className="border-b border-border/80 p-5">
            <h2 className="font-semibold text-lg mb-4 tracking-tight">Add Nodes</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search nodes..."
                className="h-10 rounded-xl border-border/80 bg-background/70 pl-9 text-sm placeholder:text-muted-foreground/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search nodes"
              />
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-5">
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
                          "border border-border/80",
                          "bg-background/70 hover:bg-accent/40",
                          "cursor-grab active:cursor-grabbing",
                          isHovered && "scale-[1.02]",
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
                            "flex-shrink-0 rounded-lg p-2 transition-all duration-500 ease-out ring-1 ring-inset ring-border/80",
                            colors.bg,
                            isHovered && "scale-110",
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

          <div className="border-t border-border/80 bg-background/70 p-5">
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-light">
              Click to add at center, or drag to drop at a specific position. Connect nodes by dragging from output to input handles.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
