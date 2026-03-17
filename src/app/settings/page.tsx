import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettingsPanel } from "@/components/settings-panel"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <SettingsPanel />
}
