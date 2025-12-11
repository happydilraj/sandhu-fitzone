import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyAdmin } from "@/lib/admin-auth"
import { hashPassword } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const users = await sql`
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at,
        m.id as membership_id, m.shift, m.start_date, m.end_date,
        mp.name as plan_name, mp.price
      FROM users u
      LEFT JOIN memberships m ON u.id = m.user_id AND m.end_date >= CURRENT_DATE
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`SELECT COUNT(*) as total FROM users`
    const total = Number.parseInt(countResult[0].total)

    const formattedUsers = users.map((user) => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      membership: user.membership_id ? {
        id: user.membership_id,
        shift: user.shift,
        startDate: user.start_date,
        endDate: user.end_date,
        planName: user.plan_name,
        price: user.price,
      } : null,
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if ("error" in auth) {
      return NextResponse.json<ApiResponse>({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { fullName, email, phone, password, role, isActive, membership } = body

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Full name, email, phone, and password are required" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 },
      )
    }

    const validRoles = ["ADMIN", "MEMBER"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid role. Must be ADMIN or MEMBER" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user (admin-created users are auto-verified)
    const newUsers = await sql`
      INSERT INTO users (full_name, email, password_hash, phone, role, is_active, email_verified, phone_verified)
      VALUES (
        ${fullName},
        ${email},
        ${passwordHash},
        ${phone},
        ${role || "MEMBER"},
        ${isActive !== undefined ? isActive : true},
        true,
        true
      )
      RETURNING id, full_name, email, phone, role, is_active, email_verified, phone_verified, created_at
    `

    const newUser = newUsers[0]

    // Create membership if provided
    let membershipData = null
    if (membership && membership.planId) {
      // Get plan details
      const plans = await sql`
        SELECT id, name, price, duration_days FROM membership_plans WHERE id = ${membership.planId}
      `

      if (plans.length > 0) {
        const plan = plans[0]
        const startDate = new Date(membership.startDate || new Date())
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + plan.duration_days)

        const newMembership = await sql`
          INSERT INTO memberships (user_id, plan_id, shift, start_date, end_date)
          VALUES (
            ${newUser.id},
            ${membership.planId},
            ${membership.shift || "morning"},
            ${startDate.toISOString()},
            ${endDate.toISOString()}
          )
          RETURNING id, shift, start_date, end_date
        `

        membershipData = {
          id: newMembership[0].id,
          shift: newMembership[0].shift,
          startDate: newMembership[0].start_date,
          endDate: newMembership[0].end_date,
          planName: plan.name,
          price: plan.price,
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.is_active,
        createdAt: newUser.created_at,
        membership: membershipData,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
