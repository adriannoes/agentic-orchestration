"use client"

import { SessionProvider } from "next-auth/react"

const MOCK_SESSION = {
  user: {
    id: "mock-user-id",
    name: "Dev User",
    email: "dev@example.com",
    username: "devuser",
    image: null,
  },
  expires: new Date(Date.now() + 3600 * 1000).toISOString(),
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = process.env.NODE_ENV === "development" ? MOCK_SESSION : undefined

  return <SessionProvider session={session}>{children}</SessionProvider>
}
