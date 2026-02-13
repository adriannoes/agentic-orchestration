import { NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params
  const updates = await request.json()
  const node = workflowStore.updateNode(id, nodeId, updates)

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 })
  }

  return NextResponse.json(node)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const { id, nodeId } = await params
  const deleted = workflowStore.deleteNode(id, nodeId)

  if (!deleted) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
