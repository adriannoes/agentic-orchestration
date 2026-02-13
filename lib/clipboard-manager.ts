import type { WorkflowNode } from "./workflow-types"

interface ClipboardData {
  nodes: WorkflowNode[]
  timestamp: number
}

class ClipboardManager {
  private clipboard: ClipboardData | null = null

  copy(nodes: WorkflowNode[]) {
    this.clipboard = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      timestamp: Date.now(),
    }
  }

  paste(): WorkflowNode[] | null {
    if (!this.clipboard) return null

    const offsetX = 50
    const offsetY = 50

    return this.clipboard.nodes.map((node) => ({
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY,
      },
    }))
  }

  hasClipboard(): boolean {
    return this.clipboard !== null
  }

  clear() {
    this.clipboard = null
  }
}

const clipboardManagers = new Map<string, ClipboardManager>()

export function getClipboardManager(workflowId: string): ClipboardManager {
  if (!clipboardManagers.has(workflowId)) {
    clipboardManagers.set(workflowId, new ClipboardManager())
  }
  return clipboardManagers.get(workflowId)!
}
