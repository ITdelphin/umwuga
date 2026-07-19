"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [credits, setCredits] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [studentMode, setStudentMode] = useState(false)
  const [studentInfo, setStudentInfo] = useState({
    university: "",
    field_of_study: "",
    graduation_year: "",
    student_id: "",
  })

  useEffect(() => {
    if (!user) return
    setDisplayName(user?.user_metadata?.full_name || "")
    setStudentMode(user?.user_metadata?.student_mode === true)
    setStudentInfo({
      university: user?.user_metadata?.university || "",
      field_of_study: user?.user_metadata?.field_of_study || "",
      graduation_year: user?.user_metadata?.graduation_year || "",
      student_id: user?.user_metadata?.student_id || "",
    })
    supabase.from("credits").select("balance").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setCredits(data.balance)
    })
  }, [user])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.auth.updateUser({ data: { full_name: displayName } })
    await supabase.from("profiles").update({ full_name: displayName }).eq("user_id", user?.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
          </div>
          <Separator />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select id="language" defaultValue="en">
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">French</option>
              <option value="sw">Kiswahili</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentLanguage">Document Language</Label>
            <Select id="documentLanguage" defaultValue="en">
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">French</option>
              <option value="sw">Kiswahili</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Student Mode
          </CardTitle>
          <CardDescription>Enable student-focused features and document generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Student Mode</p>
              <p className="text-sm text-muted-foreground">
                {studentMode ? "Access student CVs, scholarship letters & more" : "Enable to create student-focused documents"}
              </p>
            </div>
            <Button
              variant={studentMode ? "default" : "outline"}
              onClick={async () => {
                const newVal = !studentMode
                setStudentMode(newVal)
                await supabase.auth.updateUser({ data: { student_mode: newVal } })
              }}
            >
              {studentMode ? "Active" : "Enable"}
            </Button>
          </div>

          {studentMode && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Student Information</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">University / School</Label>
                  <Input
                    placeholder="University of Rwanda"
                    value={studentInfo.university}
                    onChange={e => setStudentInfo(s => ({ ...s, university: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Field of Study</Label>
                  <Input
                    placeholder="Computer Science"
                    value={studentInfo.field_of_study}
                    onChange={e => setStudentInfo(s => ({ ...s, field_of_study: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Graduation Year</Label>
                  <Input
                    placeholder="2027"
                    value={studentInfo.graduation_year}
                    onChange={e => setStudentInfo(s => ({ ...s, graduation_year: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Student ID (optional)</Label>
                  <Input
                    placeholder="12345"
                    value={studentInfo.student_id}
                    onChange={e => setStudentInfo(s => ({ ...s, student_id: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={async () => {
                  await supabase.auth.updateUser({ data: studentInfo })
                  setSaved(true)
                  setTimeout(() => setSaved(false), 3000)
                }}
              >
                {saved ? "Saved!" : "Save Student Info"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">{credits} document credits remaining</p>
            </div>
            <Button asChild>
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
