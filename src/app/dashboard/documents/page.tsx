"use client"

import { useState, useRef } from "react"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/chat/chat-interface"
import { DocumentPreview } from "@/components/documents/document-preview"
import { FileText, Download, Eye, Plus, Loader2, Upload, History, RotateCcw, Clock } from "lucide-react"
import type { DocumentVersion } from "@/types"

const documentTypes = [
  { id: "cv", label: "CV / Resume", description: "ATS-friendly professional CV", icon: FileText },
  { id: "cover_letter", label: "Cover Letter", description: "Tailored cover letters", icon: FileText },
  { id: "application_letter", label: "Application Letter", description: "Formal job applications", icon: FileText },
  { id: "motivation_letter", label: "Motivation Letter", description: "For scholarships & universities", icon: FileText },
]

export default function DocumentsPage() {
  const { profile } = useProfile()
  const [activeTab, setActiveTab] = useState<"list" | "create" | "preview">("list")
  const [generating, setGenerating] = useState(false)
  const [documentContent, setDocumentContent] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [versionDocId, setVersionDocId] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function saveVersion(documentId: string, content: string, title: string) {
    await fetch("/api/documents/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, content, title }),
    })
  }

  async function loadVersions(documentId: string) {
    const res = await fetch(`/api/documents/versions?documentId=${documentId}`)
    const data = await res.json()
    setVersions(data.versions || [])
    setVersionDocId(documentId)
    setShowVersions(true)
  }

  async function restoreVersion(versionId: string) {
    if (!versionDocId) return
    setRestoring(true)
    await fetch("/api/documents/versions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: versionDocId, versionId }),
    })
    setShowVersions(false)
    setRestoring(false)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.data) {
        alert("Profile information extracted from your document! Check your profile to review.")
      }
    } catch {
      alert("Failed to upload file. Please try again.")
    }
    setUploading(false)
  }

  async function handleGenerateDocument(type: string) {
    setGenerating(true)
    setDocumentType(type)

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          profile: profile || {},
          jobDescription: "",
        }),
      })
      const data = await res.json()
      setDocumentContent(data.content || "Failed to generate document.")
      setDocumentTitle(`My ${type.replace("_", " ")}`)
      if (data.id) {
        await saveVersion(data.id, data.content, `My ${type.replace("_", " ")}`)
      }
      setActiveTab("preview")
    } catch (err) {
      setDocumentContent("Error generating document. Please check your OpenAI API key.")
      setActiveTab("preview")
    }
    setGenerating(false)
  }

  async function handleDownload(format: "pdf" | "docx") {
    if (format === "pdf") {
      const { default: pdfLib } = await import("pdf-lib")
      const doc = await pdfLib.PDFDocument.create()
      const page = doc.addPage([612, 792])
      page.drawText(documentContent, { x: 50, y: 700, size: 11 })
      const pdfBytes = await doc.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${documentTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Create and manage your career documents</p>
        </div>
        {activeTab === "list" && (
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
            <Button variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload CV"}
            </Button>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Button>
          </div>
        )}
      </div>

      {activeTab === "list" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {documentTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                  onClick={() => handleGenerateDocument(type.id)}
                >
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm">{type.label}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No documents yet</p>
                  <p className="text-xs text-muted-foreground">Click "New Document" to create your first one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-[10px]">{doc.type}</Badge>
                            <span>{doc.updated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => loadVersions(doc.id)} title="View versions">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "create" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Document</CardTitle>
              <CardDescription>Choose a document type to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("list")}>
                ← Back to documents
              </Button>
              <div className="space-y-2">
                {documentTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleGenerateDocument(type.id)}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                      <FileText className="mr-3 h-5 w-5 text-primary" />
                    )}
                    <div className="text-left">
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <ChatInterface />
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setActiveTab("list")}>
            ← Back to documents
          </Button>
          <DocumentPreview
            title={documentTitle}
            content={documentContent}
            type={documentType}
            onDownload={handleDownload}
          />
        </div>
      )}

      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Version History
                </CardTitle>
                <CardDescription>{versions.length} saved versions</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowVersions(false)}>✕</Button>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No version history yet</p>
                  <p className="text-xs">Versions are saved automatically when you generate documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          v{v.version}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{v.title || "Untitled"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(v.created_at).toLocaleDateString()} {new Date(v.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={restoring}
                        onClick={() => restoreVersion(v.id)}
                      >
                        {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
