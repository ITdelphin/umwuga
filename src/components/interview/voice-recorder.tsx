"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Play, Loader2 } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setIsProcessing(true)

        try {
          const formData = new FormData()
          formData.append("audio", blob, "recording.webm")
          const res = await fetch("/api/speech", { method: "POST", body: formData })
          const data = await res.json()
          onTranscription(data.text || "Could not transcribe audio.")
        } catch {
          onTranscription("Could not transcribe audio. Please check your connection.")
        }
        setIsProcessing(false)

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone access denied:", err)
    }
  }, [onTranscription])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {isRecording ? (
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 animate-pulse"
            onClick={stopRecording}
          >
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12"
            onClick={startRecording}
            disabled={disabled || isProcessing}
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isRecording ? "Recording..." : isProcessing ? "Processing..." : "Ready to record"}
            </span>
            {isRecording && (
              <span className="text-sm text-destructive font-mono">
                {formatDuration(duration)}
              </span>
            )}
          </div>
          <Progress
            value={isRecording ? 100 : 0}
            className={`mt-2 ${isRecording ? "bg-destructive/20" : ""}`}
          />
        </div>

        {audioUrl && !isRecording && (
          <Button variant="outline" size="icon" onClick={() => {
            const audio = new Audio(audioUrl)
            audio.play()
          }}>
            <Play className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
