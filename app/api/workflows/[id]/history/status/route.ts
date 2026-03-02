import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { getHistoryManager } from "@/lib/history-manager"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id: workflowId } = await params
  const historyManager = getHistoryManager(workflowId)

  return NextResponse.json({
    canUndo: historyManager.canUndo(),
    canRedo: historyManager.canRedo(),
  })
}
