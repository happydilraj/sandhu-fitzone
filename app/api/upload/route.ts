import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyAdmin } from "@/lib/admin-auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'equipment' or 'gallery'

    if (!file) {
      return NextResponse.json<ApiResponse>({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`${type || "uploads"}/${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { imageUrl: blob.url },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
