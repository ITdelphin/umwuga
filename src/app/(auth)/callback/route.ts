import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth callback error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=session_not_found`)
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!existingProfile) {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User"
    await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: fullName,
      email: user.email,
    })
    const { data: credits } = await supabase
      .from("credits")
      .select("id")
      .eq("user_id", user.id)
      .single()
    if (!credits) {
      await supabase.from("credits").insert({ user_id: user.id, balance: 1 })
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
