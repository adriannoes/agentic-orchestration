import { NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { executionStore } from "@/lib/execution-store"

export async function GET() {
  const result = await withWorkspace()
  if (result.error) return result.error

  const executions = await executionStore.getAllExecutions(result.workspace.id)
  return NextResponse.json(executions)
}
