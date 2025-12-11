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
    const { name, price, durationDays, features, isActive } = body

    const updated = await sql`
      UPDATE membership_plans
      SET 
        name = COALESCE(${name}, name),
        price = COALESCE(${price}, price),
        duration_days = COALESCE(${durationDays}, duration_days),
        features = COALESCE(${features ? JSON.stringify(features) : null}, features),
        is_active = COALESCE(${isActive}, is_active)
      WHERE id = ${Number.parseInt(id)}
      RETURNING id, name, price, duration_days, features, is_active, created_at
    `

    if (updated.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Plan not found" }, { status: 404 })
    }

    const plan = updated[0]

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
    console.error("Update plan error:", error)
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

    // Soft delete
    await sql`
      UPDATE membership_plans SET is_active = false WHERE id = ${Number.parseInt(id)}
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Plan deactivated successfully" },
    })
  } catch (error) {
    console.error("Delete plan error:", error)
    return NextResponse.json<ApiResponse>({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
