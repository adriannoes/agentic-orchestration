# Production Audit Report: Open Agentic Flow

**Date:** March 19, 2026
**Target Environment:** Production (`https://open-agentic-flow.vercel.app/?from=asap`)

## Executive Summary
A comprehensive codebase and production audit was conducted on Open Agentic Flow. While the platform boasts excellent visual design, its core orchestration capabilities are severely blocked by a fundamental architectural flaw regarding **Serverless State Management**.

The primary bug preventing agents from being created or edited is that the system actively swallows Supabase connection failures and maliciously falls back to **In-Memory Maps** (RAM). In a Serverless environment like Vercel, this memory is volatile and erased constantly, leading to cascading 404/400 API errors and "Ghost Data."

---

## 1. Architectural Deep Dive: The Serverless Amnesia Bug

An investigation into the repository internals (`src/lib/db/workflows.ts` and `src/lib/execution-store.ts`) revealed the exact systemic failure across the application:

### 1.1 The In-Memory Fallback Anti-Pattern
* **Supabase Client Failure:** The function `getSupabaseServerClient()` attempts to read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If these are missing or incorrectly loaded in the Vercel production environment, it returns `null`.
* **The Volatile Fallback:** Instead of throwing a 500 error when Supabase is unreachable, `createWorkflow` and `updateWorkflow` fall back to saving the agent in a Node.js `Map` (`globalForWorkflows.memoryWorkflows`).
* **The Serverless Wipe:** Vercel utilizes stateless AWS Lambdas. The `Map` only exists during the lifespan of a single HTTP request. As soon as a user creates a new agent, it is saved to ephemeral RAM and immediately destroyed when the function goes to sleep.

### 1.2 "Ghost Agents" and Builder 400 Errors
1. **Creation:** The user creates an agent. The UI optimistically displays it. In the backend, it was saved to the ephemeral `Map` and instantly lost.
2. **Navigation:** The frontend immediately routes the user to `/builder?id=[ghost-id]`.
3. **Canvas Interaction:** When the user adds a node to the canvas, it POSTs to `/api/workflows/[ghost-id]/nodes`.
4. **Crash:** A new Serverless Lambda spins up to handle this request. It checks its clean, empty `Map` for the `ghost-id`, cannot find it, and throws `"Workflow not found"`. The API blindly maps this error to a `400 Bad Request`.

### 1.3 Execution Engine (`/api/workflows/[id]/execute`)
* **Runs are completely volatile:** The `executionStore` imported by the execution route is implemented *exclusively* as `private executions: Map<string, WorkflowExecution> = new Map()`. 
* **Impact:** There is currently no database persistence whatsoever for workflow execution histories. "Runs" will never reliably appear on the `/runs` page after a page refresh in production.

---

## 2. General UX Friction & Interface Issues

Even after the architectural persistence is solved, the following UX friction points must be addressed before launch:

### 2.1 Missing Error Feedback (Silent Failures)
* **Friction:** When node additions or LLM executions fail via the API, the UI provides zero user feedback (no toast notifications). The interface just ignores the input, creating a highly confusing experience.

### 2.2 Visibility of Critical Actions
* **Friction:** Primary agent actions (like "Edit" or "Delete") are only visible on **hover**.
* **Risk:** This breaks the interaction paradigm completely for mobile/tablet devices, hiding basic CRUD capabilities.

### 2.3 Context Isolation in Modals
* **Friction:** When the "Run Details" modal is active, interactions with the sidebar are inconsistently blocked. Users must aggressively click outside or manually close the modal to regain standard navigation.

### 2.4 Chat Logs Readability
* **Friction:** Execution logs prominently display raw, unformatted JSON.
* **Recommendation:** Wrap raw outputs in a syntax-highlighted code block with a "Copy to Clipboard" button and collapsible tree capabilities.

---

## 3. Immediate Remediation Plan

1. **Fix Production Environment Variables (P0):**
   * Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are perfectly aligned in Vercel's environment variables dashboard. 
2. **Remove the In-Memory Maps (P0):**
   * Refactor `src/lib/db/workflows.ts` to strictly throw an error (`500 Internal Server Error`) if the database connection fails, instead of falling back to memory. The UI must explicitly inform the user that the database is unreachable rather than pretending the creation succeeded.
3. **Persist the Execution Store (P1):**
   * Rewrite `src/lib/execution-store.ts` to insert and query rows from a dedicated Supabase `executions` table. Do not use local Node.js variables to track state in Next.js.
4. **Implement Global Toast Notifications (P1):**
   * Implement a toast library (e.g., `sonner`) and wrap all destructive actions or React Flow canvas updates in `try/catch` handlers that push visible alerts to the user upon API 400/500 errors.
