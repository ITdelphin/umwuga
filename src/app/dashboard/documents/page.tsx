"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/chat/chat-interface"
import { FileText, Download, Eye, MoreHorizontal, Plus } from "lucide-react"

const documentTypes = [
  { id: "cv", label: "CV / Resume", description: "ATS-friendly professional CV" },
  { id: "cover_letter", label: "Cover Letter", description: "Tailored cover letters" },
  { id: "application_letter", label: "Application Letter", description: "Formal job applications" },
  { id: "motivation_letter", label: "Motivation Letter", description: "For scholarships & universities" },
]

const recentDocuments = [
  { id: "1", title: "Software Engineer CV", type: "cv", updated: "2 hours ago", status: "complete" },
  { id: "2", title: "Google Cover Letter", type: "cover_letter", updated: "1 day ago", status: "draft" },
  { id: "3", title: "Master's Motivation Letter", type: "motivation_letter", updated: "3 days ago", status: "complete" },
]

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"create" | "documents">("documents")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Create and manage your career documents</p>
        </div>
        <Button onClick={() => setActiveTab("create")}>
          <Plus className="mr-2 h-4 w-4" /> New Document
        </Button>
      </div>

      {activeTab === "documents" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {documentTypes.map((type) => (
              <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("create")}>
                <CardHeader>
                  <CardTitle className="text-sm">{type.label}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
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
                          <Badge variant={doc.status === "complete" ? "default" : "secondary"} className="text-[10px]">
                            {doc.status}
                          </Badge>
                          <span>{doc.updated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create Document</CardTitle>
                <CardDescription>Tell the AI what you need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("documents")}>
                    ← Back to documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <ChatInterface />
          </div>
        </div>
      )}
    </div>
  )
}
