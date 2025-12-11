import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateOTP, storeOTP, sendPhoneOTP } from "@/lib/otp"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Check for authenticated user first
    const user = await getCurrentUser(request)
    
    // If not authenticated, check for x-user-id header (for registration flow)
    const userId = user?.id || request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user phone
    let phone = user?.phone
    if (!phone) {
      const users = await sql`SELECT phone FROM users WHERE id = ${userId}`
      if (users.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      phone = users[0].phone
    }

    // Generate OTP
    const otp = generateOTP()

    // Store OTP in database
    await storeOTP(userId, "phone", otp)

    // Send OTP via SMS
    const sent = await sendPhoneOTP(phone, otp)

    if (!sent) {
      return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your phone",
    })
  } catch (error) {
    console.error("Error sending phone OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
