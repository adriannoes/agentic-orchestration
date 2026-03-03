// Workflow and Canvas Types for Visual Agent Builder

export type NodeType =
  | "agent"
  | "guardrail"
  | "condition"
  | "mcp"
  | "user-approval"
  | "file-search"
  | "start"
  | "end"
  | "frame"

export interface Position {
  x: number
  y: number
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: Position
  data: NodeData
  selected?: boolean
  parentId?: string
  /** For React Flow parent nodes: width and height in px */
  style?: { width?: number; height?: number }
}

export interface NodeData {
  [key: string]: unknown
  label: string
  description?: string
  /** Frame-specific: width and height in px */
  width?: number
  height?: number
  // Agent-specific
  agentId?: string
  model?: string
  systemPrompt?: string
  tools?: string[]
  // Guardrail-specific
  guardrailType?: "jailbreak" | "pii" | "custom"
  guardrailConfig?: Record<string, unknown>
  // Condition-specific
  condition?: string
  // MCP-specific
  mcpServer?: string
  // File Search-specific
  fileTypes?: string[]
}

export interface Connection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
}

export interface Workflow {
  id: string
  workspaceId?: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: Connection[]
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface CanvasState {
  zoom: number
  pan: Position
  selectedNodeId: string | null
  selectedConnectionId: string | null
  isDragging: boolean
  isConnecting: boolean
  connectionStart: { nodeId: string; handle: string } | null
}

export const NODE_COLORS: Record<NodeType, string> = {
  start: "emerald",
  end: "rose",
  agent: "blue",
  guardrail: "amber",
  condition: "purple",
  mcp: "cyan",
  "user-approval": "orange",
  "file-search": "teal",
  frame: "zinc",
}

/** Hex colors for SVG gradients (edges) */
export const NODE_COLORS_HEX: Record<NodeType, string> = {
  start: "#10b981",
  end: "#f43f5e",
  agent: "#3b82f6",
  guardrail: "#f59e0b",
  condition: "#a855f7",
  mcp: "#06b6d4",
  "user-approval": "#f97316",
  "file-search": "#14b8a6",
  frame: "#71717a",
}

export const NODE_ICONS: Record<NodeType, string> = {
  start: "Play",
  end: "Square",
  agent: "Bot",
  guardrail: "Shield",
  condition: "GitBranch",
  mcp: "Plug",
  "user-approval": "UserCheck",
  "file-search": "FileSearch",
  frame: "Frame",
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed" | "paused"
  startedAt: Date
  completedAt?: Date
  currentNodeId?: string
  context: ExecutionContext
  logs: ExecutionLog[]
  input?: unknown
  result?: unknown
  steps?: unknown
  error?: string
}

export interface ExecutionContext {
  input: string
  variables: Record<string, unknown>
  messages: Array<{ role: string; content: string }>
}

export interface ExecutionLog {
  id: string
  nodeId: string
  timestamp: Date
  type: "info" | "success" | "error" | "tool-call" | "tool-result"
  message: string
  data?: unknown
  duration?: number
}

export interface NodeExecutionResult {
  success: boolean
  output?: unknown
  error?: string
  logs: ExecutionLog[]
  nextNodeId?: string
}

export interface WorkflowVersion {
  id: string
  workflowId: string
  version: number
  name: string
  description?: string
  nodes: WorkflowNode[]
  connections: Connection[]
  createdAt: Date
  createdBy?: string
  tags?: string[]
}

export interface VersionComparison {
  added: { nodes: WorkflowNode[]; connections: Connection[] }
  removed: { nodes: WorkflowNode[]; connections: Connection[] }
  modified: { nodes: Array<{ old: WorkflowNode; new: WorkflowNode }> }
}
