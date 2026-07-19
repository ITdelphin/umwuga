import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Bot, FileText, Mic, Sparkles, Globe, Brain } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Career Assistant",
    description: "Natural conversation that understands your needs and guides you through your career journey.",
  },
  {
    icon: FileText,
    title: "Smart Document Generation",
    description: "ATS-friendly CVs, cover letters, and more tailored to your profile and job descriptions.",
  },
  {
    icon: Mic,
    title: "Interview Training",
    description: "Practice with AI-powered mock interviews. Get feedback on your answers and improve.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in English, Kinyarwanda, French, and Kiswahili.",
  },
  {
    icon: Brain,
    title: "Professional Memory",
    description: "AI remembers your profile and preferences to create personalized documents instantly.",
  },
  {
    icon: Sparkles,
    title: "ATS Resume Checker",
    description: "Analyze your CV against job descriptions and get actionable improvement suggestions.",
  },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
                Your Personal AI Career Coach
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Build Your Career with{" "}
                <span className="text-primary">AI-Powered</span> Guidance
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Create professional CVs, prepare for interviews, and manage your entire career journey
                with an AI assistant that understands you.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="w-full sm:w-auto text-base" asChild>
                  <Link href="/register">Start Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base" asChild>
                  <Link href="/features">See Features</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free plan includes AI chat and profile creation. First CV free.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything You Need</h2>
              <p className="mt-4 text-muted-foreground">AI-powered tools to accelerate your career</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your Career?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who use Umwuga AI to create better documents,
              ace interviews, and land their dream jobs.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            &copy; 2026 Umwuga AI. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  )
}
