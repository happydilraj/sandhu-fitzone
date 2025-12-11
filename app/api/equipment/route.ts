import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let equipment

    if (category && category !== "all") {
      equipment = await sql`
        SELECT id, name, category, description, image_url, video_url, created_at
        FROM equipment
        WHERE category = ${category}
        ORDER BY created_at DESC
      `
    } else {
      equipment = await sql`
        SELECT id, name, category, description, image_url, video_url, created_at
        FROM equipment
        ORDER BY created_at DESC
      `
    }

    const formattedEquipment = equipment.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      imageUrl: item.image_url,
      videoUrl: item.video_url,
      createdAt: item.created_at,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedEquipment,
    })
  } catch (error) {
    console.error("Get equipment error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
