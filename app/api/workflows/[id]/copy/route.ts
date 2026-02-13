import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { getClipboardManager } from "@/lib/clipboard-manager"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const { nodeIds } = await request.json()

  const workflow = workflowStore.getWorkflow(workflowId)
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const nodesToCopy = workflow.nodes.filter((n) => nodeIds.includes(n.id))
  const clipboardManager = getClipboardManager(workflowId)
  clipboardManager.copy(nodesToCopy)

  return NextResponse.json({ success: true, count: nodesToCopy.length })
}
