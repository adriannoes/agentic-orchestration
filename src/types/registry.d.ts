export interface RegistryAgent {
  id: string
  name: string
  version: string
  description: string
  capabilities?: {
    skills?: Array<{
      id: string
      description: string
    }>
  }
  endpoints?: {
    asap?: string
    ws?: string
  }
  auth?: {
    schemes?: string[]
    oauth2?: {
      authorization_url?: string
      token_url?: string
      scopes?: string[]
    }
  }
  sla?: {
    max_response_time_seconds?: number
  }
  repository_url?: string | null
  documentation_url?: string | null
  built_with?: string | null
  category?: string | null
  tags?: string[]
}

export interface RevokedAgent {
  id: string
  revoked_at: string
  reason: string
}

export interface RegistryResponse {
  agents: RegistryAgent[]
}

export interface RevokedResponse {
  revoked_agents: RevokedAgent[]
}

export interface FetchRegistryResult {
  agents: RegistryAgent[]
  error?: string
}
