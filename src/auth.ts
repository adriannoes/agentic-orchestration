import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { resolveRedirectUrl } from "@/lib/auth-redirect"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
      authorization: { params: { scope: "read:user" } },
    }),
  ],
  trustHost: true,
  callbacks: {
    redirect({ url, baseUrl }) {
      return resolveRedirectUrl(url, baseUrl, process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL)
    },
    jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id
        if (profile && typeof profile === "object" && "login" in profile) {
          token.username = profile.login
        }
      }
      return token
    },
    async session({ session, token }) {
      if (typeof token.id === "string" && session.user) {
        session.user.id = token.id
      }
      if (typeof token.username === "string" && session.user) {
        ;(session.user as { username?: string }).username = token.username
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
