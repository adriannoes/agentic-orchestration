import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { RunsHistory } from "@/components/runs-history"

export default async function RunsPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return <RunsHistory />
}
