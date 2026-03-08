import { describe, it, expect } from "vitest"
import { parseEnv } from "@/lib/env-schema"

describe("parseEnv", () => {
  it("returns default URL when NEXT_PUBLIC_ASAP_PROTOCOL_URL is undefined", () => {
    const result = parseEnv({})
    expect(result.NEXT_PUBLIC_ASAP_PROTOCOL_URL).toBe("https://asap-protocol.vercel.app")
  })

  it("throws when NEXT_PUBLIC_ASAP_PROTOCOL_URL is empty string (invalid URL)", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_ASAP_PROTOCOL_URL: "" })).toThrow(
      /Invalid environment variables/,
    )
  })

  it("accepts valid URL when set", () => {
    const result = parseEnv({
      NEXT_PUBLIC_ASAP_PROTOCOL_URL: "https://custom-asap.example.com",
    })
    expect(result.NEXT_PUBLIC_ASAP_PROTOCOL_URL).toBe("https://custom-asap.example.com")
  })

  it("throws when NEXT_PUBLIC_ASAP_PROTOCOL_URL is invalid URL", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_ASAP_PROTOCOL_URL: "not-a-url" })).toThrow(
      /Invalid environment variables/,
    )
  })

  it("throws when NEXT_PUBLIC_ASAP_PROTOCOL_URL is not a string", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_ASAP_PROTOCOL_URL: 123 as unknown as string,
      }),
    ).toThrow(/Invalid environment variables/)
  })
})
