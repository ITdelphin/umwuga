import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        '<html><body><h1>Not authenticated</h1><p>Please <a href="/login">sign in</a> first.</p></body></html>',
        { status: 401, headers: { "Content-Type": "text/html" } }
      )
    }
    const { data: existingProfile } = await supabase
      .from("profiles").select("id").eq("user_id", user.id).maybeSingle()
    if (!existingProfile) {
      await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        role: "super_admin",
      })
    } else {
      await supabase.from("profiles").update({ role: "super_admin" }).eq("id", existingProfile.id)
    }
    const { data: credits } = await supabase
      .from("credits").select("id").eq("user_id", user.id).maybeSingle()
    if (!credits) {
      await supabase.from("credits").insert({ user_id: user.id, balance: 999 })
    }
    return new Response(
      '<html><body><h1>Success!</h1><p>You are now a super admin. <a href="/dashboard">Go to dashboard</a></p></body></html>',
      { status: 200, headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Admin setup error:", error)
    return new Response(
      '<html><body><h1>Error</h1><p>Setup failed. Check console.</p></body></html>',
      { status: 500, headers: { "Content-Type": "text/html" } }
    )
  }
}

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
