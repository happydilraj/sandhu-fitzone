import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
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

    if (!file) {
      return NextResponse.json<ApiResponse>({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Save to public/uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads")
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}
