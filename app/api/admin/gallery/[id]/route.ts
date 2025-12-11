import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyAdmin } from "@/lib/admin-auth"
import type { ApiResponse } from "@/lib/types"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()
    const { title, caption, imageUrl } = body

    const updated = await sql`
      UPDATE gallery_images
      SET 
        title = COALESCE(${title}, title),
        caption = COALESCE(${caption}, caption),
        image_url = COALESCE(${imageUrl}, image_url)
      WHERE id = ${Number.parseInt(id)}
      RETURNING id, title, caption, image_url, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Image not found" }, { status: 404 })
    }

    const img = updated[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: img.id,
        title: img.title,
        caption: img.caption,
        imageUrl: img.image_url,
        createdAt: img.created_at,
      },
    })
  } catch (error) {
    console.error("Update gallery image error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    await sql`DELETE FROM gallery_images WHERE id = ${Number.parseInt(id)}`

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Image deleted successfully" },
    })
  } catch (error) {
    console.error("Delete gallery image error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
