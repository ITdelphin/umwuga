export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  location: string | null
  professional_title: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  profile_id: string
  company: string
  position: string
  description: string | null
  start_date: string
  end_date: string | null
  current: boolean
  achievements: string[]
  created_at: string
}

export interface Education {
  id: string
  profile_id: string
  school: string
  degree: string
  field: string | null
  start_date: string
  end_date: string | null
  gpa: string | null
  created_at: string
}

export interface Skill {
  id: string
  profile_id: string
  name: string
  category: "technical" | "soft" | "language" | "tool"
  proficiency: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface Project {
  id: string
  profile_id: string
  title: string
  description: string | null
  technologies: string[]
  url: string | null
  start_date: string | null
  end_date: string | null
}

export interface Certification {
  id: string
  profile_id: string
  name: string
  issuer: string
  date: string
  url: string | null
  expires: string | null
}

export interface Document {
  id: string
  user_id: string
  type: "cv" | "resume" | "cover_letter" | "application_letter" | "motivation_letter"
  title: string
  content: string | null
  file_url: string | null
  version: number
  language: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  messages: Message[]
  context: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  company: string
  position: string
  job_description: string | null
  status: "saved" | "applied" | "interview" | "accepted" | "rejected"
  applied_date: string | null
  interview_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  job_title: string
  company: string | null
  job_description: string | null
  type: "mock" | "behavioral" | "technical"
  questions: InterviewQuestion[]
  score: number | null
  feedback: string | null
  created_at: string
  completed_at: string | null
}

export interface InterviewQuestion {
  question: string
  answer: string | null
  feedback: string | null
  score: number | null
  type: "behavioral" | "technical" | "general"
}

export interface Portfolio {
  id: string
  profile_id: string
  slug: string
  published: boolean
  theme: string
  created_at: string
  updated_at: string
}

export type DocumentType = "cv" | "resume" | "cover_letter" | "application_letter" | "motivation_letter"

export type Language = "en" | "rw" | "fr" | "sw"

export interface ATSResult {
  score: number
  keywords: { found: string[]; missing: string[] }
  structure: { score: number; issues: string[] }
  formatting: { score: number; issues: string[] }
  readability: { score: number; suggestions: string[] }
  recommendations: string[]
}

export interface SkillGap {
  existing: string[]
  missing: string[]
  recommendations: { skill: string; resources: string[] }[]
}
