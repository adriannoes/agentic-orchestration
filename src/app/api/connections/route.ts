import { NextResponse } from "next/server"
import { connectorStore } from "@/lib/connector-store"

export async function GET() {
  const connections = connectorStore.getConnections()
  return NextResponse.json(connections)
}

export async function POST(request: Request) {
  const body = await request.json()
  const connection = connectorStore.addConnection(body)
  return NextResponse.json(connection, { status: 201 })
}
