import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: targetProfile } = await admin.from("profiles").select("*").eq("id", id).maybeSingle()
  if (!targetProfile) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const [conversations, documents, transactions, auditLogs, experience, education, skills, credits] = await Promise.all([
    admin.from("conversations").select("*").eq("user_id", targetProfile.user_id).order("created_at", { ascending: false }).limit(20),
    admin.from("documents").select("*").eq("user_id", targetProfile.user_id).order("created_at", { ascending: false }).limit(20),
    admin.from("transactions").select("*").eq("user_id", targetProfile.user_id).order("created_at", { ascending: false }),
    admin.from("audit_logs").select("*").or(`target_id.eq.${targetProfile.user_id},target_id.eq.${id}`).order("created_at", { ascending: false }).limit(50),
    admin.from("experience").select("*").eq("profile_id", id).order("start_date", { ascending: false }),
    admin.from("education").select("*").eq("profile_id", id).order("end_date", { ascending: false }),
    admin.from("skills").select("*").eq("profile_id", id),
    admin.from("credits").select("balance").eq("user_id", targetProfile.user_id).maybeSingle(),
  ])

  return NextResponse.json({
    profile: {
      ...targetProfile,
      credits_balance: (credits.data as { balance?: number } | null)?.balance || 0,
    },
    conversations: conversations.data || [],
    documents: documents.data || [],
    transactions: transactions.data || [],
    audit_logs: auditLogs.data || [],
    experience: experience.data || [],
    education: education.data || [],
    skills: skills.data || [],
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!currentProfile || currentProfile.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can modify users" }, { status: 403 })
  }

  const admin = createAdminClient()

  if (body.role !== undefined) {
    const validRoles = ["user", "admin", "super_admin"]
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    const { error } = await admin.from("profiles").update({ role: body.role }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.suspended !== undefined) {
    const { data: target } = await admin.from("profiles").select("user_id").eq("id", id).maybeSingle()
    if (target) {
      await admin.auth.admin.updateUserById(target.user_id, {
        user_metadata: { suspended: body.suspended },
      })
      await admin.from("profiles").update({ suspended: body.suspended }).eq("id", id)
    }
  }

  await admin.from("audit_logs").insert({
    admin_id: user.id,
    action: body.suspended !== undefined ? (body.suspended ? "suspend_user" : "activate_user") : "update_role",
    target_type: "user",
    target_id: id,
    details: body,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!currentProfile || !["admin", "super_admin"].includes(currentProfile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: target } = await admin.from("profiles").select("user_id, full_name, email").eq("id", id).maybeSingle()
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await admin.from("profiles").delete().eq("id", id)

  await admin.from("audit_logs").insert({
    admin_id: user.id,
    action: "delete_user",
    target_type: "user",
    target_id: id,
    details: { user_id: target.user_id, full_name: target.full_name, email: target.email },
  })

  return NextResponse.json({ success: true })
}
