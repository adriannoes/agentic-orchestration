import { NextResponse } from "next/server"
import { connectorStore } from "@/lib/connector-store"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await connectorStore.testConnection(id)
  return NextResponse.json(result)
}
