"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  FileText,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Settings,
  Wallet,
  Lightbulb,
  BookOpen,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/interviews", label: "Interviews", icon: MessageSquare },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: GraduationCap },
  { href: "/dashboard/career-advisor", label: "Career Advisor", icon: Lightbulb },
  { href: "/dashboard/student", label: "Student Mode", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">U</span>
          </div>
          <span className="font-bold text-xl text-primary">Umwuga</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <Wallet className="h-4 w-4 text-accent" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Credits</p>
            <p className="text-sm font-medium">5 documents</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
