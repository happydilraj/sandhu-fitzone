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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let messages

    if (status && status !== "all") {
      messages = await sql`
        SELECT id, name, email, message, status, created_at
        FROM contact_messages
        WHERE status = ${status}
        ORDER BY created_at DESC
      `
    } else {
      messages = await sql`
        SELECT id, name, email, message, status, created_at
        FROM contact_messages
        ORDER BY created_at DESC
      `
    }

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      status: msg.status,
      createdAt: msg.created_at,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedMessages,
    })
  } catch (error) {
    console.error("Get contact messages error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
