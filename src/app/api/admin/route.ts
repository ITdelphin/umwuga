import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        '<html><body><h1>Not authenticated</h1><p>Please <a href="/login">sign in</a> first.</p></body></html>',
        { status: 401, headers: { "Content-Type": "text/html" } }
      )
    }

    const { searchParams } = new URL(request.url)
    const targetEmail = searchParams.get("email")
    let targetUserId = user.id

    if (targetEmail) {
      const admin = createAdminClient()
      const { data: authUser } = await admin.auth.admin.listUsers()
      const found = authUser?.users.find(u => u.email === targetEmail)
      if (!found) {
        return new Response(
          '<html><body><h1>User not found</h1><p>No user with email ' + targetEmail + '</p></body></html>',
          { status: 404, headers: { "Content-Type": "text/html" } }
        )
      }
      targetUserId = found.id
    }

    const admin = createAdminClient()
    const { data: existingProfile } = await admin
      .from("profiles").select("id").eq("user_id", targetUserId).maybeSingle()
    if (!existingProfile) {
      await admin.from("profiles").insert({
        user_id: targetUserId,
        full_name: targetEmail || user.email?.split("@")[0] || "User",
        email: targetEmail || user.email,
        role: "super_admin",
      })
    } else {
      await admin.from("profiles").update({ role: "super_admin" }).eq("id", existingProfile.id)
    }
    const { data: credits } = await admin
      .from("credits").select("id").eq("user_id", targetUserId).maybeSingle()
    if (!credits) {
      await admin.from("credits").insert({ user_id: targetUserId, balance: 999 })
    }
    return new Response(
      '<html><body><h1>Success!</h1><p>' + (targetEmail || user.email) + ' is now a super admin. <a href="/dashboard">Go to dashboard</a></p></body></html>',
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

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { email } = await request.json().catch(() => ({}))
    let targetUserId = user.id

    if (email) {
      const admin = createAdminClient()
      const { data: authUser } = await admin.auth.admin.listUsers()
      const found = authUser?.users.find(u => u.email === email)
      if (!found) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      targetUserId = found.id
    }

    const admin = createAdminClient()
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", targetUserId)
      .maybeSingle()

    if (!existingProfile) {
      const { error: insertError } = await admin.from("profiles").insert({
        user_id: targetUserId,
        full_name: email || user.email?.split("@")[0] || "User",
        email: email || user.email,
        role: "super_admin",
      })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    } else {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", existingProfile.id)
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    const { data: credits } = await admin
      .from("credits")
      .select("id")
      .eq("user_id", targetUserId)
      .maybeSingle()

    if (!credits) {
      await admin.from("credits").insert({ user_id: targetUserId, balance: 999 })
    }

    return NextResponse.json({ success: true, message: (email || user.email) + " is now super admin!" })
  } catch (error) {
    console.error("Admin setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
