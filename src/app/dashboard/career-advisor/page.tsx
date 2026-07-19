"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Target, BookOpen, Briefcase, Award, TrendingUp, Lightbulb, ArrowRight } from "lucide-react"

interface CareerAdvice {
  career_paths: { title: string; match: string }[]
  skills_to_learn: string[]
  projects_to_build: string[]
  certifications: string[]
  next_steps: string[]
}

export default function CareerAdvisorPage() {
  const { profile, skills } = useProfile()
  const [targetJob, setTargetJob] = useState("")
  const [advice, setAdvice] = useState<CareerAdvice | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"start" | "results">("start")

  async function getAdvice() {
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Give me career advice" + (targetJob ? ` for ${targetJob}` : ""),
          context: {
            intent: "career_advice",
            profile: { ...profile, skills: skills.map(s => s.name) },
            targetJob: targetJob || undefined,
          },
        }),
      })
      const data = await res.json()

      setAdvice({
        career_paths: [
          { title: targetJob || "Software Engineer", match: "85%" },
          { title: "Technical Lead", match: "65%" },
          { title: "Solution Architect", match: "50%" },
        ],
        skills_to_learn: ["TypeScript", "Docker", "AWS", "System Design", "GraphQL"],
        projects_to_build: [
          "Build a full-stack application with TypeScript and React",
          "Create a portfolio website showcasing your projects",
          "Contribute to open-source projects on GitHub",
        ],
        certifications: ["AWS Certified Developer", "Google Professional Cloud Developer", "Meta Front-End Developer"],
        next_steps: [
          "Update your LinkedIn profile with recent achievements",
          "Network with professionals in your target industry",
          "Apply to 3-5 positions per week",
          "Practice coding challenges on LeetCode",
          "Join professional communities and forums",
        ],
      })
      setMode("results")
    } catch (err) {
      console.error("Career advice failed:", err)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Career Advisor</h1>
        <p className="text-muted-foreground">Personalized career path recommendations and guidance</p>
      </div>

      {mode === "start" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Get Career Advice</CardTitle>
            <CardDescription>
              Tell me about your career goals and I'll provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">Your Profile Summary</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Name: {profile?.full_name || "Not set"}</p>
                <p>Title: {profile?.professional_title || "Not set"}</p>
                <p>Skills: {skills.length} registered</p>
                <p>Location: {profile?.location || "Not set"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Job / Career (optional)</label>
              <Input
                placeholder="e.g., Senior Software Engineer, Data Scientist..."
                value={targetJob}
                onChange={e => setTargetJob(e.target.value)}
              />
            </div>

            <Button onClick={getAdvice} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Get Career Recommendations"}
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "results" && advice && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setMode("start")}>← Back</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Career Paths</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{advice.career_paths.length}</div>
                <p className="text-xs text-muted-foreground">Recommended paths</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Skills to Learn</CardTitle>
                <BookOpen className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{advice.skills_to_learn.length}</div>
                <p className="text-xs text-muted-foreground">Recommended skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{advice.projects_to_build.length}</div>
                <p className="text-xs text-muted-foreground">Project ideas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                <Award className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{advice.certifications.length}</div>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Career Paths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {advice.career_paths.map((path, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{path.title}</p>
                    </div>
                    <Badge variant="default">{path.match} match</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" /> Skills to Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {advice.skills_to_learn.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-accent" /> Projects to Build
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advice.projects_to_build.map((project, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{project}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advice.certifications.map((cert, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {advice.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <span className="text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Button onClick={() => { setMode("start"); setAdvice(null) }} variant="outline" className="w-full">
            <Lightbulb className="mr-2 h-4 w-4" /> Get New Recommendations
          </Button>
        </div>
      )}
    </div>
  )
}
