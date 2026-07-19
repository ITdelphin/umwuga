import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as Blob | null

    if (!audio) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      return NextResponse.json({ text: "Sample transcribed text from voice recording." })
    }

    const file = new File([audio], "recording.webm", { type: "audio/webm" })
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error("Speech-to-text error:", error)
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    )
  }
}
