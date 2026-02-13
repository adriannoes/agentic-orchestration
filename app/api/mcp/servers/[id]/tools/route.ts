import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/mcp-client"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tools = mcpClient.getToolsByServer(id)
  return NextResponse.json(tools)
}
