import { type NextRequest, NextResponse } from "next/server"
import { getHistoryManager } from "@/lib/history-manager"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const historyManager = getHistoryManager(workflowId)

  return NextResponse.json({
    canUndo: historyManager.canUndo(),
    canRedo: historyManager.canRedo(),
  })
}
