import { NextResponse } from "next/server"
import { marketplaceStore } from "@/lib/marketplace-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const query = searchParams.get("q")
  const featured = searchParams.get("featured")

  let integrations

  if (featured === "true") {
    integrations = marketplaceStore.getFeaturedIntegrations()
  } else if (category) {
    integrations = marketplaceStore.getIntegrationsByCategory(category)
  } else if (query) {
    integrations = marketplaceStore.searchIntegrations(query)
  } else {
    integrations = marketplaceStore.getAllIntegrations()
  }

  return NextResponse.json(integrations)
}
