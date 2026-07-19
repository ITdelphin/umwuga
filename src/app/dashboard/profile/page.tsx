"use client"

import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { profile, skills, experience, education, loading, updateProfile, addSkill, removeSkill } = useProfile()
  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [phone, setPhone] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillCategory, setNewSkillCategory] = useState<"technical" | "soft" | "language" | "tool">("technical")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setTitle(profile.professional_title || "")
      setBio(profile.bio || "")
      setLocation(profile.location || "")
      setPhone(profile.phone || "")
    }
  }, [profile])

  async function handleSave() {
    setSaving(true)
    await updateProfile({
      full_name: fullName,
      professional_title: title,
      bio,
      location,
      phone,
    })
    setSaving(false)
  }

  async function handleAddSkill() {
    if (newSkill.trim()) {
      await addSkill({
        name: newSkill.trim(),
        category: newSkillCategory,
        proficiency: "intermediate",
      })
      setNewSkill("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Professional Profile</h1>
        <p className="text-muted-foreground">Manage your career profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 700 000 000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Rwanda" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
            <CardDescription>A brief overview of your career</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Summary</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief professional summary..."
                className="min-h-[120px]"
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add your technical and professional skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              className="flex-1"
            />
            <Select value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value as typeof newSkillCategory)} className="w-32">
              <option value="technical">Technical</option>
              <option value="soft">Soft</option>
              <option value="language">Language</option>
              <option value="tool">Tool</option>
            </Select>
            <Button onClick={handleAddSkill} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="gap-1">
                {skill.name}
                <span className="text-[10px] text-muted-foreground">({skill.category})</span>
                <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Your work history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="rounded-lg border p-3">
                <p className="font-medium">{exp.position}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
              </div>
            ))}
            {experience.length === 0 && (
              <p className="text-sm text-muted-foreground">No experience added</p>
            )}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your academic background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="rounded-lg border p-3">
                <p className="font-medium">{edu.degree}</p>
                <p className="text-sm text-muted-foreground">{edu.school}</p>
              </div>
            ))}
            {education.length === 0 && (
              <p className="text-sm text-muted-foreground">No education added</p>
            )}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
