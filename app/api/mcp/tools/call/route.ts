import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/mcp-client"

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const result = await mcpClient.callTool(body.toolName, body.args)
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
