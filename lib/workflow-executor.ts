import type { Workflow, WorkflowNode, WorkflowExecution, ExecutionLog, NodeExecutionResult } from "./workflow-types"
import { generateText } from "ai"

export class WorkflowExecutor {
  private execution: WorkflowExecution
  private workflow: Workflow
  private onUpdate?: (execution: WorkflowExecution) => void

  constructor(workflow: Workflow, input: string, onUpdate?: (execution: WorkflowExecution) => void) {
    this.workflow = workflow
    this.onUpdate = onUpdate
    this.execution = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      status: "running",
      startedAt: new Date(),
      context: {
        input,
        variables: {},
        messages: [{ role: "user", content: input }],
      },
      logs: [],
    }
  }

  async execute(): Promise<WorkflowExecution> {
    try {
      // Find start node
      const startNode = this.workflow.nodes.find((n) => n.type === "start")
      if (!startNode) {
        throw new Error("No start node found in workflow")
      }

      this.addLog("start", "info", "Workflow execution started")

      // Execute workflow
      let currentNode = this.getNextNode(startNode.id)

      while (currentNode && currentNode.type !== "end") {
        this.execution.currentNodeId = currentNode.id
        this.notifyUpdate()

        const result = await this.executeNode(currentNode)

        if (!result.success) {
          this.execution.status = "failed"
          this.addLog(currentNode.id, "error", result.error || "Node execution failed")
          this.notifyUpdate()
          return this.execution
        }

        // Add logs from node execution
        result.logs.forEach((log) => this.execution.logs.push(log))

        // Update context with node output
        if (result.output) {
          this.execution.context.variables[currentNode.id] = result.output
        }

        // Determine next node
        if (result.nextNodeId) {
          currentNode = this.workflow.nodes.find((n) => n.id === result.nextNodeId)
        } else {
          currentNode = this.getNextNode(currentNode.id)
        }

        this.notifyUpdate()
      }

      // Reached end node
      this.execution.status = "completed"
      this.execution.completedAt = new Date()
      this.addLog("end", "success", "Workflow execution completed")
      this.notifyUpdate()

      return this.execution
    } catch (error) {
      this.execution.status = "failed"
      this.execution.completedAt = new Date()
      this.addLog("system", "error", error instanceof Error ? error.message : "Unknown error")
      this.notifyUpdate()
      return this.execution
    }
  }

  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    const startTime = Date.now()
    const logs: ExecutionLog[] = []

    try {
      switch (node.type) {
        case "agent":
          return await this.executeAgentNode(node, logs, startTime)
        case "guardrail":
          return await this.executeGuardrailNode(node, logs, startTime)
        case "condition":
          return await this.executeConditionNode(node, logs, startTime)
        case "user-approval":
          return await this.executeUserApprovalNode(node, logs, startTime)
        case "mcp":
          return await this.executeMCPNode(node, logs, startTime)
        case "file-search":
          return await this.executeFileSearchNode(node, logs, startTime)
        default:
          logs.push({
            id: crypto.randomUUID(),
            nodeId: node.id,
            timestamp: new Date(),
            type: "info",
            message: `Skipping node type: ${node.type}`,
          })
          return { success: true, logs }
      }
    } catch (error) {
      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        timestamp: new Date(),
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      })
      return { success: false, error: error instanceof Error ? error.message : "Unknown error", logs }
    }
  }

  private async executeAgentNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: `Executing agent: ${node.data.label}`,
    })

    const model = node.data.model || "openai/gpt-4o"
    const systemPrompt = node.data.systemPrompt || "You are a helpful assistant."

    try {
      const { text } = await generateText({
        model,
        system: systemPrompt,
        messages: this.execution.context.messages,
      })

      // Add assistant message to context
      this.execution.context.messages.push({
        role: "assistant",
        content: text,
      })

      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        timestamp: new Date(),
        type: "success",
        message: "Agent response generated",
        data: { response: text },
        duration: Date.now() - startTime,
      })

      return { success: true, output: text, logs }
    } catch (error) {
      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        timestamp: new Date(),
        type: "error",
        message: error instanceof Error ? error.message : "Agent execution failed",
        duration: Date.now() - startTime,
      })
      return { success: false, error: error instanceof Error ? error.message : "Agent execution failed", logs }
    }
  }

  private async executeGuardrailNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: `Checking guardrail: ${node.data.guardrailType}`,
    })

    // Simulate guardrail check
    const passed = true // In real implementation, check based on guardrailType

    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: passed ? "success" : "error",
      message: passed ? "Guardrail check passed" : "Guardrail check failed",
      duration: Date.now() - startTime,
    })

    return { success: passed, logs }
  }

  private async executeConditionNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: `Evaluating condition: ${node.data.condition}`,
    })

    // Simple condition evaluation (in real implementation, use a proper expression evaluator)
    const condition = node.data.condition || "true"
    let result = false

    try {
      // Very basic evaluation - in production use a proper expression parser
      result = condition.toLowerCase() === "true"
    } catch (error) {
      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        timestamp: new Date(),
        type: "error",
        message: "Failed to evaluate condition",
        duration: Date.now() - startTime,
      })
      return { success: false, error: "Condition evaluation failed", logs }
    }

    // Find the appropriate next node based on result
    const connections = this.workflow.connections.filter((c) => c.sourceId === node.id)
    const nextConnection =
      connections.find((c) => (result ? c.label === "true" : c.label === "false")) || connections[0]

    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "success",
      message: `Condition evaluated to: ${result}`,
      data: { result },
      duration: Date.now() - startTime,
    })

    return { success: true, logs, nextNodeId: nextConnection?.targetId }
  }

  private async executeUserApprovalNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: "Pausing for user approval",
    })

    // In real implementation, this would pause and wait for user input
    this.execution.status = "paused"
    this.notifyUpdate()

    // For now, auto-approve after simulation
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "success",
      message: "User approval received (simulated)",
      duration: Date.now() - startTime,
    })

    this.execution.status = "running"
    return { success: true, logs }
  }

  private async executeMCPNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: `Calling MCP server: ${node.data.mcpServer}`,
    })

    // Simulate MCP call
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "success",
      message: "MCP server call completed (simulated)",
      duration: Date.now() - startTime,
    })

    return { success: true, logs }
  }

  private async executeFileSearchNode(
    node: WorkflowNode,
    logs: ExecutionLog[],
    startTime: number,
  ): Promise<NodeExecutionResult> {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "info",
      message: "Searching files",
    })

    // Simulate file search
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      timestamp: new Date(),
      type: "success",
      message: "File search completed (simulated)",
      data: { filesFound: 5 },
      duration: Date.now() - startTime,
    })

    return { success: true, logs }
  }

  private getNextNode(currentNodeId: string): WorkflowNode | undefined {
    const connection = this.workflow.connections.find((c) => c.sourceId === currentNodeId)
    if (!connection) return undefined
    return this.workflow.nodes.find((n) => n.id === connection.targetId)
  }

  private addLog(nodeId: string, type: ExecutionLog["type"], message: string, data?: unknown) {
    this.execution.logs.push({
      id: crypto.randomUUID(),
      nodeId,
      timestamp: new Date(),
      type,
      message,
      data,
    })
  }

  private notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate({ ...this.execution })
    }
  }

  getExecution(): WorkflowExecution {
    return this.execution
  }
}
