import { parseEnv } from "./env-schema"

export const env = parseEnv({
  NEXT_PUBLIC_ASAP_PROTOCOL_URL: process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL,
})
