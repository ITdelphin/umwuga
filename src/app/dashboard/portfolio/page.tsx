"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Globe, Eye, Copy, Check } from "lucide-react"

export default function PortfolioPage() {
  const [slug, setSlug] = useState("my-profile")
  const [published, setPublished] = useState(false)
  const [copied, setCopied] = useState(false)

  const portfolioUrl = `careerpilot.ai/profile/${slug}`

  function copyUrl() {
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Create and manage your public professional profile</p>
        </div>
        <Button onClick={() => setPublished(!published)} variant={published ? "secondary" : "default"}>
          <Globe className="mr-2 h-4 w-4" />
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
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-name" />
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
