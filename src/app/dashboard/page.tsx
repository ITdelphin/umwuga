"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Target,
  Star,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const quickActions = [
  { title: "Create CV", href: "/dashboard/documents?action=new", icon: FileText, color: "text-primary" },
  { title: "Practice Interview", href: "/dashboard/interviews", icon: MessageSquare, color: "text-secondary" },
  { title: "Track Application", href: "/dashboard/applications", icon: Briefcase, color: "text-accent" },
  { title: "Improve Skills", href: "/dashboard/profile", icon: TrendingUp, color: "text-primary" },
]

const stats = [
  { label: "Documents", value: "3", change: "+2 this week", icon: FileText },
  { label: "Interviews", value: "1", change: "Score: 85%", icon: Star },
  { label: "Applications", value: "5", change: "2 in progress", icon: Briefcase },
  { label: "Profile", value: "75%", change: "Complete your profile", icon: Target },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s your career overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
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
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                Hello! I am your AI Career Assistant. How can I help you today?
              </p>
            </div>
            <div className="space-y-2">
              {["Create CV / Resume", "Create Cover Letter", "Prepare for Interview", "Improve Existing CV"].map((option) => (
                <Button key={option} variant="ghost" className="w-full justify-start text-sm" asChild>
                  <Link href={`/dashboard?action=${option.toLowerCase().replace(/\s+/g, "-")}`}>
                    <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                    {option}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { text: "CV created for Software Engineer position", time: "2 hours ago" },
              { text: "Cover letter generated for Google application", time: "1 day ago" },
              { text: "Interview practice completed - Score: 85%", time: "3 days ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="flex-1">{activity.text}</p>
                <span className="text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
