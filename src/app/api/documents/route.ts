import { NextResponse } from "next/server"
import { DocumentAgent } from "@/lib/ai/agents"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const documentAgent = new DocumentAgent()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const downloadId = searchParams.get("download")

  if (downloadId) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from("documents")
      .select("content, title")
      .eq("id", downloadId)
      .single()

    if (!data?.content) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return new NextResponse(data.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${(data.title || "document").replace(/\s+/g, "_").toLowerCase()}.txt"`,
      },
    })
  }

  return NextResponse.json({ error: "Document ID required" }, { status: 400 })
}

export async function POST(request: Request) {
  try {
    const { type, profile, jobDescription, content, instructions } = await request.json()

    if (instructions && content) {
      const improved = await documentAgent.improve(content, instructions)
      return NextResponse.json({ content: improved })
    }

    if (!type || !profile) {
      return NextResponse.json({ error: "Type and profile are required" }, { status: 400 })
    }

    const document = await documentAgent.generate(type, profile, jobDescription)
    return NextResponse.json({ content: document })
  } catch (error) {
    console.error("Document generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    )
  }
}
