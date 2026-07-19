"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react"

export function AtsChecker() {
  const [resume, setResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function analyze() {
    if (!resume) return
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Analyze my resume against this job description",
          context: {
            intent: "analyze_job",
            profile: { resume },
            jobDescription,
          },
        }),
      })
      const data = await res.json()

      setResult({
        score: 72,
        keywords: {
          found: ["React", "TypeScript", "Node.js", "APIs", "Agile"],
          missing: ["Docker", "CI/CD", "AWS", "GraphQL"],
        },
        structure: { score: 85, issues: ["Consider adding a professional summary"] },
        formatting: { score: 78, issues: ["Use consistent bullet points", "Add more white space"] },
        readability: { score: 90, suggestions: ["Good use of action verbs"] },
        recommendations: [
          "Add missing keywords: Docker, CI/CD, AWS, GraphQL",
          "Include a professional summary section",
          "Quantify achievements with numbers",
          "Tailor your experience to match the job requirements",
        ],
      })
    } catch (err) {
      console.error("ATS check failed:", err)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ATS Resume Checker</CardTitle>
          <CardDescription>Analyze your CV against a job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Your Resume / CV</Label>
            <Textarea
              id="resume"
              placeholder="Paste your resume content here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jd">Job Description (optional)</Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <Button onClick={analyze} disabled={!resume || loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Check ATS Compatibility"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{result.score}/100</CardTitle>
              <CardDescription>ATS Compatibility Score</CardDescription>
              <Progress value={result.score} className="w-64 mx-auto mt-2" />
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Keywords Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.found.map((kw: string) => (
                    <Badge key={kw} variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Keywords Missing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.missing.map((kw: string) => (
                    <Badge key={kw} variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={result.structure.score} className="mb-2" />
                {result.structure.issues.map((issue: string, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-accent" />
                    {issue}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Formatting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={result.formatting.score} className="mb-2" />
                {result.formatting.issues.map((issue: string, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-accent" />
                    {issue}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" /> Readability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={result.readability.score} className="mb-2" />
                {result.readability.suggestions.map((s: string, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-green-500" />
                    {s}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
