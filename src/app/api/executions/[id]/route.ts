import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { executionStore } from "@/lib/execution-store"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id } = await params
  const execution = await executionStore.getExecution(id)

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 })
  }

  return NextResponse.json(execution)
}
