import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shift = searchParams.get("shift") || "all"

    let members

    if (shift && shift !== "all") {
      members = await sql`
        SELECT 
          u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
          m.shift, m.start_date, m.end_date,
          mp.name as plan_name
        FROM users u
        INNER JOIN memberships m ON u.id = m.user_id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        WHERE u.role = 'MEMBER' 
          AND u.is_active = true 
          AND m.end_date >= CURRENT_DATE
          AND (m.shift = ${shift} OR m.shift = 'both')
        ORDER BY u.full_name ASC
      `
    } else {
      members = await sql`
        SELECT 
          u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
          m.shift, m.start_date, m.end_date,
          mp.name as plan_name
        FROM users u
        INNER JOIN memberships m ON u.id = m.user_id
        INNER JOIN membership_plans mp ON m.plan_id = mp.id
        WHERE u.role = 'MEMBER' 
          AND u.is_active = true 
          AND m.end_date >= CURRENT_DATE
        ORDER BY u.full_name ASC
      `
    }

    const formattedMembers = members.map((member) => ({
      id: member.id,
      fullName: member.full_name,
      email: member.email,
      phone: member.phone,
      isActive: member.is_active,
      createdAt: member.created_at,
      shift: member.shift,
      startDate: member.start_date,
      endDate: member.end_date,
      planName: member.plan_name,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedMembers,
    })
  } catch (error) {
    console.error("Get members error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
