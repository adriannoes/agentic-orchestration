import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectorStore } from "@/lib/connector-store"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const connections = connectorStore.getConnections()
  return NextResponse.json(connections)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const connection = connectorStore.addConnection(body)
  return NextResponse.json(connection, { status: 201 })
}
