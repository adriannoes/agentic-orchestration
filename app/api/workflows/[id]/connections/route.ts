import { NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const connectionData = await request.json()
  const connection = workflowStore.addConnection(id, connectionData)

  if (!connection) {
    return NextResponse.json({ error: "Failed to add connection" }, { status: 400 })
  }

  return NextResponse.json(connection)
}
