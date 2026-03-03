"use client"

import { getBezierPath, type EdgeProps } from "@xyflow/react"

const DEFAULT_SOURCE_COLOR = "#3b82f6"
const DEFAULT_TARGET_COLOR = "#94a3b8"
const INTERACTION_WIDTH = 20

export function GradientEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const sourceColor = (data?.sourceColor as string) ?? DEFAULT_SOURCE_COLOR
  const targetColor = (data?.targetColor as string) ?? DEFAULT_TARGET_COLOR
  const gradientId = `gradient-${id}`

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={INTERACTION_WIDTH}
        className="react-flow__edge-interaction"
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        className="react-flow__edge-path"
      />
    </>
  )
}
