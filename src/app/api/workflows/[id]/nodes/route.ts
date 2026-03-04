import { NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { addWorkflowNode } from "@/lib/db/workflows"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id } = await params
  const nodeData = await request.json()

  try {
    const workflow = await addWorkflowNode(id, nodeData)
    const newNode = workflow.nodes[workflow.nodes.length - 1]
    return NextResponse.json(newNode)
  } catch (_err) {
    return NextResponse.json({ error: "Failed to add node" }, { status: 400 })
  }
}
