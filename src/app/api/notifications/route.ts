import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const unread = (notifications || []).filter(n => !n.read).length

  return NextResponse.json({ notifications: notifications || [], unread })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { id, read } = await request.json()
  if (id === "all") {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id)
  } else if (id) {
    await supabase.from("notifications").update({ read }).eq("id", id).eq("user_id", user.id)
  }

  return NextResponse.json({ success: true })
}
