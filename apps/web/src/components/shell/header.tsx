import * as React from "react"
import { Search, Bell } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu spacer */}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search interventions..."
            className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:w-[300px]"
          />
        </div>
        <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600"></span>
        </button>
      </div>
    </header>
  )
}
