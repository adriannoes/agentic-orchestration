import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/mcp-client"

export async function GET() {
  const servers = mcpClient.getServers()
  return NextResponse.json(servers)
}

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const server = await mcpClient.connectServer({
      name: body.name,
      url: body.url,
      protocol: body.protocol || "http",
      environment: body.environment,
    })

    return NextResponse.json(server, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
