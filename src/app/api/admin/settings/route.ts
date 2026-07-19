import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: settings } = await supabase.from("system_settings").select("*").order("key")
  return NextResponse.json({ settings: settings || [] })
}

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { key, value } = await request.json()
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 })

  const { error } = await supabase.from("system_settings").upsert({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: "update_setting",
    target_type: "system_settings",
    target_id: key,
    details: { key, value },
  })

  return NextResponse.json({ success: true })
}
