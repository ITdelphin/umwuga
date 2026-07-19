import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const { data } = await admin.from("ai_prompts").select("*").order("agent").order("key")
  return NextResponse.json({ prompts: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin.from("ai_prompts").insert({
    agent: body.agent, key: body.key, content: body.content,
    description: body.description, active: true, version: 1,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from("audit_logs").insert({
    admin_id: user.id, action: "create_prompt", target_type: "ai_prompts", target_id: data.id,
    details: { agent: body.agent, key: body.key },
  })

  return NextResponse.json({ prompt: data })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const body = await request.json()
  if (body.action === "rollback") {
    const { data: old } = await admin.from("ai_prompts").select("*").eq("id", body.id).single()
    if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const { data, error } = await admin.from("ai_prompts").insert({
      agent: old.agent, key: old.key, content: body.content,
      description: old.description, active: true, version: old.version + 1,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ prompt: data })
  }

  const updates: Record<string, unknown> = {}
  if (body.content) updates.content = body.content
  if (body.active !== undefined) updates.active = body.active
  if (body.description) updates.description = body.description
  if (body.key) updates.key = body.key

  const { data: existing } = await admin.from("ai_prompts").select("*").eq("id", body.id).single()
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  updates.version = existing.version + 1
  const { data, error } = await admin.from("ai_prompts").update(updates).eq("id", body.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prompt: data })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const { data: prompt } = await admin.from("ai_prompts").delete().eq("id", id).select().single()
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await admin.from("audit_logs").insert({
    admin_id: user.id, action: "delete_prompt", target_type: "ai_prompts", target_id: id,
    details: { agent: prompt.agent, key: prompt.key },
  })

  return NextResponse.json({ success: true })
}
