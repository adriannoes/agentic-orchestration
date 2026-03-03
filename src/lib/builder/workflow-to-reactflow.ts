import type { Node, Edge } from "@xyflow/react"
import type { WorkflowNode, Connection, NodeData } from "@/lib/workflow-types"

export type WorkflowNodeType = WorkflowNode["type"]

export function workflowNodesToReactFlow(nodes: WorkflowNode[]): Node<NodeData, WorkflowNodeType>[] {
  return (nodes || []).map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: n.selected,
  }))
}

export function workflowConnectionsToEdges(connections: Connection[]): Edge[] {
  return (connections || []).map((c) => ({
    id: c.id,
    source: c.sourceId,
    target: c.targetId,
    sourceHandle: c.sourceHandle ?? "output",
    targetHandle: c.targetHandle ?? "input",
  }))
}

export function reactFlowNodesToWorkflow(nodes: Node<NodeData, WorkflowNodeType>[]): WorkflowNode[] {
  return (nodes || []).map((n) => ({
    id: n.id,
    type: n.type as WorkflowNode["type"],
    position: n.position,
    data: n.data as NodeData,
    selected: n.selected,
  }))
}

export function reactFlowEdgesToConnections(edges: Edge[]): Connection[] {
  return (edges || []).map((e) => ({
    id: e.id,
    sourceId: e.source,
    targetId: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
  }))
}
