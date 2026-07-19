"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Briefcase, MessageSquare, DollarSign, CreditCard, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalUsers: number
  totalDocuments: number
  totalApplications: number
  totalInterviews: number
  totalConversations: number
  totalRevenue: number
  totalCreditsIssued: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    checkAuth()
  }, [user])

  async function checkAuth() {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user!.id)
      .maybeSingle()

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      setAuthorized(false)
      router.push("/dashboard")
      return
    }

    setAuthorized(true)
    fetchStats()
  }

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
    setLoading(false)
  }

  if (authorized === false) return null

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, href: "/dashboard/admin/users", color: "text-primary" },
    { label: "Documents", value: stats.totalDocuments, icon: FileText, href: "/dashboard/admin/users", color: "text-secondary" },
    { label: "Applications", value: stats.totalApplications, icon: Briefcase, href: "/dashboard/admin/users", color: "text-accent" },
    { label: "Interviews", value: stats.totalInterviews, icon: MessageSquare, href: "/dashboard/admin/users", color: "text-primary" },
    { label: "Conversations", value: stats.totalConversations, icon: MessageSquare, href: "/dashboard/admin/users", color: "text-secondary" },
    { label: "Revenue (RWF)", value: stats.totalRevenue.toLocaleString(), icon: DollarSign, href: null, color: "text-accent" },
    { label: "Credits Issued", value: stats.totalCreditsIssued.toLocaleString(), icon: CreditCard, href: null, color: "text-primary" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className={card.href ? "hover:shadow-md transition-shadow" : ""}>
              {card.href ? (
                <Link href={card.href}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Link>
              ) : (
                <>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </>
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/users">
                <Users className="mr-2 h-4 w-4" /> Manage Users
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/api/admin" target="_blank">
                <CreditCard className="mr-2 h-4 w-4" /> Grant Self Super Admin
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
            <CardDescription>Platform details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">Umwuga AI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">Supabase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Provider</span>
              <span className="font-medium">OpenAI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Methods</span>
              <span className="font-medium">MTN, Airtel, Equity</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
