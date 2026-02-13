import { streamText, tool, convertToModelMessages, type UIMessage, stepCountIs } from "ai"
import { z } from "zod/v4"
import { store } from "@/lib/store"

export const maxDuration = 60

// Define available tools
const availableTools = {
  "web-search": tool({
    description: "Search the web for current information",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
    }),
    async execute({ query }) {
      // Simulated web search
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        results: [
          { title: `Result for "${query}"`, snippet: "This is a simulated search result.", url: "https://example.com" },
          { title: `More about ${query}`, snippet: "Additional information found.", url: "https://example.org" },
        ],
      }
    },
  }),
  "get-weather": tool({
    description: "Get current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("The city name"),
    }),
    async execute({ location }) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"]
      return {
        location,
        temperature: Math.floor(Math.random() * 30) + 50,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 50) + 30,
      }
    },
  }),
  calculate: tool({
    description: "Perform mathematical calculations",
    inputSchema: z.object({
      expression: z.string().describe("The math expression to evaluate"),
    }),
    async execute({ expression }) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      try {
        // Safe eval for basic math
        const result = Function('"use strict"; return (' + expression + ")")()
        return { expression, result }
      } catch {
        return { expression, error: "Could not evaluate expression" }
      }
    },
  }),
  "code-interpreter": tool({
    description: "Execute Python code and return results",
    inputSchema: z.object({
      code: z.string().describe("The Python code to execute"),
    }),
    async execute({ code }) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Simulated code execution
      return {
        code,
        output: `Executed code successfully.\nSimulated output for: ${code.slice(0, 50)}...`,
        executionTime: "0.05s",
      }
    },
  }),
  "file-search": tool({
    description: "Search through uploaded files",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
    }),
    async execute({ query }) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      return {
        query,
        matches: [
          { filename: "document.pdf", excerpt: `Found "${query}" in paragraph 3...`, page: 3 },
          { filename: "notes.txt", excerpt: `Reference to ${query} found...`, line: 42 },
        ],
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages, agentId }: { messages: UIMessage[]; agentId: string } = await req.json()

  const agent = store.getAgent(agentId)
  if (!agent) {
    return new Response("Agent not found", { status: 404 })
  }

  // Filter tools based on agent configuration
  const agentTools: Record<string, (typeof availableTools)[keyof typeof availableTools]> = {}
  agent.tools.forEach((toolId) => {
    const toolKey = toolId as keyof typeof availableTools
    if (availableTools[toolKey]) {
      agentTools[toolId] = availableTools[toolKey]
    }
  })

  // Determine model provider prefix
  let modelString = agent.model
  if (agent.model.startsWith("gpt")) {
    modelString = `openai/${agent.model}`
  } else if (agent.model.startsWith("claude")) {
    modelString = `anthropic/${agent.model}`
  }

  const result = streamText({
    model: modelString,
    system: agent.systemPrompt,
    messages: convertToModelMessages(messages),
    tools: agentTools,
    stopWhen: stepCountIs(10),
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
