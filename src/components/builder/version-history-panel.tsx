"use client"

import { useState } from "react"
import { History, X, GitBranch, Tag, Trash2, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { WorkflowVersion } from "@/lib/workflow-types"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface VersionHistoryPanelProps {
  workflowId: string
  isOpen: boolean
  onToggle: () => void
  onRestoreVersion?: (version: WorkflowVersion) => void
}

export function VersionHistoryPanel({ workflowId, isOpen, onToggle, onRestoreVersion }: VersionHistoryPanelProps) {
  const { data: versions, mutate } = useSWR<WorkflowVersion[]>(`/api/workflows/${workflowId}/versions`, fetcher)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = async (versionNumber: number) => {
    if (!tagInput.trim()) return

    await fetch(`/api/workflows/${workflowId}/versions/${versionNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: tagInput }),
    })

    setTagInput("")
    mutate()
  }

  const handleDeleteVersion = async (versionNumber: number) => {
    await fetch(`/api/workflows/${workflowId}/versions/${versionNumber}`, {
      method: "DELETE",
    })
    mutate()
  }

  const handleCreateVersion = async () => {
    await fetch(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Manual save point" }),
    })
    mutate()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-border shadow-xl flex flex-col z-40">
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <h2 className="font-semibold">Version History</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <Button className="w-full" onClick={handleCreateVersion}>
          <GitBranch className="h-4 w-4 mr-2" />
          Save Version
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {versions?.map((version) => (
            <div
              key={version.id}
              className={cn(
                "p-3 rounded-lg border border-border space-y-2 cursor-pointer hover:bg-accent/50 transition-colors",
                selectedVersionId === version.id && "ring-2 ring-primary",
              )}
              onClick={() => setSelectedVersionId(version.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{version.name}</h3>
                  {version.description && <p className="text-xs text-muted-foreground mt-1">{version.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestoreVersion?.(version)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteVersion(version.version)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString()}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{version.nodes.length} nodes</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{version.connections.length} connections</span>
              </div>

              {version.tags && version.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {version.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedVersionId === version.id && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag(version.version)}
                    className="h-7 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddTag(version.version)
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          ))}

          {(!versions || versions.length === 0) && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No versions yet. Save your first version.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
