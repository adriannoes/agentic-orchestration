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
import Link from "next/link"
import { toast } from "sonner"
import { Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { authMountTransition, ghostAuthClassName, ghostCardClassName } from "@/lib/auth-styles"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGitHubSignIn() {
    setIsLoading(true)
    try {
      await signIn("github", { callbackUrl: "/" })
    } catch {
      toast.error("Failed to sign in with GitHub")
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up with GitHub to start building AI agents</CardDescription>
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
              {isLoading ? "Signing up..." : "Sign up with GitHub"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
