"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Plus, ExternalLink, Trash2 } from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "accent" | "destructive" | "outline"> = {
  saved: "secondary",
  applied: "default",
  interview: "accent",
  accepted: "default",
  rejected: "destructive",
}

const initialApplications = [
  { id: "1", company: "Google", position: "Software Engineer", status: "applied", appliedDate: "2026-07-15" },
  { id: "2", company: "Microsoft", position: "Frontend Developer", status: "interview", appliedDate: "2026-07-10" },
  { id: "3", company: "AWS", position: "Cloud Engineer", status: "saved", appliedDate: "" },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(initialApplications)
  const [showAdd, setShowAdd] = useState(false)
  const [newCompany, setNewCompany] = useState("")
  const [newPosition, setNewPosition] = useState("")
  const [newDescription, setNewDescription] = useState("")

  function addApplication() {
    if (newCompany && newPosition) {
      setApplications([
        ...applications,
        { id: Date.now().toString(), company: newCompany, position: newPosition, status: "saved", appliedDate: "" },
      ])
      setNewCompany("")
      setNewPosition("")
      setNewDescription("")
      setShowAdd(false)
    }
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
              <Textarea id="description" placeholder="Paste job description..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={addApplication}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <Badge variant={statusColors[app.status]}>{app.status}</Badge>
                  {app.appliedDate && (
                    <span className="text-xs text-muted-foreground">{app.appliedDate}</span>
                  )}
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
