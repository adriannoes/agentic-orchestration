import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AgentsDashboard } from "@/components/agents-dashboard"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <AgentsDashboard />
}
