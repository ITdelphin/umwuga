import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    profilesCount, documentsCount, applicationsCount, interviewsCount,
    conversationsCount, transactions, credits,
    todayConversations, todayDocuments, todayAIrequests, todayRevenue,
    monthRevenue, pendingPayments, successPayments, failedPayments,
    users, conversations_all, documents_all, transactions_all,
  ] = await Promise.all([
    admin.from("profiles").select("id, created_at", { count: "exact", head: true }),
    admin.from("documents").select("id, type, created_at, language"),
    admin.from("job_applications").select("id", { count: "exact", head: true }),
    admin.from("interview_sessions").select("id", { count: "exact", head: true }),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("transactions").select("amount, created_at, type, status, payment_method"),
    admin.from("credits").select("balance"),
    admin.from("conversations").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    admin.from("documents").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    admin.from("conversations").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    admin.from("transactions").select("amount").gte("created_at", todayISO),
    admin.from("transactions").select("amount").gte("created_at", thisMonth),
    admin.from("transactions").select("id").eq("status", "pending"),
    admin.from("transactions").select("id").eq("status", "completed"),
    admin.from("transactions").select("id").eq("status", "failed"),
    admin.from("profiles").select("id, created_at"),
    admin.from("conversations").select("id, created_at, context"),
    admin.from("documents").select("id, type, created_at, language"),
    admin.from("transactions").select("amount, created_at, type, payment_method, status"),
  ])

  const todayRev = (todayRevenue.data || []).reduce((s, t) => s + (t.amount || 0), 0)
  const monthRev = (monthRevenue.data || []).reduce((s, t) => s + (t.amount || 0), 0)
  const totalRev = (transactions.data || []).reduce((s, t) => s + (t.amount || 0), 0)
  const totalCred = (credits.data || []).reduce((s, c) => s + (c.balance || 0), 0)
  const docsData = documents_all.data || []
  const convData = conversations_all.data || []
  const txData = transactions_all.data || []
  const usersData = users.data || []

  // Daily registrations (last 14 days)
  const dailyReg = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    const dayStart = d.toISOString().split("T")[0]
    const count = usersData.filter(u => u.created_at?.startsWith(dayStart)).length
    return { date: dayStart, count }
  })

  // Revenue trend (last 30 days)
  const revenueTrend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const dayStart = d.toISOString().split("T")[0]
    const rev = txData.filter(t => t.created_at?.startsWith(dayStart) && t.type === "purchase")
      .reduce((s, t) => s + (t.amount || 0), 0)
    return { date: dayStart, revenue: rev }
  })

  // Document generation trend (last 14 days)
  const docTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    const dayStart = d.toISOString().split("T")[0]
    const count = docsData.filter(doc => doc.created_at?.startsWith(dayStart)).length
    return { date: dayStart, count }
  })

  // Doc types distribution
  const docTypes: Record<string, number> = {}
  docsData.forEach(d => { const t = d.type || "unknown"; docTypes[t] = (docTypes[t] || 0) + 1 })

  // Languages distribution
  const languages: Record<string, number> = {}
  docsData.forEach(d => { const l = d.language || "en"; languages[l] = (languages[l] || 0) + 1 })

  // Payment methods
  const paymentMethods: Record<string, number> = {}
  txData.filter(t => t.type === "purchase").forEach(t => {
    const m = t.payment_method || "unknown"
    paymentMethods[m] = (paymentMethods[m] || 0) + (t.amount || 0)
  })

  // AI usage trend (conversations per day, last 14 days)
  const aiUsage = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    const dayStart = d.toISOString().split("T")[0]
    const count = convData.filter(c => c.created_at?.startsWith(dayStart)).length
    return { date: dayStart, count }
  })

  // User activity (sessions today)
  const activeUsers = usersData.filter(u => u.created_at?.startsWith(todayISO.split("T")[0])).length

  // CVs and Cover Letters count
  const cvsGenerated = docsData.filter(d => d.type === "cv" || d.type === "resume").length
  const coverLettersGenerated = docsData.filter(d => d.type === "cover_letter").length

  // Total documents downloaded (tracked via file_url being set)
  const docsDownloaded = docsData.filter(d => (d as any).file_url).length

  // Storage used (estimate: count of docs * 50KB average)
  const storageUsed = docsData.length * 50

  const totalInterviews = interviewsCount.count || 0
  const totalApplications = applicationsCount.count || 0

  return NextResponse.json({
    totalUsers: profilesCount.count || 0,
    activeUsersToday: activeUsers,
    newRegistrations: dailyReg[dailyReg.length - 1]?.count || 0,
    totalConversations: conversationsCount.count || 0,
    aiRequestsToday: todayAIrequests.count || 0,
    documentsGenerated: documentsCount.count || 0,
    cvsGenerated,
    coverLettersGenerated,
    interviewSessions: totalInterviews,
    documentsDownloaded: docsDownloaded,
    revenueToday: todayRev,
    revenueThisMonth: monthRev,
    totalRevenue: totalRev,
    pendingPayments: pendingPayments.count || 0,
    successfulPayments: successPayments.count || 0,
    failedPayments: failedPayments.count || 0,
    storageUsed,
    apiUsage: conversationsCount.count || 0,
    systemHealth: "good",
    dailyRegistrations: dailyReg,
    revenueTrend,
    documentTrend: docTrend,
    aiUsageTrend: aiUsage,
    docTypes: Object.entries(docTypes).map(([name, value]) => ({ name, value })),
    languages: Object.entries(languages).map(([name, value]) => ({ name, value })),
    paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name, value })),
  })
}
