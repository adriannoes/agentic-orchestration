import { NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function GET() {
  const workflows = workflowStore.getWorkflows()
  return NextResponse.json(workflows)
}

export async function POST(request: Request) {
  const data = await request.json()
  const workflow = workflowStore.createWorkflow(data)
  return NextResponse.json(workflow)
}
