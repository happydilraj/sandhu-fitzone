import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function GET() {
  try {
    const plans = await sql`
      SELECT id, name, price, duration_days, features, is_active, created_at
      FROM membership_plans
      WHERE is_active = true
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
