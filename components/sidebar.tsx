"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Bot,
  Play,
  History,
  Settings,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Workflow,
  LayoutTemplate,
  Plug,
  Server,
  Store,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", label: "Agents", icon: Bot },
  { href: "/builder", label: "Builder", icon: Workflow },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/connectors", label: "Connectors", icon: Plug },
  { href: "/mcp", label: "MCP Servers", icon: Server },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/playground", label: "Playground", icon: Play },
  { href: "/runs", label: "Runs", icon: History },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setIsSupabaseEnabled(false)
      return
    }

    setIsSupabaseEnabled(true)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setUser(data))
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setUser(data)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">AgentKit</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-primary",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {isSupabaseEnabled && user ? (
          <div className={cn(collapsed && "flex justify-center")}>
            <UserMenu user={user} />
          </div>
        ) : (
          !collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>AgentKit v1.0</p>
              <p className="mt-1">Powered by AI SDK</p>
            </div>
          )
        )}
      </div>
    </aside>
  )
}
