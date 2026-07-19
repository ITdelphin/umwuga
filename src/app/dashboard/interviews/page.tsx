"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, Play, StopCircle, CheckCircle, XCircle } from "lucide-react"

const pastInterviews = [
  { id: "1", job: "Software Engineer", company: "Google", score: 85, date: "3 days ago", status: "completed" },
  { id: "2", job: "Frontend Developer", company: "Microsoft", score: 72, date: "1 week ago", status: "completed" },
]

export default function InterviewsPage() {
  const [mode, setMode] = useState<"list" | "setup" | "active" | "results">("list")
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  function startInterview() {
    setMode("active")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Training</h1>
          <p className="text-muted-foreground">Practice with AI-powered mock interviews</p>
        </div>
        {mode === "list" && (
          <Button onClick={() => setMode("setup")}>
            <Mic className="mr-2 h-4 w-4" /> Start Practice
          </Button>
        )}
      </div>

      {mode === "list" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Past Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {pastInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No interviews yet. Start practicing!</p>
              ) : (
                <div className="space-y-3">
                  {pastInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{interview.job}</p>
                        <p className="text-xs text-muted-foreground">{interview.company} · {interview.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">{interview.score}%</p>
                          <Progress value={interview.score} className="w-20" />
                        </div>
                        <Badge variant={interview.score >= 80 ? "default" : "secondary"}>
                          {interview.score >= 80 ? "Great" : "Needs Practice"}
                        </Badge>
                        <Button variant="ghost" size="sm">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Research the company before the interview</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Use the STAR method for behavioral questions</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <span>Prepare questions to ask the interviewer</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <span>Avoid memorizing scripts - be authentic</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {mode === "setup" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Interview Setup</CardTitle>
            <CardDescription>Configure your mock interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" placeholder="e.g., Software Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" placeholder="e.g., Google" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description (optional)</Label>
              <Textarea id="jobDescription" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setMode("list")}>Cancel</Button>
              <Button onClick={startInterview} disabled={!jobTitle}>Start Interview</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "active" && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Mock Interview</CardTitle>
            <CardDescription>Software Engineer at {company || "your target company"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-6 text-center">
              <p className="text-lg font-medium">Tell me about yourself.</p>
              <p className="text-sm text-muted-foreground mt-2">Question 1 of 5</p>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <><StopCircle className="mr-2 h-5 w-5" /> Stop Recording</>
                ) : (
                  <><Mic className="mr-2 h-5 w-5" /> Record Answer</>
                )}
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Your Answer:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRecording ? "Recording... Speak clearly." : "Click record to answer the question."}
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => { setMode("list") }}>
                End Interview
              </Button>
              <Button>Next Question</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
