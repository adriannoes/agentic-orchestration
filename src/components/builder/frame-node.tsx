"use client"

import { useState, useCallback, useEffect } from "react"
import { type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { NodeData } from "@/lib/workflow-types"

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 300

export type FrameNodeData = NodeData & {
  isHighlighted?: boolean
  customOnDelete?: () => void
  customOnLabelChange?: (newLabel: string) => void
}
export type FrameNodeType = Node<FrameNodeData, "frame">

export function FrameNode({ data, selected }: NodeProps<FrameNodeType>) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data?.label ?? "Frame")
  const width = (data?.width as number) ?? DEFAULT_WIDTH
  const height = (data?.height as number) ?? DEFAULT_HEIGHT

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
        "rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl",
        "transition-all duration-300 ease-out",
        "min-w-[120px] min-h-[80px]",
        selected && "ring-2 ring-white/20 border-white/20",
      )}
      style={{ width, height }}
    >
      <div className="p-3 border-b border-white/10 flex items-center">
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
