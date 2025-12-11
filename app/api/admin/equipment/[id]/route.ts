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
    const { name, category, description, imageUrl, videoUrl } = body

    const updated = await sql`
      UPDATE equipment
      SET 
        name = COALESCE(${name}, name),
        category = COALESCE(${category}, category),
        description = COALESCE(${description}, description),
        image_url = COALESCE(${imageUrl}, image_url),
        video_url = COALESCE(${videoUrl}, video_url)
      WHERE id = ${Number.parseInt(id)}
      RETURNING id, name, category, description, image_url, video_url, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Equipment not found" }, { status: 404 })
    }

    const item = updated[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        imageUrl: item.image_url,
        videoUrl: item.video_url,
        createdAt: item.created_at,
      },
    })
  } catch (error) {
    console.error("Update equipment error:", error)
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

    await sql`DELETE FROM equipment WHERE id = ${Number.parseInt(id)}`

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Equipment deleted successfully" },
    })
  } catch (error) {
    console.error("Delete equipment error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
