import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    await sql`
      INSERT INTO contact_messages (name, email, message, status)
      VALUES (${name}, ${email}, ${message}, 'new')
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Message sent successfully" },
    })
  } catch (error) {
    console.error("Contact error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
