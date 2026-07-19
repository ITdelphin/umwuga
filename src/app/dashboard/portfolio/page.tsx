"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Globe, Eye, Copy, Check, Loader2 } from "lucide-react"

export default function PortfolioPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [slug, setSlug] = useState("my-profile")
  const [published, setPublished] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const loadPortfolio = async () => {
      const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()
      if (profile) {
        const { data: portfolio } = await supabase.from("portfolios").select("*").eq("profile_id", profile.id).single()
        if (portfolio) {
          setSlug(portfolio.slug)
          setPublished(portfolio.published)
        }
      }
      setLoading(false)
    }
    loadPortfolio()
  }, [user, supabase])

  async function togglePublish() {
    setSaving(true)
    const newPublished = !published
    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
    if (profile) {
      const { data: existing } = await supabase.from("portfolios").select("id").eq("profile_id", profile.id).single()
      if (existing) {
        await supabase.from("portfolios").update({ published: newPublished, slug }).eq("id", existing.id)
      } else {
        await supabase.from("portfolios").insert({ profile_id: profile.id, slug, published: newPublished })
      }
      setPublished(newPublished)
    }
    setSaving(false)
  }

  async function handleSaveSlug() {
    setSaving(true)
    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
    if (profile) {
      const { data: existing } = await supabase.from("portfolios").select("id").eq("profile_id", profile.id).single()
      if (existing) {
        await supabase.from("portfolios").update({ slug }).eq("id", existing.id)
      } else {
        await supabase.from("portfolios").insert({ profile_id: profile.id, slug, published })
      }
    }
    setSaving(false)
  }

  const portfolioUrl = `https://umwuga-ai.vercel.app/profile/${slug}`

  function copyUrl() {
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Create and manage your public professional profile</p>
        </div>
        <Button onClick={togglePublish} disabled={saving} variant={published ? "secondary" : "default"}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
          {published ? "Unpublish" : "Publish"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Profile URL</Label>
              <div className="flex gap-2">
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={handleSaveSlug} placeholder="your-name" />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">careerpilot.ai/profile/{slug}</p>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-4 gap-2">
                {["Modern", "Minimal", "Bold", "Elegant"].map((theme) => (
                  <Button key={theme} variant="outline" className="h-12">
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Preview Portfolio</span>
              </div>
              <Badge variant={published ? "default" : "secondary"}>
                {published ? "Live" : "Draft"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Choose what to display on your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "About", enabled: true },
              { name: "Skills", enabled: true },
              { name: "Experience", enabled: true },
              { name: "Projects", enabled: true },
              { name: "Education", enabled: true },
              { name: "Contact", enabled: false },
              { name: "Resume Download", enabled: true },
            ].map((section) => (
              <div key={section.name} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{section.name}</span>
                <Badge variant={section.enabled ? "default" : "secondary"}>
                  {section.enabled ? "Visible" : "Hidden"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
