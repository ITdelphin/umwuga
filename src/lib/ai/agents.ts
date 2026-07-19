import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AgentContext {
  userId?: string
  profile?: Record<string, unknown>
  conversationHistory?: { role: "user" | "assistant" | "system"; content: string }[]
}

export class ConversationAgent {
  async process(message: string, context: AgentContext) {
    const systemPrompt = `You are Umwuga AI, a professional AI career assistant. You help users:
- Create CVs, resumes, cover letters, and other career documents
- Prepare for job interviews
- Analyze job descriptions
- Improve their professional profiles
- Track job applications

Rules:
- Ask one question at a time
- Be professional and friendly
- Adapt to the user's language
- Remember information from previous messages
- Never ask for unnecessary information
- Behave like a professional recruiter

Available actions: create_cv, create_cover_letter, create_application_letter, create_motivation_letter, prepare_interview, improve_cv, analyze_job, build_profile`

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(context.conversationHistory || []),
      { role: "user" as const, content: message },
    ]

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || "I'm sorry, I didn't understand that. Could you please rephrase?"
  }
}

export class DocumentAgent {
  async generate(type: string, profile: Record<string, unknown>, jobDescription?: string) {
    const prompts: Record<string, string> = {
      cv: "Create a professional ATS-friendly CV based on the following profile information.",
      resume: "Create a concise professional resume optimized for the tech industry.",
      cover_letter: "Write a compelling cover letter tailored to the job description.",
      application_letter: "Write a formal job application letter.",
      motivation_letter: "Write a persuasive motivation letter for academic or internship applications.",
    }

    const prompt = prompts[type] || prompts.cv

    const systemPrompt = `You are an expert career document writer. ${prompt}
Format the document professionally using markdown.
Include sections: Contact, Summary, Experience, Education, Skills.
Use strong action verbs and quantify achievements where possible.
Ensure the document is ATS-friendly.`

    const profileText = JSON.stringify(profile, null, 2)
    const jdText = jobDescription ? `\nJob Description:\n${jobDescription}` : ""

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Profile:\n${profileText}${jdText}\n\nGenerate the document.` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return response.choices[0]?.message?.content || ""
  }

  async improve(content: string, instructions: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert CV writer. Improve the given document based on the instructions. Make it more professional, ATS-friendly, and impactful.",
        },
        { role: "user", content: `Document:\n${content}\n\nInstructions: ${instructions}\n\nImproved version:` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return response.choices[0]?.message?.content || content
  }
}

export class ProfileAgent {
  async extractInformation(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Extract professional information from the following text. Return a JSON object with:
- full_name
- email
- phone
- location
- professional_title
- skills (array)
- experience (array of {company, position, description, start_date, end_date})
- education (array of {school, degree, field, year})
- certifications (array of {name, issuer, year})
Only include fields that are explicitly mentioned or clearly implied.`,
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : null
  }
}

export class InterviewAgent {
  async generateQuestions(jobTitle: string, company?: string, jobDescription?: string) {
    const systemPrompt = `You are an expert technical interviewer. Generate 5 interview questions for a ${jobTitle} position${company ? ` at ${company}` : ""}.
Include a mix of:
- 1 general question (e.g., "Tell me about yourself")
- 2 behavioral questions (STAR method)
- 2 technical questions specific to the role

Return as JSON array: [{ "question": "...", "type": "general|behavioral|technical", "expected_keywords": [...] }]`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...(jobDescription ? [{ role: "user" as const, content: `Job Description:\n${jobDescription}` }] : []),
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : []
  }

  async evaluateAnswer(question: string, answer: string, type: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an interview coach. Evaluate the candidate's answer to the interview question.
Provide:
- score (0-100)
- feedback (constructive criticism)
- strengths
- areas_for_improvement
- sample_better_answer

Question type: ${type}`,
        },
        { role: "user", content: `Question: ${question}\n\nAnswer: ${answer}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : null
  }
}

export class ReviewAgent {
  async checkATS(resumeContent: string, jobDescription?: string) {
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume/CV and:
1. Calculate an ATS compatibility score (0-100)
2. Identify keywords found vs missing from the job description
3. Check structure quality
4. Check formatting
5. Assess readability
6. Provide specific improvement recommendations

Return JSON with: { score, keywords: { found, missing }, structure: { score, issues }, formatting: { score, issues }, readability: { score, suggestions }, recommendations }`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Resume:\n${resumeContent}${jobDescription ? `\n\nJob Description:\n${jobDescription}` : ""}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : null
  }

  async analyzeSkillGap(profile: { skills: string[] }, jobDescription: string) {
    const systemPrompt = `Compare the user's skills against the job description requirements.
Identify:
- Existing skills that match
- Missing skills required by the job
- Learning recommendations for each missing skill

Return JSON with: { existing: string[], missing: string[], recommendations: [{ skill: string, resources: string[] }] }`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My Skills: ${profile.skills.join(", ")}\n\nJob Description:\n${jobDescription}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : null
  }
}

export class LanguageAgent {
  private languageNames: Record<string, string> = {
    en: "English", rw: "Kinyarwanda", fr: "French", sw: "Kiswahili",
  }

  async detect(text: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Detect the language of the following text. Return ONLY the language code: en for English, rw for Kinyarwanda, fr for French, sw for Kiswahili. If unsure, return en." },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 5,
    })
    const lang = response.choices[0]?.message?.content?.trim().toLowerCase() || "en"
    return ["en", "rw", "fr", "sw"].includes(lang) ? lang : "en"
  }

  async translate(text: string, targetLanguage: string) {
    const langName = this.languageNames[targetLanguage] || targetLanguage
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are a professional translator. Translate the following text to ${langName}. Maintain the same formatting and professional tone.` },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })
    return response.choices[0]?.message?.content || text
  }
}

export class CareerAdvisorAgent {
  async recommend(profile: Record<string, unknown>, targetJob?: string) {
    const systemPrompt = `You are an AI career advisor. Based on the user's profile, provide personalized career recommendations.
Return JSON with:
- career_paths: array of recommended career paths with match percentage
- skills_to_learn: array of skills to develop for career growth
- projects_to_build: array of project ideas to strengthen portfolio
- certifications: array of recommended certifications
- next_steps: array of actionable next steps`

    const profileText = JSON.stringify(profile, null, 2)
    const targetText = targetJob ? `\nTarget Job: ${targetJob}` : ""

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Profile:\n${profileText}${targetText}\n\nProvide career recommendations.` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    })
    const content = response.choices[0]?.message?.content
    return content ? JSON.parse(content) : null
  }
}

export class StudentAgent {
  async generateStudentDocument(type: string, profile: Record<string, unknown>, context?: Record<string, unknown>) {
    const prompts: Record<string, string> = {
      internship_cv: "Create an entry-level CV for an internship application. Highlight education, projects, and relevant coursework.",
      scholarship_letter: "Write a compelling scholarship motivation letter. Focus on academic achievements, goals, and why the candidate deserves the scholarship.",
      university_application: "Write a formal university application letter. Highlight academic background, interests, and reasons for choosing the program.",
      first_job_cv: "Create a professional entry-level CV for a fresh graduate. Emphasize education, internships, and transferable skills.",
    }

    const studentContext = context?.isStudent ? `
This user is a student. Adjust the tone and content accordingly.
Student information:
- Currently studying: ${context?.school || "Not specified"}
- Field of study: ${context?.field || "Not specified"}
- Expected graduation: ${context?.graduationYear || "Not specified"}
- Looking for: ${context?.goal || "career opportunities"}` : ""

    const prompt = prompts[type as keyof typeof prompts] || prompts.internship_cv
    const profileText = JSON.stringify(profile, null, 2)

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are an expert career document writer specializing in student and entry-level documents. ${prompt}${studentContext}
Format professionally using markdown. Focus on potential, education, and transferable skills.` },
        { role: "user", content: `Profile:\n${profileText}\n\nGenerate the document.` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })
    return response.choices[0]?.message?.content || ""
  }
}
