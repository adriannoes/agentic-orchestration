import { NextResponse } from "next/server"
import { oauthManager } from "@/lib/oauth-manager"
import { connectorStore } from "@/lib/connector-store"

export async function POST(request: Request) {
  const body = await request.json()
  const { connectionId } = body

  try {
    const connections = connectorStore.getConnections()
    const connection = connections.find((c) => c.id === connectionId)

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    if (!connection.config.credentials?.refreshToken) {
      return NextResponse.json({ error: "No refresh token available" }, { status: 400 })
    }

    const tokens = await oauthManager.refreshAccessToken(
      connection.connectorId,
      connection.config.credentials.refreshToken,
    )

    // Update connection with new access token
    connectorStore.updateConnection(connectionId, {
      config: {
        ...connection.config,
        credentials: {
          ...connection.config.credentials,
          accessToken: tokens.accessToken,
        },
      },
    })

    return NextResponse.json({ success: true, accessToken: tokens.accessToken })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
