import { NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const nodeData = await request.json()
  const node = workflowStore.addNode(id, nodeData)

  if (!node) {
    return NextResponse.json({ error: "Failed to add node" }, { status: 400 })
  }

  return NextResponse.json(node)
}
