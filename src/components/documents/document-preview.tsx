"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, Printer } from "lucide-react"

interface DocumentPreviewProps {
  title: string
  content: string
  type: string
  onDownload?: (format: "pdf" | "docx") => void
}

export function DocumentPreview({ title, content, type, onDownload }: DocumentPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setShowPreview(true)
  }, [])

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDownload?.("pdf")}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload?.("docx")}>
            <Download className="mr-2 h-4 w-4" /> DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-white p-8 max-h-[800px] overflow-y-auto">
        {showPreview && (
          <div className="prose prose-sm max-w-none">
            <ContentRenderer content={content} />
          </div>
        )}
      </div>
    </Card>
  )
}

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean)
  const sections: { heading: string; items: string[] }[] = []
  let currentSection: { heading: string; items: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith("#") || line.match(/^[A-Z][A-Z\s]+$/)) {
      if (currentSection) sections.push(currentSection)
      currentSection = { heading: line.replace(/^#+\s*/, ""), items: [] }
    } else if (currentSection) {
      currentSection.items.push(line)
    }
  }
  if (currentSection) sections.push(currentSection)

  if (sections.length === 0) {
    return <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
  }

  return (
    <div className="space-y-6">
      {sections.slice(0, 1).map((section, i) => (
        <div key={i}>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
          {section.items.map((item, j) => (
            <p key={j} className="text-gray-700 mb-1">{item}</p>
          ))}
        </div>
      ))}
      {sections.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.slice(1).map((section, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 mb-2 border-b pb-1">{section.heading}</h3>
              {section.items.map((item, j) => (
                <p key={j} className="text-gray-700 text-sm mb-1">{item}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
