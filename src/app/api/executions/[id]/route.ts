import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { executionStore } from "@/lib/execution-store"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const execution = executionStore.getExecution(id)

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 })
  }

  return NextResponse.json(execution)
}
