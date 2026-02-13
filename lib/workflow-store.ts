import type { Workflow, WorkflowNode, Connection } from "./workflow-types"

// Default workflows for demo
const defaultWorkflows: Workflow[] = [
  {
    id: "default-workflow",
    name: "Simple Agent Flow",
    description: "A basic single-agent workflow",
    version: 1,
    nodes: [
      {
        id: "start-1",
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Start" },
      },
      {
        id: "agent-1",
        type: "agent",
        position: { x: 350, y: 175 },
        data: {
          label: "Research Agent",
          description: "Handles research queries",
          model: "gpt-4o",
          systemPrompt: "You are a helpful research assistant.",
          tools: ["web-search"],
        },
      },
      {
        id: "end-1",
        type: "end",
        position: { x: 600, y: 200 },
        data: { label: "End" },
      },
    ],
    connections: [
      { id: "conn-1", sourceId: "start-1", targetId: "agent-1" },
      { id: "conn-2", sourceId: "agent-1", targetId: "end-1" },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]

class WorkflowStore {
  private workflows: Map<string, Workflow> = new Map()

  constructor() {
    defaultWorkflows.forEach((wf) => this.workflows.set(wf.id, wf))
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  createWorkflow(workflow: Omit<Workflow, "id" | "version" | "createdAt" | "updatedAt">): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: crypto.randomUUID(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.workflows.set(newWorkflow.id, newWorkflow)
    return newWorkflow
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | undefined {
    const workflow = this.workflows.get(id)
    if (!workflow) return undefined
    const updated: Workflow = {
      ...workflow,
      ...updates,
      version: workflow.version + 1,
      updatedAt: new Date(),
    }
    this.workflows.set(id, updated)
    return updated
  }

  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id)
  }

  // Node operations
  addNode(workflowId: string, node: Omit<WorkflowNode, "id">): WorkflowNode | undefined {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return undefined

    const newNode: WorkflowNode = {
      ...node,
      id: crypto.randomUUID(),
    }

    workflow.nodes.push(newNode)
    workflow.updatedAt = new Date()
    return newNode
  }

  updateNode(workflowId: string, nodeId: string, updates: Partial<WorkflowNode>): WorkflowNode | undefined {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return undefined

    const nodeIndex = workflow.nodes.findIndex((n) => n.id === nodeId)
    if (nodeIndex === -1) return undefined

    workflow.nodes[nodeIndex] = { ...workflow.nodes[nodeIndex], ...updates }
    workflow.updatedAt = new Date()
    return workflow.nodes[nodeIndex]
  }

  deleteNode(workflowId: string, nodeId: string): boolean {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return false

    const initialLength = workflow.nodes.length
    workflow.nodes = workflow.nodes.filter((n) => n.id !== nodeId)
    workflow.connections = workflow.connections.filter((c) => c.sourceId !== nodeId && c.targetId !== nodeId)
    workflow.updatedAt = new Date()
    return workflow.nodes.length < initialLength
  }

  // Connection operations
  addConnection(workflowId: string, connection: Omit<Connection, "id">): Connection | undefined {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return undefined

    // Check if connection already exists
    const exists = workflow.connections.some(
      (c) => c.sourceId === connection.sourceId && c.targetId === connection.targetId,
    )
    if (exists) return undefined

    const newConnection: Connection = {
      ...connection,
      id: crypto.randomUUID(),
    }

    workflow.connections.push(newConnection)
    workflow.updatedAt = new Date()
    return newConnection
  }

  deleteConnection(workflowId: string, connectionId: string): boolean {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return false

    const initialLength = workflow.connections.length
    workflow.connections = workflow.connections.filter((c) => c.id !== connectionId)
    workflow.updatedAt = new Date()
    return workflow.connections.length < initialLength
  }

  // Export/import methods
  exportWorkflow(id: string): string | undefined {
    const workflow = this.workflows.get(id)
    if (!workflow) return undefined

    return JSON.stringify(workflow, null, 2)
  }

  importWorkflow(jsonData: string): Workflow | undefined {
    try {
      const data = JSON.parse(jsonData)
      const newWorkflow: Workflow = {
        ...data,
        id: crypto.randomUUID(),
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.workflows.set(newWorkflow.id, newWorkflow)
      return newWorkflow
    } catch (error) {
      console.error("Failed to import workflow:", error)
      return undefined
    }
  }
}

export const workflowStore = new WorkflowStore()
