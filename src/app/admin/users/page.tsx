"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, Loader2, Shield, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react"
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

interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  professional_title: string | null
  role: string | null
  created_at: string
  location: string | null
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filtered, setFiltered] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
      setFiltered(data.users || [])
    } catch (err) { console.error("Failed to fetch users:", err) }
    setLoading(false)
  }

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.professional_title?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    ))
  }, [search, users])

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

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return
    setUpdating(userId)
    try {
      const admin = createClient()
      await admin.from("profiles").delete().eq("id", userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) { console.error("Failed to delete user:", err) }
    setUpdating(null)
  }

  const isSuperAdmin = users.find(u => u.user_id === currentUser?.id)?.role === "super_admin"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View, promote, demote, or remove platform users</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" onClick={fetchUsers}><Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filtered.length})</CardTitle>
          <CardDescription>{users.length - filtered.length > 0 && `${users.length - filtered.length} filtered out`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => {
                const RoleIcon = roleIcons[u.role || "user"] || Shield
                const isSelf = u.user_id === currentUser?.id
                return (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-sm">
                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {u.full_name || "Unnamed"}
                          {isSelf && <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}{u.professional_title && ` · ${u.professional_title}`}</p>
                        <p className="text-[10px] text-muted-foreground">{u.location || "No location"} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <Badge variant={roleColors[u.role || "user"] || "secondary"} className="gap-1 whitespace-nowrap">
                        <RoleIcon className="h-3 w-3" />
                        {u.role || "user"}
                      </Badge>
                      {!isSelf && u.role !== "super_admin" && (
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
                      {isSuperAdmin && !isSelf && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteUser(u.id)} disabled={updating === u.id}>
                          {updating === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
