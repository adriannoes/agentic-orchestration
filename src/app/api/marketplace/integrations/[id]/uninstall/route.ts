import { NextResponse } from "next/server"
import { marketplaceStore } from "@/lib/marketplace-store"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = marketplaceStore.uninstallIntegration(id)

  if (!success) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
