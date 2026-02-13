import type { WorkflowNode, Connection } from "./workflow-types"

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "customer-support" | "data-analysis" | "content-creation" | "automation" | "research"
  thumbnail?: string
  nodes: Omit<WorkflowNode, "id">[]
  connections: Omit<Connection, "id">[]
  tags: string[]
  usageCount: number
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "customer-support-routing",
    name: "Customer Support Routing",
    description: "Intelligent routing system that classifies customer inquiries and routes them to specialized agents",
    category: "customer-support",
    tags: ["support", "classification", "routing", "multi-agent"],
    usageCount: 245,
    nodes: [
      {
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Customer Inquiry" },
      },
      {
        type: "agent",
        position: { x: 350, y: 150 },
        data: {
          label: "Classifier Agent",
          description: "Classifies inquiry type",
          model: "openai/gpt-4o",
          systemPrompt:
            "You are a customer inquiry classifier. Analyze the customer message and classify it as: technical, billing, or general. Respond with only one word.",
        },
      },
      {
        type: "condition",
        position: { x: 600, y: 200 },
        data: {
          label: "Route by Type",
          condition: "classification === 'technical'",
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 100 },
        data: {
          label: "Technical Support Agent",
          model: "openai/gpt-4o",
          systemPrompt: "You are a technical support specialist. Help customers resolve technical issues.",
          tools: ["web-search"],
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 250 },
        data: {
          label: "Billing Support Agent",
          model: "openai/gpt-4o",
          systemPrompt: "You are a billing support specialist. Help customers with payment and billing questions.",
        },
      },
      {
        type: "end",
        position: { x: 1100, y: 200 },
        data: { label: "Response Sent" },
      },
    ],
    connections: [
      { sourceId: "node-0", targetId: "node-1" },
      { sourceId: "node-1", targetId: "node-2" },
      { sourceId: "node-2", targetId: "node-3", label: "technical" },
      { sourceId: "node-2", targetId: "node-4", label: "billing" },
      { sourceId: "node-3", targetId: "node-5" },
      { sourceId: "node-4", targetId: "node-5" },
    ],
  },
  {
    id: "content-moderation",
    name: "Content Moderation Pipeline",
    description: "Multi-stage content moderation with guardrails and human approval for edge cases",
    category: "automation",
    tags: ["moderation", "guardrails", "approval", "safety"],
    usageCount: 189,
    nodes: [
      {
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Content Submitted" },
      },
      {
        type: "guardrail",
        position: { x: 350, y: 200 },
        data: {
          label: "PII Detection",
          guardrailType: "pii",
        },
      },
      {
        type: "guardrail",
        position: { x: 600, y: 200 },
        data: {
          label: "Jailbreak Detection",
          guardrailType: "jailbreak",
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 200 },
        data: {
          label: "Content Analyzer",
          model: "openai/gpt-4o",
          systemPrompt:
            "Analyze content for policy violations. Rate as: safe, review-needed, or unsafe. Provide reasoning.",
        },
      },
      {
        type: "condition",
        position: { x: 1100, y: 200 },
        data: {
          label: "Check Safety",
          condition: "rating === 'safe'",
        },
      },
      {
        type: "user-approval",
        position: { x: 1350, y: 120 },
        data: {
          label: "Human Review",
          description: "Requires manual approval",
        },
      },
      {
        type: "end",
        position: { x: 1600, y: 200 },
        data: { label: "Decision Made" },
      },
    ],
    connections: [
      { sourceId: "node-0", targetId: "node-1" },
      { sourceId: "node-1", targetId: "node-2" },
      { sourceId: "node-2", targetId: "node-3" },
      { sourceId: "node-3", targetId: "node-4" },
      { sourceId: "node-4", targetId: "node-6", label: "safe" },
      { sourceId: "node-4", targetId: "node-5", label: "review" },
      { sourceId: "node-5", targetId: "node-6" },
    ],
  },
  {
    id: "research-assistant",
    name: "Research & Analysis Assistant",
    description: "Comprehensive research workflow with web search, file analysis, and report generation",
    category: "research",
    tags: ["research", "analysis", "web-search", "file-search"],
    usageCount: 312,
    nodes: [
      {
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Research Query" },
      },
      {
        type: "agent",
        position: { x: 350, y: 150 },
        data: {
          label: "Research Planner",
          model: "openai/gpt-4o",
          systemPrompt: "Create a research plan with specific search queries and analysis steps.",
        },
      },
      {
        type: "agent",
        position: { x: 600, y: 100 },
        data: {
          label: "Web Researcher",
          model: "openai/gpt-4o",
          systemPrompt: "Search the web and summarize findings.",
          tools: ["web-search"],
        },
      },
      {
        type: "file-search",
        position: { x: 600, y: 250 },
        data: {
          label: "Document Search",
          fileTypes: ["pdf", "docx"],
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 175 },
        data: {
          label: "Report Generator",
          model: "openai/gpt-4o",
          systemPrompt: "Synthesize research findings into a comprehensive report.",
        },
      },
      {
        type: "end",
        position: { x: 1100, y: 200 },
        data: { label: "Report Complete" },
      },
    ],
    connections: [
      { sourceId: "node-0", targetId: "node-1" },
      { sourceId: "node-1", targetId: "node-2" },
      { sourceId: "node-1", targetId: "node-3" },
      { sourceId: "node-2", targetId: "node-4" },
      { sourceId: "node-3", targetId: "node-4" },
      { sourceId: "node-4", targetId: "node-5" },
    ],
  },
  {
    id: "data-analysis-pipeline",
    name: "Data Analysis Pipeline",
    description: "Automated data processing with MCP integration for database queries and visualization",
    category: "data-analysis",
    tags: ["data", "analysis", "mcp", "automation"],
    usageCount: 156,
    nodes: [
      {
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Analysis Request" },
      },
      {
        type: "mcp",
        position: { x: 350, y: 200 },
        data: {
          label: "Fetch Data",
          mcpServer: "database-server",
        },
      },
      {
        type: "agent",
        position: { x: 600, y: 200 },
        data: {
          label: "Data Analyzer",
          model: "openai/gpt-4o",
          systemPrompt: "Analyze data patterns, trends, and anomalies. Provide insights.",
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 200 },
        data: {
          label: "Visualization Agent",
          model: "openai/gpt-4o",
          systemPrompt: "Generate visualization recommendations and create chart specifications.",
        },
      },
      {
        type: "end",
        position: { x: 1100, y: 200 },
        data: { label: "Analysis Complete" },
      },
    ],
    connections: [
      { sourceId: "node-0", targetId: "node-1" },
      { sourceId: "node-1", targetId: "node-2" },
      { sourceId: "node-2", targetId: "node-3" },
      { sourceId: "node-3", targetId: "node-4" },
    ],
  },
  {
    id: "content-creation-workflow",
    name: "Content Creation Workflow",
    description: "Multi-agent content creation with research, writing, editing, and approval stages",
    category: "content-creation",
    tags: ["content", "writing", "editing", "approval"],
    usageCount: 423,
    nodes: [
      {
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Content Brief" },
      },
      {
        type: "agent",
        position: { x: 350, y: 200 },
        data: {
          label: "Research Agent",
          model: "openai/gpt-4o",
          systemPrompt: "Research the topic and gather relevant information and sources.",
          tools: ["web-search"],
        },
      },
      {
        type: "agent",
        position: { x: 600, y: 200 },
        data: {
          label: "Writer Agent",
          model: "openai/gpt-4o",
          systemPrompt: "Write engaging, well-structured content based on research and brief.",
        },
      },
      {
        type: "agent",
        position: { x: 850, y: 200 },
        data: {
          label: "Editor Agent",
          model: "openai/gpt-4o",
          systemPrompt: "Review and improve content for clarity, grammar, and style.",
        },
      },
      {
        type: "user-approval",
        position: { x: 1100, y: 200 },
        data: {
          label: "Final Approval",
        },
      },
      {
        type: "end",
        position: { x: 1350, y: 200 },
        data: { label: "Content Published" },
      },
    ],
    connections: [
      { sourceId: "node-0", targetId: "node-1" },
      { sourceId: "node-1", targetId: "node-2" },
      { sourceId: "node-2", targetId: "node-3" },
      { sourceId: "node-3", targetId: "node-4" },
      { sourceId: "node-4", targetId: "node-5" },
    ],
  },
]

export function getTemplatesByCategory(category: WorkflowTemplate["category"]): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.category === category)
}

export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase()
  return workflowTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export function getPopularTemplates(limit = 5): WorkflowTemplate[] {
  return [...workflowTemplates].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit)
}
