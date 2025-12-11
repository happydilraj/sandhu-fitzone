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

    const equipment = await sql`
      SELECT id, name, category, description, image_url, video_url, created_at
      FROM equipment
      ORDER BY created_at DESC
    `

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

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { name, category, description, imageUrl, videoUrl } = body

    if (!name || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Name and category are required" },
        { status: 400 },
      )
    }

    const newEquipment = await sql`
      INSERT INTO equipment (name, category, description, image_url, video_url)
      VALUES (${name}, ${category}, ${description || null}, ${imageUrl || null}, ${videoUrl || null})
      RETURNING id, name, category, description, image_url, video_url, created_at
    `

    const item = newEquipment[0]

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
    console.error("Create equipment error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
