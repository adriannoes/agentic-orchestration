// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { AnimatedText } from "@/components/ui/animated-text"

describe("AnimatedText", () => {
  it("splits text into individual word spans", () => {
    const { container } = render(<AnimatedText text="Hello World" />)
    const spans = container.querySelectorAll("span")
    expect(spans.length).toBe(2)
    expect(spans[0]).toHaveTextContent("Hello")
    expect(spans[1]).toHaveTextContent("World")
  })

  it("renders as h1 by default", () => {
    const { container } = render(<AnimatedText text="Title" />)
    const h1 = container.querySelector("h1")
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent("Title")
  })

  it("renders as specified tag via as prop", () => {
    const { container } = render(<AnimatedText text="Subtitle" as="h2" />)
    const h2 = container.querySelector("h2")
    expect(h2).toBeInTheDocument()
    expect(h2).toHaveTextContent("Subtitle")
  })

  it("applies className to outer tag", () => {
    const { container } = render(<AnimatedText text="Styled" className="text-lg font-bold" />)
    const h1 = container.querySelector("h1")
    expect(h1).toHaveClass("text-lg")
    expect(h1).toHaveClass("font-bold")
  })

  it("filters empty words from multiple spaces", () => {
    const { container } = render(<AnimatedText text="  A   B  " />)
    const spans = container.querySelectorAll("span")
    expect(spans.length).toBe(2)
    expect(spans[0]).toHaveTextContent("A")
    expect(spans[1]).toHaveTextContent("B")
  })
})
