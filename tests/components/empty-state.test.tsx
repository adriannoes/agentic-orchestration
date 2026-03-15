// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EmptyState } from "@/components/ui/empty-state"
import { Bot } from "lucide-react"

describe("EmptyState", () => {
  it("renders icon, title, and description", () => {
    render(
      <EmptyState
        icon={Bot}
        title="No agents"
        description="Create your first agent to get started"
      />,
    )
    expect(screen.getByText("No agents")).toBeInTheDocument()
    expect(screen.getByText("Create your first agent to get started")).toBeInTheDocument()
  })

  it("renders title as h2 heading", () => {
    render(<EmptyState icon={Bot} title="Empty list" description="Nothing here yet" />)
    const heading = screen.getByRole("heading", { level: 2, name: "Empty list" })
    expect(heading).toBeInTheDocument()
  })

  it("renders CTA button when actionLabel and actionHref are provided", () => {
    render(
      <EmptyState
        icon={Bot}
        title="No agents"
        description="Create your first agent"
        actionLabel="Create Agent"
        actionHref="/create"
      />,
    )
    const link = screen.getByRole("link", { name: "Create Agent" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/create")
  })

  it("does not render CTA button when no action props are given", () => {
    render(<EmptyState icon={Bot} title="No agents" description="Create your first agent" />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("calls onAction when CTA button is clicked", async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        icon={Bot}
        title="No agents"
        description="Create your first agent"
        actionLabel="Create Agent"
        onAction={onAction}
      />,
    )

    const button = screen.getByRole("button", { name: "Create Agent" })
    await user.click(button)

    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
