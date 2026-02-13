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
    <div className={cn("relative border-l border-border bg-card transition-all duration-300", isOpen ? "w-80" : "w-0")}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-4 top-4 z-10 h-8 w-8 rounded-full bg-transparent"
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full">
          {node ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{node.data.label}</h2>
                    <p className="text-xs text-muted-foreground capitalize">{node.type} Node</p>
                  </div>
                </div>
              </div>

              {/* Properties Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label (all nodes) */}
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>

                {/* Description (all nodes) */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Agent-specific fields */}
                {node.type === "agent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Select
                        value={formData.model || "gpt-4o"}
                        onValueChange={(value) => setFormData({ ...formData, model: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MODELS.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <Textarea
                        id="systemPrompt"
                        value={formData.systemPrompt || ""}
                        onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                        rows={4}
                        placeholder="You are a helpful assistant..."
                      />
                    </div>
                  </>
                )}

                {/* Guardrail-specific fields */}
                {node.type === "guardrail" && (
                  <div className="space-y-2">
                    <Label htmlFor="guardrailType">Guardrail Type</Label>
                    <Select
                      value={formData.guardrailType || "jailbreak"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, guardrailType: value as "jailbreak" | "pii" | "custom" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GUARDRAIL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
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
                    <Label htmlFor="condition">Condition Expression</Label>
                    <Textarea
                      id="condition"
                      value={formData.condition || ""}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      rows={3}
                      placeholder="e.g., intent === 'support'"
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* MCP-specific fields */}
                {node.type === "mcp" && (
                  <div className="space-y-2">
                    <Label htmlFor="mcpServer">MCP Server URL</Label>
                    <Input
                      id="mcpServer"
                      value={formData.mcpServer || ""}
                      onChange={(e) => setFormData({ ...formData, mcpServer: e.target.value })}
                      placeholder="https://mcp.example.com"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <Button className="w-full" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-muted-foreground">
                <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a node to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
