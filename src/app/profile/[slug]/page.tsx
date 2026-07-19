import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Mail } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) notFound()

  const supabase = await createServerSupabaseClient()

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("profile_id, published, theme")
    .eq("slug", slug)
    .single()

  if (!portfolio || !portfolio.published) notFound()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", portfolio.profile_id)
    .single()

  if (!profile) notFound()

  const { data: skills } = await supabase
    .from("skills")
    .select("name")
    .eq("profile_id", portfolio.profile_id)

  const { data: experience } = await supabase
    .from("experience")
    .select("*")
    .eq("profile_id", portfolio.profile_id)
    .order("start_date", { ascending: false })

  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", portfolio.profile_id)
    .order("end_date", { ascending: false })

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, content")
    .eq("user_id", profile.user_id)
    .in("type", ["cv", "resume"])
    .order("created_at", { ascending: false })
    .limit(1)

  const latestCv = documents?.[0]

  const initials = (profile.full_name || "").split(" ").map((n: string) => n[0]).join("")

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {initials}
          </div>
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <p className="text-xl text-muted-foreground">{profile.professional_title}</p>
          <p className="text-sm text-muted-foreground">{profile.location}</p>
          <div className="mt-4 flex justify-center gap-3">
            {latestCv && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/documents?download=${latestCv.id}`}>
                  <Download className="mr-2 h-4 w-4" /> Download CV
                </a>
              </Button>
            )}
            {profile.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${profile.email}`}>
                  <Mail className="mr-2 h-4 w-4" /> Contact
                </a>
              </Button>
            )}
          </div>
        </div>

        {profile.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {skills && skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: { name: string }) => (
                  <Badge key={skill.name} variant="secondary">{skill.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {experience && experience.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experience.map((exp: { id: string; position: string; company: string; start_date: string; end_date?: string; current?: boolean }) => (
                  <div key={exp.id}>
                    <p className="font-medium">{exp.position}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} · {new Date(exp.start_date).getFullYear()} - {exp.current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {education && education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {education.map((edu: { id: string; degree: string; school: string; field?: string; end_date?: string }) => (
                  <div key={edu.id}>
                    <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.school} · {edu.end_date ? new Date(edu.end_date).getFullYear() : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
