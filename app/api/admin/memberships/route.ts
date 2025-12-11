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
    const shift = searchParams.get("shift")
    const status = searchParams.get("status") || "all"

    let memberships

    const baseQuery = sql`
      SELECT 
        m.id, m.shift, m.start_date, m.end_date, m.created_at,
        u.id as user_id, u.full_name, u.email, u.phone,
        mp.id as plan_id, mp.name as plan_name, mp.price
      FROM memberships m
      INNER JOIN users u ON m.user_id = u.id
      INNER JOIN membership_plans mp ON m.plan_id = mp.id
      WHERE 1=1
    `

    if (shift && shift !== "all") {
      memberships = await sql`
        SELECT 
          m.id, m.shift, m.start_date, m.end_date, m.created_at,
          u.id as user_id, u.full_name, u.email, u.phone,
          mp.id as plan_id, mp.name as plan_name, mp.price
        FROM memberships m
        INNER JOIN users u ON m.user_id = u.id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        WHERE (m.shift = ${shift} OR m.shift = 'both')
        ${status === "active" ? sql`AND m.end_date >= CURRENT_DATE` : status === "expired" ? sql`AND m.end_date < CURRENT_DATE` : sql``}
        ORDER BY m.created_at DESC
      `
    } else if (status === "active") {
      memberships = await sql`
        SELECT 
          m.id, m.shift, m.start_date, m.end_date, m.created_at,
          u.id as user_id, u.full_name, u.email, u.phone,
          mp.id as plan_id, mp.name as plan_name, mp.price
        FROM memberships m
        INNER JOIN users u ON m.user_id = u.id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        WHERE m.end_date >= CURRENT_DATE
        ORDER BY m.created_at DESC
      `
    } else if (status === "expired") {
      memberships = await sql`
        SELECT 
          m.id, m.shift, m.start_date, m.end_date, m.created_at,
          u.id as user_id, u.full_name, u.email, u.phone,
          mp.id as plan_id, mp.name as plan_name, mp.price
        FROM memberships m
        INNER JOIN users u ON m.user_id = u.id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        WHERE m.end_date < CURRENT_DATE
        ORDER BY m.created_at DESC
      `
    } else {
      memberships = await sql`
        SELECT 
          m.id, m.shift, m.start_date, m.end_date, m.created_at,
          u.id as user_id, u.full_name, u.email, u.phone,
          mp.id as plan_id, mp.name as plan_name, mp.price
        FROM memberships m
        INNER JOIN users u ON m.user_id = u.id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        ORDER BY m.created_at DESC
      `
    }

    const formattedMemberships = memberships.map((m) => ({
      id: m.id,
      shift: m.shift,
      startDate: m.start_date,
      endDate: m.end_date,
      createdAt: m.created_at,
      user: {
        id: m.user_id,
        fullName: m.full_name,
        email: m.email,
        phone: m.phone,
      },
      plan: {
        id: m.plan_id,
        name: m.plan_name,
        price: Number.parseFloat(m.price),
      },
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedMemberships,
    })
  } catch (error) {
    console.error("Get memberships error:", error)
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
    const { userId, planId, shift, startDate } = body

    if (!userId || !planId || !shift || !startDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "userId, planId, shift, and startDate are required" },
        { status: 400 },
      )
    }

    // Get plan duration
    const plans = await sql`
      SELECT duration_days FROM membership_plans WHERE id = ${planId}
    `

    if (plans.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Plan not found" }, { status: 404 })
    }

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + plans[0].duration_days)

    const newMembership = await sql`
      INSERT INTO memberships (user_id, plan_id, shift, start_date, end_date)
      VALUES (${userId}, ${planId}, ${shift}, ${start.toISOString()}, ${end.toISOString()})
      RETURNING id, shift, start_date, end_date, created_at
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: newMembership[0].id,
        shift: newMembership[0].shift,
        startDate: newMembership[0].start_date,
        endDate: newMembership[0].end_date,
        createdAt: newMembership[0].created_at,
      },
    })
  } catch (error) {
    console.error("Create membership error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
