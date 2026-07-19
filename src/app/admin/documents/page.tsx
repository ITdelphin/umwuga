"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Search, FileText, Loader2, Eye, Trash2 } from "lucide-react"
import type { Document } from "@/types"

const docTypeLabels: Record<string, string> = {
  cv: "CV",
  resume: "Resume",
  cover_letter: "Cover Letter",
  application_letter: "Application Letter",
  motivation_letter: "Motivation Letter",
}

export default function AdminDocumentsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<(Document & { profiles?: { full_name: string | null } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => { fetchDocuments() }, [])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const admin = createClient()
      const { data } = await admin
        .from("documents")
        .select("*, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
      setDocuments(data || [])
    } catch (err) { console.error("Failed to fetch documents:", err) }
    setLoading(false)
  }

  const filtered = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d as any).profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || d.type === typeFilter
    return matchesSearch && matchesType
  })

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document?")) return
    await supabase.from("documents").delete().eq("id", id)
    setDocuments(documents.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Management</h1>
        <p className="text-muted-foreground">View all user-generated documents</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-40">
          <option value="all">All Types</option>
          {Object.entries(docTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Button variant="outline" onClick={fetchDocuments}><Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No documents found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(doc => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc as any).profiles?.full_name || "Unknown"} · <Badge variant="outline" className="text-[10px]">{docTypeLabels[doc.type] || doc.type}</Badge>
                      </p>
                      <p className="text-[10px] text-muted-foreground">{doc.language.toUpperCase()} · v{doc.version} · {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Button variant="ghost" size="icon" onClick={() => window.open(`/api/documents?download=${doc.id}`, "_blank")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteDocument(doc.id)}>
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
