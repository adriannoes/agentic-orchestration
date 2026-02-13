// Workflow and Canvas Types for Visual Agent Builder

export type NodeType = "agent" | "guardrail" | "condition" | "mcp" | "user-approval" | "file-search" | "start" | "end"

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
}

export interface NodeData {
  label: string
  description?: string
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
