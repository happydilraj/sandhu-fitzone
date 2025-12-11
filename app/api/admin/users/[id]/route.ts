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
    const { fullName, phone, isActive, role } = body

    // Check if trying to demote last admin
    if (role === "MEMBER") {
      const adminCount = await sql`
        SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN' AND is_active = true
      `
      if (Number.parseInt(adminCount[0].count) <= 1) {
        const currentUser = await sql`SELECT role FROM users WHERE id = ${id}`
        if (currentUser[0]?.role === "ADMIN") {
          return NextResponse.json<ApiResponse>(
            { success: false, error: "Cannot demote the last admin" },
            { status: 400 },
          )
        }
      }
    }

    const updated = await sql`
      UPDATE users
      SET 
        full_name = COALESCE(${fullName}, full_name),
        phone = COALESCE(${phone}, phone),
        is_active = COALESCE(${isActive}, is_active),
        role = COALESCE(${role}, role)
      WHERE id = ${id}
      RETURNING id, full_name, email, phone, role, is_active, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = updated[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    // Soft delete - set isActive to false
    await sql`
      UPDATE users SET is_active = false WHERE id = ${id}
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "User deactivated successfully" },
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
