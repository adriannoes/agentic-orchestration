import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BuilderClient } from "@/components/builder/builder-client"

export default async function BuilderPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <BuilderClient />
}
