import { describe, it, expect } from "vitest"
import { z } from "zod"

const webSearchSchema = z.object({
  query: z.string().describe("The search query"),
})

const getWeatherSchema = z.object({
  location: z.string().describe("The city name"),
})

const calculateSchema = z.object({
  expression: z.string().describe("The math expression to evaluate"),
})

const codeInterpreterSchema = z.object({
  code: z.string().describe("The code to execute"),
})

const fileSearchSchema = z.object({
  query: z.string().describe("The search query"),
})

describe("Playground tool schemas (Zod 4)", () => {
  it("web-search: accepts valid input", () => {
    expect(webSearchSchema.parse({ query: "test" })).toEqual({ query: "test" })
  })

  it("web-search: rejects missing query", () => {
    expect(() => webSearchSchema.parse({})).toThrow()
  })

  it("get-weather: accepts valid input", () => {
    expect(getWeatherSchema.parse({ location: "London" })).toEqual({ location: "London" })
  })

  it("get-weather: rejects missing location", () => {
    expect(() => getWeatherSchema.parse({})).toThrow()
  })

  it("calculate: accepts valid input", () => {
    expect(calculateSchema.parse({ expression: "1+1" })).toEqual({ expression: "1+1" })
  })

  it("code-interpreter: accepts valid input", () => {
    expect(codeInterpreterSchema.parse({ code: "print(1)" })).toEqual({ code: "print(1)" })
  })

  it("file-search: accepts valid input", () => {
    expect(fileSearchSchema.parse({ query: "foo" })).toEqual({ query: "foo" })
  })
})
