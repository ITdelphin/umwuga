"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return

    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && (data.role === "admin" || data.role === "super_admin")) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
          router.push("/dashboard")
        }
      })
  }, [user])

  if (authorized === false) return null

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
