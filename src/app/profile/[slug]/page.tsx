import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Globe, Mail } from "lucide-react"

// TODO: Fetch from database
const mockProfile = {
  name: "John Doe",
  title: "Software Engineer",
  location: "Kigali, Rwanda",
  bio: "Passionate software engineer with 5+ years of experience building scalable web applications.",
  skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL"],
  experience: [
    { company: "Tech Corp", position: "Senior Developer", period: "2022 - Present" },
    { company: "Startup Inc", position: "Developer", period: "2020 - 2022" },
  ],
  education: [
    { school: "University of Rwanda", degree: "BSc Computer Science", year: "2020" },
  ],
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // TODO: Check if profile exists and is published
  if (!slug) notFound()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {mockProfile.name.split(" ").map(n => n[0]).join("")}
          </div>
          <h1 className="text-3xl font-bold">{mockProfile.name}</h1>
          <p className="text-xl text-muted-foreground">{mockProfile.title}</p>
          <p className="text-sm text-muted-foreground">{mockProfile.location}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download CV
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" /> Contact
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{mockProfile.bio}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockProfile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProfile.experience.map((exp, i) => (
                <div key={i}>
                  <p className="font-medium">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.company} · {exp.period}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProfile.education.map((edu, i) => (
                <div key={i}>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.school} · {edu.year}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
