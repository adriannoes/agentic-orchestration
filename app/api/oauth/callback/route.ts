import { NextResponse } from "next/server"
import { oauthManager } from "@/lib/oauth-manager"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/connectors?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/connectors?error=missing_parameters", request.url))
  }

  try {
    // Verify state and exchange code for token
    const oauthState = oauthManager.verifyState(state)
    if (!oauthState) {
      throw new Error("Invalid OAuth state")
    }

    const tokens = await oauthManager.exchangeCodeForToken(code, state)

    // Create connection with tokens
    const connection = connectorStore.addConnection({
      connectorId: oauthState.connectorId,
      name: `${oauthState.connectorId} Connection`,
      status: "connected",
      config: {
        authType: "oauth2",
        credentials: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    })

    console.log(`[v0] OAuth connection created:`, connection.id)

    // Redirect back to connectors page with success
    return NextResponse.redirect(new URL("/connectors?success=connected", request.url))
  } catch (error) {
    console.error("[v0] OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(`/connectors?error=${encodeURIComponent((error as Error).message)}`, request.url),
    )
  }
}
