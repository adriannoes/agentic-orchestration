import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ToolsLibrary } from "@/components/tools-library"

export default async function ToolsPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return <ToolsLibrary />
}
