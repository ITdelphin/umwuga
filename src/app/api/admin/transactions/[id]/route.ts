import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin.from("transactions").select("*, profiles!inner(user_id)(full_name, email)").eq("id", id).maybeSingle()
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ transaction: data })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const admin = createAdminClient()
  const { data: tx } = await admin.from("transactions").select("*").eq("id", id).maybeSingle()
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (tx.status === "refunded") return NextResponse.json({ error: "Already refunded" }, { status: 400 })

  const { error } = await admin.from("transactions").update({ status: "refunded" }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from("transactions").insert({
    user_id: tx.user_id, type: "refund", amount: tx.amount,
    description: `Refund for transaction ${id}`, status: "completed", payment_method: tx.payment_method,
  })

  const creditResp = await admin.from("credits").select("balance").eq("user_id", tx.user_id).maybeSingle()
  const newBalance = ((creditResp.data as { balance: number } | null)?.balance || 0) + tx.amount
  await admin.from("credits").update({ balance: newBalance }).eq("user_id", tx.user_id)

  await admin.from("audit_logs").insert({
    admin_id: user.id, action: "refund_payment", target_type: "transactions", target_id: id,
    details: { amount: tx.amount },
  })

  return NextResponse.json({ success: true })
}
