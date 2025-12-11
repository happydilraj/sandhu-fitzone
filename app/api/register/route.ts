import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, age, gender, shift, startDate, planId, password } = body

    // Validation
    if (!name || !email || !phone || !shift || !startDate || !planId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Required fields: name, email, phone, shift, startDate, planId" },
        { status: 400 },
      )
    }

    // Get plan details
    const plans = await sql`
      SELECT id, duration_days FROM membership_plans WHERE id = ${planId} AND is_active = true
    `

    if (plans.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid or inactive plan" }, { status: 400 })
    }

    const plan = plans[0]

    // Calculate end date
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + plan.duration_days)

    // Check if user exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    let userId: string

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
    } else {
      // Create new user with default password (user should change it)
      // Users created via membership registration are already verified
      const defaultPassword = password || "changeme123"
      const passwordHash = await hashPassword(defaultPassword)

      const newUsers = await sql`
        INSERT INTO users (full_name, email, password_hash, phone, role, is_active, email_verified, phone_verified)
        VALUES (${name}, ${email}, ${passwordHash}, ${phone}, 'MEMBER', true, true, true)
        RETURNING id
      `
      userId = newUsers[0].id
    }

    // Create membership
    await sql`
      INSERT INTO memberships (user_id, plan_id, shift, start_date, end_date)
      VALUES (${userId}, ${planId}, ${shift}, ${start.toISOString()}, ${end.toISOString()})
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: "Registration successful",
        userId,
        membershipStart: start,
        membershipEnd: end,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
