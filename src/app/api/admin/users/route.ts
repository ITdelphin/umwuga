import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role!)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: profiles } = await admin.from("profiles").select("*").order("created_at", { ascending: false })

  const usersWithMeta = await Promise.all((profiles || []).map(async (p) => {
    const [convCount, docCount, txCount, credits] = await Promise.all([
      admin.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", p.user_id),
      admin.from("documents").select("id", { count: "exact", head: true }).eq("user_id", p.user_id),
      admin.from("transactions").select("amount").eq("user_id", p.user_id),
      admin.from("credits").select("balance").eq("user_id", p.user_id).maybeSingle(),
    ])
    return {
      ...p,
      conversations_count: convCount.count || 0,
      documents_count: docCount.count || 0,
      total_spent: (txCount.data || []).reduce((s, t) => s + (t.amount || 0), 0),
      credits_balance: (credits.data as { balance?: number } | null)?.balance || 0,
    }
  }))

  return NextResponse.json({ users: usersWithMeta })
}
