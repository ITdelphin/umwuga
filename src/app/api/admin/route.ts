import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        role: "super_admin",
      })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    } else {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", existingProfile.id)
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    const { data: credits } = await supabase
      .from("credits")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!credits) {
      await supabase.from("credits").insert({ user_id: user.id, balance: 999 })
    }

    return NextResponse.json({ success: true, message: "You are now super admin!" })
  } catch (error) {
    console.error("Admin setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
