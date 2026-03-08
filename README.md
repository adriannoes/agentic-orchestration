# AgentKit

Platform for building, configuring, and running AI agents with tool execution, workflows, and integrations.

## What it does

- **Agents & runs** — Manage agents and view execution history
- **Workflow builder** — Visual editor for workflow orchestration (React Flow)
- **Connectors** — Central registry for data and tool connections (OAuth, APIs, MCP)
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

## Getting started

1. Install dependencies: `npm install`
2. Copy environment variables (see below) and configure a `.env` file.
3. Run development server: `npm run dev`

Required env vars for Supabase (auth and database):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the `/setup` route after starting the app to validate the connection and run migrations if needed.

## Scripts

| Script                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Development server (port 3000)                     |
| `npm run build`          | Production build                                   |
| `npm run start`          | Production server                                  |
| `npm run lint`           | ESLint                                             |
| `npm run test`           | Unit tests (Vitest, watch)                         |
| `npm run test:run`       | Unit tests (single run)                            |
| `npm run test:e2e`       | E2E tests (Playwright, starts dev on port 3099)    |
| `npm run test:e2e:ui`    | E2E tests with Playwright UI                       |
| `npm run test:e2e:reuse` | E2E tests reusing existing dev server on port 3000 |

**E2E notes:** Stop any running `npm run dev` before `npm run test:e2e`, or use `npm run test:e2e:reuse` when dev is already running.
