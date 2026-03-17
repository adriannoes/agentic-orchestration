import type { Connector, Connection } from "./connector-types"

class ConnectorStore {
  private connectors: Connector[] = [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Access and manage files in Google Drive",
      category: "storage",
      authType: "oauth2",
      status: "disconnected",
      icon: "📁",
      color: "var(--connector-google)",
      website: "https://drive.google.com",
      isOfficial: true,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Store and share files with Dropbox",
      category: "storage",
      authType: "oauth2",
      status: "disconnected",
      icon: "📦",
      color: "var(--connector-dropbox)",
      isOfficial: true,
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "Connect to OpenAI's GPT models",
      category: "ai",
      authType: "api_key",
      status: "connected",
      icon: "🤖",
      color: "var(--connector-openai)",
      isOfficial: true,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Connect to Claude models",
      category: "ai",
      authType: "api_key",
      status: "disconnected",
      icon: "🧠",
      color: "var(--connector-anthropic)",
      isOfficial: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send messages and notifications to Slack",
      category: "communication",
      authType: "oauth2",
      status: "disconnected",
      icon: "💬",
      color: "var(--connector-slack)",
      isOfficial: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Read and write to Notion databases",
      category: "productivity",
      authType: "oauth2",
      status: "disconnected",
      icon: "📝",
      color: "var(--connector-notion)",
      isOfficial: true,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Access GitHub repositories and issues",
      category: "productivity",
      authType: "oauth2",
      status: "disconnected",
      icon: "🐙",
      color: "var(--connector-github)",
      isOfficial: true,
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      description: "Connect to PostgreSQL databases",
      category: "database",
      authType: "basic",
      status: "disconnected",
      icon: "🐘",
      color: "var(--connector-postgres)",
      isOfficial: true,
    },
    {
      id: "mcp-filesystem",
      name: "MCP Filesystem",
      description: "Model Context Protocol for file operations",
      category: "mcp",
      authType: "mcp",
      status: "disconnected",
      icon: "📂",
      color: "var(--connector-mcp-filesystem)",
      isOfficial: true,
    },
    {
      id: "mcp-memory",
      name: "MCP Memory",
      description: "Model Context Protocol for knowledge graphs",
      category: "mcp",
      authType: "mcp",
      status: "disconnected",
      icon: "🧩",
      color: "var(--connector-mcp-memory)",
      isOfficial: true,
    },
  ]

  private connections: Connection[] = []

  getConnectors(): Connector[] {
    return this.connectors
  }

  getConnectorById(id: string): Connector | undefined {
    return this.connectors.find((c) => c.id === id)
  }

  getConnectorsByCategory(category: string): Connector[] {
    return this.connectors.filter((c) => c.category === category)
  }

  getConnections(): Connection[] {
    return this.connections
  }

  getConnectionsByConnector(connectorId: string): Connection[] {
    return this.connections.filter((c) => c.connectorId === connectorId)
  }

  addConnection(connection: Omit<Connection, "id" | "createdAt">): Connection {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
    }
    this.connections.push(newConnection)

    const connector = this.connectors.find((c) => c.id === connection.connectorId)
    if (connector) {
      connector.status = "connected"
    }

    return newConnection
  }

  updateConnection(id: string, updates: Partial<Connection>): Connection | null {
    const index = this.connections.findIndex((c) => c.id === id)
    if (index === -1) return null

    this.connections[index] = { ...this.connections[index], ...updates }
    return this.connections[index]
  }

  deleteConnection(id: string): boolean {
    const connection = this.connections.find((c) => c.id === id)
    if (!connection) return false

    this.connections = this.connections.filter((c) => c.id !== id)

    const hasOtherConnections = this.connections.some(
      (c) => c.connectorId === connection.connectorId,
    )
    if (!hasOtherConnections) {
      const connector = this.connectors.find((c) => c.id === connection.connectorId)
      if (connector) {
        connector.status = "disconnected"
      }
    }

    return true
  }

  testConnection(_id: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: Math.random() > 0.2,
          message: Math.random() > 0.2 ? "Connection successful" : "Failed to connect",
        })
      }, 1500)
    })
  }
}

export const connectorStore = new ConnectorStore()
