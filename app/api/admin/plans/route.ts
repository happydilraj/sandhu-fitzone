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

    const plans = await sql`
      SELECT id, name, price, duration_days, features, is_active, created_at
      FROM membership_plans
      ORDER BY price ASC
    `

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: Number.parseFloat(plan.price),
      durationDays: plan.duration_days,
      features: plan.features,
      isActive: plan.is_active,
      createdAt: plan.created_at,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedPlans,
    })
  } catch (error) {
    console.error("Get plans error:", error)
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
    const { name, price, durationDays, features } = body

    if (!name || !price || !durationDays) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Name, price, and duration are required" },
        { status: 400 },
      )
    }

    const newPlan = await sql`
      INSERT INTO membership_plans (name, price, duration_days, features, is_active)
      VALUES (${name}, ${price}, ${durationDays}, ${JSON.stringify(features || [])}, true)
      RETURNING id, name, price, duration_days, features, is_active, created_at
    `

    const plan = newPlan[0]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        price: Number.parseFloat(plan.price),
        durationDays: plan.duration_days,
        features: plan.features,
        isActive: plan.is_active,
        createdAt: plan.created_at,
      },
    })
  } catch (error) {
    console.error("Create plan error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
