"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Shield, Loader2, RefreshCw, Search } from "lucide-react"

interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
  admin?: { full_name: string | null; email: string | null }
}

const actionLabels: Record<string, string> = {
  update_role: "Role Update",
  delete_user: "Delete User",
  send_notification: "Send Notification",
  send_notification_all: "Broadcast Notification",
  update_setting: "Setting Change",
  adjust_credits: "Credit Adjustment",
  delete_document: "Delete Document",
  delete_interview: "Delete Interview",
}

const actionColors: Record<string, string> = {
  update_role: "text-blue-600",
  delete_user: "text-destructive",
  send_notification: "text-secondary",
  send_notification_all: "text-primary",
  update_setting: "text-yellow-600",
  adjust_credits: "text-green-600",
  delete_document: "text-orange-600",
  delete_interview: "text-purple-600",
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    try {
      const url = actionFilter ? `/api/admin/audit-logs?action=${actionFilter}` : "/api/admin/audit-logs"
      const res = await fetch(url)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const filtered = logs.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.action.toLowerCase().includes(q) ||
      l.target_type?.toLowerCase().includes(q) ||
      l.target_id?.toLowerCase().includes(q) ||
      l.admin?.full_name?.toLowerCase().includes(q) ||
      l.admin?.email?.toLowerCase().includes(q)
  })

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions on the platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="w-48">
          <option value="">All Actions</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{actionLabels[a] || a}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filtered.length})</CardTitle>
          <CardDescription>Chronological record of all admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No audit logs yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(l => (
                <div key={l.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <Shield className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${actionColors[l.action] || ""}`}>
                        {actionLabels[l.action] || l.action}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{l.target_type || "system"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {l.admin?.full_name || l.admin?.email || "Unknown"} · {new Date(l.created_at).toLocaleString()}
                    </p>
                    {l.target_id && (
                      <p className="text-[10px] text-muted-foreground">Target: {l.target_id}</p>
                    )}
                    {Object.keys(l.details || {}).length > 0 && (
                      <pre className="mt-1 text-[10px] text-muted-foreground bg-muted rounded p-1 overflow-x-auto">
                        {JSON.stringify(l.details, null, 1)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
