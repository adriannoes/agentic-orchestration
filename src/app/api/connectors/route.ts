import { NextResponse } from "next/server"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  const connectors = category ? connectorStore.getConnectorsByCategory(category) : connectorStore.getConnectors()

  return NextResponse.json(connectors)
}
