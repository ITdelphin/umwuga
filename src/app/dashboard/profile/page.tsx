"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X } from "lucide-react"

export default function ProfilePage() {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill))
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
              <Input id="fullName" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+250 700 000 000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Kigali, Rwanda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input id="title" placeholder="Software Engineer" />
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
                placeholder="Write a brief professional summary..."
                className="min-h-[120px]"
              />
            </div>
            <Button className="w-full">Save Profile</Button>
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
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
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
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" placeholder="Job title" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="school">School / University</Label>
              <Input id="school" placeholder="Institution name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" placeholder="Bachelor's in Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="eduStart">Start Date</Label>
                <Input id="eduStart" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eduEnd">End Date</Label>
                <Input id="eduEnd" type="date" />
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
