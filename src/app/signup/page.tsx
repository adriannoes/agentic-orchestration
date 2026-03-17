import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignupClient } from "./signup-client"

export default async function SignupPage() {
  const session = await auth()
  if (session) redirect("/")

  return <SignupClient />
}
