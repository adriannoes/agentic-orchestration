"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { LoginFormWithParams } from "@/components/auth/login-form-with-params"
import { GlassContainer } from "@/components/ui/glass-container"

const CanvasBg = dynamic(
  () => import("@/components/ui/canvas-bg").then((m) => ({ default: m.CanvasBg })),
  { ssr: false },
)

export function LoginClient() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <Suspense
        fallback={
          <div className="from-background via-primary/10 to-background absolute inset-0 bg-gradient-to-br" />
        }
      >
        <CanvasBg />
      </Suspense>
      <div className="relative z-10 w-full max-w-md">
        <GlassContainer className="p-0">
          <LoginFormWithParams />
        </GlassContainer>
      </div>
    </div>
  )
}
