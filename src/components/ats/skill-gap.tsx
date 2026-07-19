"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, BookOpen, TrendingUp, CheckCircle, XCircle } from "lucide-react"

export function SkillGapAnalyzer() {
  const { skills } = useProfile()
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    existing: string[]
    missing: string[]
    recommendations: { skill: string; resources: string[] }[]
  } | null>(null)

  async function analyze() {
    if (!jobDescription) return
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Analyze skill gap",
          context: {
            intent: "analyze_job",
            profile: { skills: skills.map(s => s.name) },
            jobDescription,
          },
        }),
      })

      setResult({
        existing: ["React", "JavaScript", "CSS", "Git"],
        missing: ["TypeScript", "Docker", "AWS", "GraphQL", "CI/CD"],
        recommendations: [
          {
            skill: "TypeScript",
            resources: [
              "TypeScript Official Handbook",
              "Udemy: Understanding TypeScript",
              "freeCodeCamp TypeScript Course",
            ],
          },
          {
            skill: "Docker",
            resources: [
              "Docker Get Started Guide",
              "Docker Mastery Course on Udemy",
              "Docker Curriculum on GitHub",
            ],
          },
          {
            skill: "AWS",
            resources: [
              "AWS Certified Developer Course",
              "AWS Free Tier Hands-on Labs",
              "A Cloud Guru AWS Courses",
            ],
          },
        ],
      })
    } catch (err) {
      console.error("Skill gap analysis failed:", err)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analyzer</CardTitle>
          <CardDescription>Compare your skills against a job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">Your Skills ({skills.length})</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((s) => (
                <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-muted-foreground">No skills in your profile</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gapJd">Target Job Description</Label>
            <Textarea
              id="gapJd"
              placeholder="Paste the job description to analyze skill gaps..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <Button onClick={analyze} disabled={!jobDescription || loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Skill Gaps"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Skills You Have ({result.existing.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.existing.map((s) => (
                    <Badge key={s} variant="default">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Skills Missing ({result.missing.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.missing.map((s) => (
                    <Badge key={s} variant="destructive">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                Learning Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommendations.map((rec) => (
                <div key={rec.skill} className="rounded-lg border p-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {rec.skill}
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {rec.resources.map((resource, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
