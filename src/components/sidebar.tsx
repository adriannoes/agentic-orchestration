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
  Globe,
  ExternalLink,
  Menu,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { env } from "@/lib/env"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Agents", icon: Bot },
  { href: "/builder", label: "Builder", icon: Workflow },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/connectors", label: "Connectors", icon: Plug },
  { href: "/mcp", label: "MCP Servers", icon: Server },
  { href: "/marketplace", label: "Registry", icon: Globe },
  { href: "/runs", label: "Runs", icon: History },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
]

function SidebarContent({
  pathname,
  collapsed,
  onCollapseToggle,
  onNavClick,
  isMobile = false,
}: {
  pathname: string
  collapsed: boolean
  onCollapseToggle: () => void
  onNavClick?: () => void
  isMobile?: boolean
}) {
  const { data: session, status } = useSession()
  const user = session?.user
  const expanded = isMobile || !collapsed

  return (
    <>
      <div className="border-border/80 flex items-center justify-between border-b p-4">
        {expanded && (
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Bot className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Agent Builder</span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapseToggle}
            className={cn(collapsed && "mx-auto")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 active:scale-[0.98]",
                "hover:bg-accent/80 hover:text-accent-foreground",
                isActive && "border-primary bg-accent text-foreground border-l-2",
                collapsed && !isMobile && "justify-center px-2",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {expanded && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-border/80 border-t p-2">
        <a
          href={env.NEXT_PUBLIC_ASAP_PROTOCOL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open ASAP Protocol"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 active:scale-[0.98]",
            "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
            collapsed && !isMobile && "justify-center px-2",
          )}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {expanded && <span>ASAP Protocol</span>}
        </a>
      </div>

      <div className="border-border/80 border-t p-4">
        {status === "authenticated" && user ? (
          <div className={cn(collapsed && !isMobile && "flex justify-center")}>
            <UserMenu user={user} />
          </div>
        ) : (
          expanded && (
            <div className="text-muted-foreground text-xs">
              <a
                href={env.NEXT_PUBLIC_ASAP_PROTOCOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-all duration-200"
              >
                Powered by ASAP protocol.
              </a>
            </div>
          )
        )}
      </div>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile: hamburger trigger + Sheet (< lg) */}
      <div className="border-border/80 bg-card/80 fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="active:scale-[0.98]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-border/80 bg-card/80 w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-4">
              <SidebarContent
                pathname={pathname}
                collapsed={false}
                onCollapseToggle={() => {}}
                onNavClick={() => setMobileOpen(false)}
                isMobile
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: sidebar (hidden below lg) */}
      <aside
        className={cn(
          "border-border/80 bg-card/80 hidden flex-col border-r backdrop-blur-sm transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed(!collapsed)}
        />
      </aside>
    </>
  )
}
