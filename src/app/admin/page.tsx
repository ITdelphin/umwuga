"use client"

import { useState, useEffect } from "react"
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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      if (!data.error) setStats(data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, href: "/admin/users", color: "text-destructive" },
    { label: "Documents", value: stats?.totalDocuments ?? 0, icon: FileText, href: "/admin/documents", color: "text-primary" },
    { label: "Applications", value: stats?.totalApplications ?? 0, icon: Briefcase, href: "/admin/applications", color: "text-secondary" },
    { label: "Interviews", value: stats?.totalInterviews ?? 0, icon: MessageSquare, href: "/admin/interviews", color: "text-accent" },
    { label: "Conversations", value: stats?.totalConversations ?? 0, icon: MessageSquare, href: null, color: "text-muted-foreground" },
    { label: "Revenue (RWF)", value: (stats?.totalRevenue ?? 0).toLocaleString(), icon: DollarSign, href: "/admin/credits", color: "text-primary" },
    { label: "Credits Issued", value: (stats?.totalCreditsIssued ?? 0).toLocaleString(), icon: CreditCard, href: "/admin/credits", color: "text-secondary" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Full system control and monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const content = (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </>
          )
          return card.href ? (
            <Link key={card.label} href={card.href} className="block hover:shadow-md transition-shadow">
              <Card>{content}</Card>
            </Link>
          ) : (
            <Card key={card.label}>{content}</Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> Manage Users</Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/documents"><FileText className="mr-2 h-4 w-4" /> View All Documents</Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/admin/credits"><CreditCard className="mr-2 h-4 w-4" /> Manage Credits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Platform details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Platform", "Umwuga AI"],
              ["Version", "0.1.0"],
              ["Database", "Supabase"],
              ["AI Provider", "OpenAI"],
              ["Payments", "MTN, Airtel, Equity"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
