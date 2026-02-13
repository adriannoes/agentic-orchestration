import { NextResponse } from "next/server"
import { executionStore } from "@/lib/execution-store"

export async function GET() {
  const executions = executionStore.getAllExecutions()
  return NextResponse.json(executions)
}
