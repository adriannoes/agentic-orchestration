import { NextResponse } from "next/server"
import { oauthManager } from "@/lib/oauth-manager"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL(`/connectors?error=${encodeURIComponent(error)}`, request.url),
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/connectors?error=missing_parameters", request.url))
  }

  try {
    const oauthState = oauthManager.verifyState(state)
    if (!oauthState) {
      throw new Error("Invalid OAuth state")
    }

    const tokens = await oauthManager.exchangeCodeForToken(code, state)

    const _connection = connectorStore.addConnection({
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

    return NextResponse.redirect(new URL("/connectors?success=connected", request.url))
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/connectors?error=${encodeURIComponent((error as Error).message)}`, request.url),
    )
  }
}
