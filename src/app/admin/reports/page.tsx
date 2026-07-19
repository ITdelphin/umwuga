"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3, Download, Loader2, Users, DollarSign, FileText, CreditCard,
  Brain, MessageSquare,
} from "lucide-react"

const reportTypes = [
  { id: "users", label: "Users Report", icon: Users },
  { id: "revenue", label: "Revenue Report", icon: DollarSign },
  { id: "documents", label: "Documents Report", icon: FileText },
  { id: "payments", label: "Payments Report", icon: CreditCard },
  { id: "ai_usage", label: "AI Usage Report", icon: Brain },
  { id: "interviews", label: "Interviews Report", icon: MessageSquare },
]

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState("users")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [preview, setPreview] = useState<{ headers: string[]; data: Record<string, unknown>[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchPreview = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: selectedType, format: "json" })
      if (startDate) params.set("start", startDate)
      if (endDate) params.set("end", endDate)
      const res = await fetch(`/api/admin/reports?${params}`)
      if (res.ok) {
        const json = await res.json()
        setPreview(json)
      }
    } catch (err) { console.error("Preview failed:", err) }
    setLoading(false)
  }, [selectedType, startDate, endDate])

  async function exportCSV() {
    setExporting(true)
    try {
      const params = new URLSearchParams({ type: selectedType, format: "csv" })
      if (startDate) params.set("start", startDate)
      if (endDate) params.set("end", endDate)
      const res = await fetch(`/api/admin/reports?${params}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedType}-report-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) { console.error("Export failed:", err) }
    setExporting(false)
  }

  const currentReport = reportTypes.find(r => r.id === selectedType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export reports for analysis</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {reportTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setSelectedType(id); setPreview(null) }}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted ${
              selectedType === id ? "border-destructive bg-destructive/5 text-destructive" : ""
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentReport?.label || "Report"}</CardTitle>
              <CardDescription>Set date range and export or preview data</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">{selectedType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-44" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-44" />
            </div>
            <Button variant="outline" onClick={fetchPreview} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
              Preview
            </Button>
            <Button onClick={exportCSV} disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
          </div>

          {preview && (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {preview.headers.map((h, i) => (
                      <th key={i} className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.data.slice(0, 10).map((row, ri) => (
                    <tr key={ri} className="border-b last:border-b-0">
                      {preview.headers.map((h, ci) => (
                        <td key={ci} className="px-4 py-2 whitespace-nowrap">{String(row[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.data.length > 10 && (
                <div className="px-4 py-2 text-xs text-muted-foreground border-t">
                  Showing 10 of {preview.data.length} rows
                </div>
              )}
              {preview.data.length === 0 && (
                <div className="px-4 py-8 text-sm text-center text-muted-foreground">No data found for the selected filters</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
