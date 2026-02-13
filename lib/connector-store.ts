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
      color: "#4285F4",
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
      color: "#0061FF",
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
      color: "#10A37F",
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
      color: "#D4A574",
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
      color: "#4A154B",
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
      color: "#000000",
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
      color: "#181717",
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
      color: "#336791",
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
      color: "#F59E0B",
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
      color: "#8B5CF6",
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

    // Update connector status
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

    // Update connector status if no more connections
    const hasOtherConnections = this.connections.some((c) => c.connectorId === connection.connectorId)
    if (!hasOtherConnections) {
      const connector = this.connectors.find((c) => c.id === connection.connectorId)
      if (connector) {
        connector.status = "disconnected"
      }
    }

    return true
  }

  testConnection(id: string): Promise<{ success: boolean; message: string }> {
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
