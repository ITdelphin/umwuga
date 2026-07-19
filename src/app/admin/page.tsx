"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2, RefreshCw, Users, FileText, MessageSquare, DollarSign,
  CreditCard, Download, Activity, Shield, BarChart3, Languages,
  PieChart as PieChartIcon, TrendingUp, Calendar, AlertTriangle,
  CheckCircle, XCircle, HardDrive, Zap,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

interface TrendPoint {
  date: string
  count?: number
  revenue?: number
}

interface ChartItem {
  name: string
  value: number
}

interface Stats {
  totalUsers: number
  activeUsersToday: number
  newRegistrations: number
  totalConversations: number
  aiRequestsToday: number
  documentsGenerated: number
  cvsGenerated: number
  coverLettersGenerated: number
  interviewSessions: number
  documentsDownloaded: number
  revenueToday: number
  revenueThisMonth: number
  totalRevenue: number
  pendingPayments: number
  successfulPayments: number
  failedPayments: number
  storageUsed: number
  apiUsage: number
  systemHealth: string
  dailyRegistrations: TrendPoint[]
  revenueTrend: TrendPoint[]
  documentTrend: TrendPoint[]
  aiUsageTrend: TrendPoint[]
  docTypes: ChartItem[]
  languages: ChartItem[]
  paymentMethods: ChartItem[]
}

const COLORS = {
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  emerald: "#10b981",
  green: "#22c55e",
  amber: "#f59e0b",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  rose: "#f43f5e",
  slate: "#64748b",
}

const CHART_COLORS = [COLORS.blue, COLORS.indigo, COLORS.violet, COLORS.cyan, COLORS.emerald, COLORS.amber, COLORS.orange, COLORS.rose, COLORS.slate, COLORS.green]

const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4"]

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString()
}

function formatCurrency(n: number): string {
  return "RWF " + n.toLocaleString()
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      if (!data.error) { setStats(data); setLastUpdated(new Date()) }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
    setLoading(false)
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: "Total Users", value: formatNumber(stats.totalUsers), raw: stats.totalUsers, icon: Users, color: COLORS.blue, href: "/admin/users" },
    { label: "Active Today", value: formatNumber(stats.activeUsersToday), raw: stats.activeUsersToday, icon: Activity, color: COLORS.emerald, href: "/admin/users" },
    { label: "New Registrations", value: formatNumber(stats.newRegistrations), raw: stats.newRegistrations, icon: TrendingUp, color: COLORS.green, href: "/admin/users" },
    { label: "Conversations", value: formatNumber(stats.totalConversations), raw: stats.totalConversations, icon: MessageSquare, color: COLORS.violet, href: "/admin/conversations" },
    { label: "AI Requests Today", value: formatNumber(stats.aiRequestsToday), raw: stats.aiRequestsToday, icon: Zap, color: COLORS.cyan, href: "/admin/conversations" },
    { label: "Documents Generated", value: formatNumber(stats.documentsGenerated), raw: stats.documentsGenerated, icon: FileText, color: COLORS.indigo, href: "/admin/documents" },
    { label: "CVs Generated", value: formatNumber(stats.cvsGenerated), raw: stats.cvsGenerated, icon: FileText, color: COLORS.indigo, href: "/admin/documents" },
    { label: "Cover Letters", value: formatNumber(stats.coverLettersGenerated), raw: stats.coverLettersGenerated, icon: FileText, color: COLORS.indigo, href: "/admin/documents" },
    { label: "Interview Sessions", value: formatNumber(stats.interviewSessions), raw: stats.interviewSessions, icon: Calendar, color: COLORS.purple, href: "/admin/interviews" },
    { label: "Downloads", value: formatNumber(stats.documentsDownloaded), raw: stats.documentsDownloaded, icon: Download, color: COLORS.blue, href: "/admin/documents" },
    { label: "Revenue Today", value: formatCurrency(stats.revenueToday), raw: stats.revenueToday, icon: DollarSign, color: COLORS.emerald, href: "/admin/credits" },
    { label: "Revenue This Month", value: formatCurrency(stats.revenueThisMonth), raw: stats.revenueThisMonth, icon: DollarSign, color: COLORS.emerald, href: "/admin/credits" },
    { label: "Pending Payments", value: formatNumber(stats.pendingPayments), raw: stats.pendingPayments, icon: AlertTriangle, color: COLORS.amber, href: "/admin/credits" },
    { label: "Successful Payments", value: formatNumber(stats.successfulPayments), raw: stats.successfulPayments, icon: CheckCircle, color: COLORS.green, href: "/admin/credits" },
    { label: "Failed Payments", value: formatNumber(stats.failedPayments), raw: stats.failedPayments, icon: XCircle, color: COLORS.red, href: "/admin/credits" },
    { label: "Storage Used", value: stats.storageUsed >= 1000 ? (stats.storageUsed / 1000).toFixed(1) + " MB" : stats.storageUsed + " KB", raw: stats.storageUsed, icon: HardDrive, color: COLORS.slate, href: null },
    { label: "System Health", value: stats.systemHealth === "good" ? "Healthy" : "Issues", raw: 0, icon: Shield, color: stats.systemHealth === "good" ? COLORS.green : COLORS.red, href: "/admin/settings" },
    { label: "API Usage", value: formatNumber(stats.apiUsage), raw: stats.apiUsage, icon: BarChart3, color: COLORS.cyan, href: "/admin/audit-logs" },
  ]

  const totalRevCard = {
    label: "Total Revenue",
    value: formatCurrency(stats.totalRevenue),
    raw: stats.totalRevenue,
    icon: DollarSign,
    color: COLORS.amber,
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete platform overview and monitoring
            {lastUpdated && (
              <span className="ml-2 text-xs text-muted-foreground/60">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5">
            <Shield className="h-3 w-3 text-green-500" />
            System Online
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Total Revenue - Prominent Card */}
      <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Revenue</p>
              <p className="text-4xl font-bold tracking-tight mt-2">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Today: {formatCurrency(stats.revenueToday)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  This Month: {formatCurrency(stats.revenueThisMonth)}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.label}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div
                className="absolute top-0 left-0 w-full h-0.5 opacity-80"
                style={{ background: card.color }}
              />
              <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </CardTitle>
                  <div
                    className="p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: card.color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="text-lg font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight">Analytics &amp; Trends</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Platform metrics visualized over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Registrations */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm">Daily Registrations</CardTitle>
            </div>
            <CardDescription>New user signups over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyRegistrations}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="count" stroke={COLORS.blue} fill="url(#regGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm">Revenue Trend</CardTitle>
            </div>
            <CardDescription>Daily purchase revenue over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatNumber(v)} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} formatter={(value: unknown) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.emerald} fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-sm">Document Trend</CardTitle>
            </div>
            <CardDescription>Documents generated per day (14 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.documentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-500" />
              <CardTitle className="text-sm">AI Usage</CardTitle>
            </div>
            <CardDescription>Conversations per day (14 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.aiUsageTrend}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="count" stroke={COLORS.cyan} fill="url(#aiGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Types Pie */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-sm">Document Types</CardTitle>
            </div>
            <CardDescription>Distribution by document type</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {stats.docTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.docTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.name ?? "Unknown"} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.docTypes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Languages Pie */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm">Languages</CardTitle>
            </div>
            <CardDescription>Document language distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {stats.languages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.languages} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.name ?? "Unknown"} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.languages.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 4) % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Pie */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm">Payment Methods</CardTitle>
            </div>
            <CardDescription>Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {stats.paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.name ?? "Unknown"} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.paymentMethods.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 8) % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* User Activity - BarChart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm">User Activity</CardTitle>
            </div>
            <CardDescription>Daily registrations (bar view)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
