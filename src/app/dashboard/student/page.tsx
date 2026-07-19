"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, GraduationCap, ScrollText, Building, Briefcase, Loader2, ArrowRight } from "lucide-react"

const studentDocTypes = [
  {
    id: "internship_cv",
    label: "Internship CV",
    description: "CV tailored for internship applications",
    icon: GraduationCap,
  },
  {
    id: "scholarship_letter",
    label: "Scholarship Letter",
    description: "Letter for scholarship applications",
    icon: ScrollText,
  },
  {
    id: "university_application",
    label: "University Application",
    description: "Application for university admission",
    icon: Building,
  },
  {
    id: "first_job_cv",
    label: "First Job CV",
    description: "Entry-level CV for your first job",
    icon: Briefcase,
  },
]

export default function StudentPage() {
  const { profile, skills } = useProfile()
  const [generating, setGenerating] = useState(false)
  const [documentContent, setDocumentContent] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [activeDocType, setActiveDocType] = useState<string | null>(null)
  const [mode, setMode] = useState<"list" | "preview">("list")

  async function handleGenerate(type: string) {
    setGenerating(true)
    setActiveDocType(type)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Create a ${type.replace(/_/g, " ")} for me`,
          context: {
            intent: "student_doc",
            studentMode: true,
            documentType: type,
            profile: { ...profile, skills: skills.map(s => s.name) },
          },
        }),
      })
      const data = await res.json()
      setDocumentContent(data.response || "Failed to generate document.")
      setDocumentTitle(`${type.replace(/_/g, " ")} - ${profile?.full_name || "Student"}`)
      setMode("preview")
    } catch {
      setDocumentContent("Error generating document. Please check your OpenAI API key and try again.")
      setMode("preview")
    }
    setGenerating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Career Mode</h1>
        <p className="text-muted-foreground">Generate student-focused career documents</p>
      </div>

      {mode === "list" && (
        <>
          <Card className="bg-muted/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Your Student Profile
              </CardTitle>
              <CardDescription>Current information used for document generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{profile?.full_name || "Not set"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Field:</span>{" "}
                  <span className="font-medium">{profile?.professional_title || "Not set"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Skills:</span>{" "}
                  <span className="font-medium">{skills.length} registered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {studentDocTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                  onClick={() => handleGenerate(type.id)}
                >
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{type.label}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      disabled={generating && activeDocType === type.id}
                    >
                      {generating && activeDocType === type.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                      ) : (
                        <><ArrowRight className="h-4 w-4" /> Generate</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {mode === "preview" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setMode("list")}>
            ← Back to document types
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{documentTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {documentContent}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => setMode("list")}>Generate Another</Button>
            <Button variant="outline">Save to Documents</Button>
          </div>
        </div>
      )}
    </div>
  )
}
