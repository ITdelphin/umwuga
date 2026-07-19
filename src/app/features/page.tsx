import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, FileText, Mic, Sparkles, Globe, Brain, Check, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Career Assistant",
    description: "Natural conversation that understands your needs and guides you through your career journey.",
    details: [
      "Context-aware AI that remembers your profile",
      "Multilingual support in English, Kinyarwanda, French, and Kiswahili",
      "Real-time career advice and guidance",
      "Personalized recommendations based on your goals",
    ],
  },
  {
    icon: FileText,
    title: "Smart Document Generation",
    description: "ATS-friendly CVs, cover letters, and more tailored to your profile and job descriptions.",
    details: [
      "Generate professional CVs and resumes instantly",
      "Tailored cover letters for specific job applications",
      "Formal application and motivation letters",
      "ATS-optimized formatting for better ranking",
    ],
  },
  {
    icon: Mic,
    title: "Interview Training",
    description: "Practice with AI-powered mock interviews. Get feedback on your answers and improve.",
    details: [
      "Voice recording with speech-to-text transcription",
      "Industry-specific interview questions",
      "Real-time feedback on your responses",
      "Track your improvement over time",
    ],
  },
  {
    icon: Brain,
    title: "ATS Resume Checker",
    description: "Analyze your CV against job descriptions and get actionable improvement suggestions.",
    details: [
      "Keyword matching against job descriptions",
      "Structure and formatting analysis",
      "Readability and impact scoring",
      "Specific recommendations for improvement",
    ],
  },
  {
    icon: Sparkles,
    title: "Skill Gap Analyzer",
    description: "Identify missing skills and get learning recommendations tailored to your career goals.",
    details: [
      "Compare your skills against job requirements",
      "Identify skill gaps with precision",
      "Get curated learning resource recommendations",
      "Track your skill development progress",
    ],
  },
  {
    icon: Globe,
    title: "Public Portfolio",
    description: "Create a professional portfolio page to showcase your skills and experience to employers.",
    details: [
      "Customizable public profile page",
      "Shareable link for employers and recruiters",
      "Showcase skills, experience, and education",
      "Multiple theme options",
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Everything You Need to{" "}
              <span className="text-primary">Advance Your Career</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Umwuga AI combines powerful AI tools with an intuitive interface to help you
              create better documents, ace interviews, and land your dream job.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="flex flex-col">
                    <CardHeader>
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2">
                        {feature.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Join professionals who use Umwuga AI to accelerate their career growth.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
