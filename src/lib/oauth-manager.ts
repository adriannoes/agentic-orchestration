export interface OAuthProvider {
  id: string
  name: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  clientId?: string
  clientSecret?: string
}

export interface OAuthState {
  connectorId: string
  redirectUri: string
  state: string
  codeVerifier?: string
  timestamp: number
}

class OAuthManager {
  private providers: Map<string, OAuthProvider> = new Map([
    [
      "google-drive",
      {
        id: "google-drive",
        name: "Google Drive",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.file",
        ],
      },
    ],
    [
      "dropbox",
      {
        id: "dropbox",
        name: "Dropbox",
        authUrl: "https://www.dropbox.com/oauth2/authorize",
        tokenUrl: "https://api.dropboxapi.com/oauth2/token",
        scopes: ["files.content.read", "files.content.write"],
      },
    ],
    [
      "slack",
      {
        id: "slack",
        name: "Slack",
        authUrl: "https://slack.com/oauth/v2/authorize",
        tokenUrl: "https://slack.com/api/oauth.v2.access",
        scopes: ["chat:write", "channels:read", "users:read"],
      },
    ],
    [
      "notion",
      {
        id: "notion",
        name: "Notion",
        authUrl: "https://api.notion.com/v1/oauth/authorize",
        tokenUrl: "https://api.notion.com/v1/oauth/token",
        scopes: ["read_content", "update_content"],
      },
    ],
    [
      "github",
      {
        id: "github",
        name: "GitHub",
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        scopes: ["repo", "read:org", "read:user"],
      },
    ],
  ])

  private pendingStates: Map<string, OAuthState> = new Map()

  getProvider(connectorId: string): OAuthProvider | undefined {
    return this.providers.get(connectorId)
  }

  async generateAuthUrl(connectorId: string, redirectUri: string): Promise<string> {
    const provider = this.providers.get(connectorId)
    if (!provider) {
      throw new Error(`Provider ${connectorId} not found`)
    }

    const state = this.generateState()
    const codeVerifier = this.generateCodeVerifier()

    this.pendingStates.set(state, {
      connectorId,
      redirectUri,
      state,
      codeVerifier,
      timestamp: Date.now(),
    })

    this.cleanupOldStates()

    const params = new URLSearchParams({
      client_id: provider.clientId || `demo-client-${connectorId}`,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: provider.scopes.join(" "),
      state: state,
      access_type: "offline",
      prompt: "consent",
    })

    if (codeVerifier) {
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      params.append("code_challenge", codeChallenge)
      params.append("code_challenge_method", "S256")
    }

    return `${provider.authUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(
    code: string,
    state: string,
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    const oauthState = this.pendingStates.get(state)
    if (!oauthState) {
      throw new Error("Invalid or expired OAuth state")
    }

    const provider = this.providers.get(oauthState.connectorId)
    if (!provider) {
      throw new Error("Provider not found")
    }

    this.pendingStates.delete(state)

    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresIn: 3600,
    }
  }

  async refreshAccessToken(
    connectorId: string,
    _refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn?: number }> {
    const provider = this.providers.get(connectorId)
    if (!provider) {
      throw new Error("Provider not found")
    }

    return {
      accessToken: `mock_refreshed_token_${Date.now()}`,
      expiresIn: 3600,
    }
  }

  verifyState(state: string): OAuthState | null {
    return this.pendingStates.get(state) || null
  }

  private generateState(): string {
    return `state_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest("SHA-256", data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  private cleanupOldStates(): void {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    for (const [state, data] of this.pendingStates.entries()) {
      if (data.timestamp < tenMinutesAgo) {
        this.pendingStates.delete(state)
      }
    }
  }
}

export const oauthManager = new OAuthManager()
