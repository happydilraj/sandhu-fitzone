import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, signToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      )
    }

    // Find user
    const users = await sql`
      SELECT id, full_name, email, password_hash, phone, role, is_active, email_verified, phone_verified, created_at
      FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Account is deactivated. Contact admin." },
        { status: 403 },
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
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
      token,
    })

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
