import { type NextRequest, NextResponse } from "next/server"
import { executionStore } from "@/lib/execution-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const execution = executionStore.getExecution(params.id)

  if (!execution) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 })
  }

  return NextResponse.json(execution)
}
