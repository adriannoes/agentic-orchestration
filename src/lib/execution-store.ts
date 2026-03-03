import type { WorkflowExecution } from "./workflow-types"

class ExecutionStore {
  private executions: Map<string, WorkflowExecution> = new Map()

  addExecution(execution: WorkflowExecution) {
    this.executions.set(execution.id, execution)
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter((e) => e.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }

  updateExecution(id: string, updates: Partial<WorkflowExecution>) {
    const execution = this.executions.get(id)
    if (execution) {
      this.executions.set(id, { ...execution, ...updates })
    }
  }

  deleteExecution(id: string): boolean {
    return this.executions.delete(id)
  }
}

export const executionStore = new ExecutionStore()
