import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { executionStore } from "@/lib/execution-store"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const executions = executionStore.getAllExecutions()
  return NextResponse.json(executions)
}
