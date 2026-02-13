import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { getClipboardManager } from "@/lib/clipboard-manager"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const clipboardManager = getClipboardManager(workflowId)

  const nodesToPaste = clipboardManager.paste()
  if (!nodesToPaste) {
    return NextResponse.json({ error: "Nothing to paste" }, { status: 400 })
  }

  const newNodeIds: string[] = []
  for (const node of nodesToPaste) {
    const newNode = workflowStore.addNode(workflowId, node)
    if (newNode) {
      newNodeIds.push(newNode.id)
    }
  }

  return NextResponse.json({ success: true, nodeIds: newNodeIds })
}
