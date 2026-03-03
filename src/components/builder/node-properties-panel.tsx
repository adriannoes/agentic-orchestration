"use client"

import type React from "react"

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
  Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { WorkflowNode, NodeType } from "@/lib/workflow-types"
import { useState, useEffect } from "react"

interface NodePropertiesPanelProps {
  isOpen: boolean
  onToggle: () => void
  node: WorkflowNode | undefined
  workflowId: string
  onUpdate: () => void
}

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

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
]

const GUARDRAIL_TYPES = [
  { value: "jailbreak", label: "Jailbreak Detection" },
  { value: "pii", label: "PII Masking" },
  { value: "custom", label: "Custom Rules" },
]

export function NodePropertiesPanel({ isOpen, onToggle, node, workflowId, onUpdate }: NodePropertiesPanelProps) {
  const [formData, setFormData] = useState<WorkflowNode["data"]>(node?.data || { label: "" })

  useEffect(() => {
    if (node) {
      setFormData(node.data)
    }
  }, [node])

  const handleSave = async () => {
    if (!node) return

    await fetch(`/api/workflows/${workflowId}/nodes/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: formData }),
    })
    onUpdate()
  }

  const Icon = node ? NODE_ICONS[node.type] : Settings2

  return (
    <div className={cn(
      "relative border-l border-white/5 bg-background/40 backdrop-blur-2xl transition-all duration-300 z-40",
      isOpen ? "w-80" : "w-0"
    )}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -left-4 top-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] text-muted-foreground",
          "hover:scale-110 hover:text-foreground transition-all duration-300"
        )}
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          {node ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/10">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground tracking-tight">{node.data.label}</h2>
                    <p className="text-[11px] text-muted-foreground/70 tracking-widest uppercase mt-0.5 font-medium">{node.type} Node</p>
                  </div>
                </div>
              </div>

              {/* Properties Form */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Label (all nodes) */}
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm"
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>

                {/* Description (all nodes) */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm resize-none"
                  />
                </div>

                {/* Agent-specific fields */}
                {node.type === "agent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="model" id="model-label" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Model</Label>
                      <Select
                        value={formData.model || "gpt-4o"}
                        onValueChange={(value) => setFormData({ ...formData, model: value })}
                      >
                        <SelectTrigger id="model" aria-labelledby="model-label" className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-xl">
                          {MODELS.map((model) => (
                            <SelectItem key={model.value} value={model.value} className="rounded-lg focus:bg-white/5 cursor-pointer">
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">System Prompt</Label>
                      <Textarea
                        id="systemPrompt"
                        value={formData.systemPrompt || ""}
                        onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                        rows={4}
                        placeholder="You are a helpful assistant..."
                        className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Guardrail-specific fields */}
                {node.type === "guardrail" && (
                  <div className="space-y-2">
                    <Label htmlFor="guardrailType" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Guardrail Type</Label>
                    <Select
                      value={formData.guardrailType || "jailbreak"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, guardrailType: value as "jailbreak" | "pii" | "custom" })
                      }
                    >
                      <SelectTrigger className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-xl">
                        {GUARDRAIL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="rounded-lg focus:bg-white/5 cursor-pointer">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Condition-specific fields */}
                {node.type === "condition" && (
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Condition Expression</Label>
                    <Textarea
                      id="condition"
                      value={formData.condition || ""}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      rows={3}
                      placeholder="e.g., intent === 'support'"
                      className="bg-black/40 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/60 transition-all rounded-xl shadow-inner text-sm font-mono text-muted-foreground/90 resize-none"
                    />
                  </div>
                )}

                {/* MCP-specific fields */}
                {node.type === "mcp" && (
                  <div className="space-y-2">
                    <Label htmlFor="mcpServer" className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">MCP Server URL</Label>
                    <Input
                      id="mcpServer"
                      value={formData.mcpServer || ""}
                      onChange={(e) => setFormData({ ...formData, mcpServer: e.target.value })}
                      placeholder="https://mcp.example.com"
                      className="bg-black/20 border-white/5 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-black/40 transition-all rounded-xl shadow-inner text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <Button className="w-full rounded-xl bg-primary/90 hover:bg-primary shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 rounded-full bg-white/[0.02] border border-white/5 mb-4">
                <Settings2 className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium text-foreground tracking-tight mb-1">No Node Selected</h3>
              <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-[200px]">Click a node on the canvas to configure its properties here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
