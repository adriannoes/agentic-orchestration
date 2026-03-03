"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Bot,
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
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

const navItems = [
  { href: "/", label: "Agents", icon: Bot },
  { href: "/builder", label: "Builder", icon: Workflow },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/connectors", label: "Connectors", icon: Plug },
  { href: "/mcp", label: "MCP Servers", icon: Server },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/runs", label: "Runs", icon: History },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { data: session, status } = useSession()
  const user = session?.user

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Agent Builder</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
                "hover:bg-accent/80 hover:text-accent-foreground",
                isActive && "bg-accent text-foreground border border-border/80",
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
        {status === "authenticated" && user ? (
          <div className={cn(collapsed && "flex justify-center")}>
            <UserMenu user={user} />
          </div>
        ) : (
          !collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>Powered by ASAP protocol.</p>
            </div>
          )
        )}
      </div>
    </aside>
  )
}
