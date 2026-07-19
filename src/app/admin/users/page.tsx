"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Search, Loader2, Shield, ShieldCheck, ShieldAlert, Trash2, UserX, UserCheck,
  Download, Eye, RefreshCw, MoreHorizontal,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  user: "secondary",
  admin: "default",
  super_admin: "destructive",
}

const roleIcons: Record<string, typeof Shield> = {
  user: Shield,
  admin: ShieldCheck,
  super_admin: ShieldAlert,
}

interface UserWithMeta {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  professional_title: string | null
  role: string | null
  created_at: string
  location: string | null
  suspended?: boolean
  conversations_count: number
  documents_count: number
  total_spent: number
  credits_balance: number
}

interface UserDetail {
  profile: UserWithMeta & { credits_balance: number }
  conversations: any[]
  documents: any[]
  transactions: any[]
  audit_logs: any[]
  experience: any[]
  education: any[]
  skills: any[]
}

interface DeletedUserEntry {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: { user_id?: string; full_name?: string; email?: string }
  created_at: string
  admin?: { full_name: string | null; email: string | null }
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const supabase = createClient()
  const [users, setUsers] = useState<UserWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithMeta | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deletedUsers, setDeletedUsers] = useState<DeletedUserEntry[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    fetchUsers()
    fetchDeletedUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) { console.error("Failed to fetch users:", err) }
    setLoading(false)
  }

  async function fetchDeletedUsers() {
    try {
      const res = await fetch("/api/admin/audit-logs?action=delete_user&limit=50")
      const data = await res.json()
      setDeletedUsers(data.logs || [])
    } catch (err) { console.error("Failed to fetch deleted users:", err) }
  }

  async function fetchUserDetail(userId: string) {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()
      setUserDetail(data)
    } catch (err) { console.error("Failed to fetch user detail:", err) }
    setDetailLoading(false)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.professional_title?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
      )
    })
  }, [search, roleFilter, users])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / pageSize)

  const uniqueRoles = useMemo(() => [...new Set(users.map(u => u.role).filter(Boolean))], [users])

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) { console.error("Failed to update role:", err) }
    setUpdating(null)
  }

  async function toggleSuspend(user: UserWithMeta) {
    setUpdating(user.id)
    const newSuspended = !user.suspended
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: newSuspended }),
      })
      if (res.ok) setUsers(users.map(u => u.id === user.id ? { ...u, suspended: newSuspended } : u))
    } catch (err) { console.error("Failed to toggle suspend:", err) }
    setUpdating(null)
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
        fetchDeletedUsers()
      }
    } catch (err) { console.error("Failed to delete user:", err) }
    setUpdating(null)
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Role", "Location", "Title", "Joined", "Conversations", "Documents", "Total Spent", "Credits", "Suspended"]
    const rows = filtered.map(u => [
      u.full_name || "",
      u.email || "",
      u.role || "",
      u.location || "",
      u.professional_title || "",
      new Date(u.created_at).toLocaleDateString(),
      u.conversations_count,
      u.documents_count,
      u.total_spent,
      u.credits_balance,
      u.suspended ? "Yes" : "No",
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function openDetail(user: UserWithMeta) {
    setSelectedUser(user)
    setUserDetail(null)
    fetchUserDetail(user.id)
  }

  function closeDetail() {
    setSelectedUser(null)
    setUserDetail(null)
  }

  const isSuperAdmin = currentUser && users.find(u => u.user_id === currentUser.id)?.role === "super_admin"
  const currentUserProfile = currentUser && users.find(u => u.user_id === currentUser.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View, promote, demote, suspend, or remove platform users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, role, location..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="w-36">
          <option value="">All Roles</option>
          {uniqueRoles.map(r => <option key={r} value={r!}>{r}</option>)}
        </Select>
        <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users ({filtered.length})</CardTitle>
              <CardDescription>{users.length - filtered.length > 0 && `${users.length - filtered.length} filtered out`}</CardDescription>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-sm">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <span className="px-2 text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-3">
              {paginated.map(u => {
                const RoleIcon = roleIcons[u.role || "user"] || Shield
                const isSelf = u.user_id === currentUser?.id
                return (
                  <div key={u.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-destructive/10 text-sm font-bold">
                            {(u.full_name || u.email || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {u.full_name || "Unnamed"}
                            </p>
                            {isSelf && <Badge variant="outline" className="text-[10px]">You</Badge>}
                            {u.suspended && <Badge variant="destructive" className="text-[10px]">Suspended</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.email}{u.professional_title && ` · ${u.professional_title}`}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {u.location || "No location"} · Joined {new Date(u.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={roleColors[u.role || "user"] || "secondary"} className="gap-1 whitespace-nowrap">
                          <RoleIcon className="h-3 w-3" />
                          {u.role || "user"}
                        </Badge>
                        {!isSelf && u.role !== "super_admin" && isSuperAdmin && (
                          <Select
                            value={u.role || "user"}
                            onChange={e => updateRole(u.id, e.target.value)}
                            disabled={updating === u.id}
                            className="w-24"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{u.conversations_count} conversations</span>
                      <span>{u.documents_count} documents</span>
                      <span>Spent: {u.total_spent.toLocaleString()} RWF</span>
                      <span>{u.credits_balance} credits</span>
                    </div>

                    {isSuperAdmin && !isSelf && (
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openDetail(u)}>
                          <Eye className="h-3 w-3 mr-1" /> View Profile
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs ${u.suspended ? "text-green-600" : "text-amber-600"}`}
                          onClick={() => toggleSuspend(u)}
                          disabled={updating === u.id}
                        >
                          {updating === u.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : u.suspended ? (
                            <UserCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <UserX className="h-3 w-3 mr-1" />
                          )}
                          {u.suspended ? "Activate" : "Suspend"}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteUser(u.id)} disabled={updating === u.id}>
                          {updating === u.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20">
          <div className="fixed inset-0 bg-black/50" onClick={closeDetail} />
          <div className="relative bg-background rounded-lg border shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto z-10 mx-4">
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-destructive/10 text-sm font-bold">
                    {((selectedUser.full_name || selectedUser.email || "?")[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.full_name || "Unnamed"}</h2>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDetail}><MoreHorizontal className="h-5 w-5" /></Button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
            ) : userDetail ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Profile Information</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><span className="font-medium text-foreground">Title:</span> {userDetail.profile.professional_title || "N/A"}</p>
                      <p><span className="font-medium text-foreground">Location:</span> {userDetail.profile.location || "N/A"}</p>
                      <p><span className="font-medium text-foreground">Role:</span> {userDetail.profile.role || "user"}</p>
                      <p><span className="font-medium text-foreground">Joined:</span> {new Date(userDetail.profile.created_at).toLocaleDateString()}</p>
                      <p><span className="font-medium text-foreground">Credits:</span> {userDetail.profile.credits_balance}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Usage Stats</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><span className="font-medium text-foreground">Conversations:</span> {userDetail.conversations.length}</p>
                      <p><span className="font-medium text-foreground">Documents:</span> {userDetail.documents.length}</p>
                      <p><span className="font-medium text-foreground">Transactions:</span> {userDetail.transactions.length}</p>
                      <p><span className="font-medium text-foreground">Total Spent:</span> {(userDetail.transactions as any[]).reduce((s: number, t: any) => s + (t.amount || 0), 0).toLocaleString()} RWF</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3">Career Profile</h3>
                  {userDetail.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {userDetail.skills.map((s: any) => (
                          <Badge key={s.id} variant="secondary" className="text-[10px]">{s.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {userDetail.experience.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Experience</p>
                      <div className="space-y-2">
                        {userDetail.experience.map((exp: any) => (
                          <div key={exp.id} className="text-sm border rounded p-2">
                            <p className="font-medium">{exp.position} @ {exp.company}</p>
                            <p className="text-xs text-muted-foreground">{exp.start_date} - {exp.end_date || "Present"}</p>
                            {exp.description && <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {userDetail.education.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Education</p>
                      <div className="space-y-2">
                        {userDetail.education.map((edu: any) => (
                          <div key={edu.id} className="text-sm border rounded p-2">
                            <p className="font-medium">{edu.degree} @ {edu.school}</p>
                            <p className="text-xs text-muted-foreground">{edu.field ? `${edu.field} · ` : ""}{edu.end_date || "Ongoing"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {userDetail.skills.length === 0 && userDetail.experience.length === 0 && userDetail.education.length === 0 && (
                    <p className="text-sm text-muted-foreground">No career profile data</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Recent Conversations ({userDetail.conversations.length})</h3>
                    {userDetail.conversations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No conversations</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {userDetail.conversations.map((c: any) => (
                          <div key={c.id} className="text-xs border rounded p-2">
                            <p className="truncate font-medium">{c.title || "Untitled"}</p>
                            <p className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Recent Documents ({userDetail.documents.length})</h3>
                    {userDetail.documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No documents</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {userDetail.documents.map((d: any) => (
                          <div key={d.id} className="text-xs border rounded p-2">
                            <p className="truncate font-medium">{d.title}</p>
                            <p className="text-muted-foreground">{d.type} · {new Date(d.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">Payment History ({userDetail.transactions.length})</h3>
                  {userDetail.transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No transactions</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="text-left py-1 pr-2">Date</th>
                            <th className="text-left py-1 pr-2">Amount</th>
                            <th className="text-left py-1">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetail.transactions.map((tx: any) => (
                            <tr key={tx.id} className="border-b">
                              <td className="py-1 pr-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                              <td className="py-1 pr-2">{tx.amount?.toLocaleString()} RWF</td>
                              <td className="py-1"><Badge variant="outline" className="text-[10px]">{tx.status || "completed"}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">Login Activity ({userDetail.audit_logs.length})</h3>
                  {userDetail.audit_logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity logs</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {userDetail.audit_logs.map((log: any) => (
                        <div key={log.id} className="text-xs border rounded p-2">
                          <p><span className="font-medium">{log.action}</span> · {new Date(log.created_at).toLocaleString()}</p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <p className="text-muted-foreground truncate">{JSON.stringify(log.details)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Deleted Users</CardTitle>
          <CardDescription>Recently removed accounts (from audit logs)</CardDescription>
        </CardHeader>
        <CardContent>
          {deletedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deleted users found</p>
          ) : (
            <div className="space-y-2">
              {deletedUsers.map(log => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {log.details?.full_name || log.details?.email || "Unknown user"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deleted {new Date(log.created_at).toLocaleString()}
                      {log.admin?.full_name && ` by ${log.admin.full_name}`}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">Deleted</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
