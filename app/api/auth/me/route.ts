import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { getTokenFromHeader, verifyToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first, then from cookie
    const authHeader = request.headers.get("authorization")
    let token = getTokenFromHeader(authHeader)
    
    // If no token in header, check cookie
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("auth-token")?.value || null
    }

    if (!token) {
      return NextResponse.json<ApiResponse>({ success: false, error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const users = await sql`
      SELECT id, full_name, email, phone, role, is_active, email_verified, phone_verified, created_at
      FROM users WHERE id = ${payload.id}
    `

    if (users.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified || false,
        phoneVerified: user.phone_verified || false,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Get me error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
