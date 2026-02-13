"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Agent, Tool } from "@/lib/types"
import { toast } from "sonner"

interface EditAgentDialogProps {
  agent: Agent
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}

const models = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
]

export function EditAgentDialog({ agent, open, onOpenChange, onUpdated }: EditAgentDialogProps) {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [model, setModel] = useState(agent.model)
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt)
  const [selectedTools, setSelectedTools] = useState<string[]>(agent.tools)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("/api/tools")
        .then((res) => res.json())
        .then(setTools)
        .catch(console.error)
    }
  }, [open])

  useEffect(() => {
    setName(agent.name)
    setDescription(agent.description)
    setModel(agent.model)
    setSystemPrompt(agent.systemPrompt)
    setSelectedTools(agent.tools)
  }, [agent])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter an agent name")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          model,
          systemPrompt,
          tools: selectedTools,
        }),
      })

      if (!res.ok) throw new Error("Failed to update agent")

      toast.success("Agent updated successfully")
      onOpenChange(false)
      onUpdated()
    } catch (error) {
      toast.error("Failed to update agent")
    } finally {
      setLoading(false)
    }
  }

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>Update your agent&apos;s configuration</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" placeholder="My Agent" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="A helpful assistant for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-systemPrompt">System Prompt</Label>
            <Textarea
              id="edit-systemPrompt"
              placeholder="You are a helpful AI assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Tools</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => toggleTool(tool.id)}
                >
                  <Checkbox checked={selectedTools.includes(tool.id)} onCheckedChange={() => toggleTool(tool.id)} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
