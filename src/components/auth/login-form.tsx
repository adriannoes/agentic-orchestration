"use client"

import { useState } from "react"
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

export function LoginForm() {
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Sign in with GitHub to access your account</CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleGitHubSignIn()
        }}
      >
        <CardContent>
          <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-muted-foreground text-center text-xs">
            By signing in, you agree to use your GitHub account for authentication.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
