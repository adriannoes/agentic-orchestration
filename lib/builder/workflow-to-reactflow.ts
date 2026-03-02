/**
 * Mappers between workflow format (API) and React Flow format.
 * Workflow: WorkflowNode (id, type, position, data), Connection (id, sourceId, targetId)
 * React Flow: Node (id, type, position, data), Edge (id, source, target, sourceHandle, targetHandle)
 */

import type { Node, Edge } from "@xyflow/react"
import type { WorkflowNode, Connection, NodeData } from "@/lib/workflow-types"

export type WorkflowNodeType = WorkflowNode["type"]

/** Convert workflow nodes to React Flow nodes */
export function workflowNodesToReactFlow(nodes: WorkflowNode[]): Node<NodeData, WorkflowNodeType>[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: n.selected,
  }))
}

/** Convert workflow connections to React Flow edges */
export function workflowConnectionsToEdges(connections: Connection[]): Edge[] {
  return connections.map((c) => ({
    id: c.id,
    source: c.sourceId,
    target: c.targetId,
    sourceHandle: c.sourceHandle ?? "output",
    targetHandle: c.targetHandle ?? "input",
  }))
}

/** Convert React Flow nodes to workflow nodes */
export function reactFlowNodesToWorkflow(nodes: Node<NodeData, WorkflowNodeType>[]): WorkflowNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type as WorkflowNode["type"],
    position: n.position,
    data: n.data as NodeData,
    selected: n.selected,
  }))
}

/** Convert React Flow edges to workflow connections */
export function reactFlowEdgesToConnections(edges: Edge[]): Connection[] {
  return edges.map((e) => ({
    id: e.id,
    sourceId: e.source,
    targetId: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
  }))
}
