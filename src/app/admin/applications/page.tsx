"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, Briefcase, Loader2, Trash2 } from "lucide-react"
import type { JobApplication } from "@/types"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  saved: "secondary",
  applied: "default",
  interview: "destructive",
  accepted: "default",
  rejected: "outline",
}

export default function AdminApplicationsPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<(JobApplication & { profiles?: { full_name: string | null } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => { fetchApplications() }, [])

  async function fetchApplications() {
    setLoading(true)
    try {
      const admin = createClient()
      const { data } = await admin
        .from("job_applications")
        .select("*, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
      setApplications(data || [])
    } catch (err) { console.error("Failed to fetch applications:", err) }
    setLoading(false)
  }

  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch = a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) ||
      (a as any).profiles?.full_name?.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function deleteApplication(id: string) {
    if (!confirm("Delete this application?")) return
    await supabase.from("job_applications").delete().eq("id", id)
    setApplications(applications.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Track all user job applications</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by company, position, or user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
          <option value="all">All Status</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Button variant="outline" onClick={fetchApplications}><Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No applications found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(app => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                      <Briefcase className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{app.position}</p>
                      <p className="text-xs text-muted-foreground">{app.company} · {(app as any).profiles?.full_name || "Unknown"}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <Badge variant={statusColors[app.status] || "secondary"}>{app.status}</Badge>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteApplication(app.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
