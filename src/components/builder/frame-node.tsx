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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLabel(data?.label ?? "Frame")
  }, [data?.label])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/exhaustive-deps */
  const handleLabelBlur = useCallback(() => {
    setIsEditing(false)
    const newLabel = label.trim() || "Frame"
    if (newLabel !== (data?.label ?? "Frame")) {
      data?.customOnLabelChange?.(newLabel)
    }
  }, [label, data?.customOnLabelChange, data?.label])
  /* eslint-enable react-hooks/preserve-manual-memoization, react-hooks/exhaustive-deps */

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  return (
    <div
      className={cn(
        "border-border/80 bg-card/90 rounded-lg border",
        "transition-all duration-300 ease-out",
        "min-h-[80px] min-w-[120px]",
        selected && "border-primary/40 ring-primary/40 ring-2",
      )}
      style={{ width, height }}
    >
      <div className="border-border/80 flex items-center border-b p-3">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => e.key === "Enter" && handleLabelBlur()}
            className="text-foreground flex-1 border-none bg-transparent px-0 text-sm font-medium outline-none focus:ring-0"
            autoFocus
            data-label="frame-label"
          />
        ) : (
          <span
            className="text-foreground/90 cursor-text truncate text-sm font-medium"
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
