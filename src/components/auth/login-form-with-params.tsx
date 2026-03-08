"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

function LoginFormWithParamsInner() {
  const searchParams = useSearchParams()
  const fromAsap = searchParams.get("from") === "asap"
  return <LoginForm fromAsap={fromAsap} />
}

export function LoginFormWithParams() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginFormWithParamsInner />
    </Suspense>
  )
}
