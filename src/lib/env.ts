import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_ASAP_PROTOCOL_URL: z
    .string()
    .url()
    .optional()
    .default("https://asap-protocol.vercel.app"),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_ASAP_PROTOCOL_URL: process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL,
})

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${parsed.error.message}. ` +
      "Ensure NEXT_PUBLIC_ASAP_PROTOCOL_URL is a valid URL when set.",
  )
}

export const env = parsed.data
