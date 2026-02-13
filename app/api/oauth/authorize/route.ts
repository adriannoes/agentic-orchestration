import { NextResponse } from "next/server"
import { oauthManager } from "@/lib/oauth-manager"

export async function POST(request: Request) {
  const body = await request.json()
  const { connectorId } = body

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/oauth/callback`
    const authUrl = oauthManager.generateAuthUrl(connectorId, redirectUri)

    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
