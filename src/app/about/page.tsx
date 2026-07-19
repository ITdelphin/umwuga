import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Bot, FileText, Mic, Sparkles, Globe, Brain, ArrowRight, Check, Shield, Users, Award } from "lucide-react"

const stats = [
  { label: "Documents Generated", value: "1,000+" },
  { label: "Active Users", value: "500+" },
  { label: "Languages Supported", value: "4" },
  { label: "Interview Sessions", value: "200+" },
]

const team = [
  { name: "Umwuga AI Team", role: "Building the future of career development", initials: "U" },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              Our Story
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About <span className="text-primary">Umwuga AI</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We believe everyone deserves access to professional career tools. Umwuga AI is an AI-powered career
              assistant that helps students, graduates, and professionals across Africa build better careers.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
              <div className="space-y-6 text-muted-foreground">
                <p>
                  Finding a job or advancing your career should not be complicated. Yet many talented individuals
                  struggle with creating professional documents, preparing for interviews, and navigating the job market.
                </p>
                <p>
                  Umwuga AI was built to bridge this gap. We combine the power of artificial intelligence with
                  a deep understanding of the job market to provide a personal career assistant that is available
                  anytime, anywhere, and speaks your language.
                </p>
                <p>
                  Whether you are a student applying for your first internship, a graduate looking for your first job,
                  or a professional seeking new opportunities, Umwuga AI helps you present your best self to employers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Umwuga AI?</h2>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { icon: Bot, title: "AI-Powered", description: "Advanced AI that understands your career needs and creates personalized documents and interview preparation." },
                { icon: Globe, title: "Multilingual", description: "Available in English, Kinyarwanda, French, and Kiswahili. Chat in one language, generate documents in another." },
                { icon: Shield, title: "Affordable", description: "Start for free. Pay only 100 RWF per document when you need to download. No expensive subscriptions required." },
                { icon: Users, title: "For Everyone", description: "Built for students, graduates, and professionals at any stage of their career journey." },
                { icon: Award, title: "ATS Optimized", description: "Documents are designed to pass Applicant Tracking Systems and reach human recruiters." },
                { icon: Brain, title: "Smart Memory", description: "AI remembers your profile and preferences, so you never have to repeat yourself." },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your Career?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Join hundreds of professionals using Umwuga AI to create better documents, ace interviews, and land their dream jobs.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">See Features</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
