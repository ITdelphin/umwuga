import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "users"
  const startDate = searchParams.get("start") || ""
  const endDate = searchParams.get("end") || ""
  const format = searchParams.get("format") || "csv"

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  let data: Record<string, unknown>[] = []
  let headers: string[] = []

  if (type === "users") {
    const { data: users } = await admin.from("profiles").select("*")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (users) {
      headers = ["Full Name", "Email", "Role", "Location", "Title", "Joined"]
      data = users.map(u => ({
        "Full Name": u.full_name || "",
        "Email": u.email || "",
        "Role": u.role || "user",
        "Location": u.location || "",
        "Title": u.professional_title || "",
        "Joined": new Date(u.created_at).toLocaleDateString(),
      }))
    }
  } else if (type === "revenue") {
    const { data: txs } = await admin.from("transactions").select("*, profiles!inner(full_name, email)")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (txs) {
      headers = ["User", "Email", "Type", "Amount", "Method", "Status", "Date"]
      data = txs.map((t: Record<string, unknown>) => ({
        "User": (t.profiles as Record<string, unknown>)?.full_name || "",
        "Email": (t.profiles as Record<string, unknown>)?.email || "",
        "Type": t.type || "",
        "Amount": t.amount || 0,
        "Method": t.payment_method || "",
        "Status": t.status || "",
        "Date": new Date(t.created_at as string).toLocaleDateString(),
      }))
    }
  } else if (type === "documents") {
    const { data: docs } = await admin.from("documents").select("*, profiles!inner(full_name, email)")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (docs) {
      headers = ["Title", "Type", "Language", "Version", "Author", "Created"]
      data = docs.map((d: Record<string, unknown>) => ({
        "Title": d.title || "",
        "Type": d.type || "",
        "Language": (d.language as string)?.toUpperCase() || "",
        "Version": d.version || 1,
        "Author": (d.profiles as Record<string, unknown>)?.full_name || "",
        "Created": new Date(d.created_at as string).toLocaleDateString(),
      }))
    }
  } else if (type === "payments") {
    const { data: pays } = await admin.from("transactions").select("*, profiles!inner(full_name, email)")
      .eq("type", "purchase")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (pays) {
      headers = ["User", "Email", "Amount", "Method", "Status", "Date"]
      data = pays.map((p: Record<string, unknown>) => ({
        "User": (p.profiles as Record<string, unknown>)?.full_name || "",
        "Email": (p.profiles as Record<string, unknown>)?.email || "",
        "Amount": p.amount || 0,
        "Method": p.payment_method || "",
        "Status": p.status || "",
        "Date": new Date(p.created_at as string).toLocaleDateString(),
      }))
    }
  } else if (type === "ai_usage") {
    const { data: convs } = await admin.from("conversations").select("*, profiles!inner(full_name, email)")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (convs) {
      headers = ["User", "Email", "Title", "Messages", "Created"]
      data = convs.map((c: Record<string, unknown>) => ({
        "User": (c.profiles as Record<string, unknown>)?.full_name || "",
        "Email": (c.profiles as Record<string, unknown>)?.email || "",
        "Title": c.title || "",
        "Messages": Array.isArray((c as Record<string, unknown>).messages) ? ((c as Record<string, unknown>).messages as unknown[]).length : 0,
        "Created": new Date(c.created_at as string).toLocaleDateString(),
      }))
    }
  } else if (type === "interviews") {
    const { data: interviews } = await admin.from("interview_sessions").select("*, profiles!inner(full_name, email)")
      .gte(startDate ? "created_at" : "", startDate)
      .lte(endDate ? "created_at" : "", endDate)
      .order("created_at", { ascending: false })
    if (interviews) {
      headers = ["User", "Email", "Job Title", "Company", "Type", "Score", "Created"]
      data = interviews.map((i: Record<string, unknown>) => ({
        "User": (i.profiles as Record<string, unknown>)?.full_name || "",
        "Email": (i.profiles as Record<string, unknown>)?.email || "",
        "Job Title": i.job_title || "",
        "Company": i.company || "",
        "Type": i.type || "",
        "Score": i.score ?? "N/A",
        "Created": new Date(i.created_at as string).toLocaleDateString(),
      }))
    }
  }

  if (format === "csv") {
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const val = String(row[h] ?? "")
        return val.includes(",") ? `"${val}"` : val
      }).join(",")),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({ data, headers })
}
