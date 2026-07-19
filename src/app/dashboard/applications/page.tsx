"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Plus, ExternalLink, Trash2, Loader2 } from "lucide-react"
import type { JobApplication } from "@/types"

const statusColors: Record<string, "default" | "secondary" | "accent" | "destructive" | "outline"> = {
  saved: "secondary",
  applied: "default",
  interview: "accent",
  accepted: "default",
  rejected: "destructive",
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newCompany, setNewCompany] = useState("")
  const [newPosition, setNewPosition] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchApplications()
  }, [user])

  async function fetchApplications() {
    const { data } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
    if (data) setApplications(data)
    setLoading(false)
  }

  async function addApplication() {
    if (!newCompany || !newPosition || !user) return
    setSaving(true)
    const { data } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company: newCompany,
        position: newPosition,
        job_description: newDescription,
        status: "saved",
      })
      .select()
      .single()
    if (data) {
      setApplications([data, ...applications])
      setNewCompany("")
      setNewPosition("")
      setNewDescription("")
      setShowAdd(false)
    }
    setSaving(false)
  }

  async function updateStatus(id: string, status: JobApplication["status"]) {
    await supabase.from("job_applications").update({ status }).eq("id", id)
    setApplications(applications.map(a => a.id === id ? { ...a, status } : a))
  }

  async function deleteApplication(id: string) {
    await supabase.from("job_applications").delete().eq("id", id)
    setApplications(applications.filter(a => a.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Application
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>New Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Company name" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Job title" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description (optional)</Label>
              <Textarea id="description" placeholder="Paste job description for AI analysis..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={addApplication} disabled={!newCompany || !newPosition || saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <ExternalLink className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No applications tracked yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-sm">
                      {app.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{app.position}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value as JobApplication["status"])}
                      className="w-28"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteApplication(app.id)}>
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
