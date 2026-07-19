"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Bell, Send, Loader2, Users, Mail, CheckCircle, X } from "lucide-react"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  profiles?: { full_name: string | null; email: string | null }
}

interface UserProfile {
  user_id: string
  full_name: string | null
  email: string | null
}

export default function AdminNotificationsPage() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [sendMode, setSendMode] = useState<"all" | "selected">("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [form, setForm] = useState({ title: "", message: "", type: "info" })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [notifRes, usersRes] = await Promise.all([
        fetch("/api/admin/notifications"),
        supabase.from("profiles").select("user_id, full_name, email").order("full_name"),
      ])
      const notifData = await notifRes.json()
      setNotifications(notifData.notifications || [])
      setUsers(usersRes.data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleSend() {
    if (!form.title || !form.message) return
    setSending(true)
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: sendMode === "selected" ? selectedUsers : [],
          title: form.title,
          message: form.message,
          type: form.type,
        }),
      })
      setForm({ title: "", message: "", type: "info" })
      setShowSend(false)
      fetchData()
    } catch (err) { console.error(err) }
    setSending(false)
  }

  const typeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    info: "default", success: "secondary", warning: "outline", error: "destructive", promotion: "secondary",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Send and manage platform notifications</p>
        </div>
        <Button onClick={() => setShowSend(!showSend)}>
          <Send className="mr-2 h-4 w-4" /> Send Notification
        </Button>
      </div>

      {showSend && (
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">New Notification</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowSend(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant={sendMode === "all" ? "default" : "outline"} size="sm" onClick={() => setSendMode("all")}>
                <Users className="mr-2 h-4 w-4" /> All Users
              </Button>
              <Button variant={sendMode === "selected" ? "default" : "outline"} size="sm" onClick={() => setSendMode("selected")}>
                <Mail className="mr-2 h-4 w-4" /> Selected Users
              </Button>
            </div>

            {sendMode === "selected" && (
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border p-2">
                {users.map(u => (
                  <label key={u.user_id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded px-2 py-1">
                    <input type="checkbox" checked={selectedUsers.includes(u.user_id)} onChange={e => {
                      setSelectedUsers(e.target.checked ? [...selectedUsers, u.user_id] : selectedUsers.filter(id => id !== u.user_id))
                    }} />
                    {u.full_name || u.email}
                  </label>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="promotion">Promotion</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., New Feature Available" />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Write your notification message..."
              />
            </div>

            <Button onClick={handleSend} disabled={sending || !form.title || !form.message}>
              {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send to {sendMode === "all" ? "All Users" : `${selectedUsers.length} Users`}</>}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sent Notifications ({notifications.length})</CardTitle>
          <CardDescription>History of all sent platform notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    n.type === "error" ? "bg-destructive/10" : n.type === "success" ? "bg-green-500/10" : n.type === "warning" ? "bg-yellow-500/10" : "bg-primary/10"
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      n.type === "error" ? "text-destructive" : n.type === "success" ? "text-green-600" : n.type === "warning" ? "text-yellow-600" : "text-primary"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Badge variant={typeColors[n.type] || "default"} className="text-[10px]">{n.type}</Badge>
                      {n.read ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-2 w-2 rounded-full bg-destructive" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      To: {n.profiles?.full_name || n.profiles?.email || "Unknown"} · {new Date(n.created_at).toLocaleString()}
                    </p>
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
