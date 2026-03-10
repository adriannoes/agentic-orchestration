# AI Agent Builder for ASAP Protocol

Platform for building, configuring, and running AI agents with tool execution, workflows, and integrations.

## What it does

- **Agents & runs** — Manage agents and view execution history
- **Workflow builder** — Visual editor for workflow orchestration (React Flow)
- **Connectors** — Central registry for data and tool connections (OAuth, APIs, MCP)
- **Cross-platform integration** — Navigation and auth hand-off with ASAP Protocol
- **MCP** — Model Context Protocol server and tool management
- **Marketplace** — Discover and install integrations
- **Templates** — Reusable workflow and agent templates

## Tech stack

- **Runtime:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend / auth:** Supabase (PostgreSQL, Auth, Realtime)
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/react`)
- **UI:** Radix UI, shadcn-style components, Lucide icons
- **Forms / validation:** React Hook Form, Zod
- **Data:** SWR, Recharts
- **Workflow canvas:** React Flow (`@xyflow/react`)

### Cross-platform integration with ASAP Protocol

This app is integrated with ASAP Protocol to provide a unified marketplace and navigation experience.

Use the `/setup` route after starting the app to validate the connection and run migrations if needed.
