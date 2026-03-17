import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SetupClient } from "./setup-client"

export default async function SetupPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <SetupClient />
}
