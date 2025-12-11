import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyAdmin } from "@/lib/admin-auth"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const images = await sql`
      SELECT id, title, caption, image_url, created_at
      FROM gallery_images
      ORDER BY created_at DESC
    `

    const formattedImages = images.map((img) => ({
      id: img.id,
      title: img.title,
      caption: img.caption,
      imageUrl: img.image_url,
      createdAt: img.created_at,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedImages,
    })
  } catch (error) {
    console.error("Get gallery error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, caption, imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Image URL is required" }, { status: 400 })
    }

    const newImage = await sql`
      INSERT INTO gallery_images (title, caption, image_url)
      VALUES (${title || null}, ${caption || null}, ${imageUrl})
      RETURNING id, title, caption, image_url, created_at
    `

    const img = newImage[0]

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
    console.error("Create gallery image error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
