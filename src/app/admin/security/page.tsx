"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  ShieldAlert,
  LogIn,
  Ban,
  Activity,
  UserCog,
  Shield,
  Loader2,
  Save,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react"

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

interface RoleInfo {
  name: string
  description: string
  permissions: string[]
}

const roles: RoleInfo[] = [
  {
    name: "Super Admin",
    description: "Full access to all system features and settings",
    permissions: ["All admin features", "User management", "Role assignment", "System configuration", "Audit logs", "Security settings"],
  },
  {
    name: "Admin (Finance)",
    description: "Manage payments, credits, and financial settings",
    permissions: ["View transactions", "Process refunds", "Manage pricing", "Credit adjustments", "Financial reports"],
  },
  {
    name: "Admin (Content)",
    description: "Manage documents, templates, and messaging content",
    permissions: ["Document management", "Template management", "Notification management", "Content moderation"],
  },
  {
    name: "Admin (Support)",
    description: "Handle user support, view users and their data",
    permissions: ["View users", "View documents", "View applications", "Send notifications", "Support tickets"],
  },
  {
    name: "AI Manager",
    description: "Manage AI prompts, model settings, and monitor usage",
    permissions: ["AI prompt management", "Model configuration", "Usage monitoring", "API key management"],
  },
]

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [logSearch, setLogSearch] = useState("")

  const [minLength, setMinLength] = useState(true)
  const [requireSpecial, setRequireSpecial] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/audit-logs")
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const loginLogs = logs.filter(l =>
    l.action === "login" ||
    l.action === "sign_in" ||
    l.action?.toLowerCase().includes("login") ||
    l.action?.toLowerCase().includes("sign_in")
  )

  const failedLogins = logs.filter(l =>
    l.action === "login_failed" ||
    l.action === "auth_error" ||
    l.action?.toLowerCase().includes("fail") ||
    l.action?.toLowerCase().includes("error")
  )

  const recentActivity = logs.filter(l => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return new Date(l.created_at) >= twentyFourHoursAgo
  })

  const searchedLogs = loginLogs.filter(l => {
    if (!logSearch) return true
    const q = logSearch.toLowerCase()
    return l.admin?.full_name?.toLowerCase().includes(q) ||
      l.admin?.email?.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.target_type?.toLowerCase().includes(q)
  })

  async function handleSaveSettings() {
    setSaving(true)
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "password_policy_min_length", value: minLength ? "8" : "6" }),
      })
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "password_policy_require_special", value: String(requireSpecial) }),
      })
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "two_factor_auth", value: String(twoFactor) }),
      })
      alert("Security settings saved")
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">Monitor access, manage roles, and configure security policies</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Login Events</CardTitle>
            <LogIn className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedLogins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active (24h)</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Login Activity</CardTitle>
            <CardDescription>Admin login events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logins..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {searchedLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No login events found</p>
              ) : (
                searchedLogs.map(l => (
                  <div key={l.id} className="flex items-center gap-3 rounded-lg border p-2 text-sm">
                    <LogIn className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{l.admin?.full_name || "Unknown"}</span>
                      <span className="text-muted-foreground"> · {l.action}</span>
                      {l.target_type && <Badge variant="outline" className="ml-1 text-[10px]">{l.target_type}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(l.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Logins</CardTitle>
            <CardDescription>Authentication errors and failed attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[300px] overflow-y-auto">
            {failedLogins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No failed login attempts</p>
            ) : (
              failedLogins.map(l => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border p-2 text-sm">
                  <Ban className="h-3 w-3 shrink-0 text-destructive" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{l.action}</span>
                    {l.details && Object.keys(l.details).length > 0 && (
                      <span className="text-muted-foreground"> · {JSON.stringify(l.details)}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(l.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Admin activity in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-destructive" /></div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Admin</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Target</th>
                    <th className="pb-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(l => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4 whitespace-nowrap text-xs">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="py-3 pr-4">{l.admin?.full_name || "Unknown"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{l.action}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{l.target_type}{l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}</td>
                      <td className="py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {Object.keys(l.details || {}).length > 0 ? JSON.stringify(l.details).slice(0, 80) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Administrative role definitions and access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.name} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCog className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{role.name}</h3>
                  <Badge variant="secondary" className="ml-auto">{role.permissions.length} permissions</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map(p => (
                    <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure authentication and password policies</CardDescription>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium text-sm">Password Policy</h3>
            <div className="flex items-center gap-3">
              <Checkbox id="min-length" checked={minLength} onCheckedChange={setMinLength} />
              <Label htmlFor="min-length" className="text-sm">Require minimum password length (8 characters)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="require-special" checked={requireSpecial} onCheckedChange={setRequireSpecial} />
              <Label htmlFor="require-special" className="text-sm">Require special characters in passwords</Label>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium text-sm">Two-Factor Authentication</h3>
            <div className="flex items-center gap-3">
              <Checkbox id="two-factor" checked={twoFactor} onCheckedChange={setTwoFactor} />
              <Label htmlFor="two-factor" className="text-sm">Enable two-factor authentication for all admin accounts</Label>
            </div>
            <p className="text-xs text-muted-foreground">Note: 2FA implementation requires additional setup (placeholder)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
