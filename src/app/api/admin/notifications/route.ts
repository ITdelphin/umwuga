import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, profiles!inner(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100)

  return NextResponse.json({ notifications: notifications || [] })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { userIds, title, message, type } = await request.json()
  if (!title || !message) {
    return NextResponse.json({ error: "Title and message required" }, { status: 400 })
  }

  const recipients = userIds && userIds.length > 0 ? userIds : []
  const allUsers = recipients.length === 0

  if (allUsers) {
    const { data: users } = await supabase.from("profiles").select("user_id")
    const inserts = (users || []).map(u => ({
      user_id: u.user_id,
      title,
      message,
      type: type || "info",
    }))
    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts)
    }
  } else {
    const inserts = recipients.map((uid: string) => ({
      user_id: uid,
      title,
      message,
      type: type || "info",
    }))
    await supabase.from("notifications").insert(inserts)
  }

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: allUsers ? "send_notification_all" : "send_notification",
    target_type: "notification",
    details: { title, recipients_count: allUsers ? "all" : recipients.length },
  })

  return NextResponse.json({ success: true })
}
