import type { Agent, Run, Tool } from "./types"

// In-memory store for demo purposes
// In production, this would use a database

const defaultTools: Tool[] = [
  {
    id: "web-search",
    name: "web_search",
    description: "Search the web for current information",
    inputSchema: { query: { type: "string", description: "Search query" } },
    category: "web",
  },
  {
    id: "get-weather",
    name: "get_weather",
    description: "Get current weather for a location",
    inputSchema: { location: { type: "string", description: "City name" } },
    category: "data",
  },
  {
    id: "calculate",
    name: "calculate",
    description: "Perform mathematical calculations",
    inputSchema: { expression: { type: "string", description: "Math expression" } },
    category: "utility",
  },
  {
    id: "code-interpreter",
    name: "code_interpreter",
    description: "Execute Python code and return results",
    inputSchema: { code: { type: "string", description: "Python code to execute" } },
    category: "code",
  },
  {
    id: "file-search",
    name: "file_search",
    description: "Search through uploaded files",
    inputSchema: { query: { type: "string", description: "Search query" } },
    category: "data",
  },
]

const defaultAgents: Agent[] = [
  {
    id: "research-agent",
    name: "Research Assistant",
    description: "An agent that helps with web research and data gathering",
    model: "gpt-4o",
    systemPrompt:
      "You are a helpful research assistant. Use the available tools to find and analyze information for the user.",
    tools: ["web-search", "file-search"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "code-agent",
    name: "Code Helper",
    description: "An agent for coding assistance and code execution",
    model: "gpt-4o",
    systemPrompt: "You are a coding assistant. Help users write, debug, and execute code.",
    tools: ["code-interpreter", "calculate"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

class AgentStore {
  private agents: Map<string, Agent> = new Map()
  private tools: Map<string, Tool> = new Map()
  private runs: Map<string, Run> = new Map()

  constructor() {
    defaultAgents.forEach((agent) => this.agents.set(agent.id, agent))
    defaultTools.forEach((tool) => this.tools.set(tool.id, tool))
  }

  // Agents
  getAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  createAgent(agent: Omit<Agent, "id" | "createdAt" | "updatedAt">): Agent {
    const newAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.agents.set(newAgent.id, newAgent)
    return newAgent
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
    const agent = this.agents.get(id)
    if (!agent) return undefined
    const updated = { ...agent, ...updates, updatedAt: new Date() }
    this.agents.set(id, updated)
    return updated
  }

  deleteAgent(id: string): boolean {
    return this.agents.delete(id)
  }

  // Tools
  getTools(): Tool[] {
    return Array.from(this.tools.values())
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id)
  }

  // Runs
  getRuns(): Run[] {
    return Array.from(this.runs.values()).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  }

  getRun(id: string): Run | undefined {
    return this.runs.get(id)
  }

  createRun(run: Omit<Run, "id">): Run {
    const newRun: Run = {
      ...run,
      id: crypto.randomUUID(),
    }
    this.runs.set(newRun.id, newRun)
    return newRun
  }

  updateRun(id: string, updates: Partial<Run>): Run | undefined {
    const run = this.runs.get(id)
    if (!run) return undefined
    const updated = { ...run, ...updates }
    this.runs.set(id, updated)
    return updated
  }
}

export const store = new AgentStore()
