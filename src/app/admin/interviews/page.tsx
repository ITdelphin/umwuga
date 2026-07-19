"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Loader2, Trash2 } from "lucide-react"
import type { InterviewSession } from "@/types"

const typeLabels: Record<string, string> = {
  mock: "Mock",
  behavioral: "Behavioral",
  technical: "Technical",
}

export default function AdminInterviewsPage() {
  const supabase = createClient()
  const [interviews, setInterviews] = useState<(InterviewSession & { profiles?: { full_name: string | null } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchInterviews() }, [])

  async function fetchInterviews() {
    setLoading(true)
    try {
      const admin = createClient()
      const { data } = await admin
        .from("interview_sessions")
        .select("*, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
      setInterviews(data || [])
    } catch (err) { console.error("Failed to fetch interviews:", err) }
    setLoading(false)
  }

  async function deleteInterview(id: string) {
    if (!confirm("Delete this interview session?")) return
    await supabase.from("interview_sessions").delete().eq("id", id)
    setInterviews(interviews.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interview Sessions</h1>
        <p className="text-muted-foreground">View all AI mock interview sessions</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={fetchInterviews}><Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Interviews ({interviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No interview sessions yet</div>
          ) : (
            <div className="space-y-2">
              {interviews.map(session => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.job_title}{session.company ? ` at ${session.company}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{(session as any).profiles?.full_name || "Unknown"} · <Badge variant="outline" className="text-[10px]">{typeLabels[session.type] || session.type}</Badge></p>
                      <p className="text-[10px] text-muted-foreground">{new Date(session.created_at).toLocaleDateString()}{session.completed_at ? ` · Completed` : " · In Progress"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {session.score !== null && (
                      <div className="text-center">
                        <p className="text-sm font-bold">{session.score}%</p>
                        <Progress value={session.score} className="w-16 h-1" />
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteInterview(session.id)}>
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
