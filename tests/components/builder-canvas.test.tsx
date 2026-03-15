// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import useSWR from "swr"
import type { Workflow } from "@/lib/workflow-types"

const { mockWorkflow, mockWorkflows, baseSWR } = vi.hoisted(() => {
  const wf: Workflow = {
    id: "wf-1",
    name: "Test Workflow",
    description: "",
    nodes: [],
    connections: [],
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const base = () => ({
    data: null,
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  })
  return { mockWorkflow: wf, mockWorkflows: [wf], baseSWR: base }
})

vi.mock("swr", () => ({
  default: vi.fn((key: string | null) => {
    if (key === "/api/workflows") {
      return { ...baseSWR(), data: mockWorkflows }
    }
    if (key?.startsWith("/api/workflows/") && !key.includes("/history/")) {
      return { ...baseSWR(), data: mockWorkflow, isLoading: true }
    }
    if (key?.includes("/history/status")) {
      return { ...baseSWR(), data: { canUndo: false, canRedo: false } }
    }
    return baseSWR()
  }),
  mutate: vi.fn(),
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockScreenToFlowPosition = vi.fn(({ x, y }: { x: number; y: number }) => ({ x, y }))
const mockGetViewport = vi.fn(() => ({ x: 0, y: 0, zoom: 1 }))

vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react")
  return {
    ...actual,
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReactFlow: () => ({
      screenToFlowPosition: mockScreenToFlowPosition,
      getViewport: mockGetViewport,
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      fitView: vi.fn(),
    }),
    useNodesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
    useEdgesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
    ReactFlow: () => <div data-testid="react-flow-mock" />,
    Background: () => null,
  }
})

const defaultSWRImpl = (key: string | null, workflowData: Workflow | null) => {
  if (key === "/api/workflows") {
    return { ...baseSWR(), data: mockWorkflows }
  }
  if (key?.startsWith("/api/workflows/") && !key.includes("/history/")) {
    return { ...baseSWR(), data: workflowData, isLoading: true }
  }
  if (key?.includes("/history/status")) {
    return { ...baseSWR(), data: { canUndo: false, canRedo: false } }
  }
  return baseSWR()
}

describe("BuilderCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSWR).mockImplementation((key) =>
      defaultSWRImpl(key as string | null, mockWorkflow),
    )
  })

  it("does NOT show loading screen when workflow data exists but isLoading is true (revalidation)", async () => {
    render(<BuilderCanvas />)

    await waitFor(() => {
      expect(screen.queryByText("Loading workflow...")).not.toBeInTheDocument()
    })

    expect(screen.getByTestId("builder-toolbar")).toBeInTheDocument()
    expect(screen.getByTestId("builder-canvas")).toBeInTheDocument()
  })

  it("shows loading screen when workflow data is absent and isLoading is true", async () => {
    vi.mocked(useSWR).mockImplementation((key) => defaultSWRImpl(key as string | null, null))

    render(<BuilderCanvas />)

    await waitFor(() => {
      expect(screen.getByText("Loading workflow...")).toBeInTheDocument()
    })
  })
})
