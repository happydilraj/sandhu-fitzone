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
    const { status } = body

    if (!status || !["new", "seen", "replied"].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Valid status required (new, seen, replied)" },
        { status: 400 },
      )
    }

    const updated = await sql`
      UPDATE contact_messages
      SET status = ${status}
      WHERE id = ${Number.parseInt(id)}
      RETURNING id, name, email, message, status, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Message not found" }, { status: 404 })
    }

    const msg = updated[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: msg.id,
        name: msg.name,
        email: msg.email,
        message: msg.message,
        status: msg.status,
        createdAt: msg.created_at,
      },
    })
  } catch (error) {
    console.error("Update contact message error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
