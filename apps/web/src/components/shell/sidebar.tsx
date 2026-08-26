"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Building2, 
  BarChart2, 
  Inbox, 
  Bot, 
  Settings, 
  Users, 
  ChevronDown,
  User
} from "lucide-react"

import { useAuth } from "../../app/internal/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false)

  const navItems = [
    { name: "Dashboard", href: "/internal/dashboard", icon: BarChart2 },
    { name: "Inbox", href: "/internal/inbox", icon: Inbox },
    { name: "Agents", href: "/internal/agents", icon: Bot },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-muted/20">
      {/* Workspace Switcher */}
      <div className="relative border-b p-4">
        <button 
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm">Acme Corp</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {isWorkspaceMenuOpen && (
          <div className="absolute left-4 right-4 top-16 z-50 rounded-md border bg-background p-1 shadow-md">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Workspace Settings</div>
            <Link href="/internal/settings/routing" className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
              <Settings className="h-4 w-4" /> Routing Rules
            </Link>
            <Link href="/internal/settings/teams" className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
              <Users className="h-4 w-4" /> Teams & Schedules
            </Link>
            <div className="my-1 border-b"></div>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Switch Workspace</div>
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
              Startup Inc
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user || "Operator"}</span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <button onClick={logout} className="text-xs font-medium text-muted-foreground hover:underline">
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
