import { NextResponse } from "next/server"
import { ProfileAgent } from "@/lib/ai/agents"

const profileAgent = new ProfileAgent()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Accepted: PDF, DOCX, PNG, JPEG" }, { status: 400 })
    }

    const text = await file.text()
    const extracted = await profileAgent.extractInformation(text)

    return NextResponse.json({ data: extracted })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    )
  }
}
