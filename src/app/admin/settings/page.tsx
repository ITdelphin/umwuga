"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Save, RefreshCw } from "lucide-react"

interface Setting {
  id: string
  key: string
  value: string
  description: string
  updated_at: string
  updated_by: string | null
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [edited, setEdited] = useState<Record<string, string>>({})

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      setSettings(data.settings || [])
      const editMap: Record<string, string> = {}
      ;(data.settings || []).forEach((s: Setting) => { editMap[s.key] = s.value })
      setEdited(editMap)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleSave(key: string) {
    setSaving(key)
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: edited[key] }),
      })
      fetchSettings()
    } catch (err) { console.error(err) }
    setSaving(null)
  }

  const booleanKeys = ["maintenance_mode", "allow_registration", "ai_enabled"]
  const numericKeys = ["default_credits", "max_document_size_mb"]

  const settingLabels: Record<string, string> = {
    site_name: "Site Name",
    maintenance_mode: "Maintenance Mode",
    allow_registration: "Allow Registration",
    default_credits: "Default Credits",
    max_document_size_mb: "Max Upload Size (MB)",
    ai_enabled: "AI Features",
    contact_email: "Contact Email",
  }

  const settingDescriptions: Record<string, string> = {
    site_name: "Platform display name shown to users",
    maintenance_mode: "When enabled, only admins can access the site",
    allow_registration: "Allow new users to create accounts",
    default_credits: "Credits awarded to new users on signup",
    max_document_size_mb: "Maximum file size for document uploads",
    ai_enabled: "Enable or disable all AI-powered features",
    contact_email: "Primary contact email for the platform",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-destructive" /> Platform Configuration
          </CardTitle>
          <CardDescription>Changes take effect immediately across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-destructive" /></div>
          ) : (
            <div className="space-y-4">
              {settings.map(s => (
                <div key={s.key} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm font-medium">{settingLabels[s.key] || s.key}</Label>
                      <p className="text-xs text-muted-foreground">{settingDescriptions[s.key] || s.description}</p>

                      {booleanKeys.includes(s.key) ? (
                        <Select
                          value={edited[s.key] || "false"}
                          onChange={e => setEdited(prev => ({ ...prev, [s.key]: e.target.value }))}
                          className="mt-2"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </Select>
                      ) : numericKeys.includes(s.key) ? (
                        <Input
                          type="number"
                          value={edited[s.key] || ""}
                          onChange={e => setEdited(prev => ({ ...prev, [s.key]: e.target.value }))}
                          className="mt-2 w-32"
                        />
                      ) : (
                        <Input
                          value={edited[s.key]?.replace(/^"|"$/g, "") || ""}
                          onChange={e => setEdited(prev => ({ ...prev, [s.key]: `"${e.target.value}"` }))}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Button size="sm" onClick={() => handleSave(s.key)} disabled={saving === s.key}>
                        {saving === s.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving === s.key ? " Saving..." : " Save"}
                      </Button>
                      <Badge variant="outline" className="text-[10px]">
                        {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "Default"}
                      </Badge>
                    </div>
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
