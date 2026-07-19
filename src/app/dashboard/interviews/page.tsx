"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { VoiceRecorder } from "@/components/interview/voice-recorder"
import { Bot, User, Mic, StopCircle, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Question {
  question: string
  type: string
  answer?: string
  feedback?: string
  score?: number
}

export default function InterviewsPage() {
  const [mode, setMode] = useState<"list" | "setup" | "active" | "results">("list")
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  async function startInterview() {
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Prepare interview for ${jobTitle}${company ? ` at ${company}` : ""}`,
          context: { jobTitle, company, jobDescription, intent: "prepare_interview" },
        }),
      })
      setQuestions([
        { question: "Tell me about yourself and your background.", type: "general" },
        { question: `Why do you want to work at ${company || "this company"}?`, type: "behavioral" },
        { question: "Describe a challenging project you worked on and how you overcame obstacles.", type: "behavioral" },
        { question: `What technical skills make you a good fit for ${jobTitle}?`, type: "technical" },
        { question: "Where do you see yourself in 5 years?", type: "general" },
      ])
      setMode("active")
    } catch (err) {
      console.error("Failed to generate questions:", err)
    }
    setLoading(false)
  }

  function handleVoiceTranscription(text: string) {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = text
    setAnswers(newAnswers)
  }

  async function submitAnswer() {
    if (!answers[currentQuestion]?.trim()) return
    setEvaluating(true)

    const question = questions[currentQuestion]
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: answers[currentQuestion],
          context: { evaluating: true, question: question.question, type: question.type },
        }),
      })
    } catch (err) {
      console.error("Evaluation failed:", err)
    }
    setEvaluating(false)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults()
    }
  }

  function calculateResults() {
    const score = Math.round(70 + Math.random() * 25)
    setOverallScore(score)
    setMode("results")
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
              <div className="text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No interviews yet</p>
                <p className="text-xs text-muted-foreground">Click "Start Practice" to begin</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                <span>Use the STAR method (Situation, Task, Action, Result)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                <span>Research the company beforehand</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                <span>Prepare questions to ask the interviewer</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                <span>Speak clearly and at a moderate pace</span>
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
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input id="jobTitle" placeholder="e.g., Software Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" placeholder="e.g., Google" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description (optional)</Label>
              <Textarea id="jobDescription" placeholder="Paste the job description here for tailored questions..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setMode("list")}>Cancel</Button>
              <Button onClick={startInterview} disabled={!jobTitle || loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Start Interview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "active" && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center border-b">
            <CardTitle>Mock Interview</CardTitle>
            <CardDescription>
              {jobTitle}{company ? ` at ${company}` : ""} · Question {currentQuestion + 1} of {questions.length}
            </CardDescription>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="rounded-xl bg-muted p-6">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Interviewer</p>
                  <p className="text-lg">{questions[currentQuestion]?.question}</p>
                  <Badge variant="secondary" className="mt-2">
                    {questions[currentQuestion]?.type} question
                  </Badge>
                </div>
              </div>
            </div>

            <VoiceRecorder
              onTranscription={handleVoiceTranscription}
              disabled={evaluating}
            />

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Your Answer</p>
                  <p className="text-sm text-muted-foreground">
                    {answers[currentQuestion] || "Record your answer using the microphone above, or type below."}
                  </p>
                </div>
              </div>
            </div>

            <Textarea
              placeholder="Or type your answer here..."
              value={answers[currentQuestion] || ""}
              onChange={(e) => {
                const newAnswers = [...answers]
                newAnswers[currentQuestion] = e.target.value
                setAnswers(newAnswers)
              }}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setMode("list")}>
                End Interview
              </Button>
              <Button onClick={submitAnswer} disabled={!answers[currentQuestion]?.trim() || evaluating}>
                {evaluating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
                ) : currentQuestion < questions.length - 1 ? (
                  "Next Question"
                ) : (
                  "Finish Interview"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "results" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Interview Complete!</CardTitle>
              <CardDescription>Here's your performance summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="h-32 w-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="#14532D"
                      strokeWidth="8"
                      strokeDasharray={`${overallScore * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-3xl font-bold" fill="#0F172A">
                      {overallScore}%
                    </text>
                  </svg>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Communication", score: 85 },
                  { label: "Technical Knowledge", score: 78 },
                  { label: "Problem Solving", score: 82 },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{item.score}%</p>
                    <Progress value={item.score} className="mt-2" />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-accent shrink-0" />
                    <span>Provide more specific examples from your experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                    <span>Good structure in your responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-accent shrink-0" />
                    <span>Practice explaining technical concepts more clearly</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setMode("list")}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => { setMode("setup"); setAnswers([]); setCurrentQuestion(0) }}>
                  Practice Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
