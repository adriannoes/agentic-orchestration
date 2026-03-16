"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { GlassContainer } from "@/components/ui/glass-container"

const CanvasBg = dynamic(
  () => import("@/components/ui/canvas-bg").then((m) => ({ default: m.CanvasBg })),
  { ssr: false },
)

export default function SignupPage() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-indigo-950/20 to-zinc-950" />
        }
      >
        <CanvasBg />
      </Suspense>
      <div className="relative z-10 w-full max-w-md">
        <GlassContainer className="p-0">
          <SignupForm />
        </GlassContainer>
      </div>
    </div>
  )
}
