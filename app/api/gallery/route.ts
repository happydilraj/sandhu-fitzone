import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function GET() {
  try {
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
