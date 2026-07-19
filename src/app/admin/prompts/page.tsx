"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Loader2, Plus, Edit3, Trash2, History, RotateCcw, Check, X, Brain } from "lucide-react"

interface AiPrompt {
  id: string
  agent: string
  key: string
  content: string
  description: string | null
  version: number
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

const AGENTS = ["ConversationAgent", "DocumentAgent", "ProfileAgent", "LanguageAgent", "InterviewAgent", "ReviewAgent"]

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAgent, setActiveAgent] = useState(AGENTS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [form, setForm] = useState({ agent: AGENTS[0], key: "", content: "", description: "" })

  useEffect(() => { fetchPrompts() }, [])

  async function fetchPrompts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/prompts")
      const data = await res.json()
      setPrompts(data.prompts || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleCreate() {
    const res = await fetch("/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) { setShowNew(false); setForm({ agent: AGENTS[0], key: "", content: "", description: "" }); fetchPrompts() }
  }

  async function handleUpdate(id: string, updates: Record<string, unknown>) {
    await fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
    fetchPrompts()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prompt?")) return
    await fetch(`/api/admin/prompts?id=${id}`, { method: "DELETE" })
    fetchPrompts()
  }

  async function handleRollback(id: string, content: string) {
    if (!confirm("Restore this version?")) return
    await fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "rollback", content }),
    })
    fetchPrompts()
  }

  const agentPrompts = prompts.filter(p => p.agent === activeAgent)
  const groupedPrompts = agentPrompts.reduce<Record<string, AiPrompt[]>>((acc, p) => {
    if (!acc[p.key]) acc[p.key] = []
    acc[p.key].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Prompts</h1>
          <p className="text-muted-foreground">Manage agent system prompts and instructions</p>
        </div>
        <Button onClick={() => { setShowNew(true); setEditingId(null) }}>
          <Plus className="mr-2 h-4 w-4" /> New Prompt
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {AGENTS.map(agent => (
          <Button
            key={agent}
            variant={activeAgent === agent ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveAgent(agent)}
          >
            <Brain className="mr-1.5 h-3.5 w-3.5" />
            {agent.replace("Agent", "")}
          </Button>
        ))}
      </div>

      {showNew && (
        <Card className="border-destructive/20">
          <CardContent className="p-4 space-y-3">
            <Select value={form.agent} onChange={e => setForm(f => ({ ...f, agent: e.target.value }))}>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
            <Input placeholder="Key (e.g. system_prompt)" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} />
            <Textarea placeholder="Prompt content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} />
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
      ) : Object.keys(groupedPrompts).length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No prompts for this agent</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedPrompts).map(([key, versions]) => {
            const latest = versions.reduce((a, b) => a.version > b.version ? a : b)
            const sortedVersions = [...versions].sort((a, b) => b.version - a.version)
            const isEditing = editingId === latest.id

            return (
              <Card key={key}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-mono">{key}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">v{latest.version}</Badge>
                        {latest.active ? <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge> : <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                      </div>
                      {latest.description && <p className="text-xs text-muted-foreground">{latest.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(isEditing ? null : latest.id); setShowHistory(null) }}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistory(showHistory === key ? null : key)}>
                        <History className="h-4 w-4" />
                      </Button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={latest.active} onChange={() => handleUpdate(latest.id, { active: !latest.active })} />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-destructive" />
                      </label>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(latest.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        defaultValue={latest.content}
                        rows={6}
                        onChange={e => {
                          const ta = e.target
                          const btn = ta.parentElement?.querySelector("[data-save]") as HTMLButtonElement
                          if (btn) btn.dataset.content = ta.value
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" data-save data-content={latest.content} onClick={e => {
                          const btn = e.currentTarget
                          handleUpdate(latest.id, { content: btn.dataset.content })
                          setEditingId(null)
                        }}><Check className="mr-1 h-4 w-4" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono line-clamp-4">{latest.content}</pre>
                  )}

                  {showHistory === key && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" /> Version History</p>
                      {sortedVersions.map(v => (
                        <div key={v.id} className="flex items-start justify-between rounded border p-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">v{v.version}</p>
                            <pre className="text-muted-foreground truncate">{v.content.substring(0, 120)}</pre>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(v.created_at).toLocaleString()}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleRollback(latest.id, v.content)} title="Rollback to this version">
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
