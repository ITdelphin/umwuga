import { NextResponse } from "next/server"
import { DocumentAgent } from "@/lib/ai/agents"

const documentAgent = new DocumentAgent()

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
