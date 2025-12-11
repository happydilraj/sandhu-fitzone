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
    const { shift, endDate } = body

    const updated = await sql`
      UPDATE memberships
      SET 
        shift = COALESCE(${shift}, shift),
        end_date = COALESCE(${endDate ? new Date(endDate).toISOString() : null}, end_date)
      WHERE id = ${Number.parseInt(id)}
      RETURNING id, shift, start_date, end_date, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Membership not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: updated[0].id,
        shift: updated[0].shift,
        startDate: updated[0].start_date,
        endDate: updated[0].end_date,
        createdAt: updated[0].created_at,
      },
    })
  } catch (error) {
    console.error("Update membership error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
