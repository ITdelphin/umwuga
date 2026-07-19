import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "100")
  const action = searchParams.get("action") || ""

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (action) {
    query = query.eq("action", action)
  }

  const { data: logs } = await query

  const logsWithAdmins = await Promise.all((logs || []).map(async (log) => {
    if (log.admin_id) {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", log.admin_id)
        .maybeSingle()
      return { ...log, admin: adminProfile || null }
    }
    return { ...log, admin: null }
  }))

  return NextResponse.json({ logs: logsWithAdmins })
}
