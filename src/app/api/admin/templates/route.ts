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
  const { data } = await admin.from("document_templates").select("*").order("type").order("name")
  return NextResponse.json({ templates: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin.from("document_templates").insert({
    name: body.name, type: body.type, content: body.content,
    description: body.description, language: body.language || "en", active: true,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from("audit_logs").insert({
    admin_id: user.id, action: "create_template", target_type: "document_templates", target_id: data.id,
    details: { name: body.name, type: body.type },
  })

  return NextResponse.json({ template: data })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) return NextResponse.json({ error: "Not authorized" }, { status: 403 })

  const admin = createAdminClient()
  const body = await request.json()

  if (body.action === "set_default") {
    const { error: clearErr } = await admin.from("document_templates").update({ is_default: false }).eq("type", body.type)
    if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 })
    const { data, error } = await admin.from("document_templates").update({ is_default: true }).eq("id", body.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ template: data })
  }

  const updates: Record<string, unknown> = {}
  if (body.content) updates.content = body.content
  if (body.name) updates.name = body.name
  if (body.type) updates.type = body.type
  if (body.description) updates.description = body.description
  if (body.language) updates.language = body.language
  if (body.active !== undefined) updates.active = body.active

  const { data, error } = await admin.from("document_templates").update(updates).eq("id", body.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ template: data })
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
  const { data: template } = await admin.from("document_templates").delete().eq("id", id).select().single()
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await admin.from("audit_logs").insert({
    admin_id: user.id, action: "delete_template", target_type: "document_templates", target_id: id,
    details: { name: template.name, type: template.type },
  })

  return NextResponse.json({ success: true })
}
