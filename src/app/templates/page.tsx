import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { TemplatesLibrary } from "@/components/templates-library"

export default async function TemplatesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return <TemplatesLibrary />
}
