"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu } from "lucide-react"

interface DashboardHeaderProps {
  onMenuClick?: () => void
  user?: { name?: string; email?: string; avatar?: string }
}

export function DashboardHeader({ onMenuClick, user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{(user?.name || "U")[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
