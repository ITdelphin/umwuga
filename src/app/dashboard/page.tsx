"use client"

import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChatInterface } from "@/components/chat/chat-interface"
import {
  FileText,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Target,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const quickActions = [
  { title: "Create CV", href: "/dashboard/documents", icon: FileText, color: "text-primary" },
  { title: "Practice Interview", href: "/dashboard/interviews", icon: MessageSquare, color: "text-secondary" },
  { title: "Track Application", href: "/dashboard/applications", icon: Briefcase, color: "text-accent" },
  { title: "Improve Skills", href: "/dashboard/profile", icon: TrendingUp, color: "text-primary" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile, skills, loading } = useProfile()

  const profileComplete = profile
    ? [profile.full_name, profile.professional_title, profile.bio, profile.location].filter(Boolean).length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your career overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((profileComplete / 4) * 100)}%</div>
            <Progress value={(profileComplete / 4) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
            <p className="text-xs text-muted-foreground">Registered skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Create your first document</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No applications tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a task with Umwuga AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button key={action.title} variant="outline" className="h-auto justify-start gap-3 p-4" asChild>
                    <Link href={action.href}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">Let AI assist you</div>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Start a conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
