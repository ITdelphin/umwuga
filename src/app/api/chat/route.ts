import { NextResponse } from "next/server"
import { ConversationAgent, DocumentAgent, ProfileAgent, ReviewAgent, LanguageAgent, CareerAdvisorAgent, StudentAgent } from "@/lib/ai/agents"

const conversationAgent = new ConversationAgent()
const documentAgent = new DocumentAgent()
const profileAgent = new ProfileAgent()
const reviewAgent = new ReviewAgent()
const languageAgent = new LanguageAgent()
const careerAdvisor = new CareerAdvisorAgent()
const studentAgent = new StudentAgent()

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const detectedLang = await languageAgent.detect(message)
    const intent = detectIntent(message, context)

    let response: string

    switch (intent) {
      case "create_cv":
      case "create_resume":
      case "create_cover_letter":
      case "create_application_letter":
      case "create_motivation_letter":
        response = await handleDocumentGeneration(intent, message, context)
        break

      case "analyze_job":
        response = await handleJobAnalysis(message, context)
        break

      case "prepare_interview":
        response = "I'll help you prepare for your interview. First, could you tell me the job title and company you're interviewing for?"
        break

      case "improve_cv":
        response = "I'd be happy to improve your CV. Please upload your current CV or paste the content here."
        break

      case "career_advice":
        response = await handleCareerAdvice(context)
        break

      case "student_doc":
        response = await handleStudentDocument(context)
        break

      default:
        response = await conversationAgent.process(message, { ...context, language: detectedLang })
    }

    if (detectedLang !== "en") {
      try {
        const translated = await languageAgent.translate(response, detectedLang)
        return NextResponse.json({ response: translated, detectedLanguage: detectedLang })
      } catch {}
    }

    return NextResponse.json({ response, detectedLanguage: detectedLang })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

function detectIntent(message: string, context?: any): string {
  const lower = message.toLowerCase()

  if (context?.studentMode) {
    if (lower.includes("internship") || lower.includes("intern")) return "student_doc"
    if (lower.includes("scholarship")) return "student_doc"
    if (lower.includes("university") || lower.includes("college")) return "student_doc"
  }

  if (lower.includes("career") && (lower.includes("advice") || lower.includes("path") || lower.includes("recommend") || lower.includes("suggest"))) return "career_advice"
  if (lower.includes("what should i learn") || lower.includes("skill") || lower.includes("grow")) return "career_advice"
  if (lower.includes("future") || lower.includes("next step") || lower.includes("where to")) return "career_advice"

  if (lower.includes("cv") || lower.includes("resume") || lower.includes("curriculum")) {
    if (lower.includes("improve") || lower.includes("better") || lower.includes("update")) return "improve_cv"
    return "create_cv"
  }
  if (lower.includes("cover letter")) return "create_cover_letter"
  if (lower.includes("application letter")) return "create_application_letter"
  if (lower.includes("motivation letter")) return "create_motivation_letter"
  if (lower.includes("interview") || lower.includes("practice") || lower.includes("mock")) return "prepare_interview"
  if (lower.includes("analyze") || lower.includes("job description") || lower.includes("opportunity")) return "analyze_job"
  if (lower.includes("profile") || lower.includes("update") || lower.includes("build")) return "build_profile"

  return "conversation"
}

async function handleDocumentGeneration(type: string, message: string, context: any) {
  const docType = type.replace("create_", "")

  if (!context?.profile) {
    return `I'd be happy to create a ${docType.replace("_", " ")} for you! First, I need some information. Could you tell me:
1. Your full name and current position
2. The job title/position you're targeting
${docType === "cover_letter" ? "3. The company name and job description" : ""}`
  }

  try {
    const document = await documentAgent.generate(docType, context.profile, context.jobDescription)
    return `Here's your ${docType.replace("_", " ")}:\n\n${document}\n\nWould you like me to make any changes?`
  } catch {
    return "I'm sorry, I had trouble generating the document. Could you provide more details about what you need?"
  }
}

async function handleJobAnalysis(message: string, context: any) {
  if (!context?.jobDescription) {
    return "Please paste the job description you'd like me to analyze."
  }

  try {
    const atsResult = await reviewAgent.checkATS(
      JSON.stringify(context.profile || {}),
      context.jobDescription
    )

    const skillGap = await reviewAgent.analyzeSkillGap(
      { skills: (context.profile?.skills as string[]) || [] },
      context.jobDescription
    )

    return `📊 Job Analysis Complete\n\n**ATS Compatibility: ${atsResult?.score || 0}/100**\n\n**Keywords:**\n✅ Found: ${atsResult?.keywords?.found?.join(", ") || "None"}\n❌ Missing: ${atsResult?.keywords?.missing?.join(", ") || "None"}\n\n**Skills Gap:**\n✅ You have: ${skillGap?.existing?.join(", ") || "None"}\n📚 Missing: ${skillGap?.missing?.join(", ") || "None"}\n\n**Recommendations:**\n${atsResult?.recommendations?.map((r: string) => `• ${r}`).join("\n") || "None"}\n\nWould you like me to tailor your CV or cover letter for this position?`
  } catch {
    return "I had trouble analyzing the job. Could you provide more details?"
  }
}

async function handleCareerAdvice(context: any) {
  try {
    const advice = await careerAdvisor.recommend(context?.profile || {}, context?.targetJob)
    if (!advice) return "Tell me about your background and goals, and I'll provide personalized career recommendations."

    return `🎯 **Career Advisor Recommendations**

**Recommended Career Paths:**
${(advice.career_paths || []).map((p: any) => `• ${p.title || p} (${p.match || ""} match)`).join("\n")}

**Skills to Learn:**
${(advice.skills_to_learn || []).map((s: string) => `• ${s}`).join("\n")}

**Projects to Build:**
${(advice.projects_to_build || []).map((p: string) => `• ${p}`).join("\n")}

**Recommended Certifications:**
${(advice.certifications || []).map((c: string) => `• ${c}`).join("\n")}

**Next Steps:**
${(advice.next_steps || []).map((s: string) => `• ${s}`).join("\n")}

Would you like me to elaborate on any of these recommendations?`
  } catch {
    return "I had trouble generating career advice. Could you tell me more about your background and goals?"
  }
}

async function handleStudentDocument(context: any) {
  const type = context?.documentType || "internship_cv"
  try {
    const doc = await studentAgent.generateStudentDocument(type, context?.profile || {}, context)
    return `Here's your student document:\n\n${doc}\n\nWould you like me to make any changes or create a different document?`
  } catch {
    return "I'm sorry, I had trouble generating the document. Could you provide more details about what you need?"
  }
}
