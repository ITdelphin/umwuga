"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Loader2, Plus, Edit3, Trash2, Eye, Star, Check, X, FileText } from "lucide-react"

interface DocumentTemplate {
  id: string
  name: string
  type: string
  content: string
  description: string | null
  language: string
  active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

const TEMPLATE_TYPES = ["cv", "resume", "cover_letter", "application_letter", "motivation_letter"]
const TYPE_LABELS: Record<string, string> = {
  cv: "CV", resume: "Resume", cover_letter: "Cover Letter",
  application_letter: "Application Letter", motivation_letter: "Motivation Letter",
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("all")
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", type: "cv", content: "", description: "", language: "en" })

  useEffect(() => { fetchTemplates() }, [])

  async function fetchTemplates() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/templates")
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleCreate() {
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) { setShowNew(false); setForm({ name: "", type: "cv", content: "", description: "", language: "en" }); fetchTemplates() }
  }

  async function handleUpdate(id: string, updates: Record<string, unknown>) {
    await fetch("/api/admin/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
    fetchTemplates()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return
    await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" })
    fetchTemplates()
  }

  async function handleSetDefault(id: string, type: string) {
    await fetch("/api/admin/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type, action: "set_default" }),
    })
    fetchTemplates()
  }

  const filtered = typeFilter === "all" ? templates : templates.filter(t => t.type === typeFilter)
  const previewTemplate = templates.find(t => t.id === previewId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground">Manage document templates for CVs, resumes, and letters</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>

      <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-48">
        <option value="all">All Types</option>
        {TEMPLATE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
      </Select>

      {showNew && (
        <Card className="border-destructive/20">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Template name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TEMPLATE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </Select>
            <div className="flex gap-2">
              <Select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="w-32">
                <option value="en">English</option>
                <option value="rw">Kinyarwanda</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
              </Select>
            </div>
            <Textarea placeholder="Template content (HTML or plain text)" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} />
            <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate}><Check className="mr-1 h-4 w-4" /> Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}><X className="mr-1 h-4 w-4" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No templates found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => {
            const isEditing = editingId === t.id
            return (
              <Card key={t.id} className="relative">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewId(t.id)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(isEditing ? null : t.id); setShowNew(false) }}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={t.active} onChange={() => handleUpdate(t.id, { active: !t.active })} />
                        <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-destructive" />
                      </label>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[t.type] || t.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{t.language.toUpperCase()}</Badge>
                    {t.active ? <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge> : <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                    {t.is_default && <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"><Star className="h-3 w-3 mr-0.5" /> Default</Badge>}
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                  {!t.is_default && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleSetDefault(t.id, t.type)}>
                      <Star className="mr-1 h-3 w-3" /> Set as Default
                    </Button>
                  )}

                  {isEditing && (
                    <div className="space-y-2 border-t pt-2 mt-2">
                      <Input defaultValue={t.name} placeholder="Name" onChange={e => {
                        const btn = e.target.parentElement?.querySelector("[data-save-template]") as HTMLButtonElement
                        if (btn) btn.dataset.name = e.target.value
                      }} />
                      <Select defaultValue={t.type} onChange={e => {
                        const btn = e.target.parentElement?.querySelector("[data-save-template]") as HTMLButtonElement
                        if (btn) btn.dataset.type = e.target.value
                      }}>
                        {TEMPLATE_TYPES.map(tt => <option key={tt} value={tt}>{TYPE_LABELS[tt]}</option>)}
                      </Select>
                      <Textarea defaultValue={t.content} rows={6} placeholder="Content" onChange={e => {
                        const btn = e.target.parentElement?.querySelector("[data-save-template]") as HTMLButtonElement
                        if (btn) btn.dataset.content = e.target.value
                      }} />
                      <div className="flex gap-2">
                        <Button size="sm" data-save-template data-name={t.name} data-content={t.content} data-type={t.type} onClick={e => {
                          const btn = e.currentTarget
                          const updates: Record<string, unknown> = {}
                          if (btn.dataset.name) updates.name = btn.dataset.name
                          if (btn.dataset.content) updates.content = btn.dataset.content
                          if (btn.dataset.type) updates.type = btn.dataset.type
                          handleUpdate(t.id, updates)
                          setEditingId(null)
                        }}><Check className="mr-1 h-3 w-3" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {previewId && previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-destructive" />
                <h2 className="font-semibold">{previewTemplate.name}</h2>
                <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[previewTemplate.type]}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewId(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{previewTemplate.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
