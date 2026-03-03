import type { Workflow } from "./workflow-types"

export interface HistoryState {
  workflow: Workflow
  timestamp: number
}

export class HistoryManager {
  private undoStack: HistoryState[] = []
  private redoStack: HistoryState[] = []
  private maxHistorySize = 50

  saveState(workflow: Workflow) {
    this.undoStack.push({
      workflow: JSON.parse(JSON.stringify(workflow)),
      timestamp: Date.now(),
    })

    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift()
    }

    this.redoStack = []
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  undo(currentWorkflow: Workflow): Workflow | null {
    if (!this.canUndo()) return null

    this.redoStack.push({
      workflow: JSON.parse(JSON.stringify(currentWorkflow)),
      timestamp: Date.now(),
    })

    const previousState = this.undoStack.pop()!
    return previousState.workflow
  }

  redo(currentWorkflow: Workflow): Workflow | null {
    if (!this.canRedo()) return null

    this.undoStack.push({
      workflow: JSON.parse(JSON.stringify(currentWorkflow)),
      timestamp: Date.now(),
    })

    const nextState = this.redoStack.pop()!
    return nextState.workflow
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }
}

const historyManagers = new Map<string, HistoryManager>()

export function getHistoryManager(workflowId: string): HistoryManager {
  if (!historyManagers.has(workflowId)) {
    historyManagers.set(workflowId, new HistoryManager())
  }
  return historyManagers.get(workflowId)!
}
