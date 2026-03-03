import { NextResponse } from "next/server"
import { marketplaceStore } from "@/lib/marketplace-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const integration = marketplaceStore.getIntegrationById(id)

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 })
  }

  return NextResponse.json(integration)
}
