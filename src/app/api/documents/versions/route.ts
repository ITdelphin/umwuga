import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get("documentId")

  if (!documentId) {
    return NextResponse.json({ error: "Document ID required" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: doc } = await supabase.from("documents").select("id, user_id").eq("id", documentId).maybeSingle()
  if (!doc || doc.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: versions } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version", { ascending: false })

  return NextResponse.json({ versions: versions || [] })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { documentId, content, title } = await request.json()
  if (!documentId || !content) {
    return NextResponse.json({ error: "Document ID and content required" }, { status: 400 })
  }

  const { data: doc } = await supabase.from("documents").select("id, user_id, version, content, title").eq("id", documentId).maybeSingle()
  if (!doc || doc.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { error: insertError } = await supabase.from("document_versions").insert({
    document_id: documentId,
    version: doc.version,
    content: doc.content,
    title: title || "",
  })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  const newVersion = (doc.version || 0) + 1
  await supabase.from("documents").update({ content, version: newVersion, title: title || undefined }).eq("id", documentId)

  return NextResponse.json({ success: true, version: newVersion })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { documentId, versionId } = await request.json()
  if (!documentId || !versionId) {
    return NextResponse.json({ error: "Document ID and version ID required" }, { status: 400 })
  }

  const { data: doc } = await supabase.from("documents").select("id, user_id, version, content, title").eq("id", documentId).maybeSingle()
  if (!doc || doc.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: version } = await supabase.from("document_versions").select("*").eq("id", versionId).eq("document_id", documentId).maybeSingle()
  if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 })

  const { error: saveError } = await supabase.from("document_versions").insert({
    document_id: documentId,
    version: (doc.version || 0) + 1,
    content: doc.content,
    title: doc.title || "",
  })

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 })

  await supabase.from("documents").update({
    content: version.content,
    version: (doc.version || 0) + 1,
  }).eq("id", documentId)

  return NextResponse.json({ success: true, message: "Restored version " + version.version })
}
