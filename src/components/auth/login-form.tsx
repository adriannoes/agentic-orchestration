"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { authMountTransition, ghostAuthClassName, ghostCardClassName } from "@/lib/auth-styles"

const SIGN_IN_MESSAGES = {
  fromAsap: "Continue with GitHub to access Agent Builder from ASAP Protocol.",
  default: "Sign in with GitHub to access your account",
} as const

interface LoginFormProps {
  fromAsap?: boolean
}

export function LoginForm({ fromAsap }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGitHubSignIn() {
    setIsLoading(true)
    try {
      const result = await signIn("github", { callbackUrl: "/", redirect: false })
      if (result && !result.ok) {
        toast.error("Failed to sign in: " + result.error)
        setIsLoading(false)
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Failed to sign in: ${message}`)
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={authMountTransition}
    >
      <Card className={ghostCardClassName}>
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            {fromAsap ? SIGN_IN_MESSAGES.fromAsap : SIGN_IN_MESSAGES.default}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleGitHubSignIn()
          }}
        >
          <CardContent>
            <Button
              type="submit"
              variant="outline"
              className={cn(ghostAuthClassName, "w-full")}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-muted-foreground text-center text-xs">
              By signing in, you agree to use your GitHub account for authentication.
            </p>
            {fromAsap && (
              <a
                href={
                  process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL ?? "https://asap-protocol.vercel.app"
                }
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                ← Back to ASAP Protocol
              </a>
            )}
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
