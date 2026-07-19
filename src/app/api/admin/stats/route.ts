import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()

  const [profiles, documents, applications, interviews, conversations, transactions, credits] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("documents").select("id", { count: "exact", head: true }),
    admin.from("job_applications").select("id", { count: "exact", head: true }),
    admin.from("interview_sessions").select("id", { count: "exact", head: true }),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("transactions").select("amount, created_at"),
    admin.from("credits").select("balance"),
  ])

  const totalRevenue = (transactions.data || []).reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalCreditsIssued = (credits.data || []).reduce((sum, c) => sum + (c.balance || 0), 0)

  return NextResponse.json({
    totalUsers: profiles.count || 0,
    totalDocuments: documents.count || 0,
    totalApplications: applications.count || 0,
    totalInterviews: interviews.count || 0,
    totalConversations: conversations.count || 0,
    totalRevenue,
    totalCreditsIssued,
  })
}
