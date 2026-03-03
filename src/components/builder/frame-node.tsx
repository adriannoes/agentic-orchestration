"use client"

import { useState, useCallback, useEffect } from "react"
import { type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { NodeData } from "@/lib/workflow-types"

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 300

export type FrameNodeData = NodeData & {
  width?: number
  height?: number
  isHighlighted?: boolean
  customOnDelete?: () => void
  customOnLabelChange?: (newLabel: string) => void
}
export type FrameNodeType = Node<FrameNodeData, "frame">

export function FrameNode({ data, selected }: NodeProps<FrameNodeType>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data?.label ?? "Frame")
  const width = data?.width ?? DEFAULT_WIDTH
  const height = data?.height ?? DEFAULT_HEIGHT

  useEffect(() => {
    setLabel(data?.label ?? "Frame")
  }, [data?.label])

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false)
    const newLabel = label.trim() || "Frame"
    if (newLabel !== (data?.label ?? "Frame")) {
      data?.customOnLabelChange?.(newLabel)
    }
  }, [label, data?.customOnLabelChange, data?.label])

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card/90",
        "transition-all duration-300 ease-out",
        "min-w-[120px] min-h-[80px]",
        selected && "border-primary/40 ring-2 ring-primary/40",
      )}
      style={{ width, height }}
    >
      <div className="flex items-center border-b border-border/80 p-3">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => e.key === "Enter" && handleLabelBlur()}
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none border-none focus:ring-0 px-0"
            autoFocus
            data-label="frame-label"
          />
        ) : (
          <span
            className="text-sm font-medium text-foreground/90 truncate cursor-text"
            onDoubleClick={handleDoubleClick}
          >
            {label}
          </span>
        )}
      </div>
      <div className="flex-1 p-2" />
    </div>
  )
}
