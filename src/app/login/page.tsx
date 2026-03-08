import { LoginForm } from "@/components/auth/login-form"

interface LoginPageProps {
  searchParams: Promise<{ from?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const fromAsap = params?.from === "asap"

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <LoginForm fromAsap={fromAsap} />
    </div>
  )
}
